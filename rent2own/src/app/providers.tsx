'use client'

import { WagmiProvider, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.alchemyapi.io/v2/6hQXqTWnhfkg0dldNoqwrB2Eq2Xajdgl`),
    [sepolia.id]: http(`https://eth-sepolia.alchemyapi.io/v2/6hQXqTWnhfkg0dldNoqwrB2Eq2Xajdgl`),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
