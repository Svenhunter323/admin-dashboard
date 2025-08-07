import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { formatUnits } from 'viem';

const LINK_TOKEN_ADDRESS = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia LINK
const VRF_CONSUMER_ADDRESS = "0x9da078c09a45704d3127a4d8ac9ef366a7da3440"; // Your VRF consumer contract

const erc20Abi = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

export const useLinkBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const publicClient = usePublicClient({
    chainId: sepolia.id,
  });

  const fetchBalance = async () => {
    if (!publicClient) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get balance
      const balanceResult = await publicClient.readContract({
        address: LINK_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [VRF_CONSUMER_ADDRESS],
      });

      // Get decimals
      const decimalsResult = await publicClient.readContract({
        address: LINK_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
      });

      // Format balance
      const formattedBalance = formatUnits(balanceResult, decimalsResult);
      
      setBalance({
        raw: balanceResult,
        formatted: formattedBalance,
        decimals: decimalsResult,
      });
    } catch (err) {
      console.error('Error fetching LINK balance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(interval);
  }, [publicClient]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
};