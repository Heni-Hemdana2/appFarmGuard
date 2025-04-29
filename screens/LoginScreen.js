import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assurez-vous d'importer AsyncStorage

const LoginScreen = () => {
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const [loaded] = useFonts({
    'Roboto-Bold': require('../assets/fonts/Roboto/Roboto-Bold.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/Roboto-Regular.ttf'),
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
      setIsLoading(true);
      setError(null);
      
      if (!pseudo || !password) {
        Alert.alert('Erreur', 'Veuillez saisir un nom d\'utilisateur et un mot de passe.');
        setIsLoading(false);
        return;
      }
  
      console.log('Tentative de connexion avec:', { pseudo, password });
      
      // Pour un appareil réel, utilisez l'adresse IP de votre ordinateur sur le réseau local
      // Pour un émulateur Android, utilisez 10.0.2.2 au lieu de 127.0.0.1
      const apiUrl = 'http://127.0.0.1:8000/api/login/';
      console.log('URL de l\'API:', apiUrl);
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pseudo: pseudo,
          password: password,
        }),
      });
  
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      // Vérifier si la réponse est au format JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur de parsing JSON:', e);
        Alert.alert('Erreur', 'La réponse du serveur n\'est pas au format JSON attendu.');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        // Gestion des erreurs de la réponse API
        if (responseData.detail) {
          setError(responseData.detail);
        } else if (responseData.non_field_errors) {
          setError(responseData.non_field_errors[0]);
        } else {
          setError('Identifiants incorrects. Veuillez réessayer.');
        }
        setIsLoading(false);
        return;
      }
      
      // Succès de la connexion
      if (responseData.access && responseData.refresh) {
        console.log('Tokens reçus:', { 
          access: responseData.access,
          refresh: responseData.refresh 
        });
        
        // Stockage des tokens - DÉCOMMENTEZ CES LIGNES
        await AsyncStorage.setItem('accessToken', responseData.access);
        await AsyncStorage.setItem('refreshToken', responseData.refresh);
        
        console.log('Tokens stockés avec succès');
        
        // Navigation vers l'écran d'alertes - CORRECTION DU NOM DE LA ROUTE
        console.log('Navigation vers Alert');
        navigation.navigate('Alert');
      } else {
        setError('Format de réponse incorrect du serveur.');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const clearPseudo = () => {
    setPseudo('');
  };

  const clearPassword = () => {
    setPassword('');
  };

  if (!loaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/Capture d\'écran 2025-04-23 004053 (1).png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Pseudo Input */}
          <Text style={styles.inputLabel}>User</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email/Username"
              value={pseudo}
              onChangeText={setPseudo}
              autoCapitalize="none"
            />
            {pseudo.length > 0 && (
              <TouchableOpacity onPress={clearPseudo} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>8 characters</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            {password.length > 0 && (
              <TouchableOpacity onPress={clearPassword} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Error message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Connexion...' : 'login'}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>forgot password ? click here</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
  },
  clearButton: {
    position: 'absolute',
    right: 15,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#92d394',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default LoginScreen;