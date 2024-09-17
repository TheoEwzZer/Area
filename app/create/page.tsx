"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, X, HelpCircle, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type BlockType = "if" | "then"

interface Block {
  type: BlockType
  text: string
  icon: React.ReactNode
}

const initialBlocks: Block[] = [
  { type: "if", text: "Choose a trigger", icon: <Zap className="h-6 w-6" /> },
  { type: "then", text: "Choose an action", icon: <Check className="h-6 w-6" /> },
];

export default function WorkflowBuilder() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = { 
      type, 
      text: type === "if" ? "Choose a trigger" : "Choose an action", 
      icon: type === "if" ? <Zap className="h-6 w-6" /> : <Check className="h-6 w-6" />
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const getBlockColor = (type: BlockType) => {
    return type === "if" ? "bg-red-500" : "bg-yellow-500";
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/">
        </Link>
        <h1 className="text-4xl font-bold">Create your own Workflow</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">How to use</h2>
            <p>Create your workflow by adding &quotIf&quot and &quotThen&quot blocks. Click the &quot+&quot button to add a new block.</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-8">
        {blocks.map((block, index) => (
          <div key={index} className="relative">
            {/* Mise à jour du lien pour pointer vers la page dans le dossier "selection" */}
            <Link href={`/selection?type=${block.type}`}>
              <div className={`flex items-center p-6 rounded-lg text-white ${getBlockColor(block.type)} cursor-pointer hover:opacity-90 transition-opacity`}>
                <div className="text-3xl font-bold capitalize mr-6">{block.type}</div>
                {block.icon}
                <div className="ml-6 text-xl">{block.text}</div>
              </div>
            </Link>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="rounded-full">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Choose block type</h2>
            <div className="flex justify-around">
              <Button onClick={() => addBlock("if")} className="bg-red-500 hover:bg-red-600">
                Add If
              </Button>
              <Button onClick={() => addBlock("then")} className="bg-yellow-500 hover:bg-yellow-600">
                Add Then
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-12">
        <Button className="w-full bg-black text-white hover:bg-gray-800 text-lg py-6">
          Save
        </Button>
      </div>
    </div>
  );
}
