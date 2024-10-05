import React, { useState } from 'react';
import { Text, StyleSheet, TextInput, ScrollView, SafeAreaView } from 'react-native';
import AreaCard from '@/components/AreaCard';
import { useTheme } from '@/hooks/ThemeContext';
import { Colors } from '@/constants/Colors';

const MyAreasPage: React.FC = () => {
  const { theme } = useTheme();
  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;

  const [filter, setFilter] = useState('');
  const [areas, setAreas] = useState([
    { id: '1', title: 'Area 1', isConnected: false, color: '#4169E1', description: 'This is a description' },
    { id: '2', title: 'Area 2', isConnected: true, color: '#32CD32', description: 'This is a description' },
    { id: '3', title: 'Area 3', isConnected: false, color: '#FF6347', description: 'This is a description' },
    // Add more areas as needed
  ]);

  const handleToggleConnection = (id: string, value: boolean) => {
    setAreas(areas.map(area => 
      area.id === id ? { ...area, isConnected: value } : area
    ));
  };

  const filteredAreas = areas.filter(area => 
    area.title.toLowerCase().includes(filter.toLowerCase())
  );

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
        {filteredAreas.map(area => (
          <AreaCard
            key={area.id}
            title={area.title}
            description={area.description}
            isConnected={area.isConnected}
            onToggleConnection={() => handleToggleConnection(area.id, !area.isConnected)}
            color={area.color}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
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