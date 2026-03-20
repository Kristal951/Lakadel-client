// app/api/auth/register/route.ts  (or wherever your register endpoint is)
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const name = String(body?.name ?? "").trim();
    const emailRaw = String(body?.email ?? "").trim();
    const email = emailRaw ? emailRaw.toLowerCase() : "";
    const password = String(body?.password ?? "");

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists, please use another email." },
        { status: 409 }
      );
    }

    const image = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&color=fff`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        authProvider: "EMAIL",
        isGuest: false,
        image,
      },
      select: { id: true, name: true, email: true, currency: true, image: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
