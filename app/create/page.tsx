"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, X, HelpCircle, Zap, Check, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { Input } from "@/components/ui/input";

type BlockType = "if" | "then";

interface Block {
  type: BlockType;
  text: string;
  icon: React.ReactNode;
  service?: string;
  action?: string;
  color?: string;
}

const initialBlocks: Block[] = [
  { type: "if", text: "Choose a trigger", icon: <Zap className="h-6 w-6" /> },
  { type: "then", text: "Choose an action", icon: <Check className="h-6 w-6" /> },
];

const services = [
  { name: "Discord", color: "#788CFF", image: "/discord.svg", actions: ["Send message", "Create channel", "Add role"] },
  { name: "Gmail", color: "#EA4335", image: "/gmail.svg", actions: ["Send email", "Create draft", "Add label"] },
  { name: "Spotify", color: "#1DB954", image: "/spotify.svg", actions: ["Play track", "Create playlist", "Follow artist"] },
  { name: "Twitch", color: "#9146FF", image: "/twitch.svg", actions: ["Start stream", "Send chat message", "Create clip"] },
  { name: "Google Calendar", color: "#4285F4", image: "/calendar.svg", actions: ["Create event", "Set reminder", "Delete event"] },
  { name: "Youtube", color: "#D00000", image: "/youtube.svg", actions: ["Upload video", "Create playlist", "Like video"] },
  { name: "Deezer", color: "#00C7F2", image: "/deezer.svg", actions: ["Play track", "Create playlist", "Follow artist"] },
  { name: "OneDrive", color: "#0078D4", image: "/onedrive.svg", actions: ["Upload file", "Create folder", "Share file"] },
  { name: "Google Drive", color: "#F5E592", image: "/google-drive.svg", actions: ["Upload file", "Create folder", "Share file"] },
  { name: "Outlook", color: "#0078D4", image: "/outlook.svg", actions: ["Send email", "Create event", "Add contact"] },
  { name: "Teams", color: "#6264A7", image: "/teams.svg", actions: ["Send message", "Create meeting", "Add member"] },
  { name: "Weather", color: "#00A5E5", image: "/weather.svg", actions: ["Get forecast", "Set alert", "Get current conditions"] },
  { name: "Google Translate", color: "#374255", image: "/google-translate.svg", actions: ["Translate text", "Detect language", "Get supported languages"] },
  { name: "Amazon", color: "#FF9900", image: "/amazon.svg", actions: ["Place order", "Track package", "Add to cart"] },
];

export default function WorkflowBuilder() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(filter.toLowerCase())
  );

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      type,
      text: type === "if" ? "Choose a trigger" : "Choose an action",
      icon: type === "if" ? <Zap className="h-6 w-6" /> : <Check className="h-6 w-6" />,
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    if (selectedBlockIndex !== null) {
      const service = services.find(s => s.name === serviceName);
      if (service) {
        const updatedBlocks = blocks.map((b, i) =>
          i === selectedBlockIndex ? { ...b, service: serviceName, color: service.color } : b
        );
        setBlocks(updatedBlocks);
      }
    }
  };

  const handleActionClick = (action: string) => {
    if (selectedBlockIndex !== null && selectedService !== null) {
      const service = services.find(s => s.name === selectedService);
      if (service) {
        const updatedBlocks = blocks.map((b, i) =>
          i === selectedBlockIndex ? { ...b, service: selectedService, action, text: action, color: service.color } : b
        );
        setBlocks(updatedBlocks);
        setSelectedBlockIndex(null);
        setSelectedService(null);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <span className="sr-only">Home</span>
          </Link>
          <h1 className="text-4xl font-bold text-center w-full">Create your own Workflow</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-6 w-6" />
                <span className="sr-only">Help</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold text-center mb-2">How to use</h2>
              <p className="text-center">
                Create your workflow by adding &quotIfquot and quotThenquot blocks. Click the
                quot+quot button to add a new block.
              </p>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-8">
          {blocks.map((block, index) => (
            <div key={index} className="relative w-full">
              <Dialog open={selectedBlockIndex === index} onOpenChange={(open) => {
                if (!open) {
                  setSelectedBlockIndex(null);
                  setSelectedService(null);
                }
              }}>
                <DialogTrigger asChild>
                  <div
                    className="flex items-center p-6 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity w-full"
                    style={{ backgroundColor: block.color ?? (block.type === "if" ? "#EF4444" : "#F59E0B") }}
                    onClick={() => setSelectedBlockIndex(index)}
                  >
                    <div className="text-3xl font-bold capitalize mr-6">{block.type}</div>
                    {block.service ? (
                      <Image
                        src={services.find(s => s.name === block.service)?.image ?? ""}
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
                <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
                  {selectedService ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedService(null)}
                        className="mb-4"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to services
                      </Button>
                      <h2 className="text-lg font-semibold text-center mb-4">Choose an action for {selectedService}</h2>
                      <div className="grid grid-cols-1 gap-4">
                        {services.find(s => s.name === selectedService)?.actions.map((action) => (
                          <Button
                            key={action}
                            className="h-12 justify-start items-center px-4 rounded-md text-white"
                            style={{ backgroundColor: services.find(s => s.name === selectedService)?.color }}
                            onClick={() => handleActionClick(action)}
                          >
                            <span>{action}</span>
                          </Button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-center mb-4">Choose service for this block</h2>
                      <div className="max-w-md mx-auto mb-8">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Filter services"
                            className="pl-8 bg-white"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {filteredServices.map((service) => (
                          <Button
                            key={service.name}
                            className="h-16 text-white justify-center items-center px-4 rounded-md"
                            style={{ backgroundColor: service.color }}
                            onClick={() => handleServiceClick(service.name)}
                          >
                            <Image
                              src={service.image}
                              alt={service.name}
                              width={32}
                              height={32}
                              className="mr-2"
                            />
                            <span className="bold">{service.name}</span>
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
              {block.type === "then" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white"
                  onClick={() => removeBlock(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove block</span>
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => addBlock("then")}
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add block</span>
          </Button>
        </div>
        <div className="mt-12">
          <Button className="w-full bg-black text-white hover:bg-gray-800 text-lg py-6">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
