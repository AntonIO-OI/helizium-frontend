import { ethers } from 'ethers';
import { ContractAction, ContractResult } from '../types/contracts';
import { generateContractMessage } from './contractMessages';

async function connectWallet(): Promise<ContractResult> {
  if (!window.ethereum) {
    return {
      success: false,
      error: 'MetaMask is not installed'
    };
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  try {
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts.length === 0) {
      return {
        success: false,
        error: 'Please connect your wallet'
      };
    }

    return {
      success: true,
      signature: {
        signer: accounts[0],
        signature: '',
        timestamp: Date.now()
      }
    };
  } catch (err: any) {
    if (err.code === -32002) {
      return {
        success: false,
        error: 'Please check MetaMask popup to connect'
      };
    } else if (err.code === 4001) {
      return {
        success: false,
        error: 'You rejected the connection request'
      };
    }
    return {
      success: false,
      error: 'Failed to connect wallet'
    };
  }
}

async function signMessage(message: string, provider: ethers.BrowserProvider): Promise<ContractResult> {
  try {
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    
    return {
      success: true,
      signature: {
        signature,
        signer: await signer.getAddress(),
        timestamp: Date.now()
      }
    };
  } catch (err: any) {
    if (err.code === 4001 || err.code === "ACTION_REJECTED") {
      return {
        success: false,
        error: 'You rejected the signature request'
      };
    }
    return {
      success: false,
      error: 'Failed to sign message'
    };
  }
}

export async function signTaskContract(
  action: ContractAction,
  taskId: number,
  taskTitle: string,
  performerId?: number,
): Promise<ContractResult> {
  try {
    const walletConnection = await connectWallet();
    if (!walletConnection.success) {
      return walletConnection;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const message = generateContractMessage({
      action,
      taskId,
      taskTitle,
      performerId
    });

    return await signMessage(message, provider);
  } catch (err: any) {
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
