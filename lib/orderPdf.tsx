import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

interface OrderItem {
  name: string;
  selectedSize?: string;
  quantity: number;
  image?: string;
  lineTotalKobo: number;
}

interface OrderPdfProps {
  type: "INVOICE" | "RECEIPT" | "ORDER SUMMARY";
  order: {
    id: string;
    orderNumber: number;
    customerName: string;
    customerEmail: string;
    createdAt:  Date;
    status: string;
    currency: string;
    subTotal: number;
    shippingFee: number;
    total: number;
    paymentMethod: string;
    shippingAddress?: {
      streetAddress?: string;
      city?: string;
      country?: string;
    };
    items: OrderItem[];
  };
}

// --- THEME ---
const BLACK = "#111111";
const SOFT_BLACK = "#1a1a1a";
const GREY_900 = "#2a2a2a";
const GREY_700 = "#666666";
const GREY_500 = "#8d8d8d";
const GREY_300 = "#d9d9d9";
const GREY_200 = "#ebebeb";
const GREY_100 = "#f7f7f7";
const WHITE = "#ffffff";

const LOGO_SRC =
  "https://res.cloudinary.com/dqjaaplnl/image/upload/f_auto,q_auto,w_400/v1774109992/picskrypt/amvwounrcticp6e8uoth.png";

// --- HELPERS ---
const formatKobo = (amountKobo: number, currency = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format((amountKobo || 0) / 100);
};

