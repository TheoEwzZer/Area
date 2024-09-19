import { Service } from "@/app/create/types";
import { Button } from "@/components/ui/button";
import { ReactElement } from "react";

interface ActionListProps {
  service: Service;
  onActionClick: (action: string) => void;
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
      (action: string): ReactElement => (
        <Button
          key={action}
          className="h-12 items-center justify-start rounded-md px-4 text-white"
          style={{ backgroundColor: service.color }}
          onClick={(): void => onActionClick(action)}
        >
          <span>{action}</span>
        </Button>
      )
    )}
  </div>
);
