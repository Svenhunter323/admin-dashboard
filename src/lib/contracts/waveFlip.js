import WaveFlipABI from '../../abi/WaveFlip.json';

export const VITE_WAVE_FLIP_ADDRESS = import.meta.env.VITE_WAVE_FLIP_ADDRESS || "0x4ceb55189d5032ca3c91771a03fb88a1a7d9ee10";

export const waveFlipConfig = {
  address: VITE_WAVE_FLIP_ADDRESS,
  abi: WaveFlipABI,
};

export const waveFlipABI = WaveFlipABI;