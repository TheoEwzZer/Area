import React, { useState, useEffect, ReactElement } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  View,
} from "react-native";
import AreaCard from "@/components/AreaCard";
import { useTheme } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";

const MyAreasPage: () => ReactElement = (): ReactElement => {
  const { theme } = useTheme();
  const backgroundColor: string = Colors[theme].background;
  const textColor: string = Colors[theme].text;

  const [filter, setFilter] = useState("");
  const [areas, setAreas] = useState([
    {
      id: "1",
      title: "Github -> Discord",
      isConnected: false,
      color: "#4169E1",
      description: "When a Pull request is opened, send a message to Discord",
    },
    {
      id: "2",
      title: "Github -> Discord",
      isConnected: true,
      color: "#32CD32",
      description: "When a Pull request is closed, send a message to Discord",
    },
    {
      id: "3",
      title: "Discord -> Github",
      isConnected: false,
      color: "#FF6347",
      description: "When a message is sent, create an issue on Github",
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect((): (() => void) => {
    const timer: NodeJS.Timeout = setTimeout((): void => {
      setLoading(false);
    }, 2000);

    return (): void => clearTimeout(timer);
  }, []);

  const handleToggleConnection: (id: string, value: boolean) => void = (
    id: string,
    value: boolean,
  ): void => {
    setAreas(
      areas.map(
        (area: {
          id: string;
          title: string;
          isConnected: boolean;
          color: string;
          description: string;
        }) => (area.id === id ? { ...area, isConnected: value } : area),
      ),
    );
  };

  const filteredAreas: {
    id: string;
    title: string;
    isConnected: boolean;
    color: string;
    description: string;
  }[] = areas.filter(
    (area: {
      id: string;
      title: string;
      isConnected: boolean;
      color: string;
      description: string;
    }): boolean => area.title.toLowerCase().includes(filter.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedText type="subtitle" style={[styles.header, { color: textColor }]}>My Areas</ThemedText>
      <TextInput
        style={[
          styles.filterInput,
          { color: textColor, borderColor: textColor },
        ]}
        placeholder="Filter"
        placeholderTextColor={textColor}
        value={filter}
        onChangeText={setFilter}
      />
      <ScrollView>
        {filteredAreas.map(
          (area: {
            id: string;
            title: string;
            isConnected: boolean;
            color: string;
            description: string;
          }): ReactElement => (
            <AreaCard
              key={area.id}
              title={area.title}
              description={area.description}
              isConnected={area.isConnected}
              onToggleConnection={(): void =>
                handleToggleConnection(area.id, !area.isConnected)
              }
              color={area.color}
            />
          ),
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    margin: 16,
  },
  filterInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    margin: 16,
  },
});

export default MyAreasPage;
