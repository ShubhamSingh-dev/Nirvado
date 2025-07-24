import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="z-20 flex flex-col items-center justify-start min-h-screen py-2 mt-10">
      <div className="flex flex-col items-center justify-center my-5">
        <Image src={"/hero.svg"} alt="Hero Section" height={400} width={400} />
        <h1 className="z-20 text-center mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 leading-[1.3] tracking-tight">
          Vibe Code with Intelligence
        </h1>
        <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400 px-5 py-10 max-w-2xl">
          VibeCode Editor is a powerful and intelligent code editor that
          enhances your coding experience with advanced features and seamless
          integration. It is designed to help you write, debug, and optimize
          your code efficiently.
        </p>
        <Link href={"/dashboard"}>
          <Button variant={"brand"} className="mb-4" size={"lg"}>
            Get Started
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
