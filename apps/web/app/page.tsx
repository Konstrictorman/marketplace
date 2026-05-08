"use client";
import ProductCard from "@/components/ProductCard/ProductCard";
import Image from "next/image";

const product = {
  name: "Product Name",
  price: 29.99,
  description:
    "This is a detailed description of the product. It explains what the product does, its key features, materials, and anything else the buyer should know before purchasing.",
  stock: 8,
  rating: 4.5,
  condition: "new" as "new" | "used",
  image: "https://placehold.co/280x180/1837A0/FEFEFE?text=Product",
};

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          src="/images/unisabana-logo.png"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to the Sabana&apos;s Marketplace
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Work in progress...
          </p>
        </div>
        <ProductCard product={product} />
      </main>
    </div>
  );
}
