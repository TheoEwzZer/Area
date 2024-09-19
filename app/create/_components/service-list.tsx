import { Service } from "@/app/create/types";
import { Button } from "@/components/ui/button";
import { ServiceType } from "@prisma/client";
import Image from "next/image";
import { ReactElement } from "react";

interface ServiceListProps {
  services: Service[];
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
      (service: Service): ReactElement => (
        <Button
          key={service.name}
          className="h-16 items-center justify-center rounded-md px-4 text-white"
          style={{ backgroundColor: service.color }}
          onClick={(): void => onServiceClick(service.name)}
        >
          <Image
            src={service.image}
            alt={service.name}
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="bold">{service.name.replace(/_/g, " ")}</span>
        </Button>
      )
    )}
  </div>
);
