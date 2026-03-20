import useCartStore from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SyncCartOnLogin() {
  const { status } = useSession();
  const { syncCart } = useCartStore();

  useEffect(() => {
    if (status !== "authenticated") return;

    const run = async () => {
      await syncCart();
    };

    run();
  }, [status, syncCart]);

  return null;
}
