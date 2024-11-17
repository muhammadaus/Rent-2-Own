import { formatEther } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import useAgreementStore from "~~/services/store/useAgreementStore";
import { Agreement } from "~~/types/Agreement";
import { notification } from "~~/utils/scaffold-eth";

export const useFetchAgreements = () => {
  const { setAgreements, setLoading } = useAgreementStore();
  const { data: rentToOwnContract, isLoading: rentToOwnContractLoading } = useScaffoldContract({
    contractName: "RentToOwn",
  });

  const fetchAgreements = async (): Promise<void> => {
    if (rentToOwnContractLoading || !rentToOwnContract) {
      notification.error("Contract instance is not available.");
      return;
    }

    setLoading(true);

    try {
      // Fetch the total number of agreements
      const agreementCounter = await rentToOwnContract.read.agreementCounter();

      // Loop through agreements and fetch their details
      const agreements: Agreement[] = [];
      for (let i = 0; i < agreementCounter; i++) {
        const agreement = await rentToOwnContract.read.agreements([BigInt(i)]);
        const totalPrice = agreement[5];
        const totalPaid = agreement[6];

        agreements.push({
          id: i,
          borrower: agreement[0], // string
          lender: agreement[1], // string
          nftContract: agreement[2], // string
          nftId: agreement[3].toString(), // bigint -> string
          monthlyPayment: formatEther(agreement[4]), // bigint -> ether string
          nextPaymentDue: new Date(Number(agreement[7]) * 1000).toLocaleDateString(), // bigint -> date string
          isActive: agreement[8], // boolean
          totalPrice: formatEther(agreement[5]),
          totalPaid: formatEther(agreement[6]),
          totalRemaining: formatEther(BigInt(totalPrice - totalPaid)),
        });
      }

      setAgreements(agreements);
    } catch (error: unknown) {
      console.error("Error fetching agreements:", error);
      notification.error((error as Error)?.message || "Failed to fetch agreements.");
    } finally {
      setLoading(false);
    }
  };

  return { fetchAgreements };
};
