"use client";
import React, { useState } from "react";

interface IconItem {
  icon: React.ReactNode;
  label?: string;
}

interface SelectionBarProps {
  iconObject: IconItem[];
}

export default function SelectionBar({ iconObject }: SelectionBarProps) {
  const [selected, setSelected] = useState<string>("Shirt");
  return (
    <div className="w-full md:p-4 py-2 flex gap-8 overflow-x-auto">
      {iconObject.map((item, index) => (
        <div key={index} className="flex flex-col items-center justify-center ">
          <button
            onClick={() => setSelected(item.label ?? "")}
            className={`text-2xl cursor-pointer 
                     transition-colors duration-200 hover:bg-[#B10E0E]/10 ${item.label === selected ? "bg-[#B10E0E] text-white" : "text-[#B10E0E]"} md:p-4 p-2 border-[#B10E0E] border rounded-full`}
          >
            <div className="text-3xl ">{item.icon}</div>
          </button>
          {item.label && (
            <span className="mt-1 text-sm text-[#B10E0E]">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
