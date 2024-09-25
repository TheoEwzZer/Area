import { ServiceInfoWithActionsAndReactions } from "@/app/about.json/route";
import Image from "next/image";
import { ReactElement } from "react";
import { Block } from "../types";

interface BlockItemProps {
  block: Block;
  onClick: () => void;
  services: ServiceInfoWithActionsAndReactions[];
}

export const BlockItem: ({
  block,
  onClick,
  services,
}: BlockItemProps) => ReactElement = ({
  block,
  onClick,
  services,
}: BlockItemProps): ReactElement => (
  <div
    className="flex w-full cursor-pointer items-center rounded-lg p-6 text-white transition-opacity hover:opacity-90"
    style={{
      backgroundColor:
        block.color ?? (block.type === "action" ? "#EF4444" : "#F59E0B"),
    }}
    onClick={onClick}
  >
    <div className="mr-6 text-3xl font-bold capitalize">{block.type}</div>
    {block.service ? (
      <Image
        src={
          services.find(
            (s: ServiceInfoWithActionsAndReactions): boolean =>
              s.type === block.service
          )?.image_url ?? ""
        }
        alt={block.service}
        width={50}
        height={50}
        className="mr-4"
      />
    ) : (
      block.icon
    )}
    <div className="ml-2 text-xl">{block.text}</div>
  </div>
);
