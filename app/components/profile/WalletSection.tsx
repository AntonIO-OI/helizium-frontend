import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Copy, Wallet, ExternalLink, LogOut } from 'lucide-react';

export default function WalletSection() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceUsd, setBalanceUsd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [networkName, setNetworkName] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('');

  const fetchEthPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (err) {
      console.error('Failed to fetch ETH price:', err);
      return null;
    }
  };

  const updateBalanceUsd = async (ethBalance: string) => {
    const ethPrice = await fetchEthPrice();
    if (ethPrice) {
      const usdBalance = parseFloat(ethBalance) * ethPrice;
      setBalanceUsd(usdBalance.toFixed(2));
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to connect your wallet');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const balance = await provider.getBalance(accounts[0]);
        const ethBalance = ethers.formatEther(balance);
        setBalance(ethBalance);
        await updateBalanceUsd(ethBalance);
        
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        
        const feeData = await provider.getFeeData();
        setGasPrice(ethers.formatUnits(feeData.gasPrice || 0, 'gwei'));

        setError(null);
        localStorage.setItem('walletConnected', 'true');
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance(null);
      setBalanceUsd(null);
      localStorage.removeItem('walletConnected');
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(accounts[0]);
      const ethBalance = ethers.formatEther(balance);
      setBalance(ethBalance);
      await updateBalanceUsd(ethBalance);
    }
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const shouldConnect = localStorage.getItem('walletConnected') === 'true';
      
      if (shouldConnect && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        try {
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const balance = await provider.getBalance(accounts[0]);
            const ethBalance = ethers.formatEther(balance);
            setBalance(ethBalance);
            await updateBalanceUsd(ethBalance);
            
            const network = await provider.getNetwork();
            setNetworkName(network.name);
            
            const feeData = await provider.getFeeData();
            setGasPrice(ethers.formatUnits(feeData.gasPrice || 0, 'gwei'));

            window.ethereum.on('accountsChanged', handleAccountsChanged);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const openEtherscan = () => {
    if (account) {
      window.open(`https://etherscan.io/address/${account}`, '_blank');
    }
  };

  return (
    <div className="bg-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold">Ethereum Wallet</h2>
      </div>

      {error && (
        <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {!account ? (
        <button
          onClick={connectWallet}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Connected Network</div>
            <div className="font-medium capitalize">{networkName || 'Unknown'}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAddress}
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={openEtherscan}
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                {copySuccess && (
                  <span className="text-green-500 text-xs">Copied!</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Balance</div>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {parseFloat(balance || '0').toFixed(4)} ETH
                </span>
                {balanceUsd && (
                  <span className="text-gray-500">
                    ≈ ${balanceUsd}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Gas Price</div>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {parseFloat(gasPrice || '0').toFixed(2)}
                </span>
                <span className="text-gray-500">Gwei</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 