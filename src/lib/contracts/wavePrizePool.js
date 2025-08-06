import WavePrizePoolABI from '../../abi/WavePrizePool.json';

export const WAVE_PRIZE_POOL_ADDRESS = process.env.VITE_WAVE_PRIZE_POOL_ADDRESS || '0x...';

export const wavePrizePoolConfig = {
  address: WAVE_PRIZE_POOL_ADDRESS,
  abi: WavePrizePoolABI,
};

export const wavePrizePoolABI = WavePrizePoolABI;