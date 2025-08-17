// useVrfSubscriptionBalance.jsx
import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { formatUnits } from 'viem';

// Ethereum Sepolia — VRF v2.5 coordinator (official)
const DEFAULT_COORDINATOR = import.meta.env.VITE_DEFAULT_COORDINATOR || '0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B';
const VRF_SUBSCRIPTION_ID = import.meta.env.VITE_VRF_SUBSCRIPTION_ID || '49596265338176564079456785074959696723617889412259832996157212647999741015293';

// Minimal ABI + the InvalidSubscription error so viem can decode reverts
const vrfV25Abi = [
  {
    name: 'getSubscription',
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'subId', type: 'uint256' }],
    outputs: [
      { name: 'balance', type: 'uint96' },        // LINK (juels)
      { name: 'nativeBalance', type: 'uint96' },  // native (wei)
      { name: 'reqCount', type: 'uint64' },
      { name: 'owner', type: 'address' },
      { name: 'consumers', type: 'address[]' },
    ],
  },
  { type: 'error', name: 'InvalidSubscription', inputs: [] },
];

export const useLinkBalance = ({
  subscriptionId = VRF_SUBSCRIPTION_ID,   // MUST be the real v2.5 subId (BigInt or number coercible to BigInt)
  coordinator = DEFAULT_COORDINATOR,
  chainId = sepolia.id,
} = {}) => {
  const [balance, setBalance] = useState(null); // { link:{raw,formatted}, native:{raw,formatted}, reqCount, owner, consumers }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const publicClient = usePublicClient({ chainId });

  const fetchBalance = async () => {
    if (!publicClient || !subscriptionId) return;
    try {
      setLoading(true);
      setError(null);

      const res = await publicClient.readContract({
        address: coordinator,
        abi: vrfV25Abi,
        functionName: 'getSubscription',
        args: [BigInt(subscriptionId)],
      });

      const [linkJuels, nativeWei, reqCount, owner, consumers] = res;

      // console.log('VRF Subscription Balance:', {
      //   linkJuels, 
      //   nativeWei,
      //   reqCount,
      //   owner,  
      //   consumers,
      // });

      setBalance({
        link: { raw: linkJuels, formatted: formatUnits(linkJuels, 18) },
        native: { raw: nativeWei, formatted: formatUnits(nativeWei, 18) },
        reqCount,
        owner,
        consumers,
      });
    } catch (e) {
      // Helpful message for the common case
      const msg =
        e?.shortMessage?.includes('InvalidSubscription') ||
        e?.message?.includes('InvalidSubscription') ||
        e?.message?.includes('0x1f6a65b6')
          ? 'Invalid subscription on this coordinator/chain. Double-check your v2.5 Subscription ID.'
          : (e?.shortMessage || e?.message || 'Failed to fetch subscription');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const id = setInterval(fetchBalance, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, coordinator, subscriptionId, chainId]);

  return { balance, loading, error, refetch: fetchBalance };
};
