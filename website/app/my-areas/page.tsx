"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { AreaWithServiceInfoOnly } from "../api/areas/route";
import { SkeletonCard } from "./_components/skeleton-card";

export default function MyAreas(): ReactElement {
  const [areas, setAreas] = useState<AreaWithServiceInfoOnly[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] =
    useState<AreaWithServiceInfoOnly | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect((): void => {
    const fetchAreas: () => Promise<void> = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/areas");
        const data: AreaWithServiceInfoOnly[] = await response.json();
        setAreas(data);
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const filteredAreas: AreaWithServiceInfoOnly[] = areas.filter(
    (area: AreaWithServiceInfoOnly): boolean =>
      area.title.toLowerCase().includes(filter.toLowerCase()) ||
      area.actionServiceInfo.type
        .toLowerCase()
        .includes(filter.toLowerCase()) ||
      area.reactionServiceInfo.type.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCardClick: (area: AreaWithServiceInfoOnly) => void = (
    area: AreaWithServiceInfoOnly
  ): void => {
    setSelectedArea(area);
    setEditedTitle(area.title);
    setIsModalOpen(true);
  };

  const handleAreaActivation: () => Promise<void> = async (): Promise<void> => {
    if (selectedArea) {
      try {
        const response = await fetch(`/api/areas/${selectedArea.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !selectedArea.isActive }),
        });
        if (response.ok) {
          setAreas(
            areas.map(
              (area: AreaWithServiceInfoOnly): AreaWithServiceInfoOnly =>
                area.id === selectedArea.id
                  ? { ...area, isActive: !area.isActive }
                  : area
            )
          );
          setSelectedArea({
            ...selectedArea,
            isActive: !selectedArea.isActive,
          });
        }
      } catch (error) {
        console.error("Failed to update area:", error);
      }
    }
  };

  const handleAreaDeletion: () => Promise<void> = async (): Promise<void> => {
    if (selectedArea) {
      try {
        const response = await fetch(`/api/areas/${selectedArea.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setAreas(
            areas.filter(
              (area: AreaWithServiceInfoOnly): boolean =>
                area.id !== selectedArea.id
            )
          );
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error("Failed to delete area:", error);
      }
    }
  };

  const handleTitleUpdate: () => Promise<void> = async (): Promise<void> => {
    if (selectedArea && editedTitle !== selectedArea.title) {
      try {
        const response = await fetch(`/api/areas/${selectedArea.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editedTitle }),
        });
        if (response.ok) {
          setAreas(
            areas.map(
              (area: AreaWithServiceInfoOnly): AreaWithServiceInfoOnly =>
                area.id === selectedArea.id
                  ? { ...area, title: editedTitle }
                  : area
            )
          );
          setSelectedArea({
            ...selectedArea,
            title: editedTitle,
          });
        }
      } catch (error) {
        console.error("Failed to update area title:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">My Areas</h1>

      <div className="mb-6 flex justify-center">
        <Input
          type="text"
          placeholder="Filter"
          className="max-w-sm"
          value={filter}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setFilter(e.target.value)
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array(6)
              .fill(null)
              .map(
                (_: any, index: number): ReactElement => (
                  <SkeletonCard key={index} />
                )
              )
          : filteredAreas.map(
              (area: AreaWithServiceInfoOnly): ReactElement => (
                <Card
                  key={area.id}
                  className="relative cursor-pointer transition-all hover:shadow-lg"
                  style={{
                    background: `linear-gradient(to right, ${area.actionServiceInfo.color}, ${area.reactionServiceInfo.color})`,
                  }}
                  onClick={(): void => handleCardClick(area)}
                >
                  <div className="absolute left-6 top-6 flex gap-2">
                    <Image
                      src={area.actionServiceInfo.image_url}
                      alt={area.actionServiceInfo.type}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-md"
                    />
                    <ArrowRight color="white" />
                    <Image
                      src={area.reactionServiceInfo.image_url}
                      alt={area.reactionServiceInfo.type}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-md"
                    />
                  </div>
                  <CardHeader className="pt-14">
                    <CardTitle className="text-3xl text-white">
                      {area.title}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex justify-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`connect-mode-${area.id}`}
                        checked={area.isActive}
                        onClick={(
                          e: React.MouseEvent<HTMLButtonElement>
                        ): void => e.stopPropagation()}
                        onCheckedChange={(): void => {
                          setSelectedArea(area);
                          handleAreaActivation();
                        }}
                      />
                      <Label htmlFor={`connect-mode-${area.id}`}>
                        {area.isActive ? "Connected" : "Disconnected"}
                      </Label>
                    </div>
                  </CardFooter>
                </Card>
              )
            )}
      </div>

      {isModalOpen && selectedArea && (
        <Dialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div>
                <DialogTitle
                  className="text-2xl font-bold"
                  style={{ color: selectedArea.actionServiceInfo.color }}
                >
                  Edit Area
                </DialogTitle>
                <DialogDescription>
                  Manage your area settings here.
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Image
                  src={selectedArea.actionServiceInfo.image_url}
                  alt={selectedArea.actionServiceInfo.type}
                  width={24}
                  height={24}
                  className="rounded-md invert filter"
                />
                <ArrowRight color="black" />
                <Image
                  src={selectedArea.reactionServiceInfo.image_url}
                  alt={selectedArea.reactionServiceInfo.type}
                  width={24}
                  height={24}
                  className="rounded-md invert filter"
                />
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="area-title"
                  className="text-sm font-medium"
                >
                  Area Title
                </Label>
                <Input
                  id="area-title"
                  value={editedTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                    setEditedTitle(e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="modal-connect-mode"
                  className="text-lg font-medium"
                >
                  {selectedArea.isActive ? "Connected" : "Disconnected"}
                </Label>
                <Switch
                  id="modal-connect-mode"
                  checked={selectedArea.isActive}
                  onCheckedChange={handleAreaActivation}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-stretch">
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={handleAreaDeletion}
                >
                  Delete Area
                </Button>
                <Button
                  variant="default"
                  onClick={(): void => {
                    handleTitleUpdate();
                    setIsModalOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
