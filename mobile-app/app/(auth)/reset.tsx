import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { ReactElement, useState } from "react";
import { Stack } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { ThemedText } from "@/components/ThemedText";
import Spinner from "react-native-loading-spinner-overlay";

const PwReset = (): ReactElement => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const { signIn, setActive } = useSignIn();
  const [loading, setLoading] = useState(false);

  const onRequestReset = async (): Promise<void> => {
    setLoading(true);
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      alert("Password reset successfully");
      await setActive!({ session: result?.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Stack.Screen options={{ headerBackVisible: !successfulCreation }} />
        <Spinner visible={loading} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/area-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {!successfulCreation ? (
          <View style={styles.formContainer}>
            <TextInput
              autoCapitalize="none"
              placeholder="Email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={styles.inputField}
            />
            <Pressable onPress={onRequestReset} style={styles.button}>
              <ThemedText type="default">Send Reset Email</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <TextInput
              value={code}
              placeholder="Verification Code"
              style={styles.inputField}
              onChangeText={setCode}
            />
            <TextInput
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
            />
            <Pressable onPress={onReset} style={styles.button}>
              <ThemedText type="default">Set New Password</ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    width: '100%',
  },
  inputField: {
    marginVertical: 10,
    height: 50,
    borderWidth: 1,
    borderColor: "#0A0A0A",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginVertical: 15,
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    padding: 15,
    borderRadius: 8,
  },
});

export default PwReset;