import {
  getGithubAccessToken,
  getUserAccounts,
  getUserRepositories,
} from "@/lib/github";
import { Option } from "@/types/globals";
import { NextResponse } from "next/server";

export async function handleGithubAction(
  action: string
): Promise<NextResponse<any>> {
  const userAccessToken: string = await getGithubAccessToken();
  const userAccount: any = await getUserAccounts(userAccessToken);

  if (!userAccount?.login) {
    return NextResponse.json({ detail: "No account found" }, { status: 400 });
  }

  const userRepositories: any[] = await getUserRepositories(
    userAccessToken,
    true
  );

  if (!userRepositories || userRepositories.length === 0) {
    return NextResponse.json(
      { detail: "No repositories found" },
      { status: 400 }
    );
  }

  const repositoryOptions: Option[] = userRepositories.map(
    (repo: any): Option => ({
      value: `${repo.owner.login}/${repo.name}`,
      label: `${repo.owner.login}/${repo.name}`,
    })
  );

  switch (action) {
    case "Any new issue":
    case "Any new pull request":
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "account",
            label: "GitHub account",
            type: "select",
            options: [
              {
                value: userAccount.login,
                label: userAccount.login,
              },
            ],
          },
        ],
      });

    case "Create an issue":
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "account",
            label: "GitHub account",
            type: "select",
            options: [
              {
                value: userAccount.login,
                label: userAccount.login,
              },
            ],
          },
          {
            name: "repository",
            label: "Repository",
            type: "select",
            options: repositoryOptions,
          },
          {
            name: "title",
            label: "Title",
            type: "text",
          },
          {
            name: "body",
            label: "Body",
            type: "textarea",
          },
        ],
      });

    case "Create new gist":
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "account",
            label: "GitHub account",
            type: "select",
            options: [
              {
                value: userAccount.login,
                label: userAccount.login,
              },
            ],
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
          },
          {
            name: "filename",
            label: "Filename",
            type: "text",
          },
          {
            name: "filecontent",
            label: "File Content",
            type: "textarea",
          },
          {
            name: "public",
            label: "Secret gist?",
            type: "select",
            options: [
              {
                value: "true",
                label: "Yes",
              },
              {
                value: "false",
                label: "No",
              },
            ],
          },
        ],
      });

    default:
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  }
}
