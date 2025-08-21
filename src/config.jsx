import { http, createConfig } from '@wagmi/core'
import { bsc, bscTestnet } from '@wagmi/core/chains'

const projectId = import.meta.env.VITE_PROJECT_ID || "166c810a1a76fedfcbfb4a4c442c40ed"

// BNB Chain RPC endpoints
const BSC_MAINNET_RPC = import.meta.env.VITE_BSC_MAINNET_RPC || 'https://bsc-dataseed1.binance.org'
const BSC_TESTNET_RPC = import.meta.env.VITE_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545'

export const config = createConfig({
  chains: [bscTestnet, bsc], 
  transports: {
    [bsc.id]: http(BSC_MAINNET_RPC),
    [bscTestnet.id]: http(BSC_TESTNET_RPC),
  },
  projectId: projectId,
})