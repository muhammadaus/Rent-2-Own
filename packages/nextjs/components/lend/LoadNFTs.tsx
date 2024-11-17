"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { useFetchNFTs } from "~~/hooks/useFetchNFTs";
import { notification } from "~~/utils/scaffold-eth";

export const LoadNFTsComponent = () => {
  const { data: myNFTContract, isLoading: myNFTIsLoading } = useScaffoldContract({
    contractName: "MyNFT",
  });
  const [contractAddress, setContractAddress] = useState<string>(""); // State for contract address input
  const { fetchNFTs } = useFetchNFTs();

  useEffect(() => {
    if (myNFTIsLoading || !myNFTContract) return;
    setContractAddress(myNFTContract.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myNFTIsLoading]);

  const handleLoadNFTs = useCallback(async () => {
    if (!contractAddress) {
      notification.error("Please enter a valid contract address.");
      return;
    }

    void fetchNFTs(contractAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress]);

  return (
    <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Load NFTs from Contract</h2>
      {myNFTContract && (
        <div className="flex gap-4">
          <AddressInput
            value={contractAddress}
            placeholder="Enter NFT Contract Address"
            onChange={setContractAddress}
          />

          <button
            onClick={handleLoadNFTs}
            className="bg-info text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Load NFTs
          </button>
        </div>
      )}
    </div>
  );
};
