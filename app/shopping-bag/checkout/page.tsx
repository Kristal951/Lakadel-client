"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IoArrowBackOutline,
  IoChevronDownOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import PhoneInput, {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";

import useCartStore from "@/store/cartStore";
import useProductStore from "@/store/productStore";
import useUserStore from "@/store/userStore";
import { CartItem, Product, ShippingAddress, State } from "@/store/types";
import { useToast } from "@/hooks/useToast";
import PriceContainer from "@/components/shop/PriceContainer";

type PaymentMethod = "PAYSTACK" | "STRIPE";
type CartLine = CartItem & { product: Product };
type FieldKey =
  | "email"
  | "phone"
  | "fullName"
  | "state"
  | "city"
  | "streetAddress";
type GeoCountry = { name: string; iso2?: string; code?: string };

const FREE_SHIPPING_ABOVE = 50_000; 
const SHIPPING_FEE = 2_500; 

const FALLBACK_COUNTRIES: GeoCountry[] = [{ name: "Nigeria", iso2: "NG" }];

const FIELD_ORDER: FieldKey[] = [
  "email",
  "phone",
  "fullName",
  "state",
  "city",
  "streetAddress",
];

const PAYMENT_METHODS: {
  value: PaymentMethod;
  name: string;
  logo: string;
  description: string;
}[] = [
  {
    value: "PAYSTACK",
    name: "Paystack",
    logo: "/assets/Paystack.png",
    description: "Local cards, bank transfer and USSD. Best for NGN.",
  },
  {
    value: "STRIPE",
    name: "Stripe",
    logo: "/assets/Stripe.png",
    description: "Global cards, true multi-currency. Best for USD, EUR and GBP.",
  },
];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

async function postJson(url: string, body: unknown, fallbackError: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || fallbackError);
  return data;
}

