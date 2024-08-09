import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Video } from 'expo-av';

const LoginScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const [pseudo, setPseudo] = useState('');
  const [mot_de_passe, setMot_de_passe] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const [loaded] = useFonts({
    'Roboto-Bold': require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/fonts/Roboto/Roboto-Bold.ttf'),
    'Roboto-Regular': require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/fonts/Roboto/Roboto-Regular.ttf'),
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  const handleLogin = async () => {
    try {
      if (!pseudo || !mot_de_passe) {
        Alert.alert('Erreur', 'Veuillez saisir un nom d\'utilisateur et un mot de passe.');
        return;
      }
  
      const response = await fetch('http://192.168.1.12:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: mot_de_passe,
          username: pseudo,
        }),
      });
  
      const responseText = await response.text();
      const contentType = response.headers.get('content-type');
  
      console.log('Raw response text:', responseText); // Affiche le texte brut de la réponse
      console.log('Response content type:', contentType); // Affiche le type de contenu
  
      if (contentType && contentType.includes('application/json')) {
        try {
          const responseData = JSON.parse(responseText);
          if (!response.ok) {
            setError(`Erreur lors de la connexion: ${responseData.detail}`);
            throw new Error(responseData.detail || 'Erreur lors de la connexion');
          }
          const { access, refresh } = responseData;
          console.log('Access token:', access);
          console.log('Refresh token:', refresh);
          navigation.navigate('Dashboard', { pseudo });
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          
        }
      } else {
        Alert.alert('La réponse du serveur n\'est pas au format JSON.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Une erreur s\'est produite lors de la connexion.');
    }
  };
  
  

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Video
        source={require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/log.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView style={styles.overlay} behavior="padding" enabled>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>
              WELCOME
            </Text>
            <Text style={styles.subtitle}>
              LOGIN
            </Text>
            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
              <View style={styles.inputContainer}>
                <FontAwesome name="user" size={24} color="#A9A9A9" style={styles.icon} />
                <TextInput
                  placeholder="Username"
                  style={styles.input}
                  placeholderTextColor="#A9A9A9"
                  onChangeText={text => setPseudo(text)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={24} color="#A9A9A9" style={styles.icon} />
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholderTextColor="#A9A9A9"
                  onChangeText={text => setMot_de_passe(text)}
                />
                <TouchableOpacity onPress={toggleShowPassword} style={styles.togglePasswordButton}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="black" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
              {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
              <View style={styles.buttonContainer}>
                <Button
                  title="login now"
                  onPress={handleLogin}
                  buttonStyle={[styles.button, { backgroundColor: '#175b27' }]}
                  onPressIn={() => {
                    Animated.spring(fadeAnim, {
                      toValue: 0.8,
                      friction: 3,
                      useNativeDriver: true,
                    }).start();
                  }}
                  onPressOut={() => {
                    Animated.spring(fadeAnim, {
                      toValue: 1,
                      friction: 3,
                      useNativeDriver: true,
                    }).start();
                  }}
                />
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 26,
    marginBottom: 10,
    marginTop: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#dcdcdc',
  },
  formContainer: {
    width: '80%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15, 
    backgroundColor: '#f0f8f4',
    width: '90%',
    height: 50,
    marginBottom: 10,
    borderRadius: 25,
    paddingHorizontal: 15,
    position: 'relative',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#000',
  },
  togglePasswordButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginRight: '25%',
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#175b27',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 25,
  },
});

export default LoginScreen;
