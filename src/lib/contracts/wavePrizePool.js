import WavePrizePoolABI from '../../abi/WavePrizePool.json';

export const WAVE_PRIZE_POOL_ADDRESS = import.meta.env.WAVE_PRIZE_POOL_ADDRESS || "0xd332fbe3be3b935e1e133abac2743962039c47e7";

// Add missing functions to the ABI if they're not included
const additionalFunctions = [
  {
    name: 'createPool',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_baseToken', type: 'address' },
      { name: '_burnFee', type: 'uint8' },
      { name: '_treasuryFee', type: 'uint8' },
      { name: '_limitAmount', type: 'uint256' },
      { name: '_ticketPrice', type: 'uint256' },
      { name: '_poolType', type: 'bool' }
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'getAllPoolIds',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  {
    name: 'getPoolState',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_poolId', type: 'bytes32' }],
    outputs: [
      { name: 'totalXpAmount', type: 'uint256' },
      { name: 'users', type: 'tuple[]', components: [
        { name: 'user', type: 'address' },
        { name: 'xpAmount', type: 'uint256' }
      ]},
      { name: 'winner', type: 'tuple', components: [
        { name: 'user', type: 'address' },
        { name: 'xpAmount', type: 'uint256' }
      ]}
    ],
  },
  {
    name: 'enterPool',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_poolId', type: 'bytes32' },
      { name: '_xpAmount', type: 'uint256' }
    ],
    outputs: [],
  },
  {
    name: 'drawWinner',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_poolId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'treasury',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  }
];

export const wavePrizePoolConfig = {
  address: WAVE_PRIZE_POOL_ADDRESS,
  abi: [...(WavePrizePoolABI.abi || WavePrizePoolABI), ...additionalFunctions],
};

export const wavePrizePoolABI = [...(WavePrizePoolABI.abi || WavePrizePoolABI), ...additionalFunctions];