"use client";

import { useState, useRef, useEffect } from "react";
import { BiSort } from "react-icons/bi";
import useProductStore from "@/store/productStore";

export default function SortButton() {
  const { sortBy, setSort } = useProductStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { label: "Price: Low → High", value: "priceAsc" },
    { label: "Price: High → Low", value: "priceDesc" },
    { label: "Name: A → Z", value: "nameAsc" },
    { label: "Name: Z → A", value: "nameDesc" },
    { label: "Newest", value: "newest" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full flex justify-end mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-foreground hover:bg-foreground/20 transition"
      >
        <BiSort className="w-5 h-5" />
        <p className="text-sm">
          {sortBy ? options.find((o) => o.value === sortBy)?.label : "Sort by"}
        </p>
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 top-6 w-max bg-background border border-gray-200 rounded-lg shadow-md z-50">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                setSort(opt.value as any);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-foreground/20 cursor-pointer text-foreground"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
