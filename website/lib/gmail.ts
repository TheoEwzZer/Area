import { currentUser, User } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";
import { GaxiosResponse } from "gaxios";
import { OAuth2Client } from "google-auth-library";
import { gmail_v1, google } from "googleapis";
import { db } from "./db";

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { token } = await oauth2Client.getAccessToken();

  if (!token) {
    throw new Error("Failed to refresh access token");
  }

  return token;
}

export async function getGmailAccessToken(): Promise<string> {
  const user: User | null = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const userId: string | null = user.id;

  if (!userId) {
    throw new Error("User ID is missing");
  }

  const service: Service | null = await db.service.findFirst({
    where: {
      userId: userId,
      service: "GMAIL",
    },
  });

  if (!service) {
    throw new Error("Gmail service not found for user");
  }
  return service.accessToken;
}

function createOAuth2Client(accessToken: string): OAuth2Client {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  return oAuth2Client;
}

export async function getGmailUserAccount(accessToken: string): Promise<{
  id: string | null | undefined;
  value: string | null | undefined;
}> {
  try {
    const auth: OAuth2Client = createOAuth2Client(accessToken);
    const service: gmail_v1.Gmail = google.gmail({
      version: "v1",
      auth,
    });
    const res: GaxiosResponse<gmail_v1.Schema$Profile> =
      await service.users.getProfile({
        userId: "me",
      });

    const profile: gmail_v1.Schema$Profile = res.data;

    return {
      id: profile?.emailAddress,
      value: profile?.emailAddress,
    };
  } catch {
    try {
      const user: User | null = await currentUser();
      if (!user || !user.id) {
        throw new Error("User not found or user ID is missing");
      }

      const service: Service | null = await db.service.findFirst({
        where: {
          userId: user.id,
          service: "GMAIL",
        },
      });

      if (!service || !service.refreshToken) {
        throw new Error("Gmail service or refresh token not found for user");
      }

      const newAccessToken: string = await refreshAccessToken(
        service.refreshToken
      );

      await db.service.update({
        where: { id: service.id },
        data: { accessToken: newAccessToken },
      });

      const auth: OAuth2Client = createOAuth2Client(accessToken);
      const gmailService: gmail_v1.Gmail = google.gmail({
        version: "v1",
        auth,
      });
      const res: GaxiosResponse<gmail_v1.Schema$Profile> =
        await gmailService.users.getProfile({
          userId: "me",
        });

      const profile: gmail_v1.Schema$Profile = res.data;

      return {
        id: profile?.emailAddress,
        value: profile?.emailAddress,
      };
    } catch (refreshError) {
      console.error("Error refreshing token and retrying", refreshError);
      return { id: null, value: null };
    }
  }
}
