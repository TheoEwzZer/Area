import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ServiceCard } from '@/components/ServiceCard';
import { ThemedText } from '@/components/ThemedText';

// Mockdata for tests
const mockData = [
    {
        color: "#FF4400",
        name: "IFTTT Service",
        oauthLink: "https://ifttt.com/oauth",
        actions: ["Action 1", "Action 2", "Action 3", "Action 4"],
        reactions: ["Réaction 1", "Réaction 2"]
    },
    {
        color: "#00FF44",
        name: "Zapier Service",
        oauthLink: "https://zapier.com/oauth",
        actions: ["Action A", "Action B", "Action C"],
        reactions: ["Réaction X", "Réaction Y"]
    },
    {
        color: "#4400FF",
        name: "Microsoft Flow",
        oauthLink: "https://flow.microsoft.com/oauth",
        actions: ["Action 1", "Action 2"],
        reactions: ["Réaction 1", "Réaction 2", "Réaction 3"]
    }
];

export default function WorkflowsScreen() {
    const { theme } = useTheme();
    const textColor = Colors[theme].text;
    const backgroundColor = Colors[theme].background;

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>
            <ThemedText type="title" style={[styles.title, { color: textColor }]}>
                Connect your services
            </ThemedText>
            {mockData.map((service, index) => (
                <ServiceCard
                    key={index}
                    color={service.color}
                    name={service.name}
                    oauthLink={service.oauthLink}
                    actions={service.actions}
                    reactions={service.reactions}
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