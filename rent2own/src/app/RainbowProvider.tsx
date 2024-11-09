"use client";

import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createConfig, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const { chains, publicClient } = configureChains(
  [chain.mainnet, chain.goerli],
  [
    alchemyProvider({ apiKey: 'YOUR_ALCHEMY_API_KEY' }), // Replace with your Alchemy API key
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Rent2Own',
  projectId: 'YOUR_PROJECT_ID', // Replace with your Project ID
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function RainbowProviderComponent({ children, ...props }) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains} {...props}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}