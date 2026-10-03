"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

export default function RetryButton() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => router.refresh())}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-background transition hover:opacity-90 disabled:opacity-60"
        >
            {pending ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <RefreshCw size={14} />
            )}
            {pending ? "Trying again..." : "Try again"}
        </button>
    );
}