import {
  getCalendars,
  getGoogleCalendarAccessToken,
} from "@/lib/googleCalendar";
import { Option } from "@/types/globals";
import { NextResponse } from "next/server";

export async function handleGoogleCalendarAction(
  action: string
): Promise<NextResponse<any>> {
  const userAccessToken: string = await getGoogleCalendarAccessToken();

  const calendars: {
    id: string | null | undefined;
    name: string | null | undefined;
  }[] = await getCalendars(userAccessToken);

  if (
    calendars.some(
      (calendar: {
        id: string | null | undefined;
        name: string | null | undefined;
      }): boolean => !calendar.id || !calendar.name
    )
  ) {
    return NextResponse.json(
      { detail: "Calendar ID or name is null or undefined" },
      { status: 400 }
    );
  }

  const calendarOptions: Option[] = calendars.map(
    (calendar: {
      id: string | null | undefined;
      name: string | null | undefined;
    }): Option => ({
      value: calendar.id!,
      label: calendar.name!,
    })
  );

  switch (action) {
    case "New event added":
    case "Event deleted":
    case "Event modified":
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "calendar",
            label: "Which calendar?",
            type: "select",
            options: calendarOptions,
          },
        ],
      });

    case "Quick add event":
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "calendar",
            label: "Which calendar?",
            type: "select",
            options: calendarOptions,
          },
          {
            name: "quickAddText",
            label: "Quick add text",
            type: "text",
          },
        ],
      });

    case "Create a detailed event":
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "calendar",
            label: "Which calendar?",
            type: "select",
            options: calendarOptions,
          },
          {
            name: "startTime",
            label: "Start time",
            type: "datetime-local",
          },
          {
            name: "endTime",
            label: "End time",
            type: "datetime-local",
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

    default:
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  }
}
