import { Pressable, Text, TextInput, View, StyleSheet } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import Spinner from "react-native-loading-spinner-overlay";
import { ReactElement, useState } from "react";
import { Stack } from "expo-router";
import React from "react";

const Register: () => ReactElement = (): ReactElement => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress: () => Promise<void> = async (): Promise<void> => {
    if (!isLoaded) {
      return;
    }
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

  const onPressVerify: () => Promise<void> = async (): Promise<void> => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      const completeSignUp: any = await signUp.attemptEmailAddressVerification({
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
      <Spinner visible={loading} />

      {!pendingVerification && (
        <>
          <TextInput
            autoCapitalize="none"
            placeholder="email@email.com"
            value={emailAddress}
            onChangeText={setEmailAddress}
            style={styles.inputField}
          />
          <TextInput
            placeholder="password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.inputField}
          />

          <Pressable onPress={onSignUpPress} style={styles.button}>
            <Text style={styles.buttonText}>Sign up</Text>
          </Pressable>
        </>
      )}

      {pendingVerification && (
        <>
          <View>
            <TextInput
              value={code}
              placeholder="Code..."
              style={styles.inputField}
              onChangeText={setCode}
            />
          </View>
          <Pressable onPress={onPressVerify} style={styles.button}>
            <Text style={styles.buttonText}>Verify Email</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: "#0A0A0A",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginVertical: 4,
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Register;
