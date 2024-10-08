import React, { ReactElement, useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { User } from "@/constants/Types";
import SearchFilterBar from "@/components/SearchFilterBar";

const UserItem: ({
  user,
  textColor,
}: {
  user: User;
  textColor: string;
}) => ReactElement = ({
  user,
  textColor,
}: {
  user: User;
  textColor: string;
}): ReactElement => (
  <View style={styles.userItem}>
    <ThemedText
      type="subtitle"
      style={{ color: textColor, fontWeight: "bold" }}
    >
      {user.firstName} {user.lastName}
    </ThemedText>
    <ThemedText type="default" style={{ color: textColor }}>
      ID: {user.id}
    </ThemedText>
    <ThemedText type="default" style={{ color: textColor }}>
      Email: {user.email}
    </ThemedText>
  </View>
);

const mockUsers: User[] = [
  {
    id: "1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
  },
  {
    id: "2",
    firstName: "Marie",
    lastName: "Martin",
    email: "marie.martin@example.com",
  },
  {
    id: "3",
    firstName: "Pierre",
    lastName: "Bernard",
    email: "pierre.bernard@example.com",
  },
  {
    id: "4",
    firstName: "Sophie",
    lastName: "Petit",
    email: "sophie.petit@example.com",
  },
  {
    id: "5",
    firstName: "Lucas",
    lastName: "Robert",
    email: "lucas.robert@example.com",
  },
];

export default function UserListingScreen(): ReactElement {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const textColor: string = Colors[theme].text;
  const backgroundColor: string = Colors[theme].background;

  useEffect((): void => {
    const loadUsers: () => Promise<void> = async (): Promise<void> => {
      try {
        await new Promise(
          (resolve: (value: unknown) => void): NodeJS.Timeout =>
            setTimeout(resolve, 1000),
        );
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.id} ${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor }]}
      >
        <ThemedText type="default" style={{ color: textColor }}>
          Erreur: {error}
        </ThemedText>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <ThemedText type="title" style={[styles.title, { color: textColor }]}>
        User Listing
      </ThemedText>
      <SearchFilterBar
        data={users.map((user) => `${user.id} ${user.firstName} ${user.lastName} ${user.email}`)}
        onItemPress={(text) => setSearchText(text)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  userItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
  },
});