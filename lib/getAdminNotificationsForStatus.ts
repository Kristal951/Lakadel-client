import { NotificationType, OrderStatus } from "@prisma/client";

export function getAdminNotificationForStatus(
  status: OrderStatus,
  input: {
    orderId: string;
    orderRef: string;
    customerEmail?: string;
    total?: number;
  },
) {
  const { orderId, orderRef, customerEmail, total } = input;

  switch (status) {
    case OrderStatus.PAID:
      return {
        title: "New paid order 💰",
        message: `Order #${orderRef} has been paid${customerEmail ? ` by ${customerEmail}` : ""}.`,
        type: NotificationType.PAYMENT,
        action: "ADMIN_PAYMENT_SUCCESS",
        audience: "ADMIN",
        priority: "HIGH",
        orderId,
        status,
        meta: { total, customerEmail },
      };

    case OrderStatus.FAILED:
      return {
        title: "Payment failed ⚠️",
        message: `Payment failed for order #${orderRef}.`,
        type: NotificationType.PAYMENT,
        action: "ADMIN_PAYMENT_FAILED",
        audience: "ADMIN",
        priority: "URGENT",
        orderId,
        status,
      };

    case OrderStatus.PENDING:
      return {
        title: "New order placed 🛒",
        message: `Order #${orderRef} has been created and is awaiting payment.`,
        type: NotificationType.ORDER,
        action: "ADMIN_ORDER_CREATED",
        audience: "ADMIN",
        priority: "NORMAL",
        orderId,
        status,
      };

    case OrderStatus.SHIPPED:
      return {
        title: "Order shipped 🚚",
        message: `Order #${orderRef} has been marked as shipped.`,
        type: NotificationType.ORDER,
        action: "ADMIN_ORDER_SHIPPED",
        audience: "ADMIN",
        priority: "LOW",
        orderId,
        status,
      };

    case OrderStatus.DELIVERED:
      return {
        title: "Order delivered 📦",
        message: `Order #${orderRef} has been delivered.`,
        type: NotificationType.ORDER,
        action: "ADMIN_ORDER_DELIVERED",
        audience: "ADMIN",
        priority: "LOW",
        orderId,
        status,
      };

    case OrderStatus.REFUNDED:
      return {
        title: "Refund processed 💸",
        message: `Refund completed for order #${orderRef}.`,
        type: NotificationType.ORDER,
        action: "ADMIN_ORDER_REFUNDED",
        audience: "ADMIN",
        priority: "HIGH",
        orderId,
        status,
      };

    case OrderStatus.CANCELLED:
      return {
        title: "Order cancelled ❌",
        message: `Order #${orderRef} has been cancelled.`,
        type: NotificationType.ORDER,
        action: "ADMIN_ORDER_CANCELLED",
        audience: "ADMIN",
        priority: "NORMAL",
        orderId,
        status,
      };

    default:
      return null;
  }
}