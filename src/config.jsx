import { http, createConfig } from '@wagmi/core'
import {bsc, bscTestnet, sepolia } from '@wagmi/core/chains'
// import { defineChain } from 'viem'
// import dotenv from 'dotenv'
// dotenv.config()

const projectId = import.meta.env.NEXT_PUBLIC_PROJECT_ID || "166c810a1a76fedfcbfb4a4c442c40ed"

export const config = createConfig({
  chains: [bsc, bscTestnet, sepolia],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [sepolia.id]: http(),
  },
  projectId: projectId,
})