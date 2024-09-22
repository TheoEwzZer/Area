import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<unknown>> {
  const authorizationUrl = "https://discord.com/api/oauth2/authorize";
  const clientId: string = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth2/callback/DISCORD`;
  const scope = "identify";

  const url = `${authorizationUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}`;

  return NextResponse.redirect(url);
}
