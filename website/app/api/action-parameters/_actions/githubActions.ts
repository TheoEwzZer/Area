import { getGithubAccessToken, getUserAccounts } from "@/lib/github";
import { NextResponse } from "next/server";

export async function handleGithubAction(
  action: string
): Promise<NextResponse<any>> {
  const userAccessToken: string = await getGithubAccessToken();
  const userAccount: any = await getUserAccounts(userAccessToken);

  if (!userAccount?.login) {
    return NextResponse.json({ detail: "No account found" }, { status: 400 });
  }

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

    case "Create new Gist":
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
            type: "text",
          },
          {
            name: "filename",
            label: "Filename",
            type: "text",
          },
          {
            name: "fileContent",
            label: "File content",
            type: "textarea",
          },
        ],
      });

    case "Create an issue/pull request comment":
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
            name: "repositoryName",
            label: "Repository Name",
            type: "text",
          },
          {
            name: "issueNumber",
            label: "Issue Number",
            type: "number",
          },
          {
            name: "fileComment",
            label: "File Comment",
            type: "textarea",
          },
        ],
      });

    default:
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  }
}
