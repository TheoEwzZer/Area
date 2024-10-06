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

const MyAreasPage: () => ReactElement = (): ReactElement => {
  const { theme } = useTheme();
  const backgroundColor: string = Colors[theme].background;
  const textColor: string = Colors[theme].text;

  const [filter, setFilter] = useState("");
  const [areas, setAreas] = useState([
    {
      id: "1",
      title: "Area 1",
      isConnected: false,
      color: "#4169E1",
      description: "This is a description",
    },
    {
      id: "2",
      title: "Area 2",
      isConnected: true,
      color: "#32CD32",
      description: "This is a description",
    },
    {
      id: "3",
      title: "Area 3",
      isConnected: false,
      color: "#FF6347",
      description: "This is a description",
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
    value: boolean
  ): void => {
    setAreas(
      areas.map(
        (area: {
          id: string;
          title: string;
          isConnected: boolean;
          color: string;
          description: string;
        }) => (area.id === id ? { ...area, isConnected: value } : area)
      )
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
    }): boolean => area.title.toLowerCase().includes(filter.toLowerCase())
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
      <Text style={[styles.header, { color: textColor }]}>My Areas</Text>
      <TextInput
        style={[styles.filterInput, { color: textColor, borderColor: textColor }]}
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
          )
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
    fontSize: 24,
    fontWeight: "bold",
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
