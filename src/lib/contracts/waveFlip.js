import WaveFlipABI from '../../abi/WaveFlip.json';

export const WAVE_FLIP_ADDRESS = import.meta.env.WAVE_FLIP_ADDRESS || "0x4ceb55189d5032ca3c91771a03fb88a1a7d9ee10";

export const waveFlipConfig = {
  address: WAVE_FLIP_ADDRESS,
  abi: WaveFlipABI,
};

export const waveFlipABI = WaveFlipABI;