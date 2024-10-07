import React, { ReactElement, useEffect, useState } from "react";
import { ScrollView, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useTheme } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ServiceCard } from "@/components/ServiceCard";
import { ThemedText } from "@/components/ThemedText";
import { useServices } from "@/services/api/Services";
import { useUsers } from "@/services/api/Users";
import { Action, Reaction, Service } from "@/constants/Types";
import { useAuth } from "@clerk/clerk-expo";

export default function WorkflowsScreen(): ReactElement {
  const { theme } = useTheme();
  const { fetchServices } = useServices();
  const { fetchUserServices } = useUsers();
  const [services, setServices] = useState<Service[]>([]);
  const [userServicesNames, setUserServicesNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const textColor: string = Colors[theme].text;
  const backgroundColor: string = Colors[theme].background;

  useEffect((): void => {
    const loadServices: () => Promise<void> = async (): Promise<void> => {
      try {
        const fetchedServices: Service[] = await fetchServices();
        const fetchedUserServices: { services: { service: string }[] } = await fetchUserServices(userId!);
        
        if (!Array.isArray(fetchedUserServices.services)) {
          throw new Error("Invalid data format for user services");
        }

        const userServicesNames: string[] = fetchedUserServices.services.map(
          (service) => service.service
        );

        setServices(fetchedServices);
        setUserServicesNames(userServicesNames);
        setLoading(false);
      } catch (err) {
        console.error("Error loading services:", err);
        setError(
          err instanceof Error ? err.message : "An error occurred",
        );
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return (
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor }]}
      >
        <ActivityIndicator size="large" color={textColor} />
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
        Connect your services
      </ThemedText>
      {services.map(
        (service: Service): ReactElement => (
          <ServiceCard
            key={service.id}
            color={service.color}
            name={service.type}
            imageUrl={service.image_url}
            actions={service.actions.map(
              (action: Action): string => action.name,
            )}
            reactions={service.reactions.map(
              (reaction: Reaction): string => reaction.name,
            )}
            isConnected={userServicesNames.includes(service.type)}
          />
        ),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
});