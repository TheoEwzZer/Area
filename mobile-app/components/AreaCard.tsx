import React, { ReactElement } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

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
  return (
    <View style={[styles.card, { borderColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Switch
          value={isConnected}
          onValueChange={onToggleConnection}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isConnected ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
        {description}
      </Text>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  colorBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
});

export default AreaCard;
