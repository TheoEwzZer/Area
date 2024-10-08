import { ServiceInfoWithActionsAndReactions } from "@/app/about.json/route";
import { Button } from "@/components/ui/button";
import { ServiceType } from "@prisma/client";
import Image from "next/image";
import { ReactElement } from "react";

interface ServiceListProps {
  services: ServiceInfoWithActionsAndReactions[];
  onServiceClick: (serviceName: ServiceType) => void;
}

export const ServiceList: ({
  services,
  onServiceClick,
}: ServiceListProps) => ReactElement = ({
  services,
  onServiceClick,
}: ServiceListProps): ReactElement => (
  <div className="grid grid-cols-2 gap-4">
    {services.map(
      (service: ServiceInfoWithActionsAndReactions): ReactElement => (
        <Button
          key={service.type.replace(/_/g, " ")}
          className="h-16 items-center justify-center rounded-md px-4 text-white"
          style={{ backgroundColor: service.color }}
          onClick={(): void => onServiceClick(service.type)}
        >
          <Image
            src={service.image_url}
            alt={service.type.replace(/_/g, " ")}
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="bold">{service.type.replace(/_/g, " ")}</span>
        </Button>
      )
    )}
  </div>
);
