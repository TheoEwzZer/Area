import {
  getCalendars,
  getGoogleCalendarAccessToken,
} from "@/lib/googleCalendar";
import { Option } from "@/types/globals";
import { NextResponse } from "next/server";

const timeOptions: Option[] = [
  { value: "0", label: "0 minute" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 heure" },
  { value: "90", label: "1 heure 30" },
  { value: "120", label: "2 heures" },
  { value: "150", label: "2 heures 30" },
  { value: "180", label: "3 heures" },
  { value: "210", label: "3 heures 30" },
  { value: "240", label: "4 heures" },
];

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

  switch (action) {
    case "New event added": {
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "calendar",
            label: "Which calendar?",
            type: "select",
            options: calendars.map(
              (calendar: {
                id: string | null | undefined;
                name: string | null | undefined;
              }): Option => ({
                value: calendar.id!,
                label: calendar.name!,
              })
            ),
          },
        ],
      });
    }

    case "Any event starts": {
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "calendar",
            label: "Which calendar?",
            type: "select",
            options: calendars.map(
              (calendar: {
                id: string | null | undefined;
                name: string | null | undefined;
              }): Option => ({
                value: calendar.id!,
                label: calendar.name!,
              })
            ),
          },
          {
            name: "timeBeforeEvent",
            label: "Time before event starts",
            type: "select",
            options: timeOptions,
          },
        ],
      });
    }

    case "Quick add event": {
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "calendar",
            label: "Which calendar?",
            type: "select",
            options: calendars.map(
              (calendar: {
                id: string | null | undefined;
                name: string | null | undefined;
              }): Option => ({
                value: calendar.id!,
                label: calendar.name!,
              })
            ),
          },
          {
            name: "quickAddText",
            label: "Quick add text",
            type: "text",
          },
        ],
      });
    }

    case "Create a detailed event": {
      return NextResponse.json({
        actionName: action,
        parameters: [
          {
            name: "calendar",
            label: "Which calendar?",
            type: "select",
            options: calendars.map(
              (calendar: {
                id: string | null | undefined;
                name: string | null | undefined;
              }): Option => ({
                value: calendar.id!,
                label: calendar.name!,
              })
            ),
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
    }

    default:
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  }
}
