"use client";
import { categories, sizes } from "@/lib";
import useProductStore from "@/store/productStore";
import { useEffect, useState } from "react";

export default function SidebarFilters() {
  const { filters, setFilter } = useProductStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    setFilter("sizes", selectedSizes);
  }, [selectedSizes, setFilter]);

  useEffect(() => {
    setFilter("categories", selectedCategories);
  }, [selectedCategories, setFilter]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleSizes = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((c) => c !== size) : [...prev, size],
    );
  };

  return (
    <aside
      className="w-[20%] hidden md:flex flex-col justify-between border-0 border-r border-gray-100 fixed bottom-0 left-0 p-4"
      style={{
        height: "calc(100vh - 120px)",
        backgroundColor: "var(--background)",
      }}
    >
      <div>
        <div className="w-full flex flex-col">
          <h3
            className="text-lg font-semibold select-none"
            style={{ color: "var(--foreground)" }}
          >
            Categories
          </h3>
          <ul className="flex flex-col gap-2 p-4">
            {categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat);
              return (
                <li
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat)}
                    className={`w-5 h-5 rounded transition ${isChecked ? "accent-foreground" : ""}`}
                  />
                  <span
                    className="select-none font-medium transition-colors"
                    style={{
                      color: "var(--foreground)",
                      opacity: isChecked ? 1 : 0.7,
                    }}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="w-full flex flex-col mt-4">
          <h3
            className="text-lg font-semibold select-none"
            style={{ color: "var(--foreground)" }}
          >
            Sizes
          </h3>
          <ul className="flex flex-col gap-2 p-4">
            {sizes.map((size) => {
              const isChecked = selectedSizes.includes(size);
              return (
                <li
                  key={size}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSizes(size)}
                    className={`w-5 h-5 rounded transition ${isChecked ? "accent-foreground" : ""}`}
                  />

                  <span
                    className="select-none font-medium transition-colors"
                    style={{
                      color: "var(--foreground)",
                      opacity: isChecked ? 1 : 0.7,
                    }}
                    onClick={() => toggleSizes(size)}
                  >
                    {size}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
