import { getGmailAccessToken, getGmailUserAccount } from "@/lib/gmail";
import { NextResponse } from "next/server";

export async function handleGmailAction(
  action: string
): Promise<NextResponse<any>> {
  let userAccessToken: string;

  try {
    userAccessToken = await getGmailAccessToken();
  } catch (error) {
    return NextResponse.json(
      { detail: "Failed to retrieve access token" },
      { status: 500 }
    );
  }

  const userAccount: {
    id: string | null | undefined;
    value: string | null | undefined;
  } = await getGmailUserAccount(userAccessToken);

  switch (action) {
    case "Send an email": {
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "account",
            label: "Gmail account",
            type: "select",
            options: [
              {
                value: userAccount.id,
                label: userAccount.value,
              },
            ],
          },
          {
            name: "toAddress",
            label: "To address",
            type: "text",
          },
          {
            name: "subject",
            label: "Subject",
            type: "text",
          },
          {
            name: "body",
            label: "Body",
            type: "textarea",
          },
        ],
      });
    }

    case "Send yourself an email": {
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "account",
            label: "Gmail account",
            type: "select",
            options: [
              {
                value: userAccount.id,
                label: userAccount.value,
              },
            ],
          },
          {
            name: "subject",
            label: "Subject",
            type: "text",
          },
          {
            name: "body",
            label: "Body",
            type: "textarea",
          },
        ],
      });
    }

    default:
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  }
}
