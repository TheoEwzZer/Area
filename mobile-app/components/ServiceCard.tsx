import React, { ReactElement } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";

const screenWidth: number = Dimensions.get("window").width;
const cardWidth: number = screenWidth * 0.8;
const maxContentHeight = 200;

interface ServiceCardProps {
  color: string;
  name: string;
  imageUrl: string;
  actions: string[];
  reactions: string[];
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  color,
  name,
  imageUrl,
  actions,
  reactions,
}) => {
  const handleConnectPress: () => void = (): void => {
    console.log(`Connecting to ${name}`);
  };

  const renderList: (
    items: string[],
    title: string,
    emptyMessage: string
  ) => ReactElement = (items: string[], title: string, emptyMessage: string) => (
    <View style={styles.listContainer}>
      <Text style={styles.columnTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      ) : (
        items.map(
          (item: string, index: number): ReactElement => (
            <View key={index} style={styles.listItemContainer}>
              <View style={styles.bullet} />
              <Text style={styles.listItem}>{item}</Text>
            </View>
          )
        )
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <View style={styles.header}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <Text style={styles.headerText}>{name}</Text>
        </View>
        <ScrollView style={styles.scrollContent} nestedScrollEnabled={true}>
          {renderList(
            actions,
            actions.length === 1 ? "Action" : "Actions",
            "Aucune action"
          )}
          {renderList(
            reactions,
            reactions.length === 1 ? "Reaction" : "Reactions",
            "Aucune reaction"
          )}
        </ScrollView>
        <View style={styles.connectContainer}>
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectPress}>
            <Text style={[styles.connectButtonText, { color }]}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  card: {
    width: cardWidth,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  scrollContent: {
    maxHeight: maxContentHeight,
    paddingHorizontal: 16,
  },
  listContainer: {
    marginBottom: 16,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingLeft: 10,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "white",
    marginRight: 6,
  },
  listItem: {
    fontSize: 12,
    color: "white",
    flex: 1,
  },
  emptyMessage: {
    fontSize: 12,
    color: "white",
    fontStyle: "italic",
  },
  connectContainer: {
    padding: 16,
  },
  connectButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  connectButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
