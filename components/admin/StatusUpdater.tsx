"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { useToast } from "@/hooks/useToast";
import Spinner from "../ui/spinner";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending Payment" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "CANCELLED", label: "Cancelled" },
];
const allowedTransitions: Record<string, string[]> = {
  PENDING: ["PAID", "FAILED"],
  PAID: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  FAILED: ["PAID"],
};

export function StatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const availableOptions = useMemo(() => {
    const allowed = [
      currentStatus,
      ...(allowedTransitions[currentStatus] || []),
    ];
    return STATUS_OPTIONS.filter((opt) => allowed.includes(opt.value));
  }, [currentStatus]);

  const changed = status !== currentStatus;

  const handleUpdate = async () => {
    if (!changed) return;

    try {
      setSaving(true);

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update status");
      }

      showToast("Order status updated", "success");

      router.refresh();
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Current Status
        </p>
        <p className="text-sm text-foreground/55">
          Update the order using valid operational steps only.
        </p>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={saving}
        className="w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground/25 disabled:opacity-60"
      >
        {availableOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleUpdate}
        disabled={!changed || saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <>
            <Spinner w="5" h="5" />
            Updating...
          </>
        ) : (
          "Update Status"
        )}
      </button>
    </div>
  );
}
