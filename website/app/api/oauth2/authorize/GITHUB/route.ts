import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<unknown>> {
  const authorizationUrl = "https://github.com/login/oauth/authorize";
  const clientId: string = process.env.GITHUB_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth2/callback/GITHUB`;
  const scope = "repo user";

  const url = `${authorizationUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(url);
}
