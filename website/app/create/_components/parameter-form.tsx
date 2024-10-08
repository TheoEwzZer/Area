"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Option } from "@/types/globals";
import { Check, ChevronsUpDown } from "lucide-react";
import { ReactElement, useCallback, useState } from "react";
import { ControllerRenderProps, useForm, UseFormReturn } from "react-hook-form";

interface Parameter {
  name: string;
  label: string;
  type: string;
  options?: Option[];
}

interface ParameterFormProps {
  parameters: Parameter[];
  onSubmit: (values: Record<string, string>) => void;
}

export default function ParameterForm({
  parameters,
  onSubmit,
}: Readonly<ParameterFormProps>): ReactElement {
  const [channels, setChannels] = useState<Option[]>([]);

  const form: UseFormReturn<Record<string, string>, any, undefined> = useForm({
    defaultValues: parameters.reduce(
      (
        acc: Record<string, string>,
        param: Parameter
      ): Record<string, string> => {
        acc[param.name] = "";
        return acc;
      },
      {} as Record<string, string>
    ),
  });

  const handleGuildChange: (guildId: string) => Promise<void> = async (
    guildId: string
  ): Promise<void> => {
    try {
      const response: Response = await fetch(
        `/api/action-parameters?guildId=${guildId}`
      );
      const data = await response.json();
      setChannels(data);
      form.setValue("channel", "");
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const handleSelect: (paramName: string, optionValue: string) => void = (
    paramName: string,
    optionValue: string
  ): void => {
    form.setValue(paramName, optionValue);
    if (paramName === "guild") {
      handleGuildChange(optionValue);
    }
  };

  const getOptions: (param: Parameter) => Option[] = useCallback(
    (param: Parameter): Option[] => {
      if (param.name === "channel") {
        return channels;
      }
      return param.options || [];
    },
    [channels]
  );

  const renderCommandItem: (
    param: Parameter,
    option: Option,
    field: ControllerRenderProps<Record<string, string>, string>
  ) => ReactElement = (
    param: Parameter,
    option: Option,
    field: ControllerRenderProps<Record<string, string>, string>
  ): ReactElement => (
    <CommandItem
      value={option.label}
      key={option.value}
      onSelect={(): void => handleSelect(param.name, option.value)}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          option.value === field.value ? "opacity-100" : "opacity-0"
        )}
      />
      {option.label}
    </CommandItem>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {parameters.map(
          (param: Parameter): ReactElement => (
            <FormField
              key={param.name}
              name={param.name}
              control={form.control}
              render={({
                field,
              }: {
                field: ControllerRenderProps<Record<string, string>, string>;
              }): ReactElement => (
                <FormItem className="space-y-1">
                  <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
                  {param.type === "select" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? (getOptions(param).find(
                                  (option: Option): boolean =>
                                    option.value === field.value
                                )?.label ?? "Select an option")
                              : "Select an option"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="min-w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search option..." />
                          <CommandList>
                            <CommandEmpty>No option found</CommandEmpty>
                            <CommandGroup>
                              {getOptions(param).map(
                                (option: Option): ReactElement =>
                                  renderCommandItem(param, option, field)
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <FormControl>
                      <Input
                        type={param.type}
                        id={param.name}
                        {...field}
                        required
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        )}
        <Button
          type="submit"
          className="mt-4 w-full"
        >
          Set Parameters
        </Button>
      </form>
    </Form>
  );
}
