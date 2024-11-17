import { useAccount } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface NFT {
  name: string;
  tokenId: string;
  tokenURI: string;
  contractAddress: string;
}

export function useFetchNFTs() {
  const { address: connectedAddress } = useAccount();
  const { data: myNFTContract } = useScaffoldContract({
    contractName: "MyNFT",
  });

  const fetchNFTs = async (): Promise<NFT[]> => {
    if (!myNFTContract || !connectedAddress) {
      notification.error("Contract not available.");
      return [];
    }

    try {
      const nfts = [];

      // Fetch current token ID
      const currentTokenId = await myNFTContract.read.getCurrentTokenId();
      const parsedTokenId = parseInt(currentTokenId.toString());

      //load only nfts owned by current address
      for (let i = 1; i <= parsedTokenId; i++) {
        const owner = await myNFTContract.read.ownerOf([BigInt(i)]);
        if (owner === connectedAddress) {
          const tokenURI = await myNFTContract.read.tokenURI([BigInt(i)]);
          nfts.push({
            name: await myNFTContract.read.name(),
            tokenId: `${i}`,
            tokenURI: tokenURI.toString(),
            contractAddress: myNFTContract.address,
          });
        }
      }

      return nfts;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      notification.error("Failed to load NFTs.");
      return [];
    }
  };

  return { fetchNFTs };
}
