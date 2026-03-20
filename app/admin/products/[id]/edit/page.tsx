import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductClient from "./EditProductClient";

interface PageProps {
  // In Next.js 15, params is a Promise
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  // 1. Await the params promise
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 2. Safety check: If id is missing, don't even call Prisma
  if (!id) {
    return notFound();
  }

  const product = await prisma.product.findUnique({
    where: { 
      id: id // Explicitly passing the string
    },
  });
  // 3. Handle product not found
  if (!product) {
    return notFound();
  }

  return <EditProductClient initialData={product} />;
}