const inputClass = (invalid: boolean) =>
  [
    "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors",
    "placeholder:text-foreground/50 disabled:cursor-not-allowed disabled:opacity-50",
    invalid
      ? "border-red-500 focus:border-red-500"
      : "border-foreground/50 hover:border-foreground/30 focus:border-foreground",
  ].join(" ");

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
};

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  optional,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-foreground/45">(optional)</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(!!error)}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  autoComplete,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(!!error)}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          {step}
        </span>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function OrderSummary({
  cartItems,
  currency,
  subtotal,
  shippingFee,
  totalAmount,
}: {
  cartItems: CartLine[];
  currency: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}) {
  const remaining = Math.max(FREE_SHIPPING_ABOVE - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_ABOVE) * 100, 100);

  return (
    <div>
      <ul className="max-h-[40vh] space-y-5 overflow-y-auto pr-1">
        {cartItems.map((item) => (
          <li
            key={`${item.productId}-${item.selectedSize ?? ""}-${item.selectedColor ?? ""}`}
            className="flex items-center gap-4"
          >
            <div className="relative h-20 w-16 shrink-0 mt-2">
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-foreground/5">
                <Image
                  src={item.product.images?.[0] ?? "/placeholder.png"}
                  alt={item.product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                {item.quantity}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.product.name}</p>
              {item.selectedSize && (
                <p className="mt-0.5 text-xs text-foreground/55">
                  Size {item.selectedSize}
                </p>
              )}
            </div>

            <div className="text-sm font-medium">
              <PriceContainer
                currency={currency}
                price={item.product.price * item.quantity}
              />
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-3 border-t border-foreground/10 pt-6 text-sm">
        <div className="flex items-center justify-between text-foreground/70">
          <dt>Subtotal</dt>
          <dd>
            <PriceContainer currency={currency} price={subtotal} />
          </dd>
        </div>
        <div className="flex items-center justify-between text-foreground/70">
          <dt>Shipping</dt>
          <dd>
            {shippingFee === 0 ? (
              <span className="font-medium text-emerald-600">Free</span>
            ) : (
              <PriceContainer currency={currency} price={shippingFee} />
            )}
          </dd>
        </div>
      </dl>

      {/* {shippingFee > 0 && (
        <div className="mt-4 rounded-xl bg-foreground/5 p-3">
          <div className="flex flex-wrap items-center gap-x-1 text-xs text-foreground/70">
            <span>Spend</span>
            <PriceContainer currency={currency} price={remaining} />
            <span>more for free shipping</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )} */}

      <div className="mt-6 flex items-baseline justify-between border-t border-foreground/10 pt-6">
        <span className="text-sm font-semibold">Total</span>
        <span className="text-2xl font-semibold tracking-tight">
          <PriceContainer
            currency={currency}
            price={totalAmount}
            textSize="3xl"
          />
        </span>
      </div>
    </div>
  );
}

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { items, isSyncing } = useCartStore();
  const { products } = useProductStore();
  const { currency, user } = useUserStore();
  const { showToast } = useToast();

  const payLock = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [countryData, setCountryData] = useState<GeoCountry[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: "",
    streetAddress: "",
    landMark: "",
    city: "",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "",
  });

  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const recommendedMethod: PaymentMethod =
    currency === "NGN" ? "PAYSTACK" : "STRIPE";
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(recommendedMethod);

  useEffect(() => setMounted(true), []);
  useEffect(() => setPaymentMethod(recommendedMethod), [recommendedMethod]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/geo/countries");
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        if (!json.error && Array.isArray(json.data)) setCountryData(json.data);
      } catch (err) {
        console.error("Countries fetch failed", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!shipping.country) return;

    const selectedCountry = shipping.country;
    let cancelled = false;

    (async () => {
      setStates([]);
      setStatesLoading(true);
      setShipping((prev) => ({
        ...prev,
        state: selectedCountry === "Nigeria" ? "Lagos" : "",
        city: "",
      }));

      try {
        const json = await postJson(
          "/api/users/geo/states",
          { country: selectedCountry },
          "Failed to fetch states",
        );
        if (!cancelled) setStates(json?.data?.states || json?.data || []);
      } catch (err) {
        console.error("States fetch failed", err);
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shipping.country]);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products as Product[]) map.set(p.id, p);
    return map;
  }, [products]);

  const cartItems = useMemo<CartLine[]>(
    () =>
      (items as CartItem[]).flatMap((cartItem) => {
        const product =
          productMap.get(cartItem.productId) ??
          (cartItem as Partial<CartLine>).product;
        return product ? [{ ...cartItem, product } as CartLine] : [];
      }),
    [items, productMap],
  );

  const unavailableCount = items.length - cartItems.length;

  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
    [cartItems],
  );
  const shippingFee = subtotal > FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const totalAmount = subtotal + shippingFee;

  useEffect(() => {
    if (mounted && !isSyncing && items.length === 0) router.replace("/shop");
  }, [mounted, isSyncing, items.length, router]);

  const errors = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!email.trim()) e.email = "Enter your email address.";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address.";

    if (!phone) e.phone = "Enter your phone number.";
    else if (!isValidPhoneNumber(phone)) e.phone = "Enter a valid phone number.";

    if (!shipping.fullName.trim()) e.fullName = "Enter your full name.";
    if (states.length > 0 && !shipping.state) e.state = "Select your state.";
    if (!shipping.city.trim()) e.city = "Enter your city.";
    if (!shipping.streetAddress.trim())
      e.streetAddress = "Enter your street address.";
    return e;
  }, [email, phone, shipping, states.length]);

  const touch = (key: FieldKey) =>
    setTouched((p) => (p[key] ? p : { ...p, [key]: true }));
  const fieldError = (key: FieldKey) =>
    submitted || touched[key] ? errors[key] : undefined;

  const getPaymentUrl = async (orderId: string): Promise<string> => {
    if (paymentMethod === "PAYSTACK") {
      const data = await postJson(
        "/api/users/paystack/initialise",
        { orderId },
        "Failed to initialise Paystack",
      );
      if (!data?.authorization_url)
        throw new Error("Paystack did not return an authorization URL");
      return data.authorization_url as string;
    }

    let guestId: string | null = null;
    try {
      guestId = localStorage.getItem("guestId");
    } catch {
      guestId = null;
    }

    const data = await postJson(
      "/api/users/stripe",
      {
        orderId,
        guestId,
        userId: user?.id ?? null,
        email: email.trim().toLowerCase(),
      },
      "Failed to initialise Stripe",
    );
    if (!data?.url) throw new Error("Stripe did not return a checkout URL");
    return data.url as string;
  };

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (payLock.current) return;

    setError("");
    setSubmitted(true);

    const firstInvalid = FIELD_ORDER.find((k) => errors[k]);
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.focus();
      return;
    }
    if (cartItems.length === 0) {
      setError("Your bag is empty.");
      return;
    }

    payLock.current = true;
    setLoading(true);
    let redirecting = false;

    try {
      const orderData = await postJson(
        "/api/users/orders/create",
        {
          name: shipping.fullName,
          email: email.trim().toLowerCase(),
          phone: phone ? formatPhoneNumberIntl(phone) : null,
          currency,
          shippingAddress: shipping,
          userId: user?.id ?? null,
          items: cartItems.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedSize: i.selectedSize ?? null,
            selectedColor: i.selectedColor ?? null,
          })),
        },
        "Failed to create order",
      );

      const orderId = orderData?.orderId as string | undefined;
      if (!orderId) throw new Error("Order creation failed (missing orderId)");

      const url = await getPaymentUrl(orderId);
      redirecting = true; 
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      showToast("Could not initialise payment", "error");
    } finally {
      if (!redirecting) {
        setLoading(false);
        payLock.current = false;
      }
    }
  };

  if (!mounted) return null;

  const countryList = countryData.length ? countryData : FALLBACK_COUNTRIES;
  const methods =
    recommendedMethod === "PAYSTACK"
      ? PAYMENT_METHODS
      : [...PAYMENT_METHODS].reverse();
  const phoneError = fieldError("phone");

  const summaryProps = { cartItems, currency, subtotal, shippingFee, totalAmount };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <details className="group border-b border-foreground/10 bg-foreground/3 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 font-medium">
            Order summary
            <IoChevronDownOutline className="transition-transform group-open:rotate-180" />
          </span>
          <span className="font-semibold">
            <PriceContainer currency={currency} price={totalAmount} />
          </span>
        </summary>
        <div className="px-6 pb-6">
          <OrderSummary {...summaryProps} />
        </div>
      </details>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20 lg:py-16">
        <form onSubmit={handlePay} noValidate className="max-w-xl">
          <Link
            href="/shopping-bag"
            className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
          >
            <IoArrowBackOutline />
            Back to bag
          </Link>

          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Checkout
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Enter your details to complete your order.
            </p>
          </header>

          {unavailableCount > 0 && (
            <div
              role="status"
              className="mb-8 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400"
            >
              <IoInformationCircleOutline className="mt-0.5 shrink-0 text-lg" />
              <span>
                {unavailableCount} item{unavailableCount > 1 ? "s" : ""} in your
                bag couldn&apos;t be loaded and won&apos;t be included in this
                order.{" "}
                <Link href="/shopping-bag" className="underline">
                  Review your bag
                </Link>
              </span>
            </div>
          )}

          <div className="space-y-12">
            <Section step={1} title="Contact">
              <TextField
                id="field-email"
                label="Email address"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                onBlur={() => touch("email")}
                error={fieldError("email")}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="field-phone" className="text-sm font-medium">
                  Phone number
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  onBlur={() => touch("phone")}
                  defaultCountry="NG"
                  international
                  countryCallingCodeEditable={false}
                  className={[
                    "flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm transition-colors focus-within:border-foreground",
                    phoneError
                      ? "border-red-500"
                      : "border-foreground/15 hover:border-foreground/30",
                  ].join(" ")}
                  numberInputProps={{
                    id: "field-phone",
                    className:
                      "w-full bg-transparent outline-none placeholder:text-foreground/30",
                    placeholder: "801 234 5678",
                    autoComplete: "tel",
                    "aria-invalid": !!phoneError,
                    "aria-describedby": phoneError
                      ? "field-phone-error"
                      : undefined,
                  }}
                />
                {phoneError && (
                  <p id="field-phone-error" className="text-xs text-red-600">
                    {phoneError}
                  </p>
                )}
              </div>
            </Section>

            <Section step={2} title="Delivery">
              <TextField
                id="field-fullName"
                label="Full name"
                autoComplete="name"
                value={shipping.fullName}
                onChange={(v) => setShipping((p) => ({ ...p, fullName: v }))}
                onBlur={() => touch("fullName")}
                error={fieldError("fullName")}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  id="field-country"
                  label="Country"
                  autoComplete="country-name"
                  value={shipping.country}
                  onChange={(v) =>
                    setShipping((p) => ({
                      ...p,
                      country: v as ShippingAddress["country"],
                    }))
                  }
                >
                  {countryList.map((c) => (
                    <option key={c.iso2 || c.code || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>

                {statesLoading || states.length > 0 ? (
                  <SelectField
                    id="field-state"
                    label="State"
                    autoComplete="address-level1"
                    value={shipping.state}
                    onChange={(v) => setShipping((p) => ({ ...p, state: v }))}
                    onBlur={() => touch("state")}
                    error={fieldError("state")}
                    disabled={statesLoading}
                  >
                    <option value="">
                      {statesLoading ? "Loading states..." : "Select state"}
                    </option>
                    {states.map((s) => (
                      <option key={s.state_code} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </SelectField>
                ) : (
                  <TextField
                    id="field-state"
                    label="State / region"
                    optional
                    autoComplete="address-level1"
                    value={shipping.state}
                    onChange={(v) => setShipping((p) => ({ ...p, state: v }))}
                  />
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id="field-city"
                  label="City"
                  autoComplete="address-level2"
                  value={shipping.city}
                  onChange={(v) => setShipping((p) => ({ ...p, city: v }))}
                  onBlur={() => touch("city")}
                  error={fieldError("city")}
                />
                <TextField
                  id="field-postalCode"
                  label="Postal code"
                  optional
                  autoComplete="postal-code"
                  inputMode="text"
                  value={shipping.postalCode ?? ""}
                  onChange={(v) => setShipping((p) => ({ ...p, postalCode: v }))}
                />
              </div>

              <TextField
                id="field-streetAddress"
                label="Street address"
                autoComplete="street-address"
                value={shipping.streetAddress}
                onChange={(v) =>
                  setShipping((p) => ({ ...p, streetAddress: v }))
                }
                onBlur={() => touch("streetAddress")}
                error={fieldError("streetAddress")}
              />

              <TextField
                id="field-landMark"
                label="Landmark"
                optional
                value={shipping.landMark ?? ""}
                onChange={(v) => setShipping((p) => ({ ...p, landMark: v }))}
              />
            </Section>

            <Section step={3} title="Payment">
              <div
                role="radiogroup"
                aria-label="Payment method"
                className="space-y-3"
              >
                {methods.map((m) => {
                  const selected = paymentMethod === m.value;
                  return (
                    <label
                      key={m.value}
                      className="relative block cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={m.value}
                        checked={selected}
                        onChange={() => setPaymentMethod(m.value)}
                        className="peer sr-only"
                      />
                      <div
                        className={[
                          "flex items-start gap-4 rounded-2xl border p-5 transition peer-focus-visible:ring-2 peer-focus-visible:ring-foreground/40",
                          selected
                            ? "border-foreground ring-1 ring-foreground"
                            : "border-foreground/15 hover:border-foreground/40",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            selected ? "border-foreground" : "border-foreground/30",
                          ].join(" ")}
                        >
                          {selected && (
                            <span className="h-2 w-2 rounded-full bg-foreground" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <Image
                            src={m.logo}
                            alt={`${m.name} logo`}
                            width={100}
                            height={20}
                            className="h-5 w-24 object-contain object-left"
                          />
                          <p className="mt-2 text-sm text-foreground/60">
                            {m.description}
                          </p>
                        </div>

                        {recommendedMethod === m.value && (
                          <span className="h-fit rounded-full bg-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-background">
                            Recommended
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </Section>
          </div>

          <div className="mt-10 space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
              >
                <IoInformationCircleOutline className="mt-0.5 shrink-0 text-lg" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              aria-busy={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay</span>
                  <PriceContainer
                    currency={currency}
                    price={totalAmount}
                    textColor="white"
                  />
                </>
              )}
            </button>

            <p className="flex items-start justify-center gap-2 text-center text-xs text-foreground/50">
              <IoLockClosedOutline className="mt-0.5 shrink-0 text-sm" />
              <span>
                Secure payment via{" "}
                {paymentMethod === "PAYSTACK" ? "Paystack" : "Stripe"}. Your
                data is encrypted and not stored.
              </span>
            </p>
          </div>
        </form>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-foreground/10 bg-foreground/2 p-8">
            <h2 className="mb-6 text-lg font-semibold tracking-tight">
              Order summary
            </h2>
            <OrderSummary {...summaryProps} />
          </div>
        </aside>
      </div>
    </div>
  );
}