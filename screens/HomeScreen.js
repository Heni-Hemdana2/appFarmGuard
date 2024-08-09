import React, { useRef, useEffect } from 'react';//utilisés pour gérer l'état des composants et les effets secondaires.
import { View, Text, StyleSheet, Animated, ImageBackground, Image } from 'react-native';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';//est utilisé pour naviguer entre les écrans.
import { useFonts } from 'expo-font';//charge des polices personnalisées.

const HomeScreen = () => {  
  const [loaded] = useFonts({//chargement des polices personnalisées à partir des chemins spécifiés.
    'Roboto-Bold': require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/fonts/Roboto/Roboto-Bold.ttf'),
    'Roboto-Regular': require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/fonts/Roboto/Roboto-Regular.ttf'),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;//est une référence pour gérer l'état de l'animation, commençant à 0
  const navigation = useNavigation();//fournit des capacités de navigation  

  useEffect(() => {//Exécute l'effet d'animation lorsque le composant est monté.
    Animated.timing(fadeAnim, {//Fait apparaître progressivement le composant de l'opacité 0 à 1 sur 1000 millisecondes.
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

//Retourne null si les polices ne sont pas chargées
  if (!loaded) {
    return null; // Return null or a loading indicator while fonts are loading
  }
//Fournit une image de fond pour tout l'écran.
//Les conteneurs View organisent les éléments de mise en page tels que le logo, le titre et les boutons.
  return (
    <ImageBackground
      source={require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/back.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Image
          source={require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/logo.png')}
          style={styles.logo}
          
        />
        
        <Text style={styles.title}>WELCOME TO SFG</Text>

      
        <View style={styles.imageContainer}>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('Login')}
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
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { //Définit l'image de fond pour couvrir tout l'écran.
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {//Centre tous les éléments dans l'écran.
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {//Styles pour l'image du logo, y compris la taille et la marge.

    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 20,
  },
  titleImage: {//Gèrent la mise en page et l'apparence du titre et des images.
    width: 250,
    height: 100,
    resizeMode: 'contain',
    marginTop: '5%',
  },
  imageContainer: {
    width: '80%',
    aspectRatio: 1,
    alignItems: 'center',
    marginTop: '5%',
  },
  backgroundImageInner: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  contentContainer: {
    marginTop: '1%',
    alignItems: 'center',
  },
  slogan: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: '50%',
  },
  button: {
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',

  },
});

export default HomeScreen;
