import { db } from "@/lib/db";
import { currentUser, User } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function getGithubAccessToken(): Promise<string> {
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
      service: "GITHUB",
    },
  });

  if (!service) {
    throw new Error("Github service not found for user");
  }
  return service.accessToken;
}

export async function getUserAccounts(accessToken: string): Promise<any> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user accounts");
    }

    return response.json();
  } catch {
    try {
      const user: User | null = await currentUser();
      if (!user || !user.id) {
        throw new Error("User not found or user ID is missing");
      }

      const service: Service | null = await db.service.findFirst({
        where: {
          userId: user.id,
          service: "GITHUB",
        },
      });

      if (!service || !service.refreshToken) {
        throw new Error("GitHub service or refresh token not found for user");
      }

      const newAccessToken: string = await refreshAccessToken(
        service.refreshToken
      );

      await db.service.update({
        where: { id: service.id },
        data: { accessToken: newAccessToken },
      });

      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch GitHub user accounts");
      }

      return response.json();
    } catch (refreshError) {
      console.error("Error refreshing token and retrying", refreshError);
      return null;
    }
  }
}
