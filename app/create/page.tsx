"use client";

import { Block } from "@/app/create/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Service, ServiceAction, ServiceType } from "@prisma/client";
import { ArrowLeft, Check, Search, Zap } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { ServiceInfoWithActionsAndReactions } from "../about.json/route";
import { ActionList } from "./_components/action-list";
import { BlockItem } from "./_components/block-item";
import ParameterForm from "./_components/parameter-form";
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

interface Parameter {
  actionName: string;
  parameters: any[];
}

export default function WorkflowBuilder(): ReactElement {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [filter, setFilter] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [services, setServices] = useState<
    ServiceInfoWithActionsAndReactions[]
  >([]);
  const [connectedServices, setConnectedServices] = useState<ServiceType[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [actionParameters, setActionParameters] = useState<Parameter | null>(
    null
  );
  const [isParameterModalOpen, setIsParameterModalOpen] =
    useState<boolean>(false);
  const { toast } = useToast();

  const saveArea: () => Promise<void> = async (): Promise<void> => {
    const action: Block | undefined = blocks.find(
      (block: Block): boolean => block.type === "action"
    );
    const reaction: Block | undefined = blocks.find(
      (block: Block): boolean => block.type === "reaction"
    );

    if (!action?.action || !reaction?.action) {
      toast({
        title: "Error",
        description:
          "Please select both an action and a reaction before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/areas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionService: action.service,
          actionName: action.action,
          reactionService: reaction.service,
          reactionName: reaction.action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save area");
      }

      toast({
        title: "Success",
        description: "Your AREA has been saved successfully!",
      });

      setBlocks(initialBlocks);
    } catch (error) {
      console.error("Error saving area:", error);
      toast({
        title: "Error",
        description: "Failed to save your AREA. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect((): void => {
    const fetchServices: () => Promise<void> = async (): Promise<void> => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        const data: ServiceInfoWithActionsAndReactions[] =
          await response.json();
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

  const filteredServices: ServiceInfoWithActionsAndReactions[] =
    services.filter(
      (service: ServiceInfoWithActionsAndReactions): boolean =>
        connectedServices.includes(service.type) &&
        service.type.toLowerCase().includes(filter.toLowerCase()) &&
        ((selectedBlock?.type === "action" && service.actions.length > 0) ||
          (selectedBlock?.type === "reaction" && service.reactions.length > 0))
    );

  const handleBlockClick: (block: Block) => void = (block: Block): void => {
    setSelectedBlock(block);
    setIsServiceModalOpen(true);
  };

  const handleServiceClick: (serviceType: ServiceType) => void = (
    serviceType: ServiceType
  ): void => {
    setSelectedService(serviceType);
    setIsServiceModalOpen(false);
    setIsActionModalOpen(true);
  };

  const handleActionClick: (action: ServiceAction) => Promise<void> = async (
    action: ServiceAction
  ): Promise<void> => {
    if (selectedBlock !== null && selectedService !== null) {
      try {
        const response = await fetch(
          `/api/action-parameters?service=${selectedService}&action=${action.name}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch action parameters");
        }
        const data = await response.json();
        setActionParameters(data);
        setIsActionModalOpen(false);
        setIsParameterModalOpen(true);
      } catch (error) {
        console.error("Error fetching action parameters:", error);
        toast({
          title: "Error",
          description: "Failed to fetch action parameters. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleParameterSubmit: (parameters: Record<string, string>) => void = (
    parameters: Record<string, string>
  ): void => {
    if (
      selectedBlock !== null &&
      selectedService !== null &&
      actionParameters !== null
    ) {
      const service: ServiceInfoWithActionsAndReactions | undefined =
        services.find(
          (s: ServiceInfoWithActionsAndReactions): boolean =>
            s.type === selectedService
        );
      if (service) {
        const updatedBlocks: Block[] = blocks.map(
          (b: Block): Block =>
            b === selectedBlock
              ? {
                  ...b,
                  service: selectedService,
                  action: actionParameters.actionName,
                  text: actionParameters.actionName,
                  color: service.color,
                  parameters: parameters,
                }
              : b
        );
        setBlocks(updatedBlocks);
        setSelectedBlock(null);
        setSelectedService(null);
        setActionParameters(null);
        setIsParameterModalOpen(false);
      }
    }
  };

  return (
    <div className="flex flex-col">
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
                <BlockItem
                  block={block}
                  onClick={(): void => handleBlockClick(block)}
                  services={services}
                />
              </div>
            )
          )}
        </div>
        <div className="mt-12">
          <Button
            className="w-full bg-black py-6 text-lg text-white hover:bg-gray-800"
            onClick={saveArea}
          >
            Save
          </Button>
        </div>
      </div>
      <Dialog
        open={isServiceModalOpen}
        onOpenChange={setIsServiceModalOpen}
      >
        <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-center text-lg font-semibold">
            Choose service for this {selectedBlock?.type}
          </h2>
          <h3 className="mb-4 text-center text-sm text-gray-500">
            You can add more services to the list by connecting them on the{" "}
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
                onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                  setFilter(e.target.value)
                }
              />
            </div>
          </div>
          <ServiceList
            services={filteredServices}
            onServiceClick={handleServiceClick}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={isActionModalOpen}
        onOpenChange={setIsActionModalOpen}
      >
        <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
          <Button
            variant="ghost"
            onClick={(): void => {
              setIsActionModalOpen(false);
              setIsServiceModalOpen(true);
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to services
          </Button>
          <h2 className="mb-4 text-center text-lg font-semibold">
            Choose an {selectedBlock?.type} for {selectedService}
          </h2>
          {selectedService && selectedBlock && (
            <ActionList
              service={
                services.find(
                  (s: ServiceInfoWithActionsAndReactions): boolean =>
                    s.type === selectedService
                )!
              }
              blockType={selectedBlock.type}
              onActionClick={handleActionClick}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={isParameterModalOpen}
        onOpenChange={setIsParameterModalOpen}
      >
        <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
          <Button
            variant="ghost"
            onClick={(): void => {
              setIsParameterModalOpen(false);
              setIsActionModalOpen(true);
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to actions
          </Button>
          <h2 className="mb-4 text-center text-lg font-semibold">
            {actionParameters?.actionName}
          </h2>
          {actionParameters && (
            <ParameterForm
              parameters={actionParameters.parameters}
              onSubmit={handleParameterSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
