import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground, Image, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';

const HomeScreen = () => {  
  const [loaded] = useFonts({
    'Roboto-Bold': require('../assets/fonts/Roboto/Roboto-Bold.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/Roboto-Regular.ttf'),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Naviguer automatiquement après 3 secondes si souhaité
    // const timer = setTimeout(() => {
    //   navigation.navigate('Login');
    // }, 3000);
    // return () => clearTimeout(timer);
  }, [fadeAnim]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.contentContainer, { opacity: fadeAnim }]}
      >
        {/* Logo image (la partie graphique avec la ferme) */}
        <Image
          source={require('../assets/Capture d\'écran 2025-04-23 004053 (1).png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        {/* Texte du logo */}
        {/* <Text style={styles.smartFarmText}>smart farm</Text>
        <Text style={styles.visionText}>vision</Text> */}
        
        {/* Bouton invisible qui couvre tout l'écran pour naviguer */}
        <TouchableOpacity 
          style={styles.fullScreenButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          {/* Bouton optionnel visible */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a7858', // Couleur verte comme dans l'image
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  smartFarmText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 40,
    color: '#a5c3b2', // Couleur vert clair pour le texte
    textAlign: 'center',
    letterSpacing: 1,
  },
  visionText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 40,
    color: '#a5c3b2', // Couleur vert clair pour le texte
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: -10, // Rapproche les deux textes
  },
  fullScreenButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  buttonContainer: {
    width: '60%',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#a5c3b2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  }
});

export default HomeScreen;