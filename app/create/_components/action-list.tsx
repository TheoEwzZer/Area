import { Button } from "@/components/ui/button";
import { ServiceAction } from "@prisma/client";
import { ReactElement } from "react";

interface ActionListProps {
  service: {
    color: string;
    actions: ServiceAction[];
  };
  onActionClick: (action: ServiceAction) => void;
}

export const ActionList: ({
  service,
  onActionClick,
}: ActionListProps) => ReactElement = ({
  service,
  onActionClick,
}: ActionListProps): ReactElement => (
  <div className="grid grid-cols-1 gap-4">
    {service.actions.map(
      (action: ServiceAction): ReactElement => (
        <Button
          key={action.id}
          className="h-12 items-center justify-start rounded-md px-4 text-white"
          style={{ backgroundColor: service.color }}
          onClick={(): void => onActionClick(action)}
        >
          <span>{action.name}</span>
        </Button>
      )
    )}
  </div>
);
