import { create } from "zustand";
import { Product, ProductState } from "./types";

const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  filters: { sizes: [], categories: [] },
  sortBy: null,
  query: "",
  deletingId: null,
  archivingId: null,
  restoringId: null,

  setQuery: (q) => set({ query: q }),
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSort: (sortBy) => set({ sortBy }),
  setFilter: (type, value) =>
    set((state) => ({
      filters: { ...state.filters, [type]: value },
    })),

  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),

  fetchProducts: async () => {
    const { products } = get();
    if (products.length > 0) return;

    set({ loading: true, error: null });

    try {
      const res = await fetch("/api/users/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();
      set({ products: data });
    } catch (err: any) {
      set({ error: err.message || "Something went wrong" });
    } finally {
      set({ loading: false });
    }
  },

  fetchProductsForAdmins: async () => {
    const { products } = get();
    if (products.length > 0) return;

    set({ loading: true, error: null });

    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();
      set({ products: data });
    } catch (err: any) {
      set({ error: err.message || "Something went wrong" });
    } finally {
      set({ loading: false });
    }
  },

  getProductById: (id: string) => get().products.find((p) => p.id === id),

  deleteProduct: async (id: string) => {
    set({ deletingId: id });

    try {
      const res = await fetch(`/api/admin/products/${id}/soft-delete`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to soft delete product");
      }

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, status: "DELETED" } : p,
        ),
      }));

      return true;
    } catch (error) {
      console.error("Soft delete product error:", error);
      return false;
    } finally {
      set({ deletingId: null });
    }
  },

  archiveProduct: async (id: string) => {
    set({ archivingId: id });

    try {
      const res = await fetch(`/api/admin/products/${id}/archive`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to archive product");
      }

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, status: "ARCHIVED" } : p,
        ),
      }));

      return true;
    } catch (error) {
      console.error("Archive product error:", error);
      return false;
    } finally {
      set({ archivingId: null });
    }
  },

  restoreProduct: async (id: string) => {
    set({ restoringId: id });
    try {
      const res = await fetch(`/api/admin/products/${id}/restore`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to restore product");
      }

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, status: "ACTIVE" } : p,
        ),
      }));

      return true;
    } catch (error) {
      console.error("restore product error:", error);
      return false;
    } finally {
      set({ restoringId: null });
    }
  },

  filteredAndSearchedProducts: () => {
    let products = [...get().products];
    const { sizes, categories } = get().filters;
    const { sortBy, query } = get();

    if (sizes.length > 0) {
      products = products.filter((p) =>
        (p.sizes ?? []).some((s) => sizes.includes(s)),
      );
    }

    if (categories.length > 0) {
      products = products.filter((p) =>
        (p.filters ?? []).some((f) => categories.includes(f)),
      );
    }

    if (query) {
      const q = query.toLowerCase();

      products = products.filter((p) => {
        const matchText =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);

        const matchPrice = p.price.toString().includes(query);

        return matchText || matchPrice;
      });
    }

    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          products.sort((a, b) => a.price - b.price);
          break;
        case "priceDesc":
          products.sort((a, b) => b.price - a.price);
          break;
        case "nameAsc":
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "nameDesc":
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "newest":
          products.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
      }
    }

    return products;
  },
}));

export default useProductStore;
