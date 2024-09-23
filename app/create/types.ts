import { ServiceType } from "@prisma/client";
import { ReactNode } from "react";

export type BlockType = "action" | "reaction";

export interface Block {
  type: BlockType;
  text: string;
  icon: ReactNode;
  service?: ServiceType;
  action?: string;
  color?: string;
}
