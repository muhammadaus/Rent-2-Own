import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface NFT {
  name: string;
  tokenId: string;
  contractAddress: string;
}

export function useFetchNFTs() {
  const { data: myNFTContract } = useScaffoldContract({
    contractName: "MyNFT",
  });

  const fetchNFTs = async (contractAddress: string): Promise<NFT[]> => {
    if (!myNFTContract) {
      notification.error("Contract not available.");
    }

    try {
      // Fetch current token ID
      const currentTokenId = await myNFTContract.read.getCurrentTokenId();

      // Create NFT object
      return [
        {
          name: await myNFTContract.read.name(),
          tokenId: currentTokenId.toString(),
          contractAddress,
        },
      ];
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      notification.error("Failed to load NFTs.");
    }
  };

  return { fetchNFTs };
}
