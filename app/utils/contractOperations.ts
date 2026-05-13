import { ethers } from 'ethers';
import { ContractAction, ContractResult } from '../types/contracts';
import { generateContractMessage } from './contractMessages';

// ──────────────── Contract ABI (matches TaskEscrow.sol) ────────────────

const TASK_ESCROW_ABI = [
  // Write functions
  'function fundTask(string calldata taskDbId) external payable',
  'function releaseToFreelancer(string calldata taskDbId, address freelancer) external',
  'function cancelTask(string calldata taskDbId) external',
  'function raiseDispute(string calldata taskDbId) external',
  'function resolveDispute(string calldata taskDbId, address recipient) external',
  'function adminRelease(string calldata taskDbId, address recipient) external',
  'function withdraw() external',
  'function setFeeRecipient(address newRecipient) external',
  'function setFeeBasisPoints(uint16 newBp) external',
  'function pause() external',
  'function unpause() external',
  // Read functions
  'function getTask(string calldata taskDbId) external view returns (address client, uint256 amount, uint8 state, uint64 fundedAt, uint64 settledAt)',
  'function getTaskState(string calldata taskDbId) external view returns (uint8)',
  'function getContractBalance() external view returns (uint256)',
  'function pendingWithdrawals(address) external view returns (uint256)',
  'function feeRecipient() external view returns (address)',
  'function feeBasisPoints() external view returns (uint16)',
  'function owner() external view returns (address)',
  'function paused() external view returns (bool)',
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// ──────────────────────── provider helpers ─────────────────────────────

async function getProvider(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  const provider = await getProvider();
  if (!provider) return null;
  try {
    await provider.send('eth_requestAccounts', []);
    return provider.getSigner();
  } catch {
    return null;
  }
}

function getContract(signerOrProvider: ethers.ContractRunner): ethers.Contract | null {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return null;
  }
  return new ethers.Contract(CONTRACT_ADDRESS, TASK_ESCROW_ABI, signerOrProvider);
}

// ─────────────────── message-signing (no on-chain state) ──────────────

export async function signTaskContract(
  action: ContractAction,
  taskId: number,
  taskTitle: string,
  performerId?: number,
): Promise<ContractResult> {
  try {
    if (!window.ethereum) {
      return { success: false, error: 'MetaMask is not installed' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    let accounts: string[];
    try {
      accounts = await provider.send('eth_requestAccounts', []);
    } catch (err: any) {
      if (err.code === 4001)
        return { success: false, error: 'You rejected the wallet connection' };
      return { success: false, error: 'Failed to connect wallet' };
    }

    if (!accounts.length) return { success: false, error: 'No accounts found' };

    const signer = await provider.getSigner();
    const message = generateContractMessage({ action, taskId, taskTitle, performerId });

    let signature: string;
    try {
      signature = await signer.signMessage(message);
    } catch (err: any) {
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        return { success: false, error: 'You rejected the signature request' };
      }
      return { success: false, error: 'Failed to sign message' };
    }

    return {
      success: true,
      signature: { signature, signer: accounts[0], timestamp: Date.now() },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unexpected error' };
  }
}

// ─────────────────── on-chain write operations ─────────────────────────

/**
 * Fund a task — client locks ETH in escrow.
 * @param taskDbId  MongoDB ObjectId string
 * @param priceInEth  Amount to lock (as ETH string, e.g. "0.05")
 */
export async function fundTaskOnChain(
  taskDbId: string,
  priceInEth: string,
): Promise<{ txHash: string } | { error: string }> {
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };
    const contract = getContract(signer);
    if (!contract) return { error: 'Contract address not configured (NEXT_PUBLIC_CONTRACT_ADDRESS)' };

    const tx = await contract.fundTask(taskDbId, { value: ethers.parseEther(priceInEth) });
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected by user' };
    }
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}

/**
 * Release escrowed funds to the freelancer (client approves work).
 * @param taskDbId          MongoDB ObjectId string
 * @param freelancerAddress Freelancer's ETH wallet address
 */
export async function releasePaymentOnChain(
  taskDbId: string,
  freelancerAddress: string,
): Promise<{ txHash: string } | { error: string }> {
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };
    const contract = getContract(signer);
    if (!contract) return { error: 'Contract address not configured' };

    const tx = await contract.releaseToFreelancer(taskDbId, freelancerAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected by user' };
    }
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}

/**
 * Cancel a task and refund the client.
 * @param taskDbId  MongoDB ObjectId string
 */
export async function cancelTaskOnChain(
  taskDbId: string,
): Promise<{ txHash: string } | { error: string }> {
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };
    const contract = getContract(signer);
    if (!contract) return { error: 'Contract address not configured' };

    const tx = await contract.cancelTask(taskDbId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected by user' };
    }
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}

/**
 * Raise a dispute on a task (freezes on-chain funds).
 * Can be called by the client. Admin can also call it on behalf of the performer.
 * @param taskDbId  MongoDB ObjectId string
 */
export async function raiseDisputeOnChain(
  taskDbId: string,
): Promise<{ txHash: string } | { error: string }> {
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };
    const contract = getContract(signer);
    if (!contract) return { error: 'Contract address not configured' };

    const tx = await contract.raiseDispute(taskDbId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected by user' };
    }
    return { error: err?.reason || err?.message || 'Transaction failed (are you the contract owner or task client?)' };
  }
}

/**
 * Admin resolves a dispute, releasing funds to a specific recipient.
 * Caller MUST be the contract owner (the platform deployer wallet).
 * @param taskDbId   MongoDB ObjectId string
 * @param recipient  ETH address that will receive the funds
 */
export async function resolveDisputeOnChain(
  taskDbId: string,
  recipient: string,
): Promise<{ txHash: string } | { error: string }> {
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };
    const contract = getContract(signer);
    if (!contract) return { error: 'Contract address not configured' };

    const tx = await contract.resolveDispute(taskDbId, recipient);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected' };
    }
    return {
      error: err?.reason || err?.message ||
        'Failed — ensure your MetaMask wallet is the contract owner',
    };
  }
}

/**
 * Admin emergency release (skips dispute flow, no fee).
 * @param taskDbId   MongoDB ObjectId string
 * @param recipient  ETH address that will receive the full balance
 */
export async function adminReleaseOnChain(
  taskDbId: string,
  recipient: string,
): Promise<{ txHash: string } | { error: string }> {
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };
    const contract = getContract(signer);
    if (!contract) return { error: 'Contract address not configured' };

    const tx = await contract.adminRelease(taskDbId, recipient);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected' };
    }
    return { error: err?.reason || err?.message || 'Admin release failed' };
  }
}

// ──────────────────────────── read helpers ─────────────────────────────

export async function getOnChainTaskState(
  taskDbId: string,
): Promise<number | null> {
  try {
    const provider = await getProvider();
    if (!provider) return null;
    const contract = getContract(provider);
    if (!contract) return null;
    const state = await contract.getTaskState(taskDbId);
    return Number(state);
  } catch {
    return null;
  }
}

/** Returns the connected wallet's address, or null. */
export async function getConnectedAddress(): Promise<string | null> {
  try {
    const provider = await getProvider();
    if (!provider) return null;
    const accounts = await provider.send('eth_accounts', []);
    return accounts[0] || null;
  } catch {
    return null;
  }
}
