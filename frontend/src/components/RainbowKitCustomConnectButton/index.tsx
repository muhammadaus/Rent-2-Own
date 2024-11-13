"use client";

import React from "react";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";

export const RainbowKitCustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }
              return (
                <>
                  <div className="flex flex-col items-center mr-1">
                    <span className="text-xs" style={{ color: '#ffffff' }}>
                      {chain.name}
                    </span>
                  </div>
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
