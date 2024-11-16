import { useCallback, useEffect, useState } from "react";
import { parseEther } from "viem";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Agreement {
  id: number;
  borrower: string;
  lender: string;
  nftContract: string;
  nftId: string;
  monthlyPayment: bigint;
  totalPrice: bigint;
  totalPaid: bigint;
  totalRemaining: bigint;
  nextPaymentDue: string;
  isActive: boolean;
}

export function useAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch the total number of agreements
  // noinspection TypeScriptValidateTypes
  const {
    data: agreementCounter,
    isLoading: counterLoading,
    error: counterError,
  } = useScaffoldReadContract({
    contractName: "RentToOwn",
    functionName: "agreementCounter",
    args: undefined,
  });

  const { data: rentToOwnContract, isLoading: rentToOwnContractLoading } = useScaffoldContract({
    contractName: "RentToOwn",
  });

  const fetchAgreements = useCallback(() => {
    if (!agreementCounter || counterLoading || counterError) return;

    const fetchAgreements = async () => {
      if (rentToOwnContractLoading || !rentToOwnContract) {
        setError(new Error("The RentToOwn Contract is loading."));
        return [];
      }
      setLoading(true);
      setError(null);

      try {
        const loadedAgreements = [];

        for (let i = 0; i < agreementCounter; i++) {
          const agreement = await rentToOwnContract.read.agreements(BigInt(i) as any);
          console.log(`Agreement ${i}:`, agreement);
          const totalPrice = parseEther(agreement[5].toString());
          const totalPaid = parseEther(agreement[6].toString());

          loadedAgreements.push({
            borrower: agreement[0], // string
            lender: agreement[1], // string
            nftContract: agreement[2], // string
            nftId: agreement[3].toString(), // bigint -> string
            monthlyPayment: parseEther(agreement[4].toString()), // bigint -> ether string
            nextPaymentDue: new Date(Number(agreement[7]) * 1000).toLocaleDateString(), // bigint -> date string
            isActive: agreement[8], // boolean
            totalPrice,
            totalPaid,
            totalRemaining: totalPrice - totalPaid,
            id: i,
          });
        }

        setAgreements(loadedAgreements);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load agreements"));
      } finally {
        setLoading(false);
      }
    };

    void fetchAgreements();
  }, [agreementCounter, counterLoading, counterError, rentToOwnContract]);

  return { agreements, loading, error, reload: fetchAgreements };
}