const formatDate = (value: string | Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const safe = (value?: string | number | null, fallback = "N/A") => {
  console.log(value);
  if (!value || !Number(value) || !String(value).trim()) return fallback;
  return String(value);
};

const isReceipt = (type: OrderPdfProps["type"]) => type === "RECEIPT";

const prettyStatus = (status?: string) => {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ");
};

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 38,
    paddingHorizontal: 38,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: BLACK,
    backgroundColor: WHITE,
  },

  watermark: {
    position: "absolute",
    top: 305,
    left: 78,
    fontSize: 95,
    fontFamily: "Helvetica-Bold",
    color: "#fafafa",
    transform: "rotate(-28deg)",
  },

  // Top strip
  topBar: {
    borderBottom: `1pt solid ${BLACK}`,
    paddingBottom: 14,
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  brandBlock: {
    maxWidth: 260,
  },

  logo: {
    width: 92,
    height: 28,
    objectFit: "contain",
    marginBottom: 7,
  },

  brandName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },

  brandTagline: {
    fontSize: 6.5,
    color: GREY_700,
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 2.8,
  },

  docMeta: {
    alignItems: "flex-end",
  },

  docTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: SOFT_BLACK,
  },

  metaRef: {
    marginTop: 6,
    fontSize: 8,
    color: GREY_700,
    fontFamily: "Courier",
  },

  // Hero row
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    alignItems: "flex-end",
  },

  heroLeft: {
    maxWidth: 280,
  },

  heroLabel: {
    fontSize: 7,
    color: GREY_500,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },

  heroText: {
    fontSize: 12,
    lineHeight: 1.55,
    color: BLACK,
  },

  heroTextStrong: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.4,
    color: BLACK,
  },

  statusChip: {
    border: `1pt solid ${BLACK}`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },

  infoPanel: {
  borderTop: `1pt solid ${GREY_200}`,
  borderBottom: `1pt solid ${GREY_200}`,
  paddingVertical: 18,
  marginBottom: 28,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
  infoCol: {
    flex: 1,
  },

  infoColRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  sectionLabel: {
    fontSize: 7,
    color: GREY_500,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },

  infoLine: {
    fontSize: 8.5,
    lineHeight: 1.55,
    color: GREY_900,
  },

  infoLineBold: {
    fontSize: 8.8,
    lineHeight: 1.55,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
  },

  // Table header
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottom: `1pt solid ${BLACK}`,
    marginBottom: 6,
  },

  listHeaderTextLeft: {
    flex: 1,
    fontSize: 7,
    color: GREY_700,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontFamily: "Helvetica-Bold",
  },

  listHeaderTextRight: {
    width: 110,
    textAlign: "right",
    fontSize: 7,
    color: GREY_700,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontFamily: "Helvetica-Bold",
  },

  // Items
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottom: `0.6pt solid ${GREY_200}`,
  },

  itemImageWrap: {
    width: 56,
    height: 72,
    backgroundColor: GREY_100,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  imagePlaceholder: {
    fontSize: 6.5,
    color: GREY_500,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  itemMain: {
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    fontSize: 9.6,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: BLACK,
    lineHeight: 1.35,
  },

  itemMeta: {
    marginTop: 4,
    fontSize: 7.2,
    color: GREY_700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    lineHeight: 1.45,
  },

  itemAmount: {
    width: 110,
    textAlign: "right",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
  },

  // Summary
  summaryWrap: {
    marginTop: 26,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  summaryBox: {
    width: 245,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  summaryLabel: {
    fontSize: 7.2,
    color: GREY_700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: "Helvetica-Bold",
  },

  summaryValue: {
    fontSize: 8.8,
    color: BLACK,
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1pt solid ${BLACK}`,
    marginTop: 10,
    paddingTop: 12,
  },

  grandTotalLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: BLACK,
  },

  grandTotalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
  },

  // Footer
  footer: {
    position: "absolute",
    left: 38,
    right: 38,
    bottom: 28,
    borderTop: `1pt solid ${GREY_200}`,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  footerLeft: {
    maxWidth: 270,
  },

  footerSmallLabel: {
    fontSize: 6.8,
    color: GREY_500,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },

  footerText: {
    fontSize: 7.2,
    color: GREY_700,
    lineHeight: 1.4,
  },

  authCode: {
    fontSize: 7.2,
    color: GREY_700,
    fontFamily: "Courier",
  },

  footerRight: {
    fontSize: 7,
    color: GREY_700,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Helvetica-Bold",
  },
});

// --- COMPONENT ---
export const OrderPdfDocument = ({ type, order }: OrderPdfProps) => {
  const receiptMode = isReceipt(type);

  return (
    <Document author="Lakadel" title={`${type}-${order.orderNumber}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>LAKADEL</Text>

        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.brandBlock}>
            <Image src={LOGO_SRC} style={styles.logo} />
            <Text style={styles.brandName}>Lakadel</Text>
            <Text style={styles.brandTagline}>Archive & Studio</Text>
          </View>

          <View style={styles.docMeta}>
            <Text style={styles.docTitle}>{type}</Text>
            <Text style={styles.metaRef}>REF: {safe(order.orderNumber)}</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>
              {receiptMode ? "Receipt issued to" : "Bill to"}
            </Text>
            <Text style={styles.heroTextStrong}>
              {safe(order.customerName)}
            </Text>
            <Text style={styles.heroText}>{safe(order.customerEmail)}</Text>
          </View>

          <Text style={styles.statusChip}>{prettyStatus(order.status)}</Text>
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.infoCol}>
            <Text style={styles.sectionLabel}>Shipping Address</Text>
            <Text style={styles.infoLine}>
              {safe(order.shippingAddress?.streetAddress)}
            </Text>
            <Text style={styles.infoLine}>
              {safe(order.shippingAddress?.city, "")}
              {order.shippingAddress?.city && order.shippingAddress?.country
                ? ", "
                : ""}
              {safe(order.shippingAddress?.country, "") || "N/A"}
            </Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.sectionLabel}>Document issued on</Text>
            <Text style={styles.infoLineBold}>
              {formatDate(order.createdAt)}
            </Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.sectionLabel}>Payed Via</Text>
            <Text style={styles.infoLineBold}>
              {prettyStatus(order.paymentMethod)}
            </Text>
          </View>

          <View style={styles.infoColRight}>
            <Text style={styles.sectionLabel}>Order Status</Text>
            <Text style={styles.infoLineBold}>
              {prettyStatus(order.status)}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTextLeft}>Items</Text>
          <Text style={styles.listHeaderTextRight}>Amount</Text>
        </View>

        {order.items.map((item, index) => (
          <View
            key={`${item.name}-${index}`}
            style={styles.itemRow}
            wrap={false}
          >
            <View style={styles.itemImageWrap}>
              {item.image ? (
                <Image src={item.image} style={styles.itemImage} />
              ) : (
                <Text style={styles.imagePlaceholder}>No Image</Text>
              )}
            </View>

            <View style={styles.itemMain}>
              <Text style={styles.itemName}>{safe(item.name)}</Text>
              <Text style={styles.itemMeta}>
                Size: {safe(item.selectedSize, "OS")} / Qty: {item.quantity}
              </Text>
            </View>

            <Text style={styles.itemAmount}>
              {formatKobo(item.lineTotalKobo, order.currency)}
            </Text>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryWrap} wrap={false}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatKobo(order.subTotal, order.currency)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {formatKobo(order.shippingFee, order.currency)}
              </Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>
                {receiptMode ? "Amount Paid" : "Total Payable"}
              </Text>
              <Text style={styles.grandTotalValue}>
                {formatKobo(order.total, order.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerSmallLabel}>System Authentication</Text>
            <Text style={styles.authCode}>
              #{String(order.orderNumber).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.footerRight}>lakadel.com</Text>
        </View>
      </Page>
    </Document>
  );
};
