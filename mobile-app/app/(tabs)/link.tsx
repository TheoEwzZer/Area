import React, { ReactElement, useEffect, useState } from "react";
import { ScrollView, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useTheme } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { ServiceCard } from "@/components/ServiceCard";
import { ThemedText } from "@/components/ThemedText";
import { useServices } from "@/services/api/Services";
import { Action, Reaction, Service } from "@/constants/Types";

export default function WorkflowsScreen(): ReactElement {
  const { theme } = useTheme();
  const { fetchServices } = useServices();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textColor: string = Colors[theme].text;
  const backgroundColor: string = Colors[theme].background;

  useEffect((): void => {
    const loadServices: () => Promise<void> = async (): Promise<void> => {
      try {
        const fetchedServices: Service[] = await fetchServices();
        setServices(fetchedServices);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
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
        <Text style={{ color: textColor, marginTop: 10 }}>
          Chargement des services...
        </Text>
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
