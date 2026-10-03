import Link from "next/link";
import {
    ArrowUpRight,
    MessageSquare,
    PackageSearch,
    ShieldAlert,
    WifiOff,
    type LucideIcon,
} from "lucide-react";
import RetryButton from "@/components/order/RetryButton";

export type OrderIssue = "invalid" | "not_found" | "forbidden" | "error";

const COPY: Record<
    OrderIssue,
    { icon: LucideIcon; title: string; body: string }
> = {
    invalid: {
        icon: PackageSearch,
        title: "That doesn't look like an order number",
        body: "Order numbers look like LKD-000123. Check the link in your confirmation email, or find the order in your order history.",
    },
    not_found: {
        icon: PackageSearch,
        title: "We couldn't find this order",
        body: "It may have been typed incorrectly, or the order was never completed. Check your confirmation email for the right number.",
    },
    forbidden: {
        icon: ShieldAlert,
        title: "This order isn't available to you",
        body: "Orders can only be viewed by the account that placed them. If you ordered as a guest, use the link from your confirmation email.",
    },
    error: {
        icon: WifiOff,
        title: "We couldn't load this order",
        body: "That was on our side, not yours. Your order is safe. Please try again in a moment.",
    },
};

export default function OrderUnavailable({
    issue,
    orderRef,
}: {
    issue: OrderIssue;
    orderRef: string;
}) {
    const { icon: Icon, title, body } = COPY[issue];

    return (
        <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16 text-foreground">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-foreground/10 bg-foreground/4">
                    <Icon size={26} className="text-foreground" />
                </div>

                <h1 className="text-4xl font-semibold tracking-tight sm:text-3xl">
                    {title}
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground/60">
                    {body}
                </p>

                {issue !== "invalid" && (
                    <p className="mt-5 inline-block max-w-full truncate rounded-full bg-foreground/5 px-3 py-1 font-mono text-xs text-foreground/60">
                        {orderRef}
                    </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    {issue === "error" ? (
                        <RetryButton />
                    ) : (
                        <Link
                            href="/orders"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-background transition hover:opacity-90"
                        >
                            View my orders
                            <ArrowUpRight size={14} />
                        </Link>
                    )}

                    <Link
                        href={`/support?ref=${encodeURIComponent(orderRef)}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-foreground hover:text-background"
                    >
                        <MessageSquare size={14} />
                        Contact support
                    </Link>
                </div>

                <Link
                    href="/shop"
                    className="mt-6 inline-block text-sm text-foreground/50  md:underline-offset-4 underline transition hover:text-foreground md:hover:underline"
                >
                    Continue shopping
                </Link>
            </div>
        </main>
    );
}