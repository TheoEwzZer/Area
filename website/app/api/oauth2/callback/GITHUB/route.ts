import { db } from "@/lib/db";
import { currentUser, User } from "@clerk/nextjs/server";
import { Service, ServiceType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse<unknown>> {
  const { searchParams } = req.nextUrl;
  const code: string | null = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ detail: "Missing code" }, { status: 400 });
  }

  const tokenUrl = "https://github.com/login/oauth/access_token";
  const clientId: string = process.env.GITHUB_APP_CLIENT_ID!;
  const clientSecret: string = process.env.GITHUB_APP_CLIENT_SECRET!;

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const data = await response.json();
    const { access_token } = data;

    const user: User | null = await currentUser();
    if (!user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    const userId: string = user.id;

    const existingService: Service | null = await db.service.findFirst({
      where: {
        userId,
        service: ServiceType.GITHUB,
      },
    });

    if (existingService) {
      await db.service.update({
        where: { id: existingService.id },
        data: {
          accessToken: access_token,
        },
      });
    } else {
      await db.service.create({
        data: {
          userId,
          service: ServiceType.GITHUB,
          accessToken: access_token,
        },
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/my-services`
    );
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      { detail: "Failed to exchange code for token" },
      { status: 500 }
    );
  }
}
