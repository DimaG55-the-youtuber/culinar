import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // For the button
  View
} from 'react-native';

const WEB_CLIENT_ID = "618274131041-883rgkdj9t2lqt1bpk691dhe70ii1men.apps.googleusercontent.com"
const ANDROID_CLIENT_ID = "618274131041-uv8fdtkhd94vosgmbtussjvqb6t7so1c.apps.googleusercontent.com"

WebBrowser.maybeCompleteAuthSession();

export function Apps() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure Google Sign-In using Expo's hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'], // Request user's profile and email
  });

  useEffect(() => {
    // Check for stored user info on app start
    const checkStoredUser = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('user_info');
        if (jsonValue != null) {
          setUserInfo(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error('Failed to load user info from storage:', e);
      }
    };
    checkStoredUser();
  }, []);

  useEffect(() => {
    // Handle the authentication response from Google
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      } else {
        console.log('Authentication successful but no access token received.');
      }
    } else if (response?.type === 'cancel') {
      console.log('Sign-in cancelled by user.');
    } else if (response?.type === 'error') {
      console.log(`Sign-in error: ${response.error?.message || 'Unknown error'}`);
      console.error('Google Auth Error:', response.error);
    }
  }, [response]);

  // Fetches user information from Google using the access token
  const fetchUserInfo = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await userInfoResponse.json();
      if (userInfoResponse.ok) {
        setUserInfo(user);
        // Store user info for persistence
        await AsyncStorage.setItem('user_info', JSON.stringify(user));
      } else {
        console.log(`Failed to fetch user info: ${user.error?.message || 'Unknown error'}`);
        console.error('User Info Fetch Error:', user);
      }
    } catch (e) {
      console.error('Error fetching user info:', e);
      console.log('Network error or failed to fetch user info.');
    } finally {
      setLoading(false);
    }
  };

  // Handles the sign-in process
  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prompt the user to sign in using the configured Google OAuth flow
      const result = await promptAsync();
      // Response is handled in the useEffect hook
    } catch (e) {
      console.error('Error prompting for sign-in:', e);
      console.log('Failed to initiate sign-in process.');
    } finally {
      setLoading(false);
    }
  };

  // Handles the sign-out process
  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      setUserInfo(null);
      await AsyncStorage.removeItem('user_info'); // Clear stored user info
      Alert.alert('Signed Out', 'You have been successfully signed out.');
    } catch (e) {
      console.error('Error signing out:', e);
      console.log('Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo Google Sign-In</Text>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {userInfo ? (
        // User is signed in
        <View style={styles.userInfoContainer}>
          <Text style={styles.signedInText}>You are signed in as:</Text>
          {userInfo.picture && (
            <Image
              source={{ uri: userInfo.picture }}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} disabled={loading}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // User is not signed in
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          disabled={!request || loading} // Disable if request not ready or loading
        >
          <Text style={styles.buttonText}>Sign In with Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


const LoginForm: React.FC = () => {
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");

  const passwordInputRef = useRef<TextInput>(null);

  // Function to handle form submission
  const handleSubmit = () => {
    // Dismiss the keyboard when the form is submitted
    Keyboard.dismiss();

    // Basic validation (you'd do more robust validation in a real app)
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
  }}
  return (
    <View>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholder="Username"
        onChangeText={newText => setName(newText)}
        defaultValue={username}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => {
          passwordInputRef.current?.focus();
        }}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
        }}
        secureTextEntry={true}
        placeholder="Password"
        onChangeText={newText => setPassword(newText)}
        defaultValue={password}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        ref={passwordInputRef}
      />
      <View style={{
        borderBottomColor: 'black',
        borderBottomWidth: 1, // or a specific number like 1
        marginVertical: 10, // Add some vertical spacing if needed
      }}>
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8', // A slightly softer background
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#2c3e50',
  },
  input: {
    height: 50,
    borderColor: '#b0c4de', // A softer border color
    borderWidth: 1,
    borderRadius: 10,
    width: '90%',
    paddingHorizontal: 15,
    fontSize: 17,
    backgroundColor: '#ffffff',
    marginBottom: 15, // Space between inputs
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    backgroundColor: '#3498db', // A vibrant blue
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  signedInText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  signInButton: {
    backgroundColor: '#4285F4', // Google blue
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  }
});

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      
    </View>
  );
}
