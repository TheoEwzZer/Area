"use client";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactElement, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";

interface Parameter {
  name: string;
  label: string;
  type: string;
  options?: { value: string; label: string }[];
}

interface ParameterFormProps {
  parameters: Parameter[];
  onSubmit: (values: Record<string, string>) => void;
}

export default function ParameterForm({
  parameters,
  onSubmit,
}: ParameterFormProps): ReactElement {
  const [channels, setChannels] = useState<{ value: string; label: string }[]>(
    []
  );

  const form: UseFormReturn<Record<string, string>, any, undefined> = useForm({
    defaultValues: parameters.reduce(
      (acc: Record<string, string>, param: Parameter) => {
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {parameters.map(
          (param: Parameter): ReactElement => (
            <FormField
              key={param.name}
              name={param.name}
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
                  {param.type === "select" ? (
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={(value: string): void => {
                          field.onChange(value);
                          if (param.name === "guild") {
                            handleGuildChange(value);
                          }
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {(param.name === "channel"
                            ? channels
                            : param.options
                          )?.map(
                            (option: {
                              value: string;
                              label: string;
                            }): ReactElement => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
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
