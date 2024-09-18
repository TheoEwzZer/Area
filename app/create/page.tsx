"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, X, HelpCircle, Zap, Check, Search } from "lucide-react";
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
}

const initialBlocks: Block[] = [
  { type: "if", text: "Choose a trigger", icon: <Zap className="h-6 w-6" /> },
  { type: "then", text: "Choose an action", icon: <Check className="h-6 w-6" /> },
];

const services = [
  { name: "Discord", color: "#788CFF", image: "/discord.svg" },
  { name: "Gmail", color: "#EA4335", image: "/gmail.svg" },
  { name: "Spotify", color: "#1DB954", image: "/spotify.svg" },
  { name: "Twitch", color: "#9146FF", image: "/twitch.svg" },
  { name: "Google Calendar", color: "#4285F4", image: "/calendar.svg" },
  { name: "Youtube", color: "#D00000", image: "/youtube.svg" },
  { name: "Deezer", color: "#00C7F2", image: "/deezer.svg" },
  { name: "OneDrive", color: "#0078D4", image: "/onedrive.svg" },
  { name: "Google Drive", color: "#F5E592", image: "/google-drive.svg" },
  { name: "Outlook", color: "#0078D4", image: "/outlook.svg" },
  { name: "Teams", color: "#6264A7", image: "/teams.svg" },
  { name: "Weather", color: "#00A5E5", image: "/weather.svg" },
  { name: "Google Translate", color: "#374255", image: "/google-translate.svg" },
  { name: "Amazon", color: "#FF9900", image: "/amazon.svg" },
];

export default function WorkflowBuilder() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState("");

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

  const getBlockColor = (type: BlockType) => {
    return type === "if" ? "bg-red-500" : "bg-yellow-500";
  };

  const handleServiceClick = (serviceName: string) => {
    if (selectedBlockIndex !== null) {
      const updatedBlocks = blocks.map((b, i) =>
        i === selectedBlockIndex ? { ...b, service: serviceName, text: serviceName } : b
      );
      setBlocks(updatedBlocks);
      setSelectedBlockIndex(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
          </Link>
          <h1 className="text-4xl font-bold text-center w-full">Create your own Workflow</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold text-center mb-2">How to use</h2>
              <p className="text-center">
                Create your workflow by adding &quotIf&quot and &quotThen&quot blocks. Click the
                &quot+&quot button to add a new block.
              </p>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-8">
          {blocks.map((block, index) => (
            <div key={index} className="relative w-full">
              <Dialog open={selectedBlockIndex === index} onOpenChange={(open) => {
                if (!open) setSelectedBlockIndex(null);
              }}>
                <DialogTrigger asChild>
                  <div
                    className={`flex items-center p-6 rounded-lg text-white ${getBlockColor(
                      block.type
                    )} cursor-pointer hover:opacity-90 transition-opacity w-full`}
                    onClick={() => setSelectedBlockIndex(index)}
                  >
                    <div className="text-3xl font-bold capitalize mr-6">{block.type}</div>
                    {block.icon}
                    <div className="ml-6 text-xl">{block.text}</div>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
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
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white"
                onClick={() => removeBlock(index)}
              >
                <X className="h-4 w-4" />
              </Button>
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
