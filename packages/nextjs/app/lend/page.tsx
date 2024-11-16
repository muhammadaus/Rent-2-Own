"use client";

import React, { useCallback, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { useScaffoldContract, useTransactor } from "~~/hooks/scaffold-eth";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";

// Define the NFT type
interface NFT {
  name: string;
  tokenId: bigint;
  contractAddress: string; // Add this property based on your NFT structure
}

const RentToOwnPage = () => {
  const { address: connectedAddress } = useAccount();
  const { RentToOwn, MyNFT } = useAllContracts();

  const [nfts, setNfts] = useState<NFT[]>([]); // Specify the type for nfts
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null); // Specify the type for selectedNft
  const [monthlyPayment, setMonthlyPayment] = useState<string>("");
  const [numberOfPayments, setNumberOfPayments] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>(""); // State for contract address input

  const { data: myNFTContract, isLoading: myNFTIsLoading } = useScaffoldContract({
    contractName: "MyNFT",
  });
  const { writeContractAsync } = useWriteContract();
  const writeTx = useTransactor();

  const loadNFTs = async (contractAddress: string): Promise<NFT[]> => {
    if (myNFTIsLoading || !myNFTContract) {
      alert("The NFT Contract is loading.");
      return [];
    }
    // Get the current token ID
    const currentTokenId = await myNFTContract.read.getCurrentTokenId();
    console.log("Current token ID:", currentTokenId.toString());

    // Create NFT object
    const nfts: NFT[] = [
      {
        name: await myNFTContract.read.name(),
        tokenId: currentTokenId,
        contractAddress: contractAddress,
      },
    ];

    console.log("Found NFTs:", nfts);
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
      alert("Failed to load NFTs. Check console for details.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress, setContractAddress]);

  const handleLendNFT = useCallback(async () => {
    if (myNFTIsLoading || !myNFTContract) {
      alert("The NFT Contract is loading.");
      return [];
    }
    if (!selectedNft || !monthlyPayment || !numberOfPayments) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // 1. First verify the NFT contract
      // 2. Check if user owns the NFT
      const owner = await myNFTContract.read.ownerOf(selectedNft.tokenId as any);
      if (owner.toLowerCase() !== connectedAddress) {
        alert("You do not own this NFT");
        return;
      }

      // 3. Get the RentToOwn contract using the constant
      // 4. Approve the NFT transfer
      console.log("Approving NFT transfer...");
      const writeApproveNFTTransfer = () =>
        writeContractAsync({
          address: MyNFT.address,
          abi: MyNFT.abi,
          functionName: "approve",
          args: [RentToOwn.address, selectedNft.tokenId],
        });
      const approveTx = await writeTx(writeApproveNFTTransfer, { blockConfirmations: 1 });
      console.log("Approval transaction:", approveTx);

      // 5. List the NFT
      console.log("Listing NFT with parameters:", {
        nftContract: selectedNft.contractAddress,
        tokenId: selectedNft.tokenId,
        monthlyPayment,
        numberOfPayments,
      });

      const writeListNFT = () =>
        writeContractAsync({
          address: RentToOwn.address,
          abi: RentToOwn.abi,
          functionName: "listNFT",
          args: [selectedNft.contractAddress, selectedNft.tokenId, parseEther(monthlyPayment), numberOfPayments],
        });

      const listTx = await writeTx(writeListNFT, { blockConfirmations: 1 });

      console.log("Listing transaction:", listTx);
      alert("NFT listed successfully!");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNft, setSelectedNft, monthlyPayment, setMonthlyPayment, numberOfPayments, setNumberOfPayments]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rent to Own NFTs</h1>

      <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Load NFTs from Contract</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter NFT Contract Address"
            value={contractAddress}
            onChange={e => setContractAddress(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLoadNFTs}
            className="bg-info text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Load NFTs
          </button>
        </div>
      </div>

      <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your NFTs</h2>
        {nfts.length === 0 ? (
          <p className="text-gray-500">No NFTs found. Load your NFTs first.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  selectedNft?.tokenId === nft.tokenId ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{nft.name}</span>
                  <span className="text-gray-500">ID: {nft.tokenId}</span>
                </div>
                <button
                  onClick={() => setSelectedNft(nft)}
                  className={`w-full py-2 px-4 rounded transition-colors ${
                    selectedNft?.tokenId === nft.tokenId
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {selectedNft?.tokenId === nft.tokenId ? "Selected" : "Select NFT"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNft && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Lend NFT</h2>
          <div className="mb-4">
            <p className="text-lg mb-2">
              Selected NFT: <span className="font-medium">{selectedNft.name}</span>
            </p>
            <p className="text-gray-500">Token ID: {selectedNft.tokenId}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Payment (ETH)</label>
              <input
                type="text"
                placeholder="e.g., 0.1"
                value={monthlyPayment}
                onChange={e => setMonthlyPayment(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Payments</label>
              <input
                type="text"
                placeholder="e.g., 12"
                value={numberOfPayments}
                onChange={e => setNumberOfPayments(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleLendNFT}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            List NFT for Rent-to-Own
          </button>
        </div>
      )}
    </div>
  );
};

export default RentToOwnPage;
