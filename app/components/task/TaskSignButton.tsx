import { useState } from 'react';
import { ethers, JsonRpcSigner } from 'ethers';
import { Wallet } from 'lucide-react';

interface TaskSignButtonProps {
  taskId: number;
  taskTitle: string;
  disabled?: boolean;
}

export default function TaskSignButton({
  taskId,
  taskTitle,
  disabled = false,
}: TaskSignButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleError = (err: any) => {
    if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
      setError('You rejected the signature request');
    } else if (err.code === -32002) {
      setError('Please check MetaMask popup to connect');
    } else if (err.message?.includes('user rejected')) {
      setError('You rejected the connection request');
    } else {
      setError(err.message || 'Failed to sign task');
    }
  };

  const connectAndSign = async () => {
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        setError('Please install MetaMask to sign tasks');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      let accounts: JsonRpcSigner[] = [];

      try {
        accounts = await provider.listAccounts();
      } catch (e) {
      }

      if (accounts.length === 0) {
        try {
          accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
        } catch (err) {
          handleError(err);
          return;
        }
      }

      if (accounts.length === 0) {
        setError('Please connect your wallet');
        return;
      }

      const signer = await provider.getSigner();
      const message = `Signing task #${taskId}: ${taskTitle}\n\nThis signature confirms your agreement to the task terms.`;

      try {
        const signature = await signer.signMessage(message);
        console.log('Signature:', signature);
        setSigned(true);
        setError(null);
      } catch (err) {
        handleError(err);
        return;
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-2">
      {!signed ? (
        <button
          onClick={connectAndSign}
          disabled={disabled || isConnecting}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-5 h-5" />
          {isConnecting ? 'Connecting...' : 'Sign with MetaMask'}
        </button>
      ) : (
        <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <Wallet className="w-5 h-5" />
          Task Signed
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
