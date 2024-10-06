import React, { ReactElement, useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";

type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
};

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
      {user.firstname} {user.lastname}
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
    id: 1,
    firstname: "Jean",
    lastname: "Dupont",
    email: "jean.dupont@example.com",
  },
  {
    id: 2,
    firstname: "Marie",
    lastname: "Martin",
    email: "marie.martin@example.com",
  },
  {
    id: 3,
    firstname: "Pierre",
    lastname: "Bernard",
    email: "pierre.bernard@example.com",
  },
  {
    id: 4,
    firstname: "Sophie",
    lastname: "Petit",
    email: "sophie.petit@example.com",
  },
  {
    id: 5,
    firstname: "Lucas",
    lastname: "Robert",
    email: "lucas.robert@example.com",
  },
];

export default function UserListingScreen(): ReactElement {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color={textColor} />
        <ThemedText type="default" style={{ color: textColor, marginTop: 10 }}>
          Chargement des utilisateurs...
        </ThemedText>
      </ScrollView>
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
        Liste des utilisateurs
      </ThemedText>
      {users.map(
        (user: User): ReactElement => (
          <UserItem key={user.id} user={user} textColor={textColor} />
        ),
      )}
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
