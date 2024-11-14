'use client'

import React, { useState, useEffect } from 'react';
import Web3 from 'web3'; // or import { ethers } from 'ethers';
import RentToOwnABI from './RentToOwnABI.json'; // Import the ABI of your contract
import MyNftABI from './MyNftABI.json'; // Import the ABI of your contract

// Define the NFT type
interface NFT {
    name: string;
    tokenId: string;
    contractAddress: string; // Add this property based on your NFT structure
}

const RENT_TO_OWN_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);
            }
        };

        loadBlockchainData();
    }, []);

    const loadNFTs = async (web3: Web3, account: string, contractAddress: string): Promise<NFT[]> => {
        const contract = new web3.eth.Contract(MyNftABI, contractAddress);
        
        try {
            // Check if contract implements basic ERC721
            const supportsERC721 = await contract.methods.supportsInterface('0x80ac58cd').call().catch(() => false);
            if (!supportsERC721) {
                throw new Error('Contract does not implement ERC721 interface');
            }

            const balance = await contract.methods.balanceOf(account).call();
            const nfts: NFT[] = [];

            // Try to get transfer events to this address
            const events = await contract.getPastEvents('Transfer', {
                filter: { to: account },
                fromBlock: 0,
                toBlock: 'latest'
            });

            // Create a Set to track unique token IDs
            const uniqueTokenIds = new Set();

            // Process each transfer event
            for (const event of events) {
                const tokenId = event.returnValues.tokenId;
                
                try {
                    // Check if we still own this token
                    const currentOwner = await contract.methods.ownerOf(tokenId).call();
                    if (currentOwner.toLowerCase() !== account.toLowerCase()) {
                        continue; // Skip if we don't own it anymore
                    }

                    // Skip if we've already processed this token
                    if (uniqueTokenIds.has(tokenId)) {
                        continue;
                    }
                    uniqueTokenIds.add(tokenId);

                    let name = `NFT #${tokenId}`;
                    
                    // Try to get metadata if tokenURI is available
                    try {
                        const tokenURI = await contract.methods.tokenURI(tokenId).call();
                        if (tokenURI) {
                            const formattedURI = tokenURI.startsWith('ipfs://')
                                ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
                                : tokenURI;
                            
                            const response = await fetch(formattedURI);
                            if (response.ok) {
                                const metadata = await response.json();
                                name = metadata.name || name;
                            }
                        }
                    } catch (metadataError) {
                        console.warn(`Metadata fetch failed for token ${tokenId}:`, metadataError);
                    }

                    nfts.push({
                        name,
                        tokenId,
                        contractAddress
                    });
                } catch (tokenError) {
                    console.warn(`Failed to process token ${tokenId}:`, tokenError);
                    continue;
                }
            }

            console.log('NFTs loaded:', nfts);
            return nfts;
        } catch (error) {
            console.error('Error loading NFTs:', error);
            throw error;
        }
    };

    const handleLoadNFTs = async () => {
        if (!contractAddress) {
            alert('Please enter a valid contract address.');
            return;
        }

        try {
            const web3 = new Web3(window.ethereum);
            const nfts = await loadNFTs(web3, account, contractAddress);
            setNfts(nfts);
        } catch (error) {
            console.error('Error loading NFTs:', error);
            alert('Failed to load NFTs. Please check the contract address and try again.');
        }
    };

    const handleLendNFT = async () => {
        if (!selectedNft || !monthlyPayment || !numberOfPayments) {
            alert('Please fill in all fields');
            return;
        }

        const web3 = new Web3(window.ethereum);
        
        try {
            // 1. First verify the NFT contract
            const nftContract = new web3.eth.Contract(MyNftABI, selectedNft.contractAddress);
            
            // 2. Check if user owns the NFT
            const owner = await nftContract.methods.ownerOf(selectedNft.tokenId).call();
            if (owner.toLowerCase() !== account.toLowerCase()) {
                alert('You do not own this NFT');
                return;
            }

            // 3. Get the RentToOwn contract using the constant
            const rentToOwnContract = new web3.eth.Contract(RentToOwnABI, RENT_TO_OWN_CONTRACT_ADDRESS);
            
            // 4. Approve the NFT transfer
            console.log('Approving NFT transfer...');
            const approveTx = await nftContract.methods.approve(
                RENT_TO_OWN_CONTRACT_ADDRESS, // Use the constant here too
                selectedNft.tokenId
            ).send({ 
                from: account 
            });
            console.log('Approval transaction:', approveTx);

            // 5. List the NFT
            console.log('Listing NFT with parameters:', {
                nftContract: selectedNft.contractAddress,
                tokenId: selectedNft.tokenId,
                monthlyPayment,
                numberOfPayments
            });

            const listTx = await rentToOwnContract.methods.listNFT(
                selectedNft.contractAddress,
                selectedNft.tokenId,
                web3.utils.toWei(monthlyPayment, 'ether'),
                numberOfPayments
            ).send({ 
                from: account
            });

            console.log('Listing transaction:', listTx);
            alert('NFT listed successfully!');
            
        } catch (error: any) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>Rent to Own NFTs</h1>
            <div>
                <h2>Load NFTs from Contract</h2>
                <input
                    type="text"
                    placeholder="Enter NFT Contract Address"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                />
                <button onClick={handleLoadNFTs}>Load NFTs</button>
            </div>
            <div>
                <h2>Your NFTs</h2>
                <ul>
                    {nfts.map((nft, index) => (
                        <li key={index}>
                            {nft.name} - {nft.tokenId}
                            <button onClick={() => setSelectedNft(nft)}>Select</button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedNft && (
                <div>
                    <h2>Lend NFT</h2>
                    <p>Selected NFT: {selectedNft.name}</p>
                    <input
                        type="text"
                        placeholder="Monthly Payment (ETH)"
                        value={monthlyPayment}
                        onChange={(e) => setMonthlyPayment(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Number of Payments"
                        value={numberOfPayments}
                        onChange={(e) => setNumberOfPayments(e.target.value)}
                    />
                    <button onClick={handleLendNFT}>Lend NFT</button>
                </div>
            )}
        </div>
    );
};

export default RentToOwnPage;
