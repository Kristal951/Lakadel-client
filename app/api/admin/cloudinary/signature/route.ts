export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST() {
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    folder: "lakadel/products",
    eager: "w_600,f_auto,q_auto",
    eager_async: "false",
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder: "lakadel/products",
    eager: "w_600,f_auto,q_auto",
    eager_async: "false",
  });
}
