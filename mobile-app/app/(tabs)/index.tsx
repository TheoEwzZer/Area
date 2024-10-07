import React, { useState, useEffect, ReactElement } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { useTheme } from "@/hooks/ThemeContext";
import { Colors } from "@/constants/Colors";
import { useUsers } from "@/services/api/Users";
import { Service } from "@/constants/Types";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

const Header: ({ textColor }: { textColor: string }) => ReactElement = ({
  textColor,
}: {
  textColor: string;
}): ReactElement => (
  <View style={styles.header}>
    <ThemedText type="subtitle" style={{ color: textColor }}>
      Create your own AREA
    </ThemedText>
  </View>
);

export default function WorkflowsScreen(): ReactElement {
  const { theme } = useTheme();
  const backgroundColor: string = Colors[theme].background;
  const textColor: string = Colors[theme].text;

  const { fetchUserServices } = useUsers();
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(-1);
  const [blocks, setBlocks] = useState([
    { type: "action", text: "If This", icon: "zap", color: "#000" },
    { type: "reaction", text: "Then That", icon: "check", color: "#000" },
  ]);
  const { userId } = useAuth();
  const [servicesLoaded, setServicesLoaded] = useState(false);

  useEffect((): void => {
    const loadUserServices = async (): Promise<void> => {
      if (!userId || servicesLoaded) {
        return;
      }
      try {
        const response = await fetchUserServices(userId);
        const fetchedServices = response.services || [];
        setUserServices(fetchedServices);
        setServicesLoaded(true);
      } catch (err) {
        console.error("Failed to fetch user services:", err);
      }
    };

    loadUserServices();
  }, [fetchUserServices, userId, servicesLoaded]);

  const handleAddBlock: (index: number) => void = (index: number): void => {
    setSelectedBlockIndex(index);
    setShowServiceModal(true);
  };

  const handleSelectService: (service: Service) => void = (service: Service): void => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block, index) =>
        index === selectedBlockIndex ? { ...block, text: String(service.service) } : block
      )
    );
    setShowServiceModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Header textColor={textColor} />
        <View style={styles.blocksContainer}>
          {blocks.map(
            (
              block: {
                type: string;
                text: string;
                icon: string;
                color: string;
              },
              index: number,
            ): ReactElement => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  onPress={(): void => handleAddBlock(index)}
                  style={[styles.block, { backgroundColor: block.color }]}
                >
                  <ThemedText>{block.text}</ThemedText>
                </TouchableOpacity>
                {index < blocks.length - 1 && (
                  <View
                    style={[styles.connector, { backgroundColor: "#ccc" }]}
                  />
                )}
              </React.Fragment>
            ),
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showServiceModal}
        animationType="slide"
        transparent={true}
      >
        <TouchableWithoutFeedback onPress={() => setShowServiceModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>
                  {userServices.length === 0
                    ? "No services linked yet"
                    : "Select a Service"}
                </ThemedText>
                {userServices.length === 0 && (
                  <Pressable
                    onPress={() => {
                      setShowServiceModal(false);
                      router.push("/link");
                    }}
                  >
                    <ThemedText style={styles.linkText}>
                      Click here to go to the link page
                    </ThemedText>
                  </Pressable>
                )}
                {userServices.length > 0 && (
                  <ScrollView>
                    {userServices.map((service: Service, index: number) => (
                      <View key={index} style={styles.modalItem}>
                        <Pressable
                          onPress={() => handleSelectService(service)}
                          style={styles.serviceButton}
                        >
                          <ThemedText style={styles.serviceButtonText}>
                            {service.service}
                          </ThemedText>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
  },
  header: {
    padding: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  blocksContainer: {
    alignItems: "center",
    width: "100%",
  },
  block: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  blockText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  connector: {
    width: 2,
    height: 40,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#000",
  },
  modalItem: {
    padding: 10,
  },
  serviceButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    alignItems: "center",
  },
  serviceButtonText: {
    fontSize: 16,
    color: "#000",
  },
  linkText: {
    color: "blue",
    textAlign: "center",
    marginTop: 10,
  },
});