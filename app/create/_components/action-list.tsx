import { Button } from "@/components/ui/button";
import { ServiceAction, ServiceReaction } from "@prisma/client";
import { ReactElement } from "react";
import { BlockType } from "../types";

interface ActionListProps {
  service: {
    color: string;
    actions: ServiceAction[];
    reactions: ServiceReaction[];
  };
  blockType: BlockType;
  onActionClick: (action: ServiceAction | ServiceReaction) => void;
}

export const ActionList: ({
  service,
  blockType,
  onActionClick,
}: ActionListProps) => ReactElement = ({
  service,
  blockType,
  onActionClick,
}: ActionListProps): ReactElement => (
  <div className="grid grid-cols-1 gap-4">
    {(blockType === "action" ? service.actions : service.reactions).map(
      (item: ServiceAction | ServiceReaction): ReactElement => (
        <Button
          key={item.id}
          className="h-12 items-center justify-start rounded-md px-4 text-white"
          style={{ backgroundColor: service.color }}
          onClick={(): void => onActionClick(item)}
        >
          <span>{item.name}</span>
        </Button>
      )
    )}
  </div>
);
