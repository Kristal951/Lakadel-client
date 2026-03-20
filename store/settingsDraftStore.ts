import { create } from "zustand";
import { ShippingAddress } from "./types";

type SettingsDraft = {
  name?: string;
  email?: string;
  image?: string | null;
  shippingAddress?: ShippingAddress;
};

type SettingsDraftState = {
  draft: SettingsDraft;
  isDirty: boolean;
  lastSavedAt: number | null;

  hydrateFromUser: (user: any) => void;

  // top-level fields
  setField: <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => void;

  // nested shippingAddress fields
  setShippingField: <K extends keyof ShippingAddress>(
    key: K,
    value: ShippingAddress[K]
  ) => void;

  resetDraft: () => void;
  setLastSaved: (ts: number) => void;
};

const emptyShipping: ShippingAddress = {
  fullName: "",
  streetAddress: "",
  phone: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export const useSettingsDraftStore = create<SettingsDraftState>((set) => ({
  draft: {},
  isDirty: false,
  lastSavedAt: null,

  hydrateFromUser: (user) =>
    set({
      draft: {
        name: user?.name ?? "",
        email: user?.email ?? "",
        image: user?.image ?? null,
        shippingAddress: user?.shippingAddress
          ? {
              ...emptyShipping,
              ...(user.shippingAddress as Partial<ShippingAddress>),
            }
          : { ...emptyShipping },
      },
      isDirty: false,
    }),

  setField: (key, value) =>
    set((state) => ({
      draft: { ...state.draft, [key]: value },
      isDirty: true,
    })),

  setShippingField: (key, value) =>
    set((state) => ({
      draft: {
        ...state.draft,
        shippingAddress: {
          ...(state.draft.shippingAddress ?? { ...emptyShipping }),
          [key]: value,
        },
      },
      isDirty: true,
    })),

  resetDraft: () => set({ draft: {}, isDirty: false }),
  setLastSaved: (ts) => set({ lastSavedAt: ts, isDirty: false }),
}));
