"use client";

import { useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { SkipTimeComponent } from "~~/components/dev/SkipTimeComponent";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAgreements } from "~~/hooks/useAgreements";
import { notification } from "~~/utils/scaffold-eth";

export default function BorrowPage() {
  const { address: connectedAddress } = useAccount();
  const { agreements, loading, reload: reloadAgreements } = useAgreements();

  const { writeContractAsync: writeRentToOwnAsync } = useScaffoldWriteContract("RentToOwn");

  // Fetch agreements on mount or when agreementCounter changes
  useEffect(() => {
    void reloadAgreements();
    // eslint-disable-next-line
  }, []);

  const startAgreement = useCallback(
    async (id: number, monthlyPayment: bigint) => {
      try {
        await writeRentToOwnAsync({
          functionName: "startAgreement",
          args: [id as unknown as bigint],
          value: monthlyPayment,
        });
        notification.success("Agreement started successfully!");
        reloadAgreements();
      } catch (e) {
        console.log({ e });
        notification.error("Failed to start agreement. Please try again.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreements, reloadAgreements],
  );

  const makePayment = useCallback(
    async (id: number, monthlyPayment: bigint) => {
      try {
        await writeRentToOwnAsync({
          functionName: "makePayment",
          args: [id as unknown as bigint],
          value: monthlyPayment,
        });
        notification.success("Payment made successfully!");
        reloadAgreements();
      } catch (e) {
        console.log({ e });
        notification.error("Failed to make payment. Please try again.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreements, reloadAgreements],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">NFT Rent-to-Own Agreements</h1>

      <SkipTimeComponent reload={reloadAgreements} />

      <h2 className="text-2xl font-bold mb-6">Available Agreements</h2>
      {loading ? (
        <p>Loading agreements...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agreements
            .filter(a => a.isActive && a.borrower === "0x0000000000000000000000000000000000000000")
            .map(agreement => (
              <div key={agreement.id} className="border rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Agreement #{agreement.id}</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">NFT Contract:</span> {agreement.nftContract}
                  </p>
                  <p>
                    <span className="font-medium">NFT ID:</span> {agreement.nftId}
                  </p>
                  <p>
                    <span className="font-medium">Monthly Payment:</span> {agreement.monthlyPayment} ETH
                  </p>
                  <p>
                    <span className="font-medium">Total Price:</span> {agreement.totalPrice} ETH
                  </p>
                </div>

                <button
                  onClick={() => startAgreement(agreement.id, agreement.monthlyPayment)}
                  className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Start Agreement
                </button>
              </div>
            ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 mt-12">My Active Agreements</h2>
      {loading ? (
        <p>Loading agreements...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agreements
            .filter(a => a.isActive && a.borrower.toLowerCase() === (connectedAddress as string))
            .map(agreement => (
              <div key={agreement.id} className="border rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Agreement #{agreement.id}</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">NFT Contract:</span> {agreement.nftContract}
                  </p>
                  <p>
                    <span className="font-medium">NFT ID:</span> {agreement.nftId}
                  </p>
                  <p>
                    <span className="font-medium">Monthly Payment:</span> {agreement.monthlyPayment} ETH
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
                    <span className="font-medium">Remaining:</span> {agreement.totalRemaining} ETH
                  </p>
                </div>

                <button
                  onClick={() => makePayment(agreement.id, agreement.monthlyPayment)}
                  className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Make Payment
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
