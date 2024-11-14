'use client';

import { useState, useEffect } from 'react';
import Web3 from 'web3';
import RentToOwnABI from './abi/RentToOwnABI.json';

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
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string>('');
    const [agreements, setAgreements] = useState<Array<Agreement & { id: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initWeb3 = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                try {
                    // Request account access
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);
                } catch (error) {
                    console.error("User denied account access");
                }
            }
        };

        initWeb3();
    }, []);

    useEffect(() => {
        if (web3 && account) {
            loadAgreements();
        }
    }, [web3, account]);

    const loadAgreements = async () => {
        if (!web3) return;

        const contract = new web3.eth.Contract(RentToOwnABI, RENT_TO_OWN_CONTRACT_ADDRESS);
        try {
            const agreementCounter = await contract.methods.agreementCounter().call();
            const loadedAgreements = [];

            for (let i = 0; i < agreementCounter; i++) {
                const agreement = await contract.methods.agreements(i).call();
                if (agreement.isActive && agreement.borrower === '0x0000000000000000000000000000000000000000') {
                    loadedAgreements.push({
                        ...agreement,
                        id: i
                    });
                }
            }

            setAgreements(loadedAgreements);
            setLoading(false);
        } catch (error) {
            console.error('Error loading agreements:', error);
            setLoading(false);
        }
    };

    const startAgreement = async (agreementId: number, monthlyPayment: string) => {
        if (!web3 || !account) return;

        try {
            const contract = new web3.eth.Contract(RentToOwnABI, RENT_TO_OWN_CONTRACT_ADDRESS);
            
            await contract.methods.startAgreement(agreementId).send({
                from: account,
                value: monthlyPayment,
            });

            alert('Agreement started successfully!');
            loadAgreements(); // Reload agreements
        } catch (error) {
            console.error('Error starting agreement:', error);
            alert('Failed to start agreement. Please try again.');
        }
    };

    const makePayment = async (agreementId: number, monthlyPayment: string) => {
        if (!web3 || !account) return;

        try {
            const contract = new web3.eth.Contract(RentToOwnABI, RENT_TO_OWN_CONTRACT_ADDRESS);
            
            await contract.methods.makePayment(agreementId).send({
                from: account,
                value: monthlyPayment,
            });

            alert('Payment made successfully!');
            loadAgreements(); // Reload agreements
        } catch (error) {
            console.error('Error making payment:', error);
            alert('Failed to make payment. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Available NFTs for Rent-to-Own</h1>
            
            {loading ? (
                <p>Loading available agreements...</p>
            ) : agreements.length === 0 ? (
                <p>No available agreements found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agreements.map((agreement) => (
                        <div key={agreement.id} className="border rounded-lg p-6 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Agreement #{agreement.id}</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">NFT Contract:</span> {agreement.nftContract}</p>
                                <p><span className="font-medium">NFT ID:</span> {agreement.nftId}</p>
                                <p><span className="font-medium">Monthly Payment:</span> {web3?.utils.fromWei(agreement.monthlyPayment, 'ether')} ETH</p>
                                <p><span className="font-medium">Total Price:</span> {web3?.utils.fromWei(agreement.totalPrice, 'ether')} ETH</p>
                                <p><span className="font-medium">Lender:</span> {agreement.lender}</p>
                            </div>
                            
                            <button
                                onClick={() => startAgreement(agreement.id, agreement.monthlyPayment)}
                                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                            >
                                Start Agreement
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {account && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">My Active Agreements</h2>
                    {/* Add a section to show the user's active agreements and allow making payments */}
                </div>
            )}
        </div>
    );
}
