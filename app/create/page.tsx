"use client";

import React, { useState } from "react";
import { Plus, ChevronDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Action {
  id: number
  service: string
  action: string
}

interface ModalState {
  isOpen: boolean
  type: "trigger" | "action"
  id: number | null
  isService: boolean
}

const services = {
  trigger: ["Weather", "Time", "Location", "YouTube"],
  action: ["Notification", "Email", "Smart Home", "SMS"]
};

const actions = {
  trigger: ["Rain forecast", "Sunset", "Enter area", "New liked video"],
  action: ["Send notification", "Send email", "Turn on lights", "Send an SMS"]
};

function AppletCreator() {
  const [trigger, setTrigger] = useState({ service: "", action: "" });
  const [actionList, setActionList] = useState<Action[]>([]);
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: "trigger", id: null, isService: true });

  const addAction = () => {
    setActionList([...actionList, { id: Date.now(), service: "", action: "" }]);
  };

  const openModal = (type: "trigger" | "action", id: number | null, isService: boolean) => {
    setModalState({ isOpen: true, type, id, isService });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const selectOption = (option: string) => {
    const { type, id, isService } = modalState;
    if (type === "trigger") {
      setTrigger(prev => ({ ...prev, [isService ? "service" : "action"]: option }));
    } else {
      setActionList(prev => prev.map(item => 
        item.id === id ? { ...item, [isService ? "service" : "action"]: option } : item
      ));
    }
    closeModal();
  };

  const removeAction = (id: number) => {
    setActionList(actionList.filter(action => action.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card className="bg-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold mr-2">If</span>
                {trigger.service && (
                  <>
                    <span className="text-xl">{trigger.service}</span>
                    <span className="text-xl ml-2">{trigger.action}</span>
                  </>
                )}
              </div>
              {trigger.service && (
                <div>
                  <Button variant="ghost" size="sm" className="text-white" onClick={() => openModal("trigger", null, true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white" onClick={() => setTrigger({ service: "", action: "" })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {!trigger.service && (
              <Button 
                onClick={() => openModal("trigger", null, true)} 
                variant="ghost" 
                className="w-full mt-2 bg-red-600 hover:bg-red-700"
              >
                Add trigger
              </Button>
            )}
          </CardContent>
        </Card>

        {actionList.map((action, index) => (
          <React.Fragment key={action.id}>
            <div className="flex justify-center">
              <ChevronDown className="h-8 w-8 text-gray-500" />
            </div>
            <Card className="bg-green-500 text-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold mr-2">{index === 0 ? "Then" : "And"}</span>
                    {action.service && (
                      <>
                        <span className="text-xl">{action.service}</span>
                        <span className="text-xl ml-2">{action.action}</span>
                      </>
                    )}
                  </div>
                  {action.service && (
                    <div>
                      <Button variant="ghost" size="sm" className="text-white" onClick={() => openModal("action", action.id, true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white" onClick={() => removeAction(action.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {!action.service && (
                  <Button 
                    onClick={() => openModal("action", action.id, true)} 
                    variant="ghost" 
                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                  >
                    Add action
                  </Button>
                )}
              </CardContent>
            </Card>
          </React.Fragment>
        ))}

        {(trigger.service || actionList.length > 0) && (
          <div className="flex justify-center">
            <Button onClick={addAction} variant="outline" size="icon" className="rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Select {modalState.isService ? "Service" : "Action"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {(modalState.isService ? services[modalState.type] : actions[modalState.type]).map((option) => (
                <Button key={option} onClick={() => selectOption(option)} variant="outline">
                  {option}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AppletCreator;