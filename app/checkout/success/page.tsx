import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const dynamic = "force-dynamic"; 

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <SuccessClient />
    </Suspense>
  );
}
