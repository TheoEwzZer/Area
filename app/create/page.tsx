"use client";

import { Block } from "@/app/create/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Service, ServiceAction, ServiceType } from "@prisma/client";
import { ArrowLeft, Check, Search, Zap } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { ServiceInfoWithActions } from "../api/services/route";
import { ActionList } from "./_components/action-list";
import { BlockItem } from "./_components/block-item";
import { ServiceList } from "./_components/service-list";

const initialBlocks: Block[] = [
  {
    type: "action",
    text: "Choose an Action",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    type: "reaction",
    text: "Choose a REAction",
    icon: <Check className="h-6 w-6" />,
  },
];

export default function WorkflowBuilder(): ReactElement {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null
  );
  const [filter, setFilter] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [services, setServices] = useState<ServiceInfoWithActions[]>([]);
  const [connectedServices, setConnectedServices] = useState<ServiceType[]>([]);

  useEffect((): void => {
    const fetchServices: () => Promise<void> = async (): Promise<void> => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        const data: ServiceInfoWithActions[] = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    const fetchConnectedServices: () => Promise<void> =
      async (): Promise<void> => {
        try {
          const userResponse: Response = await fetch("/api/users/me");
          const userData = await userResponse.json();
          const userId = userData.id;

          const response = await fetch(`/api/users/${userId}/services`);
          if (!response.ok) {
            throw new Error("Failed to fetch connected services");
          }
          const data = await response.json();
          const connectedServiceTypes = data.services.map(
            (service: Service): ServiceType => service.service
          );
          setConnectedServices(connectedServiceTypes);
        } catch (error) {
          console.error("Error fetching connected services:", error);
        }
      };

    fetchServices();
    fetchConnectedServices();
  }, []);

  const filteredServices: ServiceInfoWithActions[] = services.filter(
    (service: ServiceInfoWithActions): boolean =>
      connectedServices.includes(service.type) &&
      service.type.toLowerCase().includes(filter.toLowerCase())
  );

  const handleServiceClick: (serviceType: ServiceType) => void = (
    serviceName: ServiceType
  ): void => {
    setSelectedService(serviceName);
    if (selectedBlockIndex !== null) {
      const service: ServiceInfoWithActions | undefined = services.find(
        (s: ServiceInfoWithActions): boolean => s.type === serviceName
      );
      if (service) {
        const updatedBlocks: Block[] = blocks.map(
          (b: Block, i: number): Block =>
            i === selectedBlockIndex
              ? { ...b, service: serviceName, color: service.color }
              : b
        );
        setBlocks(updatedBlocks);
      }
    }
  };

  const handleActionClick: (action: ServiceAction) => void = (
    action: ServiceAction
  ): void => {
    if (selectedBlockIndex !== null && selectedService !== null) {
      const service: ServiceInfoWithActions | undefined = services.find(
        (s: ServiceInfoWithActions): boolean => s.type === selectedService
      );
      if (service) {
        const updatedBlocks: Block[] = blocks.map(
          (b: Block, i: number): Block =>
            i === selectedBlockIndex
              ? {
                  ...b,
                  service: selectedService,
                  action: action.name,
                  text: action.name,
                  color: service.color,
                }
              : b
        );
        setBlocks(updatedBlocks);
        setSelectedBlockIndex(null);
        setSelectedService(null);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <span className="sr-only">Home</span>
          </Link>
          <h1 className="w-full text-center text-4xl font-bold">
            Create your own AREA
          </h1>
        </div>
        <div className="space-y-8">
          {blocks.map(
            (block: Block, index: number): ReactElement => (
              <div
                key={index}
                className="relative w-full"
              >
                <Dialog
                  open={selectedBlockIndex === index}
                  onOpenChange={(open: boolean): void => {
                    if (!open) {
                      setSelectedBlockIndex(null);
                      setSelectedService(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <BlockItem
                      block={block}
                      onClick={(): void => setSelectedBlockIndex(index)}
                      services={services}
                    />
                  </DialogTrigger>
                  <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
                    {selectedService ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={(): void => setSelectedService(null)}
                          className="mb-4"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to services
                        </Button>
                        <h2 className="mb-4 text-center text-lg font-semibold">
                          Choose an action for {selectedService}
                        </h2>
                        <ActionList
                          service={
                            services.find(
                              (s: ServiceInfoWithActions): boolean =>
                                s.type === selectedService
                            )!
                          }
                          onActionClick={handleActionClick}
                        />
                      </>
                    ) : (
                      <>
                        <h2 className="mb-4 text-center text-lg font-semibold">
                          Choose service for this block
                        </h2>
                        <h3 className="mb-4 text-center text-sm text-gray-500">
                          You can add more services to the list by connecting
                          them on the{" "}
                          <Link
                            href="/my-services"
                            className="text-blue-500 underline"
                          >
                            My Services
                          </Link>{" "}
                          page.
                        </h3>
                        <div className="mx-auto mb-8 max-w-md">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Filter services"
                              className="bg-white pl-8"
                              value={filter}
                              onChange={(
                                e: ChangeEvent<HTMLInputElement>
                              ): void => setFilter(e.target.value)}
                            />
                          </div>
                        </div>
                        <ServiceList
                          services={filteredServices}
                          onServiceClick={handleServiceClick}
                        />
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )
          )}
        </div>
        <div className="mt-12">
          <Button className="w-full bg-black py-6 text-lg text-white hover:bg-gray-800">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
