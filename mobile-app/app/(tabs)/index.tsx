import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/hooks/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@clerk/clerk-expo'

const mockServices = [
  {
    name: 'Service1',
    color: '#FF5733',
    actions: [
      { name: 'Action1', serviceType: 'Service1' },
    ],
    reactions: [
      { name: 'Reaction1', serviceType: 'Service1' },
    ],
  },
  {
    name: 'Service2',
    color: '#33FF57',
    actions: [
      { name: 'Action2', serviceType: 'Service2' },
    ],
    reactions: [
      { name: 'Reaction3', serviceType: 'Service2' },
    ],
  },
];


const Header = ({ textColor }: { textColor: string }) => (
  <View style={styles.header}>
    <Text style={[styles.title, { color: textColor }]}>
      Create your own AREA
    </Text>
  </View>
);

export default function WorkflowsScreen() {
  const { theme } = useTheme();
  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(-1);
  const [selectedService, setSelectedService] = useState<null | {
    name: string;
    color: string;
    actions: { name: string; serviceType: string }[];
    reactions: { name: string; serviceType: string }[];
  }>(null);
  
  const [blocks, setBlocks] = useState<
    { type: string; text: string; icon: string; color: string; service?: string }[]
  >([
    { type: 'action', text: 'If This', icon: 'zap', color: '#000' },
    { type: 'reaction', text: 'Then That', icon: 'check', color: '#000' },
  ]);

  const handleAddBlock = (index: React.SetStateAction<number>) => {
    setSelectedBlockIndex(index);
    setShowServiceModal(true);
  };

  const handleServicePress = (serviceName: string) => {
    const service = mockServices.find(s => s.name === serviceName);
    setSelectedService(service);
    setShowServiceModal(false);
    setShowActionModal(true);
  };

  const handleActionPress = (actionName: string) => {
    if (selectedService) {
      const action = selectedService.actions.find(a => a.name === actionName);
      if (action) {
        handleSavePress(action);
      }
    }
  };

  const handleSavePress = (action: { name: any; serviceType: any; }) => {
    if (action && selectedBlockIndex !== -1) {
      const newBlocks = [...blocks];
      const service = mockServices.find(s => s.name === action.serviceType);
      newBlocks[selectedBlockIndex] = {
        ...newBlocks[selectedBlockIndex],
        text: action.name,
        service: action.serviceType,
        color: service ? service.color : '#000',
      };
      setBlocks(newBlocks);
      setShowActionModal(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Header textColor={textColor} />
        <View style={styles.blocksContainer}>
          {blocks.map((block, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                onPress={() => handleAddBlock(index)}
                style={[styles.block, { backgroundColor: block.color }]}
              >
                <Text style={styles.blockText}>{block.text}</Text>
              </TouchableOpacity>
              {index < blocks.length - 1 && (
                <View style={[styles.connector, { backgroundColor: '#ccc' }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showServiceModal} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setShowServiceModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select a Service</Text>
                <ScrollView>
                  {mockServices.map((service, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalItem}
                      onPress={() => handleServicePress(service.name)}
                    >
                      <Text style={styles.modalItemText}>{service.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={showActionModal} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setShowActionModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select an Action</Text>
                <ScrollView>
                  {selectedService?.actions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalItem}
                      onPress={() => handleActionPress(action.name)}
                    >
                      <Text style={styles.modalItemText}>{action.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// Styles Simplifiés
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  blocksContainer: {
    alignItems: 'center',
    width: '100%',
  },
  block: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  blockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connector: {
    width: 2,
    height: 40,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 16,
  },
});