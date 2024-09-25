import { db } from "@/lib/db";
import { currentUser, User } from "@clerk/nextjs/server";
import { Action, Area, Reaction } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<Area>
> {
  const { actionService, actionName, reactionService, reactionName } =
    await req.json();
  const user: User | null = await currentUser();

  try {
    const action: Action | null = await db.action.findFirst({
      where: { service: actionService, name: actionName },
    });

    const reaction: Reaction | null = await db.reaction.findFirst({
      where: { service: reactionService, name: reactionName },
    });

    if (!action || !reaction) {
      return NextResponse.json(
        { detail: "Action or reaction not found" },
        { status: 404 }
      );
    }

    if (user?.id && action.id && reaction.id) {
      const newArea: Area = await db.area.create({
        data: {
          userId: user.id,
          actionId: action.id,
          reactionId: reaction.id,
        },
      });
      return NextResponse.json(newArea);
    } else {
      throw new Error("User ID, Action ID, or Reaction ID is undefined");
    }
  } catch (error) {
    console.error("Error creating area:", error);
    return NextResponse.json(
      { detail: "Failed to create area" },
      { status: 500 }
    );
  }
}
