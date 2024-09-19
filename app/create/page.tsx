"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ServiceType } from "@prisma/client";
import { ArrowLeft, Check, HelpCircle, Search, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { ReactElement, useEffect, useState } from "react";

type BlockType = "action" | "reaction";

interface Block {
  type: BlockType;
  text: string;
  icon: React.ReactNode;
  service?: ServiceType;
  action?: string;
  color?: string;
}

interface Service {
  name: ServiceType;
  color: string;
  image: string;
  actions: string[];
}

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

const services: Service[] = [
  {
    name: "YOUTUBE",
    color: "#ff0000",
    image:
      "https://assets.ifttt.com/images/channels/32/icons/monochrome_large.png",
    actions: ["Upload video", "Create playlist", "Like video"],
  },
  {
    name: "OUTLOOK",
    color: "#0371C5",
    image: "/outlook.svg",
    actions: ["Send email", "Create event", "Add contact"],
  },
  {
    name: "GITHUB",
    color: "#4078c0",
    image:
      "https://assets.ifttt.com/images/channels/2107379463/icons/monochrome_large.png",
    actions: ["Create repository", "Create issue", "Create pull request"],
  },
  {
    name: "DISCORD",
    color: "#7289da",
    image:
      "https://assets.ifttt.com/images/channels/179823445/icons/monochrome_large.png",
    actions: ["Send message", "Create channel", "Add role"],
  },
  {
    name: "GOOGLE_CALENDAR",
    color: "#2c6efc",
    image:
      "https://assets.ifttt.com/images/channels/1396293310/icons/monochrome_large.png",
    actions: ["Create event", "Set reminder", "Delete event"],
  },
];

export default function WorkflowBuilder(): ReactElement {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect((): void => {
    const checkServiceConnection: () => Promise<void> =
      async (): Promise<void> => {
        if (selectedService) {
          try {
            const userResponse: Response = await fetch("/api/users/me");
            const userData = await userResponse.json();

            if (!userResponse.ok) {
              throw new Error(userData.detail || "Failed to fetch user data");
            }

            const userId = userData.id;

            const response = await fetch(
              `/api/check-service-connection/${userId}/${selectedService}`
            );
            const data = await response.json();
            setIsConnected(data.isConnected);
          } catch (error) {
            console.error("Error checking service connection:", error);
          }
        }
      };

    checkServiceConnection();
  }, [selectedService]);

  const filteredServices: Service[] = services.filter(
    (service: Service): boolean =>
      service.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleServiceClick: (serviceName: ServiceType) => void = (
    serviceName: ServiceType
  ): void => {
    setSelectedService(serviceName);
    if (selectedBlockIndex !== null) {
      const service: Service | undefined = services.find(
        (s: Service): boolean => s.name === serviceName
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

  const handleActionClick: (action: string) => void = (
    action: string
  ): void => {
    if (selectedBlockIndex !== null && selectedService !== null) {
      const service: Service | undefined = services.find(
        (s: Service): boolean => s.name === selectedService
      );
      if (service) {
        const updatedBlocks: Block[] = blocks.map(
          (b: Block, i: number): Block =>
            i === selectedBlockIndex
              ? {
                  ...b,
                  service: selectedService,
                  action,
                  text: action,
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
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <HelpCircle className="h-6 w-6" />
                <span className="sr-only">Help</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-2 text-center text-lg font-semibold">
                How to use
              </h2>
              <p className="text-center">
                Create your workflow by adding &quot;Action&quot; and
                &quot;Reaction&quot; blocks.
              </p>
            </DialogContent>
          </Dialog>
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
                    <div
                      className="flex w-full cursor-pointer items-center rounded-lg p-6 text-white transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor:
                          block.color ??
                          (block.type === "action" ? "#EF4444" : "#F59E0B"),
                      }}
                      onClick={(): void => setSelectedBlockIndex(index)}
                    >
                      <div className="mr-6 text-3xl font-bold capitalize">
                        {block.type}
                      </div>
                      {block.service ? (
                        <Image
                          src={
                            services.find(
                              (s: Service): boolean => s.name === block.service
                            )?.image ?? ""
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
                  </DialogTrigger>
                  <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
                    {selectedService ? (
                      isConnected ? (
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
                          <div className="grid grid-cols-1 gap-4">
                            {services
                              .find(
                                (s: Service): boolean =>
                                  s.name === selectedService
                              )
                              ?.actions.map(
                                (action: string): ReactElement => (
                                  <Button
                                    key={action}
                                    className="h-12 items-center justify-start rounded-md px-4 text-white"
                                    style={{
                                      backgroundColor: services.find(
                                        (s: Service): boolean =>
                                          s.name === selectedService
                                      )?.color,
                                    }}
                                    onClick={(): void =>
                                      handleActionClick(action)
                                    }
                                  >
                                    <span>{action}</span>
                                  </Button>
                                )
                              )}
                          </div>
                        </>
                      ) : (
                        <div>
                          <h2 className="mb-4 text-center text-lg font-semibold">
                            Connect to {selectedService}
                          </h2>
                          <p className="text-center">
                            You need to connect to {selectedService} to use its
                            actions.
                          </p>
                          <Button
                            className="mt-4 w-full"
                            onClick={(): void => {
                              // Logic to connect to service
                            }}
                          >
                            Connect to {selectedService}
                          </Button>
                        </div>
                      )
                    ) : (
                      <>
                        <h2 className="mb-4 text-center text-lg font-semibold">
                          Choose service for this block
                        </h2>
                        <div className="mx-auto mb-8 max-w-md">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Filter services"
                              className="bg-white pl-8"
                              value={filter}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ): void => setFilter(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {filteredServices.map(
                            (service: Service): ReactElement => (
                              <Button
                                key={service.name}
                                className="h-16 items-center justify-center rounded-md px-4 text-white"
                                style={{ backgroundColor: service.color }}
                                onClick={(): void =>
                                  handleServiceClick(service.name)
                                }
                              >
                                <Image
                                  src={service.image}
                                  alt={service.name}
                                  width={32}
                                  height={32}
                                  className="mr-2"
                                />
                                <span className="bold">
                                  {service.name.replace(/_/g, " ")}
                                </span>
                              </Button>
                            )
                          )}
                        </div>
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
