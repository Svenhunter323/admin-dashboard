import WaveChallengeFlipABI from '../../abi/WaveChallengeFlip.json';

export const WAVE_CHALLENGE_FLIP_ADDRESS = process.env.VITE_WAVE_CHALLENGE_FLIP_ADDRESS || '0x...';

export const waveChallengeFlipConfig = {
  address: WAVE_CHALLENGE_FLIP_ADDRESS,
  abi: WaveChallengeFlipABI,
};

export const waveChallengeFlipABI = WaveChallengeFlipABI;