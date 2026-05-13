'use client';

import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  Copy,
  Wallet,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { usersApi } from '../../lib/api/users';

export default function WalletSection() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceUsd, setBalanceUsd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [networkName, setNetworkName] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);

  const fetchEthPrice = async () => {
    try {
      const res = await fetch('/api/eth-price');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.ethereum?.usd ?? null;
    } catch {
      return null;
    }
  };

  const updateBalanceUsd = useCallback(async (ethBalance: string) => {
    const price = await fetchEthPrice();
    if (price) setBalanceUsd((parseFloat(ethBalance) * price).toFixed(2));
  }, []);

  const loadWalletData = useCallback(
    async (address: string) => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(address);
      const ethBal = ethers.formatEther(bal);
      setBalance(ethBal);
      await updateBalanceUsd(ethBal);

      const network = await provider.getNetwork();
      setNetworkName(network.name);

      const feeData = await provider.getFeeData();
      setGasPrice(ethers.formatUnits(feeData.gasPrice || 0, 'gwei'));
    },
    [updateBalanceUsd],
  );

  const saveAddressToBackend = useCallback(async (address: string) => {
    try {
      await usersApi.updateEthAddress(address);
      setAddressSaved(true);
    } catch {
      // Non-critical — wallet still works even if storage fails.
    }
  }, []);

  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setBalance(null);
        setBalanceUsd(null);
        setAddressSaved(false);
        sessionStorage.removeItem('walletConnected');
      } else {
        setAccount(accounts[0]);
        await loadWalletData(accounts[0]);
        await saveAddressToBackend(accounts[0]);
      }
    },
    [loadWalletData, saveAddressToBackend],
  );

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to connect your wallet.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await loadWalletData(accounts[0]);
        await saveAddressToBackend(accounts[0]);
        sessionStorage.setItem('walletConnected', 'true');
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }
    } catch (err: any) {
      if (err.code === 4001) setError('Connection rejected.');
      else setError('Failed to connect wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const check = async () => {
      if (
        sessionStorage.getItem('walletConnected') !== 'true' ||
        !window.ethereum
      )
        return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await loadWalletData(accounts[0]);
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }
    };
    check();
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged,
        );
      }
    };
  }, [handleAccountsChanged, loadWalletData]);

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
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
        <div className="mb-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!account ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Connect your MetaMask wallet to fund tasks, receive payments, and
            participate in the escrow system. Your address will be stored in
            your profile so clients can send you payments.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isConnecting ? 'Connecting…' : 'Connect MetaMask Wallet'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addressSaved && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Wallet address saved to your profile — clients can now pay you
                on-chain.
              </span>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Connected Network</div>
            <div className="font-medium capitalize">
              {networkName || 'Unknown'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {account.slice(0, 6)}…{account.slice(-4)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAddress}
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="Copy full address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://etherscan.io/address/${account}`,
                      '_blank',
                    )
                  }
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
                  <span className="text-gray-500 text-sm">≈ ${balanceUsd}</span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Gas Price</div>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {parseFloat(gasPrice || '0').toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm">Gwei</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
