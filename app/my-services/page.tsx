"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@clerk/nextjs/server";
import { Service, ServiceType } from "@prisma/client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";
import { ServiceInfoWithActions } from "../api/services/route";

export default function ServiceConnector(): ReactElement {
  const [services, setServices] = useState<ServiceInfoWithActions[]>([]);
  const [connectedServices, setConnectedServices] = useState<ServiceType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [serviceToDisconnect, setServiceToDisconnect] =
    useState<ServiceType | null>(null);
  const router: AppRouterInstance = useRouter();

  useEffect((): void => {
    const fetchServices: () => Promise<void> = async (): Promise<void> => {
      try {
        const userResponse: Response = await fetch("/api/users/me");
        const userData: User = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userId: string = userData.id;
        const servicesResponse: Response = await fetch("/api/services");
        const servicesData: ServiceInfoWithActions[] =
          await servicesResponse.json();
        setServices(servicesData);

        const connectedServicesResponse: Response = await fetch(
          `/api/users/${userId}/services`
        );
        const connectedServicesData = await connectedServicesResponse.json();
        if (Array.isArray(connectedServicesData.services)) {
          setConnectedServices(
            connectedServicesData.services.map(
              (service: Service): ServiceType => service.service
            )
          );
        } else {
          console.error("Expected an array but got:", connectedServicesData);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  const handleConnectService: (service: ServiceType) => Promise<void> = async (
    service: ServiceType
  ): Promise<void> => {
    try {
      const userResponse: Response = await fetch("/api/users/me");
      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.detail || "Failed to fetch user data");
      }

      router.push(`/api/oauth2/authorize/${service}`);
    } catch (error) {
      console.error("Error connecting to service:", error);
    }
  };

  const handleDisconnectService: (service: ServiceType) => void = (
    service: ServiceType
  ): void => {
    setServiceToDisconnect(service);
    setIsModalOpen(true);
  };

  const confirmDisconnectService: () => Promise<void> =
    async (): Promise<void> => {
      if (!serviceToDisconnect) {
        return;
      }

      try {
        const userResponse: Response = await fetch("/api/users/me");
        const userData: User = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userId: string = userData.id;
        const response: Response = await fetch(
          `/api/users/${userId}/services/${serviceToDisconnect}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to disconnect service");
        }

        setConnectedServices((prev: ServiceType[]): ServiceType[] =>
          prev.filter(
            (service: ServiceType): boolean => service !== serviceToDisconnect
          )
        );
        setIsModalOpen(false);
        setServiceToDisconnect(null);
      } catch (error) {
        console.error("Error disconnecting service:", error);
      }
    };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Connect your services
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(
          (service: ServiceInfoWithActions): ReactElement => (
            <Card
              key={service.id}
              className="flex flex-col"
              style={{ backgroundColor: service.color }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Image
                    src={service.image_url}
                    alt={service.type.replace(/_/g, " ")}
                    width={32}
                    height={32}
                  />
                  {service.type.replace(/_/g, " ")}
                </CardTitle>
                <CardDescription className="text-white">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button
                  onClick={(): void | Promise<void> =>
                    connectedServices.includes(service.type)
                      ? handleDisconnectService(service.type)
                      : handleConnectService(service.type)
                  }
                  variant={
                    connectedServices.includes(service.type)
                      ? "destructive"
                      : "default"
                  }
                  className="w-full"
                >
                  {connectedServices.includes(service.type)
                    ? "Disconnect"
                    : "Connect"}
                </Button>
              </CardFooter>
            </Card>
          )
        )}
      </div>

      {isModalOpen && (
        <AlertDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Disconnect</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disconnect the service?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(): void => setIsModalOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDisconnectService}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
