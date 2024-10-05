import { View, StyleSheet, TextInput, Pressable, Text, GestureResponderEvent } from 'react-native';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';

const PwReset = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const { signIn, setActive } = useSignIn();

  const onRequestReset = async () => {
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  const onReset = async () => {
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      alert('Password reset successfully');

      await setActive!({ session: result?.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  function onPressVerify(event: GestureResponderEvent): void {
    if (!successfulCreation) {
      onRequestReset();
    } else {
      onReset();
    }
  }  

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerBackVisible: !successfulCreation }} />

      {!successfulCreation && (
        <>
          <TextInput autoCapitalize="none" placeholder="email@email.com" value={emailAddress} onChangeText={setEmailAddress} style={styles.inputField} />

          <Pressable onPress={onPressVerify} style={styles.button}>
            <Text style={styles.buttonText}>Send Reset Email</Text>
          </Pressable>
        </>
      )}

      {successfulCreation && (
        <>
          <View>
            <TextInput value={code} placeholder="Code..." style={styles.inputField} onChangeText={setCode} />
            <TextInput placeholder="New password" value={password} onChangeText={setPassword} secureTextEntry style={styles.inputField} />
          </View>
          <Pressable onPress={onPressVerify} style={styles.button}>
            <Text style={styles.buttonText}>Set New Password</Text>
          </Pressable>
        </>
      )}
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
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 4,
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PwReset;