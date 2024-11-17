"use client";

import { useCallback, useEffect } from "react";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { SkipTimeComponent } from "~~/components/dev/SkipTimeComponent";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useTransactor } from "~~/hooks/scaffold-eth";
import { useFetchAgreements } from "~~/hooks/useFetchAgreements";
import useAgreementStore from "~~/services/store/useAgreementStore";
import { notification } from "~~/utils/scaffold-eth";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";

export default function BorrowPage() {
  const { RentToOwn } = useAllContracts();
  const { agreements, isLoading, error } = useAgreementStore();
  const { fetchAgreements } = useFetchAgreements();
  const { data: rentToOwnContract, isLoading: contractLoading } = useScaffoldContract({
    contractName: "RentToOwn",
  });

  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const writeTx = useTransactor();

  // Fetch agreements on mount or when agreementCounter changes
  useEffect(() => {
    if (contractLoading || !rentToOwnContract) return;

    void fetchAgreements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractLoading]);

  const startAgreement = useCallback(
    async (id: number, monthlyPayment: string) => {
      try {
        const startAgreement = () =>
          writeContractAsync({
            address: RentToOwn.address,
            abi: RentToOwn.abi,
            functionName: "startAgreement",
            args: [id as unknown as bigint],
            value: parseEther(monthlyPayment),
          });
        const approveTx = await writeTx(startAgreement, { blockConfirmations: 1 });
        console.log("Agreement started:", approveTx);
        notification.success("Agreement started successfully!");
        void fetchAgreements();
      } catch (e) {
        console.log({ e });
        notification.error("Failed to start agreement. Please try again.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreements],
  );

  const makePayment = useCallback(
    async (id: number, monthlyPayment: string) => {
      try {
        const makePayment = () =>
          writeContractAsync({
            address: RentToOwn.address,
            abi: RentToOwn.abi,
            functionName: "makePayment",
            args: [id as unknown as bigint],
            value: parseEther(monthlyPayment),
          });
        const approveTx = await writeTx(makePayment, { blockConfirmations: 1 });
        console.log("Agreement started:", approveTx);
        notification.success("Payment made successfully!");
        void fetchAgreements();
      } catch (e) {
        console.log({ e });
        notification.error("Failed to make payment. Please try again.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreements],
  );

  // noinspection TypeScriptValidateTypes
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">NFT Rent-to-Own Agreements</h1>

      {/*<SkipTimeComponent />*/}

      <h2 className="text-2xl font-bold mb-6 mt-6">Available Agreements</h2>
      {isLoading && <p>Loading agreements...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && agreements.length === 0 && <p>No agreements available.</p>}

      {!isLoading && !error && agreements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agreements
            .filter(a => a.isActive && a.borrower === "0x0000000000000000000000000000000000000000")
            .map(agreement => (
              <div key={agreement.id} className="card bg-primary text-primary-content w-96">
                <div className="card-body">
                  <h2 className="card-title">Agreement #{agreement.id}</h2>
                  <p>
                    <span className="font-medium">NFT Contract:</span>
                    {agreement?.nftContract && <Address address={agreement.nftContract} />}
                  </p>
                  <p>
                    <span className="font-medium">NFT ID:</span> {agreement.nftId}
                  </p>
                  <p>
                    <span className="font-medium">Monthly Payment:</span> {agreement.monthlyPayment.toString()} ETH
                  </p>
                  <p>
                    <span className="font-medium">Total Price:</span> {agreement.totalPrice.toString()} ETH
                  </p>
                  <div className="card-actions justify-end">
                    <button
                      onClick={() => startAgreement(agreement.id, agreement.monthlyPayment)}
                      className="btn mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                      Start Agreement
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 mt-12">My Active Agreements</h2>
      {isLoading && <p>Loading agreements...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && agreements.filter(a => a.isActive && a.borrower === connectedAddress).length === 0 && (
        <p>No agreements made.</p>
      )}

      {!isLoading && !error && agreements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agreements
            .filter(a => a.isActive && a.borrower === connectedAddress)
            .map(agreement => (
              <div key={agreement.id} className="card bg-primary text-primary-content w-96">
                <div className="card-body">
                  <h2 className="card-title">Agreement #{agreement.id}</h2>
                  <p>
                    <span className="font-medium">NFT Contract:</span>
                    {agreement?.nftContract && <Address address={agreement.nftContract} />}
                  </p>
                  <p>
                    <span className="font-medium">NFT ID:</span> {agreement.nftId}
                  </p>
                  <p>
                    <span className="font-medium">Monthly Payment:</span> {agreement.monthlyPayment.toString()} ETH
                  </p>
                  <p>
                    <span className="font-medium">Total Price:</span> {agreement.totalPrice} ETH
                  </p>
                  <p>
                    <span className="font-medium">Total Paid:</span> {agreement.totalPaid} ETH
                  </p>
                  <p>
                    <span className="font-medium">Next Payment Due:</span> {agreement.nextPaymentDue}
                  </p>
                  <p>
                    <span className="font-medium">Remaining:</span> {agreement.totalRemaining.toString()} ETH
                  </p>
                  <div className="card-actions justify-end">
                    <button
                      onClick={() => makePayment(agreement.id, agreement.monthlyPayment)}
                      className="btn mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
