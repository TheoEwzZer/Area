import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, ReactElement, useState } from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import React = require("react");

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const theme: "light" | "dark" = useColorScheme() ?? "light";

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value: boolean): boolean => !value)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isOpen ? "chevron-down" : "chevron-forward-outline"}
          size={18}
          color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
