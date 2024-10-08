import React, { useState, useEffect, useCallback, ReactElement } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";

interface SearchFilterBarProps {
  data: string[];
  onItemPress: (item: string) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  data,
  onItemPress,
}) => {
  const { theme } = useTheme();
  const textColor = Colors[theme].text;
  const backgroundColor = Colors[theme].background;

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const handleFilter: () => void = useCallback((): void => {
    const filtered = data.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredData(filtered);
  }, [data, searchQuery]);

  useEffect((): void => {
    handleFilter();
  }, [searchQuery, data, handleFilter]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TextInput
        style={[styles.input, { color: textColor, borderColor: textColor }]}
        placeholder="Rechercher..."
        placeholderTextColor={textColor}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View>
        {filteredData.length > 0 ? (
          filteredData.map(
            (item, index: number): ReactElement => (
              <TouchableOpacity
                key={index}
                style={styles.item}
                onPress={() => onItemPress(item)}
              >
                <ThemedText type="default" style={{ color: textColor }}>
                  {item}
                </ThemedText>
              </TouchableOpacity>
            ),
          )
        ) : (
          <ThemedText type="default" style={[styles.errorText, { color: textColor }]}>
            Aucun résultat
          </ThemedText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  input: {
    height: 40,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  item: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  errorText: {
    padding: 10,
    fontSize: 16,
    textAlign: "center",
  },
});

export default SearchFilterBar;