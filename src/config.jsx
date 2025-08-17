import { http, createConfig } from '@wagmi/core'
import { bsc, bscTestnet, sepolia } from '@wagmi/core/chains'
// import { defineChain } from 'viem'
// import dotenv from 'dotenv'
// dotenv.config()

const projectId = import.meta.env.VITE_PROJECT_ID || "166c810a1a76fedfcbfb4a4c442c40ed"

export const config = createConfig({
  chains: [sepolia, bsc, bscTestnet], 
  transports: {
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_ID || 'e58c047765b946f7b4bdd61630660e96'}`),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  projectId: projectId,
})