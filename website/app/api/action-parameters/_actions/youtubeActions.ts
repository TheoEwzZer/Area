import { getYoutubeAccessToken, getYouTubeUserAccount } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function handleYoutubeAction(
  action: string
): Promise<NextResponse<any>> {
  const userAccessToken: string = await getYoutubeAccessToken();

  const userAccount: {
    id: string | null | undefined;
    value: string | null | undefined;
  } = await getYouTubeUserAccount(userAccessToken);

  if (action === "Upload video from URL") {
    return NextResponse.json({
      actionName: action,
      parameters: [
        {
          name: "account",
          label: "YouTube account",
          type: "select",
          options: [
            {
              value: userAccount.id,
              label: userAccount.value,
            },
          ],
        },
        {
          name: "videoUrl",
          label: "Video URL",
          type: "text",
        },
        {
          name: "title",
          label: "Title",
          type: "text",
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
        },
      ],
    });
  } else {
    return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  }
}
