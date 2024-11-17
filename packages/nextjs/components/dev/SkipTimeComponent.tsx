import { useState } from "react";
import { usePublicClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useFetchAgreements } from "~~/hooks/useFetchAgreements";
import { notification } from "~~/utils/scaffold-eth";

export const SkipTimeComponent = () => {
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const { fetchAgreements } = useFetchAgreements();
  const [isLoading, setIsLoading] = useState(false);
  const [days, setDays] = useState<number>(30);

  const skipTime = async (days: number) => {
    if (!publicClient) {
      notification.error("Public client not available. Ensure you're connected to the correct network.");
      return;
    }

    setIsLoading(true);
    try {
      //TODO
      // await publicClient.request({
      //   method: "evm_increaseTime",
      //   params: [days * 24 * 60 * 60],
      // });
      // await publicClient.request({
      //   method: "evm_mine",
      //   params: [],
      // });

      notification.success(`Skipped ${days} days!`);
      void fetchAgreements(); // Refresh agreements after time skip
    } catch (error) {
      console.error("Error skipping time:", error);
      notification.error("Failed to skip time. Ensure you're connected to the correct network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-secondary rounded shadow">
      <h3 className="font-bold mb-2">Development Tools</h3>
      <div className="flex items-center gap-4">
        <input
          type="number"
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="border p-2 rounded text-secondary"
          placeholder="Days to skip"
        />
        <button
          onClick={() => skipTime(days)}
          disabled={isLoading}
          className={`bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Skipping..." : "Skip Time"}
        </button>
      </div>
    </div>
  );
};
