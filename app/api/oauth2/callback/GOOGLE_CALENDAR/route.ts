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

  const tokenUrl = "https://oauth2.googleapis.com/token";
  const clientId: string = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret: string = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth2/callback/GOOGLE_CALENDAR`;

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const data = await response.json();
    const { access_token, refresh_token } = data;

    const user: User | null = await currentUser();
    if (!user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    const userId: string = user.id;

    const existingService: Service | null = await db.service.findFirst({
      where: {
        userId,
        service: ServiceType.GOOGLE_CALENDAR,
      },
    });

    if (existingService) {
      await db.service.update({
        where: { id: existingService.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });
    } else {
      await db.service.create({
        data: {
          userId,
          service: ServiceType.GOOGLE_CALENDAR,
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/my-services`
    );
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return NextResponse.json(
      { detail: "Failed to exchange code for tokens" },
      { status: 500 }
    );
  }
}
