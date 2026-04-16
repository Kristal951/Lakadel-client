"use client";

import { OrderPdfDocument } from "@/lib/orderPdf";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  },
);

export default function InvoicePreviewPage() {
  const mockOrder = {
    id: "lakadel_9f3a2c1b7e8d",
    orderNumber: 102845,
    createdAt: new Date("2026-03-21T12:30:00"),
    paidAt: new Date("2026-03-21T12:45:00"),
    status: "PAID",
    paymentRef: "PAYSTACK_92HF82JDK",
    currency: "NGN",

    customerName: "Nonso Okeke",
    customerEmail: "nonso@example.com",
    customerPhone: "08012345678",
    paymentMethod: "Stripe",

    shippingAddress: {
      fullName: "Nonso Okeke",
      phone: "08012345678",
      street: "12 Admiralty Way",
      city: "Lekki",
      state: "Lagos",
      country: "Nigeria",
    },

    shippingFee: 300000, // ₦3,000
    subTotal: 1850000,   // ₦18,500
    total: 2150000,      // ₦21,500

    items: [
      {
        name: "Lakadel Oversized Hoodie",
        quantity: 2,
        unitPriceKobo: 750000,
        lineTotalKobo: 1500000,
        selectedSize: "XL",
        selectedColor: "Black",
        image:
          "https://images.unsplash.com/photo-1602810319428-019690571b5b?q=80&w=800",
      },
      {
        name: "Lakadel Premium Sneakers",
        quantity: 1,
        unitPriceKobo: 350000,
        lineTotalKobo: 350000,
        selectedSize: "44",
        selectedColor: "White",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800",
      },
    ],
  };

  return (
    <div className="h-screen w-full">
      <PDFViewer width="100%" height="100%">
        <OrderPdfDocument type="RECEIPT" order={mockOrder} />
      </PDFViewer>
    </div>
  );
}