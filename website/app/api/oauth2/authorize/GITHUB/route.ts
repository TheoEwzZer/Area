import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<unknown>> {
  const installationUrl =
    "https://github.com/apps/area-epitech-marseille/installations/new";
  const clientId: string = process.env.GITHUB_APP_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth2/callback/GITHUB`;

  const url = `${installationUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  return NextResponse.redirect(url);
}
