"use client";

import { useToast } from "@/hooks/useToast";
import { categories, genders, sizes, uploadImagesToCloudinary } from "@/lib";
import { Check, Image as ImageIcon, Plus, X } from "lucide-react";
import React, {
  useState,
  KeyboardEvent,
  useEffect,
  FormEvent,
  useRef,
} from "react";
import Image from "next/image";
import Spinner from "@/components/ui/spinner";
import { HexColorPicker } from "react-colorful";
import { useRouter } from "next/navigation";

type ProductColor = { name: string; hex: string };

export default function EditProductPage({ initialData }: { initialData: any }) {
  const { showToast } = useToast();
  const router = useRouter();

  const [colors, setColors] = useState<ProductColor[]>(
    initialData?.colors || [],
  );
  const [hex, setHex] = useState("#6366f1");
  const [currentColorName, setCurrentColorName] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images || [],
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialData?.images || []);

  const [productName, setProductName] = useState(initialData?.name || "");
  const [productDesc, setProductDesc] = useState(
    initialData?.description || "",
  );
  const [productPrice, setProductPrice] = useState(
    initialData?.price != null ? String(initialData.price) : "",
  );
  const [stock, setStock] = useState(
    initialData?.totalStock != null ? String(initialData.totalStock) : "",
  );
  const [tags, setTags] = useState<string[]>(initialData?.filters || []);
  const [tagInput, setTagInput] = useState("");
  const [availableSizes, setAvailableSizes] = useState<string[]>(
    initialData?.sizes || [],
  );
  const [availableGender, setAvailableGender] = useState<string>(
    initialData?.gender || "",
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [status, setStatus] = useState(initialData?.status || "ACTIVE");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const addColor = () => {
    const name = currentColorName.trim();
    if (!name) return;

    const exists = colors.some(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() ||
        c.hex.toLowerCase() === hex.toLowerCase(),
    );

    if (exists) {
      showToast("That color already exists", "info");
      return;
    }

    setColors((prev) => [...prev, { hex, name }]);
    setCurrentColorName("");
    setShowPicker(false);
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  function toggleSize(size: string) {
    setAvailableSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();

      if (!tags.some((t) => t.toLowerCase() === newTag.toLowerCase())) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILES = 5;
    const MAX_SIZE_MB = 10;
    const selectedFiles = Array.from(e.target.files || []);

    if (previews.length + selectedFiles.length > MAX_FILES) {
      showToast(`You can upload up to ${MAX_FILES} images`, "info");
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const isValidType = ["image/png", "image/jpeg", "image/webp"].includes(
        file.type,
      );
      const isValidSize = file.size <= MAX_SIZE_MB * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      showToast(
        `Some files were skipped (Invalid type or >${MAX_SIZE_MB}MB)`,
        "info",
      );
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const imageToRemove = previews[index];

    if (existingImages.includes(imageToRemove)) {
      setExistingImages((prev) => prev.filter((img) => img !== imageToRemove));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    const newImagePreviews = previews.filter(
      (p) => !existingImages.includes(p),
    );
    const fileIndex = newImagePreviews.indexOf(imageToRemove);

    if (imageToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove);
    }

    setFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!productName.trim())
      return showToast("Product name is required", "error");
    if (!productPrice) return showToast("Price is required", "error");
    if (!availableGender) return showToast("Please select a gender", "error");
    if (!category) return showToast("Please select a category", "error");
    if (!sku.trim()) return showToast("SKU is required", "error");
    if (previews.length === 0)
      return showToast("Please upload at least 1 image", "error");
    if (availableSizes.length === 0)
      return showToast("Select at least one size", "error");

    setLoading(true);

    try {
      const uploadedNewImages =
        files.length > 0 ? await uploadImagesToCloudinary(files) : [];

      const payload = {
        name: productName,
        description: productDesc,
        price: Number(productPrice),
        totalStock: Number(stock || 0),
        category,
        gender: availableGender,
        sku,
        status,
        filters: tags,
        sizes: availableSizes,
        colors,
        images: [...existingImages, ...uploadedNewImages],
      };

      const res = await fetch(`/api/admin/products/${initialData.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to update product",
        );
      }

      showToast("Product updated successfully!", "success");
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      showToast(message, "error");
      console.log(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col px-10 py-5 bg-background min-h-screen text-foreground"
    >
      <div className="w-full h-16 flex items-center justify-end sticky top-15 left-0 right-0 bg-background/80 backdrop-blur-md z-10">
        <button
          type="submit"
          disabled={loading}
          className="bg-foreground text-background gap-2 px-6 py-2.5 rounded-full font-bold flex items-center transition-opacity hover:opacity-90 shadow-sm disabled:opacity-60"
        >
          {loading ? (
            <Spinner w="5" h="5" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <p>Update Product</p>
            </>
          )}
        </button>
      </div>

      <div className="w-full flex justify-between gap-12">
        <div className="w-full lg:w-1/2 flex flex-col gap-8 pb-20">
          <section className="w-full space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              General Information
            </h2>

            <div className="group relative flex flex-col h-72 w-full border-2 border-dashed border-foreground/20 hover:border-foreground/40 hover:bg-muted/5 rounded-3xl items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden">
              <div className="p-4 rounded-full bg-muted transition-transform group-hover:scale-110">
                <ImageIcon className="w-8 h-8 text-foreground/50" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">
                  Click to upload product images
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Up to 5 images. PNG, JPG or WebP.
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFilesChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {previews.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {previews.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-foreground/10 shrink-0 group"
                  >
                    <Image
                      src={src}
                      alt="preview"
                      fill
                      unoptimized={src.startsWith("blob:")}
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Essential Oversized Tee"
                  className="p-3 w-full rounded-xl border border-foreground/20 outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Description
                </label>
                <textarea
                  rows={5}
                  className="p-3 w-full rounded-xl border border-foreground/20 outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all"
                  placeholder="Describe the fit, fabric, and style..."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                />
              </div>

              <div className="flex w-full justify-between items-center pt-2 gap-8">
                <div className="flex-1 space-y-3">
                  <h3 className="font-bold text-sm">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`h-11 w-12 rounded-xl border font-bold text-xs transition-all ${
                          availableSizes.includes(size)
                            ? "bg-foreground text-background border-foreground shadow-md"
                            : "border-foreground/20 hover:border-foreground/40"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="font-bold text-sm">Gender *</h3>
                  <div className="flex gap-2.5 flex-wrap">
                    {genders.map((g, i) => (
                      <button
                        type="button"
                        key={i}
                        className="flex gap-3 items-center group cursor-pointer focus:outline-none"
                        onClick={() => setAvailableGender(g)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            availableGender === g
                              ? "border-foreground bg-foreground"
                              : "border-foreground/20"
                          }`}
                        >
                          {availableGender === g && (
                            <div className="w-1.5 h-1.5 rounded-full bg-background" />
                          )}
                        </div>
                        <p className="capitalize text-sm font-medium">{g}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 border-t border-foreground/10 pt-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Pricing & Stock
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5 relative group">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-foreground font-bold">
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-xl outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full p-3 border border-foreground/20 rounded-xl outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all font-semibold"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 border-t border-foreground/10 pt-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Search & Organization
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-3 w-full rounded-xl border border-foreground/20 bg-background outline-none focus:border-foreground transition-all cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat, i) => (
                    <option value={cat} key={i}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Search Filters (Tags)
                </label>
                <div className="flex flex-wrap gap-2 p-3 min-h-12.5 border border-foreground/20 rounded-xl bg-muted/5 focus-within:border-foreground/40 transition-colors">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tag and press Enter..."
                    className="bg-transparent outline-none text-xs flex-1 min-w-30"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 border-t border-foreground/10 pt-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Inventory Logistics
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Product SKU
                </label>

                <input
                  type="text"
                  placeholder="LKD-OG-TEE-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="p-3 w-full rounded-xl border border-foreground/20 outline-none focus:border-foreground transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Visibility Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="p-3 w-full rounded-xl border border-foreground/20 bg-background outline-none focus:border-foreground transition-all font-bold text-sm cursor-pointer"
                >
                  <option value="ACTIVE">Active (Live on Store)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-6 border-t border-foreground/10 pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">
                Product Colors
              </h2>
              <span className="text-[10px] bg-foreground/5 px-2 py-1 rounded-md font-bold text-foreground/50 uppercase tracking-widest">
                {colors.length} Variants
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative flex items-center gap-2 p-2 bg-foreground/3 border border-foreground/10 rounded-2xl focus-within:border-foreground/30 transition-all">
                <div className="relative" ref={pickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-12 h-12 rounded-xl border-2 border-background shadow-sm transition-transform active:scale-95"
                    style={{ backgroundColor: hex }}
                    title="Choose color"
                  />

                  {showPicker && (
                    <div className="absolute top-full left-0 mt-3 z-50 p-4 bg-white border border-foreground/10 shadow-2xl rounded-2xl">
                      <HexColorPicker color={hex} onChange={setHex} />
                      <div className="mt-3 flex items-center justify-between font-mono text-xs font-bold text-foreground/40 uppercase">
                        <span>{hex}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: hex }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-[9px] font-black uppercase tracking-[0.15em] text-foreground/40 ml-1 mb-0.5">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={currentColorName}
                    onChange={(e) => setCurrentColorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (currentColorName.trim()) addColor();
                      }
                    }}
                    placeholder="e.g. Midnight Black"
                    className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-foreground/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={addColor}
                  disabled={!currentColorName.trim()}
                  className="h-12 px-5 bg-foreground text-background rounded-xl font-bold hover:opacity-90 disabled:opacity-10 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-10">
                {colors.map((color, i) => (
                  <div
                    key={`${color.name}-${color.hex}-${i}`}
                    className="group flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl border border-foreground/10 bg-background hover:border-foreground/20 transition-all"
                  >
                    <div
                      className="w-4 h-4 rounded-lg shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-bold text-foreground/80">
                      {color.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeColor(i)}
                      className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-rose-500 hover:text-white text-foreground/30 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {colors.length === 0 && (
                  <p className="text-xs text-foreground/30 italic py-2">
                    No colors defined for this product.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="hidden lg:flex w-1/2 sticky top-24 h-[calc(100vh-100px)] bg-muted/10 border border-foreground/5 rounded-[2.5rem] items-start justify-center overflow-y-auto custom-scrollbar">
          <div className="w-full h-max justify-center items-center flex flex-col py-10">
            <div className="w-[80%] h-max flex flex-col gap-6">
              {previews.length > 0 ? (
                <>
                  <div className="w-full aspect-3/3 relative rounded-2xl overflow-hidden shadow-sm bg-white">
                    <img
                      src={previews[0]}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {previews.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                      {previews.slice(1).map((src, idx) => (
                        <div
                          key={`${src}-${idx}`}
                          className="aspect-square rounded-xl overflow-hidden bg-white"
                        >
                          <img
                            src={src}
                            alt={`preview-${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full aspect-3/3 border-2 border-dashed border-foreground/10 rounded-2xl flex items-center justify-center bg-muted/5 text-muted-foreground">
                  No images uploaded
                </div>
              )}
            </div>

            <div className="w-[80%] flex flex-col items-start py-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {productName || "Product Name"}
                </h2>
                <p className="text-lg font-semibold mt-1">
                  {productPrice
                    ? `₦${Number(productPrice).toLocaleString()}`
                    : "₦0.00"}
                </p>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {productDesc || "No description provided."}
              </p>

              <div className="w-full flex flex-col gap-4 mt-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Sizes
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSizes.length > 0 ? (
                      availableSizes.map((size) => (
                        <span
                          key={size}
                          className="w-10 h-10 flex items-center justify-center bg-foreground text-background rounded-lg text-sm font-medium"
                        >
                          {size}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No sizes selected
                      </span>
                    )}
                  </div>
                </div>

                {colors.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Colors
                    </span>
                    <div className="flex gap-2 mt-2">
                      {colors.map((c, i) => (
                        <div
                          key={`${c.name}-${c.hex}-${i}`}
                          title={c.name}
                          className="w-8 h-8 rounded-full border border-foreground/20"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
