import { NotificationType, OrderStatus } from "@prisma/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  filters: string[];
  createdAt: string;
  totalStock: number;
}
export type Color = { name: string; hex: string };

export type CartItem = {
  productId: string;
  quantity: number;
  selectedColor?: { name: string; hex: string } | null;
  selectedSize?: string | null;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    totalStock: number;
  };
};

export interface CartStore {
  items: CartItem[];
  isSyncing: boolean;
  loading: boolean;

  addToCart: (item: CartItem) => void;
  syncCart: () => void;
  clearLocalCart: () => void;

  removeFromCart: (
    productId: string,
    selectedSize?: string | null,
    selectedColorHex?: string | null,
  ) => void;

  increaseQty: (
    productId: string,
    selectedSize?: string | null,
    selectedColorHex?: string | null,
  ) => void;

  decreaseQty: (
    productId: string,
    selectedSize?: string | null,
    selectedColorHex?: string | null,
  ) => void;

  clearCart: () => void;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  phone?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  landMark?: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  deletingId: string | null;
  archivingId: string | null;
  restoringId: string | null;
  error: string | null;
  filters: {
    sizes: string[];
    categories: string[];
  };
  sortBy: "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc" | "newest" | null;
  query: string;

  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSort: (sortBy: ProductState["sortBy"]) => void;
  setQuery: (query: string) => void;
  setFilter: (type: "sizes" | "categories", value: string[]) => void;

  fetchProducts: () => Promise<void>;
  fetchProductsForAdmins: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  filteredAndSearchedProducts: () => Product[];
  deleteProduct: (id: string) => Promise<boolean>;
  archiveProduct: (id: string) => Promise<boolean>;
  restoreProduct: (id: string) => Promise<boolean>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  authProvider: "GOOGLE" | "EMAIL";
  isGuest: boolean;
  currency: string;
  image?: string;

  cart: {
    productId: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];

  orders: string[];

  shippingAddress?: {
    fullName: string;
    streetAddress: string;
    phone?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  };
  phone?: string;

  createdAt: string;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
  currency: string;
  country: string;
  currencySymbol: string;
  loggingOut: boolean;

  setUser: (user: User) => void;
  setLoggingOut: (loggingOut: boolean) => void;
  setCurrency: (currency: string) => void;
  setCountry: (country: string) => void;
  logout: () => void;
  registerUser: (data: {
    name: string;
    email: string;
    password: string;
  }) => User | null | Promise<any>;
}

export interface ExchangeRateState {
  rates: Record<string, number>;
  loading: boolean;
  error: string | null;
  fetchRates: () => Promise<void>;
  resetRates: () => void;
  lastFetched: number;
}

export type CartItemPayload = {
  productId: string;
  quantity: number;
  selectedColor?: { name: string; hex: string } | string | null;
  selectedSize: string | null;
};

export type Country = {
  name: string;
  iso2: string;
  lat?: string;
  long?: number;
  code?: number;
};

export type State = { state_code?: string; name: string };

export type NotificationAudience = "USER" | "ADMIN";
export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  action?: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
  status?: OrderStatus;
  orderId?: string;
  audience?: NotificationAudience;
  priority?: NotificationPriority;
  meta?: Record<string, any>;
  order?: any;
};

export type Store = {
  notifications: AppNotification[];
  unreadCount: number;
  hasFetched: boolean;
  loading: boolean;

  fetchNotifications: () => Promise<void>;
  push: (n: AppNotification) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
  clearAllNotification: () => Promise<void>;
};

export type Body = {
  orderId: string;
  userId?: string | null;
  guestId?: string | null;
};
export type CreateNotificationInput = Omit<
  AppNotification,
  "id" | "read" | "createdAt"
>;

export type SelectedColor = {
  name: string;
  hex: string;
};

export type OrderItem = {
  id: string;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: unknown;
  unitPriceKobo: number;
  product?: {
    id?: string;
    name?: string | null;
    images?: string[] | null;
  } | null;
};

export type Order = {
  id: string;
  orderNumber: number;
  formattedOrderNumber: string;
  itemCount: number;
  totalKobo: number;
  status: OrderStatus;
  createdAt: string | Date;
  orderItems: OrderItem[];
};

export type Counts = {
  all: number;
  PENDING: number;
  PAID: number;
  SHIPPED: number;
  DELIVERED: number;
};
