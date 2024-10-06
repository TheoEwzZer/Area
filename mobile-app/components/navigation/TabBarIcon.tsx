import Ionicons from "@expo/vector-icons/Ionicons";
import { type IconProps } from "@expo/vector-icons/build/createIconSet";
import { ReactElement, type ComponentProps } from "react";
import React from "react";

export function TabBarIcon({
  style,
  ...rest
}: Readonly<IconProps<ComponentProps<typeof Ionicons>["name"]>>): ReactElement {
  return <Ionicons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}
