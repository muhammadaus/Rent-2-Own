'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RentToOwnABI from '../abi/RentToOwnABI.json';

interface Agreement {
    borrower: string;
    lender: string;
    nftContract: string;
    nftId: string;
    monthlyPayment: string;
    totalPrice: string;
    totalPaid: string;
    nextPaymentDue: string;
    isActive: boolean;
}

const RENT_TO_OWN_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function BorrowPage() {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [account, setAccount] = useState<string>('');
    const [agreements, setAgreements] = useState<Array<Agreement & { id: number }>>([]);
    const [myAgreements, setMyAgreements] = useState<Array<Agreement & { id: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [timeSkipDays, setTimeSkipDays] = useState<number>(30);

    useEffect(() => {
        const initEthers = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(provider);

                try {
                    await provider.send("eth_requestAccounts", []);
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    setAccount(address);
                } catch (error) {
                    console.error("User denied account access");
                }
            }
        };

        initEthers();
    }, []);

    useEffect(() => {
        if (provider && account) {
            loadAgreements();
        }
    }, [provider, account]);

    const loadAgreements = async () => {
        if (!provider) return;

        const contract = new ethers.Contract(
            RENT_TO_OWN_CONTRACT_ADDRESS,
            RentToOwnABI,
            provider
        );

        try {
            const agreementCounter = await contract.agreementCounter();
            console.log('Total agreements:', agreementCounter.toString());

            const loadedAgreements = [];

            for (let i = 0; i < agreementCounter; i++) {
                const agreement = await contract.agreements(i);
                console.log(`Agreement ${i}:`, agreement);
                
                loadedAgreements.push({
                    ...agreement,
                    id: i
                });
            }

            console.log('Loaded agreements:', loadedAgreements);
            setAgreements(loadedAgreements);
            setLoading(false);
        } catch (error) {
            console.error('Error loading agreements:', error);
            setLoading(false);
        }
    };

    const startAgreement = async (agreementId: number, monthlyPayment: string) => {
        if (!provider || !account) return;

        try {
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                RENT_TO_OWN_CONTRACT_ADDRESS,
                RentToOwnABI,
                signer
            );
            
            const tx = await contract.startAgreement(agreementId, {
                value: monthlyPayment
            });
            await tx.wait();

            alert('Agreement started successfully!');
            loadAgreements();
        } catch (error) {
            console.error('Error starting agreement:', error);
            alert('Failed to start agreement. Please try again.');
        }
    };

    const makePayment = async (agreementId: number, monthlyPayment: string) => {
        if (!provider || !account) return;

        try {
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                RENT_TO_OWN_CONTRACT_ADDRESS,
                RentToOwnABI,
                signer
            );
            
            const tx = await contract.makePayment(agreementId, {
                value: monthlyPayment
            });
            await tx.wait();

            alert('Payment made successfully!');
            loadAgreements();
        } catch (error) {
            console.error('Error making payment:', error);
            alert('Failed to make payment. Please try again.');
        }
    };

    const skipTime = async (days: number) => {
        if (!provider) return;
        
        try {
            await provider.send("evm_increaseTime", [days * 24 * 60 * 60]);
            await provider.send("evm_mine", []);
            
            alert(`Skipped ${days} days`);
            loadAgreements();
        } catch (error) {
            console.error('Error skipping time:', error);
            alert('Failed to skip time. Make sure you are on Hardhat network.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">NFT Rent-to-Own Agreements</h1>
            
            <div className="mb-8 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Development Tools (PLEASE DELETE THIS LATER!)</h3>
                <div className="flex gap-4">
                    <input
                        type="number"
                        value={timeSkipDays}
                        onChange={(e) => setTimeSkipDays(Number(e.target.value))}
                        className="border p-2 rounded"
                        placeholder="Days to skip"
                    />
                    <button
                        onClick={() => skipTime(timeSkipDays)}
                        className="bg-purple-500 text-white px-4 py-2 rounded"
                    >
                        Skip Time
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Available Agreements</h2>
            {loading ? (
                <p>Loading agreements...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agreements.filter(a => 
                        a.isActive && a.borrower === '0x0000000000000000000000000000000000000000'
                    ).map((agreement) => (
                        <div key={agreement.id} className="border rounded-lg p-6 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Agreement #{agreement.id}</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">NFT Contract:</span> {agreement.nftContract}</p>
                                <p><span className="font-medium">NFT ID:</span> {agreement.nftId.toString()}</p>
                                <p><span className="font-medium">Monthly Payment:</span> {ethers.utils.formatEther(agreement.monthlyPayment.toString())} ETH</p>
                                <p><span className="font-medium">Total Price:</span> {ethers.utils.formatEther(agreement.totalPrice.toString())} ETH</p>
                            </div>
                            
                            <button
                                onClick={() => startAgreement(agreement.id, agreement.monthlyPayment.toString())}
                                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            >
                                Start Agreement
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <h2 className="text-2xl font-bold mb-6 mt-12">My Active Agreements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agreements.filter(a => 
                    a.isActive && a.borrower.toLowerCase() === account.toLowerCase()
                ).map((agreement) => (
                    <div key={agreement.id} className="border rounded-lg p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Agreement #{agreement.id}</h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">NFT Contract:</span> {agreement.nftContract}</p>
                            <p><span className="font-medium">NFT ID:</span> {agreement.nftId.toString()}</p>
                            <p><span className="font-medium">Monthly Payment:</span> {ethers.utils.formatEther(agreement.monthlyPayment.toString())} ETH</p>
                            <p><span className="font-medium">Total Price:</span> {ethers.utils.formatEther(agreement.totalPrice.toString())} ETH</p>
                            <p><span className="font-medium">Total Paid:</span> {ethers.utils.formatEther(agreement.totalPaid.toString())} ETH</p>
                            <p><span className="font-medium">Next Payment Due:</span> {new Date(Number(agreement.nextPaymentDue.toString()) * 1000).toLocaleDateString()}</p>
                            <p><span className="font-medium">Remaining:</span> {ethers.utils.formatEther(
                                agreement.totalPrice.sub(agreement.totalPaid).toString()
                            )} ETH</p>
                        </div>
                        
                        <button
                            onClick={() => makePayment(agreement.id, agreement.monthlyPayment.toString())}
                            className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        >
                            Make Payment
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
