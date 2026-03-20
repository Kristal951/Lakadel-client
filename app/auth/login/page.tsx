import { Suspense } from "react";
import FloatingLabelLogin from "./FloatingLabel";


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <FloatingLabelLogin />
    </Suspense>
  );
}