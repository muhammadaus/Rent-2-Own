"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BanknotesIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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
              </div>
            </Link>
            <Link href="/borrow">
              <div className="flex flex-col bg-base-100 px-5 py-5 text-center items-center max-w-xs rounded-3xl">
                <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" /> Borrow
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
