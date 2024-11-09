"use client";

import React from 'react';
import { RainbowKitCustomConnectButton } from "../components/RainbowKitCustomConnectButton";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">Rent2Own</h1>
      <RainbowKitCustomConnectButton />
    </header>
  );
}
