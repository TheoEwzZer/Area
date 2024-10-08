import { db } from "@/lib/db";
import { currentUser, User } from "@clerk/nextjs/server";
import { Octokit } from "@octokit/rest";
import { Service } from "@prisma/client";

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
  const octokit = new Octokit({
    auth: accessToken,
  });

  const { data } = await octokit.rest.users.getAuthenticated();

  return data;
}

export async function getUserRepositories(accessToken: string): Promise<any> {
  const octokit = new Octokit({
    auth: accessToken,
  });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    visibility: "all",
  });

  return data;
}
