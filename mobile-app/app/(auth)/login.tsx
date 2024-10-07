import { ThemedText } from "@/components/ThemedText";
import { useSignIn } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import React, { ReactElement, useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";

const handleError = (error: any): void => {
  const errorMessage = error.errors?.[0]?.message || "An error occurred";
  alert(errorMessage);
};

const Login = (): ReactElement => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = async (): Promise<void> => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      handleError(err);
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
        <Spinner visible={loading} />
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/area-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
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
          <Pressable onPress={onSignInPress} style={styles.buttonLogin}>
            <ThemedText type="default">Login</ThemedText>
          </Pressable>
        </View>
        <View style={styles.linksContainer}>
          <Link href="/reset" asChild>
            <Pressable style={styles.button}>
              <ThemedText type="default" style={styles.buttonText}>
                Forgot password?
              </ThemedText>
            </Pressable>
          </Link>
          <Link href="/register" asChild>
            <Pressable style={styles.button}>
              <ThemedText type="default" style={styles.buttonText}>
                Create Account
              </ThemedText>
            </Pressable>
          </Link>
        </View>
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
    marginBottom: 20,
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
  buttonLogin: {
    marginTop: 20,
    backgroundColor: "gray",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  linksContainer: {
    marginTop: 20,
  },
  button: {
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "black",
  },
});

export default Login;