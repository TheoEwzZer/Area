"use client";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import { ReactNode, useEffect, useState } from "react";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

export type ToasterToast = ToastProps & {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastActionElement;
};

let count: number = 0;

function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = {
  readonly ADD_TOAST: "ADD_TOAST";
  readonly UPDATE_TOAST: "UPDATE_TOAST";
  readonly DISMISS_TOAST: "DISMISS_TOAST";
  readonly REMOVE_TOAST: "REMOVE_TOAST";
};

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue: (toastId: string) => void = (toastId: string): void => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout((): void => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer: (state: State, action: Action) => State = (
  state: State,
  action: Action
): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(
          (t: ToasterToast): ToasterToast =>
            t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast: ToasterToast): void => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map(
          (t: ToasterToast): ToasterToast =>
            t.id === toastId || toastId === undefined
              ? {
                  ...t,
                  open: false,
                }
              : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter(
          (t: ToasterToast): boolean => t.id !== action.toastId
        ),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener: (state: State) => void): void => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast): {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
} {
  const id: string = genId();

  const update: (props: ToasterToast) => void = (props: ToasterToast): void =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss: () => void = (): void =>
    dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean): void => {
        if (!open) {
          dismiss();
        }
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast(): {
  toast: ({ ...props }: Toast) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
  toasts: ToasterToast[];
} {
  const [state, setState] = useState<State>(memoryState);

  useEffect((): (() => void) => {
    listeners.push(setState);
    return (): void => {
      const index: number = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string): void =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { toast, useToast };
