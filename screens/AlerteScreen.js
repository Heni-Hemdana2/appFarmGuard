import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AlertScreen = () => {
  const navigation = useNavigation();
  // Exemple de données d'alerte - vous pouvez les remplacer par des données réelles provenant d'une API
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      title: 'List item',
      description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
    },
    {
      id: '2',
      title: 'List item',
      description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
    },
    {
      id: '3',
      title: 'List item',
      description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
    },
    {
      id: '4',
      title: 'List item',
      description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
    },
  ]);

  // Vous pouvez ajouter une fonction pour récupérer les alertes depuis votre API
  useEffect(() => {
    // Fonction pour récupérer les alertes
    const fetchAlerts = async () => {
      try {
        // Exemple de code pour récupérer les alertes depuis une API
        // const response = await fetch('votre_url_api/alerts');
        // const data = await response.json();
        // setAlerts(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des alertes:', error);
      }
    };

    // fetchAlerts();
  }, []);

  const renderAlertItem = ({ item }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertItemContent}>
        <View style={styles.alertIconContainer}>
          <View style={styles.alertTriangle}></View>
          <View style={styles.alertSquare}></View>
          <View style={styles.alertCircle}></View>
        </View>
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          <Text style={styles.alertDescription}>{item.description}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Feather name="more-vertical" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e0e0e0" barStyle="dark-content" />
      
      {/* Carte d'alerte principale */}
      <View style={styles.alertCardContainer}>
        <View style={styles.alertCard}>
          <View style={styles.alertCardContent}>
            <View style={styles.alertDetails}>
              <Text style={styles.alertCardTitle}>Alerte</Text>
              <Text style={styles.alertCardSubtitle}>Camera zone X</Text>
            </View>
            <View style={styles.alertCardIconsContainer}>
              <View style={styles.triangleShape}></View>
              <View style={styles.squareShape}></View>
              <View style={styles.circleShape}>
                <Text style={styles.circleText}>1st</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Liste des alertes */}
      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContainer}
      />

      {/* Barre de navigation inférieure */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color="#000" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, styles.activeNavItem]}
        >
          <Ionicons name="time-outline" size={24} color="#4CAF50" />
          <Text style={styles.activeNavText}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
        >
          <Ionicons name="search-outline" size={24} color="#000" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
        >
          <Ionicons name="person-outline" size={24} color="#000" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  alertCardContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  alertCard: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
    height: 170,
  },
  alertCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  alertDetails: {
    marginBottom: 10,
  },
  alertCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  alertCardSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  alertCardIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  triangleShape: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#9e9e9e',
    marginRight: 20,
  },
  squareShape: {
    width: 50,
    height: 50,
    backgroundColor: '#9e9e9e',
    marginRight: 20,
  },
  circleShape: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9e9e9e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingTop: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f4fa',
    padding: 15,
  },
  alertItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  alertTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#9e9e9e',
    position: 'absolute',
    top: 5,
    left: '50%',
    marginLeft: -8,
  },
  alertSquare: {
    width: 12,
    height: 12,
    backgroundColor: '#9e9e9e',
    position: 'absolute',
    bottom: 13,
    left: 12,
  },
  alertCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9e9e9e',
    position: 'absolute',
    bottom: 13,
    right: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavItem: {
    borderBottomWidth: 0,
  },
  navText: {
    fontSize: 12,
    marginTop: 3,
    color: '#000',
  },
  activeNavText: {
    fontSize: 12,
    marginTop: 3,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default AlertScreen;