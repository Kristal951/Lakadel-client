import { OrderStatus, NotificationType } from "@prisma/client";

export function getUserNotificationForStatus(
  status: OrderStatus,
  input: { orderId: string; orderRef: string },
) {
  const { orderId, orderRef } = input;

  switch (status) {
    case OrderStatus.PAID:
      return {
        title: "Payment confirmed 🎉",
        message: `We have received your payment for order #${orderRef}.`,
        type: NotificationType.PAYMENT,
        action: "PAYMENT_SUCCESS",
        orderId,
        status: OrderStatus.PAID,
      };

    case OrderStatus.FAILED:
      return {
        title: "Payment failed",
        message: `Your payment for order #${orderRef} failed. Please try again.`,
        type: NotificationType.PAYMENT,
        action: "PAYMENT_FAILED",
        orderId,
        status: OrderStatus.FAILED,
      };

    case OrderStatus.SHIPPED:
      return {
        title: "Order shipped 🚚",
        message: `Your Order #${orderRef} is on the way.`,
        type: NotificationType.ORDER,
        action: "ORDER_SHIPPED",
        orderId,
        status: OrderStatus.SHIPPED,
      };

    case OrderStatus.DELIVERED:
      return {
        title: "Order delivered 📦",
        message: `Your Order #${orderRef} has been delivered.`,
        type: NotificationType.ORDER,
        action: "ORDER_DELIVERED",
        orderId,
        status: OrderStatus.DELIVERED,
      };

    case OrderStatus.REFUNDED:
      return {
        title: "Refund processed 💸",
        message: `Your refund for order #${orderRef} has been completed.`,
        type: NotificationType.ORDER,
        action: "ORDER_REFUNDED",
        orderId,
        status: OrderStatus.REFUNDED,
      };

    case OrderStatus.PENDING:
      return {
        title: "Order placed ✅",
        message: `Your order #${orderRef} has been placed and is awaiting payment.`,
        type: NotificationType.ORDER,
        action: "ORDER_PLACED",
        orderId,
        status: OrderStatus.PENDING,
      };

    case OrderStatus.CANCELLED:
      return {
        title: "Order cancelled ❌",
        message: `Your order #${orderRef} has been cancelled.`,
        type: NotificationType.ORDER,
        action: "ORDER_CANCELLED",
        orderId,
        status: OrderStatus.CANCELLED,
      };

    default:
      return null;
  }
}
