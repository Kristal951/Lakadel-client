"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ArrowUpDown,
  Archive,
  Filter,
  Package,
  Trash,
  Pencil,
  ArchiveRestore,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";

import useProductStore from "@/store/productStore";
import { formatPrice } from "@/lib";
import { useExchangeRateStore } from "@/store/exchangeRate";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/useToast";

function normalizeStatus(status?: string) {
  const s = String(status || "").toUpperCase();
  const base =
    "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider";

  if (s === "ACTIVE") {
    return {
      label: "Active",
      cls: `${base} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`,
    };
  }

  if (s === "DRAFT") {
    return {
      label: "Draft",
      cls: `${base} bg-amber-500/10 text-amber-600 border-amber-500/20`,
    };
  }

  if (s === "ARCHIVED") {
    return {
      label: "Archived",
      cls: `${base} bg-slate-500/10 text-slate-600 border-slate-500/20`,
    };
  }

  if (s === "DELETED") {
    return {
      label: "Deleted",
      cls: `${base} bg-rose-500/10 text-rose-600 border-rose-500/20`,
    };
  }

  return {
    label: s || "Unknown",
    cls: `${base} bg-slate-500/10 text-slate-600 border-slate-500/20`,
  };
}

export default function ProductsAdminPage() {
  const {
    products,
    fetchProductsForAdmins,
    loading,
    deleteProduct,
    deletingId,
    archivingId,
    restoringId,
    restoreProduct,
    archiveProduct,
  } = useProductStore();

  const { rates } = useExchangeRateStore();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "price" | "stock">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchProductsForAdmins();
  }, [fetchProductsForAdmins]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = Array.isArray(products) ? products : [];

    const searched = !q
      ? list
      : list.filter((p: any) => {
          const name = String(p?.name ?? p?.title ?? "").toLowerCase();
          const sku = String(p?.sku ?? p?.code ?? "").toLowerCase();
          const category = String(
            p?.category ?? p?.categoryName ?? "",
          ).toLowerCase();

          return name.includes(q) || sku.includes(q) || category.includes(q);
        });

    return [...searched].sort((a: any, b: any) => {
      const getVal = (x: any) => {
        if (sortKey === "name") {
          return String(x?.name ?? x?.title ?? "").toLowerCase();
        }

        if (sortKey === "price") {
          return Number(x?.price ?? x?.amount ?? 0);
        }

        return Number(x?.stock ?? x?.totalStock ?? x?.quantity ?? 0);
      };

      const av = getVal(a);
      const bv = getVal(b);

      if (av === bv) return 0;
      if (sortDir === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }, [products, query, sortKey, sortDir]);

  const handleDelete = async (pid: string) => {
    const success = await deleteProduct(pid);

    if (success) {
      showToast("Product deleted", "success");
    } else {
      showToast("Failed to delete product", "error");
    }
  };

  const handleArchive = async (pid: string) => {
    const success = await archiveProduct(pid);

    if (success) {
      showToast("Product archived", "success");
    } else {
      showToast("Failed to archive product", "error");
    }
  };

  const handleUnArchive = async (pid: string) => {
    const success = await restoreProduct(pid);

    if (success) {
      showToast("Product unarchived", "success");
    } else {
      showToast("Failed to unarchive product", "error");
    }
  };

  const handleUnDelete = async (pid: string) => {
    const success = await restoreProduct(pid);

    if (success) {
      showToast("Product restored", "success");
    } else {
      showToast("Failed to restore product", "error");
    }
  };

  return (
    <div className="max-w-350 mx-auto p-6 lg:p-10 space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Catalogue
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage and monitor your inventory.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 p-2 bg-foreground text-background rounded hover:opacity-90 transition font-bold"
        >
          <Plus className="w-5 h-5" />
          New Product
        </Link>
      </header>

      <section className="p-2 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="relative group border w-full lg:w-[50%] rounded-md">
          <Search className="w-5 h-5 text-muted-foreground absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name, sku, or category..."
            className="w-full pl-14 pr-6 py-3 outline-none transition-all font-medium bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border hover:bg-muted/50 transition font-bold text-xs"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortDir.toUpperCase()}
          </button>

          <button
            onClick={() =>
              setSortKey((prev) =>
                prev === "name" ? "price" : prev === "price" ? "stock" : "name",
              )
            }
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border hover:bg-muted/50 transition font-bold text-xs"
          >
            <Filter className="w-4 h-4" />
            Sort: {sortKey}
          </button>
        </div>
      </section>

      <div className="bg-card rounded-[2.5rem] border border-foreground/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-foreground/30 text-left bg-muted/10">
                <th className="pl-10 pr-6 py-6 text-[11px] font-black uppercase tracking-widest text-foreground/70">
                  Product Detail
                </th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-foreground/70 text-center">
                  Price
                </th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-foreground/70 text-center">
                  Inventory
                </th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-foreground/70 text-center">
                  Status
                </th>
                <th className="pl-6 pr-10 py-6 text-[11px] font-black uppercase tracking-widest text-foreground/70 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-foreground/40">
              {filtered.map((p: any) => {
                const status = normalizeStatus(p?.status);
                const image =
                  (Array.isArray(p?.images) ? p.images[0] : p?.images) || null;
                const stock = Number(p?.stock ?? p?.totalStock ?? 0);
                const stockMax = 100;
                const pct = Math.min(100, Math.round((stock / stockMax) * 100));

                return (
                  <tr
                    key={p.id}
                    className="group hover:bg-muted/20 transition-all duration-300"
                  >
                    <td className="pl-10 pr-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/50 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {image ? (
                            <img
                              src={image}
                              alt={p.name || p.title || "Product image"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 opacity-20" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                            {p.name || p.title}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {p.category || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-foreground">
                        {formatPrice(
                          p.price,
                          p.currency || "NGN",
                          rates?.[p.currency || "NGN"],
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={clsx(
                            "text-base font-black tracking-tighter",
                            stock < 10 ? "text-rose-500" : "text-green-500",
                          )}
                        >
                          {stock}
                        </span>

                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all",
                              stock < 10 ? "bg-rose-500" : "bg-primary",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className={status.cls}>{status.label}</span>
                    </td>

                    <td className="pl-6 pr-10 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-2.5 rounded-xl border bg-background hover:bg-foreground hover:text-background transition-all shadow-sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {status.label === "Archived" ? (
                          <button
                            disabled={restoringId === p.id}
                            onClick={() => handleUnArchive(p.id)}
                            className="p-2.5 rounded-xl border bg-background hover:bg-foreground hover:text-background transition-all shadow-sm disabled:opacity-60"
                          >
                            {restoringId === p.id ? (
                              <Spinner w="5" h="5" />
                            ) : (
                              <ArchiveRestore className="w-4 h-4" />
                            )}
                          </button>
                        ) : status.label === "Deleted" ? (
                          <button
                            disabled={restoringId === p.id}
                            onClick={() => handleUnDelete(p.id)}
                            className="p-2.5 rounded-xl border bg-background hover:bg-foreground hover:text-background transition-all shadow-sm disabled:opacity-60"
                          >
                            {restoringId === p.id ? (
                              <Spinner w="5" h="5" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <>
                            <button
                              disabled={archivingId === p.id}
                              onClick={() => handleArchive(p.id)}
                              className="p-2.5 rounded-xl border bg-background hover:bg-foreground hover:text-background transition-all shadow-sm disabled:opacity-60"
                            >
                              {archivingId === p.id ? (
                                <Spinner w="5" h="5" />
                              ) : (
                                <Archive className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              disabled={deletingId === p.id}
                              onClick={() => handleDelete(p.id)}
                              className="p-2.5 rounded-xl border bg-background hover:bg-foreground hover:text-background transition-all shadow-sm disabled:opacity-60"
                            >
                              {deletingId === p.id ? (
                                <Spinner w="5" h="5" />
                              ) : (
                                <Trash className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>

              <h3 className="text-xl font-bold italic">No items found</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-6">
                Try adjusting your search or filters.
              </p>

              <button
                onClick={() => setQuery("")}
                className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 hover:border-primary transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {loading && (
            <div className="w-full h-125 flex items-center justify-center">
              <Spinner w="10" h="10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
