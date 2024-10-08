import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<unknown>> {
  const authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const clientId: string = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth2/callback/GMAIL`;
  const scopes: string[] = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  const url = `${authorizationUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes.join(" "))}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(url);
}
