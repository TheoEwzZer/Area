import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Dimensions, ScrollView } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.8;
const maxContentHeight = 200;

export const ServiceCard = ({ color, name, oauthLink, actions, reactions }: { color: string, name: string, oauthLink: string, actions: string[], reactions: string[] }) => {
  const handleOAuthPress = () => {
    Linking.openURL(oauthLink);
  };

  const renderList = (items: string[], title: string) => (
    <View style={styles.listContainer}>
      <Text style={styles.columnTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.listItemContainer}>
          <View style={styles.bullet} />
          <Text style={styles.listItem}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{name}</Text>
        </View>

        {/* ScrollView for actions and reactions */}
        <ScrollView style={styles.scrollContent} nestedScrollEnabled={true}>
          {/* Actions List */}
          {renderList(actions, 'Actions')}

          {/* Reactions List */}
          {renderList(reactions, 'Réactions')}
        </ScrollView>

        {/* OAuth button at the bottom */}
        <View style={styles.oauthContainer}>
          <TouchableOpacity style={styles.oauthButton} onPress={handleOAuthPress}>
            <Text style={[styles.oauthButtonText, { color }]}>Connecter avec OAuth</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  card: {
    width: cardWidth,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    maxHeight: maxContentHeight, // Limite de hauteur avec scroll si nécessaire
    paddingHorizontal: 16,
  },
  listContainer: {
    marginBottom: 16, // Espacement entre les listes
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 10, // Décalage vers la droite
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginRight: 6,
  },
  listItem: {
    fontSize: 12,
    color: 'white',
    flex: 1,
  },
  oauthContainer: {
    padding: 16,
  },
  oauthButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  oauthButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
