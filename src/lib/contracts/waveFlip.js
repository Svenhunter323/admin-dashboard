import WaveFlipABI from '../../abi/WaveFlip.json';

export const WAVE_FLIP_ADDRESS = process.env.VITE_WAVE_FLIP_ADDRESS || '0x...';

export const waveFlipConfig = {
  address: WAVE_FLIP_ADDRESS,
  abi: WaveFlipABI,
};

export const waveFlipABI = WaveFlipABI;