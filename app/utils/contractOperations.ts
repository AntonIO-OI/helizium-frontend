import { ethers } from 'ethers';
import { ContractAction, ContractResult } from '../types/contracts';
import { generateContractMessage } from './contractMessages';

const TASK_ESCROW_ABI = [
  'function fundTask(string calldata taskDbId) external payable',
  'function assignFreelancer(string calldata taskDbId, address payable freelancer) external',
  'function submitWork(string calldata taskDbId) external',
  'function approveWork(string calldata taskDbId) external',
  'function cancelTask(string calldata taskDbId) external',
  'function raiseDispute(string calldata taskDbId) external',
  'function getTask(string calldata taskDbId) external view returns (tuple(address client, address freelancer, uint256 amount, uint8 state, uint256 createdAt, uint256 completedAt))',
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

async function getProvider(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

async function getContract(withSigner = false) {
  const provider = await getProvider();
  if (!provider) return null;

  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, TASK_ESCROW_ABI, signer);
  }

  return new ethers.Contract(CONTRACT_ADDRESS, TASK_ESCROW_ABI, provider);
}

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
      if (err.code === 4001) return { success: false, error: 'You rejected the wallet connection' };
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
      signature: {
        signature,
        signer: accounts[0],
        timestamp: Date.now(),
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unexpected error' };
  }
}

/// On-chain operations (used when contract is deployed)
export async function fundTaskOnChain(taskDbId: string, priceInEth: string): Promise<{ txHash: string } | { error: string }> {
  try {
    const contract = await getContract(true);
    if (!contract) return { error: 'Contract not available. Check NEXT_PUBLIC_CONTRACT_ADDRESS.' };
    const tx = await contract.fundTask(taskDbId, { value: ethers.parseEther(priceInEth) });
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}

export async function assignFreelancerOnChain(taskDbId: string, freelancerAddress: string): Promise<{ txHash: string } | { error: string }> {
  try {
    const contract = await getContract(true);
    if (!contract) return { error: 'Contract not available' };
    const tx = await contract.assignFreelancer(taskDbId, freelancerAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}
export async function approveWorkOnChain(taskDbId: string): Promise<{ txHash: string } | { error: string }> {
  try {
    const contract = await getContract(true);
    if (!contract) return { error: 'Contract not available' };
    const tx = await contract.approveWork(taskDbId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}

export async function cancelTaskOnChain(taskDbId: string): Promise<{ txHash: string } | { error: string }> {
  try {
    const contract = await getContract(true);
    if (!contract) return { error: 'Contract not available' };
    const tx = await contract.cancelTask(taskDbId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err: any) {
    return { error: err?.reason || err?.message || 'Transaction failed' };
  }
}
