import Header from './Header'; // Import the Header component
import Image from "next/image";
import Link from 'next/link'; // Import Link from Next.js

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
      <Header />

      <div className="flex space-x-4">
        <Link href="/borrow">
          <button className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
            Borrower
          </button>
        </Link>
        <Link href="/lend">
          <button className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
            Lender
          </button>
        </Link>
      </div>

      {/* <Carousel className="w-full max-w-[500px]">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-[10px]">
                <Card className="shadow-none">
                  <CardContent
                    img="/path/to/your/image.jpg"
                    className="flex aspect-square items-center justify-center p-4"
                  >
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

      <Button>Rent2Own👉ThisNFT</Button> */}
    </div>
  );
}
