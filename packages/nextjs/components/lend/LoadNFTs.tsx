"use client";

import React, { useCallback, useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { useFetchNFTs } from "~~/hooks/useFetchNFTs";
import useNFTStore from "~~/services/store/useNFTStore";
import { notification } from "~~/utils/scaffold-eth";

export const LoadNFTsComponent = () => {
  const { data: myNFTContract, isLoading: myNFTIsLoading } = useScaffoldContract({
    contractName: "MyNFT",
  });
  const [contractAddress, setContractAddress] = useState<string>(""); // State for contract address input
  const { setNFTs, setLoading } = useNFTStore();
  const { fetchNFTs } = useFetchNFTs();

  const handleLoadNFTs = useCallback(async () => {
    if (myNFTIsLoading || !myNFTContract || !contractAddress) {
      notification.error("Please enter a valid contract address.");
      return;
    }

    const loadNFTs = async () => {
      setLoading(true);
      try {
        const fetchedNFTs = await fetchNFTs(contractAddress);
        setNFTs(fetchedNFTs);
      } catch (err: unknown) {
        notification.error((err as Error)?.message);
      } finally {
        setLoading(false);
      }
    };

    void loadNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress]);

  return (
    <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Load NFTs from Contract</h2>
      {myNFTContract && (
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter NFT Contract Address"
            value={contractAddress || myNFTContract.address}
            onChange={e => setContractAddress(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-secondary"
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
