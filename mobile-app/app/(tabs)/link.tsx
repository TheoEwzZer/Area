import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/hooks/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ServiceCard } from '@/components/ServiceCard';
import { ThemedText } from '@/components/ThemedText';
import { useServices } from '@/services/api/Services';
import { Service } from '@/constants/Types';
import { useAuth } from '@clerk/clerk-expo';

export default function WorkflowsScreen() {
  const { theme } = useTheme();
  const { fetchServices } = useServices();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textColor = Colors[theme].text;
  const backgroundColor = Colors[theme].background;

  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServices();
        setServices(fetchedServices);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={textColor} />
        <Text style={{ color: textColor, marginTop: 10 }}>Chargement des services...</Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
        <ThemedText type="default" style={{ color: textColor }}>Erreur: {error}</ThemedText>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
      <ThemedText type="title" style={[styles.title, { color: textColor }]}>
        Connect your services
      </ThemedText>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          color={service.color}
          name={service.type}
          imageUrl={service.image_url}
          actions={service.actions.map(action => action.name)}
          reactions={service.reactions.map(reaction => reaction.name)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
});