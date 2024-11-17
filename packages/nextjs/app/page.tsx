"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BanknotesIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Rent2Own</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <Link href="/lend">
              <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-xs rounded-3xl">
                <BanknotesIcon className="h-8 w-8 fill-secondary" /> Lend
                <p>List an NFT for Rent-to-Own</p>
              </div>
            </Link>
            <Link href="/borrow">
              <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-xs rounded-3xl">
                <WalletIcon className="h-8 w-8 fill-secondary" /> Borrow
                <p>Seek through available agreements</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="stats shadow mt-16">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Total Listings</div>
            <div className="stat-value text-primary">25.6K</div>
            <div className="stat-desc">21% more than last month</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-8 w-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Agreements Started</div>
            <div className="stat-value text-secondary">2.6K</div>
            <div className="stat-desc">5% less than last month</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <div className="avatar online">
                <div className="w-16 rounded-full">
                  <Image
                    width={900}
                    height={900}
                    src="https://black-objective-gerbil-643.mypinata.cloud/ipfs/QmV9gunTMKEAgeyG62qXw3T5i2dPsgykS9WctfDFGz7nKJ"
                    alt="Stock Photo"
                  />
                </div>
              </div>
            </div>
            <div className="stat-value">86%</div>
            <div className="stat-title">Payment plans completed</div>
            <div className="stat-desc text-secondary">31 unpaid remaining</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
