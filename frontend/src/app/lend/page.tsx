'use client'

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RentToOwnABI from '../abi/RentToOwnABI.json'; // Import the ABI of your contract
import MyNftABI from '../abi/MyNftABI.json'; // Import the ABI of your contract

// Define the NFT type
interface NFT {
    name: string;
    tokenId: string;
    contractAddress: string; // Add this property based on your NFT structure
}

const RENT_TO_OWN_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Add this contract address manually

const RentToOwnPage = () => {
    const [nfts, setNfts] = useState<NFT[]>([]); // Specify the type for nfts
    const [selectedNft, setSelectedNft] = useState<NFT | null>(null); // Specify the type for selectedNft
    const [monthlyPayment, setMonthlyPayment] = useState<string>('');
    const [numberOfPayments, setNumberOfPayments] = useState<string>('');
    const [account, setAccount] = useState<string>('');
    const [contractAddress, setContractAddress] = useState<string>(''); // State for contract address input

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (window.ethereum) {
                try {
                    // Request network switch to localhost
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x7A69' }], // 31337 in hex for Hardhat
                    });

                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const accounts = await signer.getAddress();
                    setAccount(accounts);

                    // Verify network
                    const network = await provider.getNetwork();
                    console.log('Connected to network:', network.chainId);
                    
                    if (network.chainId !== 31337) {
                        alert('Please connect to Hardhat network (localhost:8545)');
                        return;
                    }
                } catch (error) {
                    console.error('Failed to load blockchain data:', error);
                }
            }
        };

        loadBlockchainData();
    }, []);

    const loadNFTs = async (account: string, contractAddress: string): Promise<NFT[]> => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            const contract = new ethers.Contract(
                contractAddress,
                MyNftABI,
                signer
            );

            const balance = await contract.balanceOf(account);
            console.log('NFT balance:', balance.toString());

            // Get the current token ID
            const currentTokenId = await contract.getCurrentTokenId();
            console.log('Current token ID:', currentTokenId.toString());

            // Create NFT object
            const nfts: NFT[] = [{
                name: await contract.name(),
                tokenId: currentTokenId.toString(),
                contractAddress: contractAddress
            }];

            console.log('Found NFTs:', nfts);
            return nfts;
        } catch (error) {
            console.error('Error in loadNFTs:', error);
            throw error;
        }
    };

    const handleLoadNFTs = async () => {
        if (!contractAddress) {
            alert('Please enter a valid contract address.');
            return;
        }

        try {
            const nfts = await loadNFTs(account, contractAddress);
            setNfts(nfts);
        } catch (error) {
            console.error('Error loading NFTs:', error);
            alert('Failed to load NFTs. Check console for details.');
        }
    };

    const handleLendNFT = async () => {
        if (!selectedNft || !monthlyPayment || !numberOfPayments) {
            alert('Please fill in all fields');
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        try {
            // 1. First verify the NFT contract
            const nftContract = new ethers.Contract(
                selectedNft.contractAddress,
                MyNftABI,
                signer
            );
            
            // 2. Check if user owns the NFT
            const owner = await nftContract.ownerOf(selectedNft.tokenId);
            if (owner.toLowerCase() !== account.toLowerCase()) {
                alert('You do not own this NFT');
                return;
            }

            // 3. Get the RentToOwn contract using the constant
            const rentToOwnContract = new ethers.Contract(
                RENT_TO_OWN_CONTRACT_ADDRESS,
                RentToOwnABI,
                signer
            );
            
            // 4. Approve the NFT transfer
            console.log('Approving NFT transfer...');
            const approveTx = await nftContract.approve(
                RENT_TO_OWN_CONTRACT_ADDRESS, // Use the constant here too
                selectedNft.tokenId
            );
            console.log('Approval transaction:', approveTx);

            // 5. List the NFT
            console.log('Listing NFT with parameters:', {
                nftContract: selectedNft.contractAddress,
                tokenId: selectedNft.tokenId,
                monthlyPayment,
                numberOfPayments
            });

            const listTx = await rentToOwnContract.listNFT(
                selectedNft.contractAddress,
                selectedNft.tokenId,
                ethers.utils.parseEther(monthlyPayment),
                numberOfPayments
            );

            console.log('Listing transaction:', listTx);
            alert('NFT listed successfully!');
            
        } catch (error: any) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Rent to Own NFTs</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Load NFTs from Contract</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter NFT Contract Address"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleLoadNFTs}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Load NFTs
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Your NFTs</h2>
                {nfts.length === 0 ? (
                    <p className="text-gray-500">No NFTs found. Load your NFTs first.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nfts.map((nft, index) => (
                            <div 
                                key={index}
                                className={`p-4 border rounded-lg ${
                                    selectedNft?.tokenId === nft.tokenId 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200'
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
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {selectedNft?.tokenId === nft.tokenId ? 'Selected' : 'Select NFT'}
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
                        <p className="text-lg mb-2">Selected NFT: <span className="font-medium">{selectedNft.name}</span></p>
                        <p className="text-gray-500">Token ID: {selectedNft.tokenId}</p>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Monthly Payment (ETH)</label>
                            <input
                                type="text"
                                placeholder="e.g., 0.1"
                                value={monthlyPayment}
                                onChange={(e) => setMonthlyPayment(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Number of Payments</label>
                            <input
                                type="text"
                                placeholder="e.g., 12"
                                value={numberOfPayments}
                                onChange={(e) => setNumberOfPayments(e.target.value)}
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