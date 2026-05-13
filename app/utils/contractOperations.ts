import { ethers } from 'ethers';
import { ContractAction, ContractResult } from '../types/contracts';
import { generateContractMessage } from './contractMessages';

// ──────────────── Contract ABI (matches TaskEscrow.sol) ────────────────

const TASK_ESCROW_ABI = [
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

// ──────────────────────────── helpers ──────────────────────────────────

function isValidContractAddress(addr: string | undefined): addr is string {
  return (
    !!addr &&
    addr !== '0x0000000000000000000000000000000000000000' &&
    /^0x[0-9a-fA-F]{40}$/.test(addr)
  );
}

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

async function isContractDeployed(
  provider: ethers.BrowserProvider | ethers.JsonRpcSigner,
  address: string,
): Promise<boolean> {
  try {
    const p =
      provider instanceof ethers.BrowserProvider
        ? provider
        : provider.provider as ethers.BrowserProvider;
    const code = await p.getCode(address);
    return code !== '0x' && code !== '0x0';
  } catch {
    return false;
  }
}

function getContract(
  signerOrProvider: ethers.ContractRunner,
): ethers.Contract | null {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) {
    return null;
  }
  return new ethers.Contract(CONTRACT_ADDRESS, TASK_ESCROW_ABI, signerOrProvider);
}

// ─────────────── message-signing (no on-chain state) ──────────────────

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

// ─────────────── on-chain write operations ─────────────────────────────

export async function fundTaskOnChain(
  taskDbId: string,
  priceInEth: string,
): Promise<{ txHash: string } | { error: string }> {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) {
    return { error: 'Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.' };
  }
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };

    if (!(await isContractDeployed(signer, CONTRACT_ADDRESS))) {
      return { error: `No contract found at ${CONTRACT_ADDRESS}. Deploy first.` };
    }

    const contract = getContract(signer)!;
    const valueWei = ethers.parseEther(priceInEth);
    const tx = await contract.fundTask(taskDbId, { value: valueWei });
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected by user' };
    }
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}

export async function releasePaymentOnChain(
  taskDbId: string,
  freelancerAddress: string,
): Promise<{ txHash: string } | { error: string }> {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) {
    return { error: 'Contract address not configured.' };
  }
  if (!freelancerAddress || !/^0x[0-9a-fA-F]{40}$/.test(freelancerAddress)) {
    return { error: 'Invalid freelancer ETH address.' };
  }
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };

    if (!(await isContractDeployed(signer, CONTRACT_ADDRESS))) {
      return { error: `No contract found at ${CONTRACT_ADDRESS}.` };
    }

    const contract = getContract(signer)!;
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

export async function cancelTaskOnChain(
  taskDbId: string,
): Promise<{ txHash: string } | { error: string }> {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) {
    return { error: 'Contract address not configured.' };
  }
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };

    if (!(await isContractDeployed(signer, CONTRACT_ADDRESS))) {
      return { error: `No contract found at ${CONTRACT_ADDRESS}.` };
    }

    const contract = getContract(signer)!;
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

export async function raiseDisputeOnChain(
  taskDbId: string,
): Promise<{ txHash: string } | { error: string }> {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) {
    return { error: 'Contract address not configured.' };
  }
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };

    if (!(await isContractDeployed(signer, CONTRACT_ADDRESS))) {
      return { error: `No contract found at ${CONTRACT_ADDRESS}.` };
    }

    const contract = getContract(signer)!;
    const tx = await contract.raiseDispute(taskDbId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected by user' };
    }
    return {
      error:
        err?.reason ||
        err?.message ||
        'Transaction failed (are you the contract owner or task client?)',
    };
  }
}

export async function resolveDisputeOnChain(
  taskDbId: string,
  recipient: string,
): Promise<{ txHash: string } | { error: string }> {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) {
    return { error: 'Contract address not configured.' };
  }
  if (!recipient || !/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
    return { error: 'Invalid recipient ETH address.' };
  }
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };

    if (!(await isContractDeployed(signer, CONTRACT_ADDRESS))) {
      return { error: `No contract found at ${CONTRACT_ADDRESS}.` };
    }

    const contract = getContract(signer)!;
    const tx = await contract.resolveDispute(taskDbId, recipient);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      return { error: 'Transaction rejected' };
    }
    return {
      error:
        err?.reason ||
        err?.message ||
        'Failed — ensure your MetaMask wallet is the contract owner',
    };
  }
}

export async function adminReleaseOnChain(
  taskDbId: string,
  recipient: string,
): Promise<{ txHash: string } | { error: string }> {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) {
    return { error: 'Contract address not configured.' };
  }
  if (!recipient || !/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
    return { error: 'Invalid recipient ETH address.' };
  }
  try {
    const signer = await getSigner();
    if (!signer) return { error: 'MetaMask not connected' };

    if (!(await isContractDeployed(signer, CONTRACT_ADDRESS))) {
      return { error: `No contract found at ${CONTRACT_ADDRESS}.` };
    }

    const contract = getContract(signer)!;
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

export async function getOnChainTaskState(taskDbId: string): Promise<number | null> {
  if (!isValidContractAddress(CONTRACT_ADDRESS)) return null;
  try {
    const provider = await getProvider();
    if (!provider) return null;

    if (!(await isContractDeployed(provider, CONTRACT_ADDRESS))) return null;

    const contract = getContract(provider);
    if (!contract) return null;
    const state = await contract.getTaskState(taskDbId);
    return Number(state);
  } catch {
    return null;
  }
}

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
