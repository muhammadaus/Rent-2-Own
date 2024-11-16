"use client";

import React, { useCallback, useState } from "react";
import { useNotification } from "~~/contexts/NotificationContext";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

// Define the NFT type
interface NFT {
  name: string;
  tokenId: bigint;
  contractAddress: string; // Add this property based on your NFT structure
}

const LoadNFTsComponent = () => {
  const { addErrorNotification } = useNotification();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nfts, setNfts] = useState<NFT[]>([]); // Specify the type for nfts
  const [contractAddress, setContractAddress] = useState<string>(""); // State for contract address input

  const { data: myNFTContract, isLoading: myNFTIsLoading } = useScaffoldContract({
    contractName: "MyNFT",
  });

  const loadNFTs = async (contractAddress: string): Promise<NFT[]> => {
    if (myNFTIsLoading || !myNFTContract) {
      addErrorNotification("The NFT Contract is loading.");
      return [];
    }
    // Get the current token ID
    const currentTokenId = await myNFTContract.read.getCurrentTokenId();
    // console.log("Current token ID:", currentTokenId.toString());

    // Create NFT object
    const nfts: NFT[] = [
      {
        name: await myNFTContract.read.name(),
        tokenId: currentTokenId.toString(),
        contractAddress: contractAddress,
      },
    ];

    // console.log("Found NFTs:", nfts);
    return nfts;
  };

  const handleLoadNFTs = useCallback(async () => {
    if (!contractAddress) {
      alert("Please enter a valid contract address.");
      return;
    }

    try {
      const nfts = await loadNFTs(contractAddress);
      setNfts(nfts);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      addErrorNotification("Failed to load NFTs. Check console for details.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, setContractAddress]);

  return (
    <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Load NFTs from Contract</h2>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter NFT Contract Address"
          value={contractAddress}
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
    </div>
  );
};

export default LoadNFTsComponent;
