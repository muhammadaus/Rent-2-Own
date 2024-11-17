"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { parseEther } from "viem";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";
import { LoadNFTsComponent } from "~~/components/lend/LoadNFTs";
import { useScaffoldContract, useTransactor } from "~~/hooks/scaffold-eth";
import { useFetchNFTs } from "~~/hooks/useFetchNFTs";
import useNFTStore from "~~/services/store/useNFTStore";
import { notification } from "~~/utils/scaffold-eth";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";

const RentToOwnPage = () => {
  const { address: connectedAddress } = useAccount();
  const { RentToOwn, MyNFT } = useAllContracts();

  const [monthlyPayment, setMonthlyPayment] = useState<string>("");
  const [numberOfPayments, setNumberOfPayments] = useState<string>("");

  const { nfts, selectedNft, isLoading, setNFTs, setLoading, setSelectedNft } = useNFTStore();
  const { fetchNFTs } = useFetchNFTs();

  const { data: walletClient } = useWalletClient({ account: connectedAddress });
  const { data: myNFTContract, isLoading: myNFTIsLoading } = useScaffoldContract({
    contractName: "MyNFT",
    walletClient,
  });
  const { writeContractAsync } = useWriteContract();
  const writeTx = useTransactor();

  useEffect(() => {
    if (myNFTIsLoading || !myNFTContract || !connectedAddress) return;

    const loadNFTs = async () => {
      setLoading(true);
      try {
        const fetchedNFTs = await fetchNFTs();
        setNFTs(fetchedNFTs);
      } catch (err: unknown) {
        notification.error((err as Error)?.message);
      } finally {
        setLoading(false);
      }
    };

    void loadNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myNFTIsLoading, connectedAddress]);

  const handleLendNFT = useCallback(async () => {
    if (myNFTIsLoading || !myNFTContract) {
      notification.error("The NFT Contract is loading.");
      return [];
    }
    if (!selectedNft || !monthlyPayment || !numberOfPayments) {
      notification.error("Please fill in all fields");
      return;
    }
    const currentTokenId = BigInt(selectedNft.tokenId);

    try {
      // 1. First verify the NFT contract
      // 2. Check if user owns the NFT
      const owner = await myNFTContract.read.ownerOf([currentTokenId]);
      if (owner !== connectedAddress) {
        notification.error("You do not own this NFT");
        return;
      }

      // 3. Get the RentToOwn contract using the constant
      // 4. Approve the NFT transfer
      console.log("Approving NFT transfer...");
      const approveNFT = () =>
        writeContractAsync({
          address: MyNFT.address,
          abi: MyNFT.abi,
          functionName: "approve",
          args: [RentToOwn.address, currentTokenId],
        });
      const approveTx = await writeTx(approveNFT, { blockConfirmations: 1 });
      console.log("Approval transaction:", approveTx);

      // 5. List the NFT
      console.log("Listing NFT with parameters:", {
        nftContract: selectedNft.contractAddress,
        tokenId: currentTokenId,
        monthlyPayment,
        numberOfPayments,
        typeof: typeof numberOfPayments,
      });

      const writeListNFT = () =>
        writeContractAsync({
          address: RentToOwn.address,
          abi: RentToOwn.abi,
          functionName: "listNFT",
          args: [selectedNft.contractAddress, currentTokenId, parseEther(monthlyPayment), numberOfPayments],
        });

      const listTx = await writeTx(writeListNFT, { blockConfirmations: 1 });

      console.log("Listing transaction:", listTx);
      notification.success("NFT listed successfully!");
    } catch (error: any) {
      console.error("Error:", error);
      notification.error(`Error: ${error.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNft, monthlyPayment, numberOfPayments]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rent to Own NFTs</h1>

      <LoadNFTsComponent />

      <div className="bg-secondary rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your NFTs</h2>
        {isLoading ? (
          <p className="text-gray-500">No NFTs found. Load your NFTs first.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft, index) => (
              <div
                className={`card bg-base-100 w-96 shadow-xl ${
                  selectedNft?.tokenId === nft.tokenId ? "border-blue-500" : "border-gray-200"
                }`}
                key={index}
              >
                <figure>
                  <Image width={900} height={900} src={nft.tokenURI} alt={nft.name} />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">
                    {nft.name}
                    <div className="badge badge-secondary p-5">ID: {nft.tokenId}</div>
                  </h2>
                  <button
                    onClick={() => setSelectedNft(nft)}
                    className={`w-full py-2 px-4 btn-info glass rounded transition-colors ${
                      selectedNft?.tokenId === nft.tokenId
                        ? "bg-primary hover:bg-blue-600 text-warning"
                        : "bg-warning hover:bg-gray-200 text-secondary"
                    }`}
                  >
                    {selectedNft?.tokenId === nft.tokenId ? "Selected" : "Select NFT"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNft && (
        <div className="bg-secondary rounded-lg shadow-md p-6">
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
                placeholder="0.1"
                value={monthlyPayment}
                onChange={e => setMonthlyPayment(e.target.value)}
                className="w-full text-secondary p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Payments</label>
              <input
                type="text"
                placeholder="12"
                value={numberOfPayments}
                onChange={e => setNumberOfPayments(e.target.value)}
                className="w-full text-secondary p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
