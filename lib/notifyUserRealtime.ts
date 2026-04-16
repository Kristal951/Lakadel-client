import { prisma } from "@/lib/prisma";
import { CreateNotificationInput } from "@/store/types";

export async function notifyUserRealtime(input: CreateNotificationInput) {
  const { userId, guestId } = input;
  console.log(userId, guestId, 'notify User')

  if (!userId && !guestId) {
    throw new Error("Notification must have userId or guestId");
  }

  const scopedDedupeKey = input.dedupeKey
    ? `${input.dedupeKey}:${userId ?? guestId}`
    : undefined;

  if (scopedDedupeKey) {
    const existing = await prisma.notification.findUnique({
      where: { dedupeKey: scopedDedupeKey },
    });

    if (existing) return existing;
  }

  const n = await prisma.notification.create({
    data: {
      userId: userId ?? null,
      guestId: guestId ?? null,
      title: input.title,
      message: input.message,
      type: input.type ?? "INFO",
      link: input.link,
      action: input.action,
      orderId: input.orderId,
      status: input.status,
      audience: input.audience ?? "USER",
      priority: input.priority ?? "NORMAL",
      meta: input.meta,
      dedupeKey: scopedDedupeKey,
    },
  });

  try {
    await fetch(process.env.SOCKET_EMIT_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.SOCKET_INTERNAL_KEY!,
      },
      body: JSON.stringify({
        userId: userId ?? null,
        guestId: guestId ?? null,
        notification: {
          ...n,
          createdAt: n.createdAt.toISOString(),
        },
        audience: input.audience ?? "USER",
      }),
    });
  } catch (err) {
    console.log("Socket emit failed:", err);
  }

  return n;
}

export async function notifyAdminsRealtime({
  title,
  message,
  type = "INFO",
  link,
  action,
  orderId,
  status,
  priority = "HIGH",
  meta,
  dedupeKeyPrefix,
}: {
  title: string;
  message: string;
  type?: any;
  link?: string;
  action?: string;
  orderId?: string;
  status?: any;
  priority?: any;
  meta?: any;
  dedupeKeyPrefix?: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const results = await Promise.all(
    admins.map((admin) =>
      notifyUserRealtime({
        userId: admin.id,
        title,
        message,
        type,
        link,
        action,
        orderId,
        status,
        audience: "ADMIN",
        priority,
        meta,
        dedupeKey: dedupeKeyPrefix
          ? `${dedupeKeyPrefix}:${admin.id}`
          : undefined,
      }),
    ),
  );

  return results;
}
