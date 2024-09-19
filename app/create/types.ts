import { ServiceType } from "@prisma/client";
import { ReactNode } from "react";

export interface Block {
  type: "action" | "reaction";
  text: string;
  icon: ReactNode;
  service?: ServiceType;
  action?: string;
  color?: string;
}

export interface Service {
  name: ServiceType;
  color: string;
  image: string;
  actions: string[];
}
