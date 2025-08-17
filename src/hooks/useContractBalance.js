import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';

export const useContractBalance = ({ 
  contractAddress, 
  tokenAddress, 
  tokenDecimals = 18,
  chainId,
  refreshInterval = 30000 
}) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const publicClient = usePublicClient({ chainId });

  const fetchBalance = async () => {
    if (!publicClient || !contractAddress || !tokenAddress) return;
    
    try {
      setLoading(true);
      setError(null);

      const balanceResult = await publicClient.readContract({
        address: tokenAddress,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
          },
        ],
        functionName: 'balanceOf',
        args: [contractAddress],
      });

      setBalance({
        raw: balanceResult,
        formatted: formatUnits(balanceResult, tokenDecimals),
      });
    } catch (e) {
      const msg = e?.shortMessage || e?.message || 'Failed to fetch balance';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [publicClient, contractAddress, tokenAddress, chainId, refreshInterval]);

  return { balance, loading, error, refetch: fetchBalance };
};