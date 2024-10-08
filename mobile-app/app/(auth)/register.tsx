import { Pressable, TextInput, View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import Spinner from "react-native-loading-spinner-overlay";
import { ReactElement, useState } from "react";
import { Stack } from "expo-router";
import React from "react";
import { ThemedText } from "@/components/ThemedText";

const Register = (): ReactElement => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async (): Promise<void> => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async (): Promise<void> => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setActive({ session: completeSignUp.createdSessionId });
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
        <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
        <Spinner visible={loading} />
        
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/area-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {!pendingVerification ? (
          <View style={styles.formContainer}>
            <TextInput
              autoCapitalize="none"
              placeholder="Email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={styles.inputField}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
            />
            <Pressable onPress={onSignUpPress} style={styles.button}>
              <ThemedText type="default">Sign up</ThemedText>
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
            <Pressable onPress={onPressVerify} style={styles.button}>
              <ThemedText type="default">Verify Email</ThemedText>
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

export default Register;