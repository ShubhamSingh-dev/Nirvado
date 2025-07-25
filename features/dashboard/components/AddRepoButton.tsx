import React from "react";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown } from "lucide-react";
const AddRepoButton = () => {
  return (
    <div
      className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:bg-background hover:border-indigo-500 hover:scale-[1.02]
        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
        hover:shadow-[0_10px_30px_rgba(233,63,63,0.15)]"
    >
      <div className="flex flex-row justify-center items-start gap-4">
        <Button
          variant={"outline"}
          className="flex justify-center items-center bg-white group-hover:bg-[#fff8f8] group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors duration-300"
          size={"icon"}
        >
          <ArrowDown
            size={30}
            className="transition-transform duration-300 group-hover:-rotate-90"
          />
        </Button>
        <div className="flex flex-col ">
          <h1 className="text-xl font-bold text-indigo-500">
            Open Github Repository
          </h1>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Work with your Repo on VibeCode
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <Image
          src={"/github.svg"}
          alt="Add New"
          height={150}
          width={150}
          className="transition-transform duration-300 group:hover:scale-110"
        />
      </div>
    </div>
  );
};

export default AddRepoButton;
