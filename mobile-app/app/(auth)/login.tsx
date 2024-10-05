import { useSignIn, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Text } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const handleError = (error: any) => {
  const errorMessage = error.errors?.[0]?.message || 'An error occurred';
  alert(errorMessage);
};

const Login: React.FC = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
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
    <View style={styles.container}>
      <Spinner visible={loading} />
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
      <Pressable onPress={onSignInPress} style={styles.buttonLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Link href="/reset" asChild>
        <Pressable style={styles.button}>
          <Text>Forgot password?</Text>
        </Pressable>
      </Link>
      <Link href="/register" asChild>
        <Pressable style={styles.button}>
          <Text>Create Account</Text>
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: '#0A0A0A',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  button: {
    margin: 8,
    alignItems: 'center',
  },
  buttonLogin: {
    marginVertical: 4,
    backgroundColor: '#0A0A0A',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Login;