import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-between items-center">
        <h1>Rent2Own</h1>
        <ConnectButton />
      </header>
      
      <div>
        {/* Your main content */}
      </div>
      
      <Carousel className="w-full max-w-[500px]">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-[10px]">
                <Card className="shadow-none">
                  <CardContent img="" className="flex aspect-square items-center justify-center p-4">
                    <span className="text-3xl font-base">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      <Button>Rent2Own👉ThisNFT</Button>
    </div>
  );
}
