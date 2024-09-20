import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse<unknown>> {
  const { searchParams } = req.nextUrl;
  const service: string | null = searchParams.get("service");

  if (!service || service !== "GOOGLE_CALENDAR") {
    return NextResponse.json(
      { detail: "Missing or invalid service" },
      { status: 400 }
    );
  }

  const authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const clientId: string = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth2/callback?service=GOOGLE_CALENDAR`;
  const scope = "https://www.googleapis.com/auth/calendar";

  const url = `${authorizationUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(url);
}
