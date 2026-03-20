import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";
import { authOptions } from "@/lib/authOptions";
import AdminHeader from "@/components/admin/Header";
import { AdminNotificationsBootstrap } from "@/contexts/SocketNotifications";
import SocketNotificationsClient from "@/contexts/SocketProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session) redirect("/auth/login");
  if (role !== "ADMIN") redirect("/shop");

  return (
    <>
      <AdminNotificationsBootstrap />
      <SocketNotificationsClient />
      <div className="h-screen w-full flex flex-col">
        <AdminHeader />
        <div className="flex h-full flex-1 ml-72 mt-17.5">
          <AdminSidebar />
          <main className="flex-1 bg-background">{children}</main>
        </div>
      </div>
    </>
  );
}
