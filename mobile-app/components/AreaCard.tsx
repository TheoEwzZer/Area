import React, { ReactElement } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { useTheme } from "@/hooks/ThemeContext"; // Import the useTheme hook
import { Colors } from "@/constants/Colors";
import { ThemedText } from "./ThemedText";

const AreaCard = ({
  title,
  description,
  isConnected,
  onToggleConnection,
  color,
}: {
  title: string;
  description: string;
  isConnected: boolean;
  onToggleConnection: () => void;
  color: string;
}): ReactElement => {
  const { theme } = useTheme();
  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;

  return (
    <View style={[styles.card, { borderColor: color, backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={{ color: textColor }}>{title}</ThemedText>
        <Switch
          value={isConnected}
          onValueChange={onToggleConnection}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isConnected ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
      <ThemedText type="default" style={[styles.description, { color: textColor }]} numberOfLines={2} ellipsizeMode="tail">
        {description}
      </ThemedText>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  description: {
    marginBottom: 8,
  },
  colorBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
});

export default AreaCard;