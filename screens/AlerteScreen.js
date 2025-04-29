import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AlertScreen = () => {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestDetection, setLatestDetection] = useState(null);
  const [error, setError] = useState(null);
  
  // URL de l'API - assurez-vous que cette URL est correcte et accessible
  // Pour les tests sur l'émulateur Android, utilisez 10.0.2.2 au lieu de 127.0.0.1
  // Pour iOS simulateur, utilisez localhost
  // Pour un appareil réel, utilisez l'adresse IP de votre ordinateur sur le réseau local
  const API_URL = 'http://127.0.0.1:8000/api';

  // Fonction pour récupérer le token
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('Aucun token trouvé, redirection vers la page de connexion');
        navigation.navigate('Login');
        return null;
      }
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  };

  // Fonction pour récupérer les alertes depuis l'API
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) return;

      console.log('Récupération des données...');
      
      // Récupérer la dernière détection pour la carte principale
      try {
        const latestResponse = await axios.get(`${API_URL}/latest-detection/`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 secondes de timeout
        });
        
        if (latestResponse.data) {
          console.log('Dernière détection récupérée:', latestResponse.data.id);
          setLatestDetection(latestResponse.data);
        }
      } catch (latestError) {
        console.error('Erreur lors de la récupération de la dernière détection:', latestError);
        // Ne pas arrêter le processus, continuer pour récupérer l'historique
      }

      // Récupérer l'historique des détections (10 dernières)
      try {
        const historyResponse = await axios.get(`${API_URL}/detections/?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 secondes de timeout
        });
        
        // Transformer les données pour correspondre au format attendu par la FlatList
        const formattedAlerts = historyResponse.data.map(detection => ({
          id: detection.id.toString(),
          title: `Détection - ${detection.camera_name}`,
          description: new Date(detection.detection_time).toLocaleString('fr-FR'),
          camera: detection.camera_name,
          detection_time: detection.detection_time,
          image_url: detection.image_url,
          detections: detection.detection_data?.data || []
        }));
        
        setAlerts(formattedAlerts);
        console.log(`${formattedAlerts.length} alertes récupérées`);
      } catch (historyError) {
        console.error('Erreur lors de la récupération de l\'historique:', historyError);
        setError('Impossible de récupérer l\'historique des alertes');
        
        // Utiliser des données de démonstration en cas d'erreur
        setAlerts([
          {
            id: '1',
            title: 'Caméra secteur Nord',
            description: 'Détection - 29/04/2025 14:30',
            camera: 'Caméra secteur Nord'
          },
          {
            id: '2',
            title: 'Caméra zone X',
            description: 'Détection - 29/04/2025 13:15',
            camera: 'Caméra zone X'
          },
          {
            id: '3',
            title: 'Caméra secteur Est',
            description: 'Détection - 29/04/2025 11:22',
            camera: 'Caméra secteur Est'
          },
          {
            id: '4',
            title: 'Caméra périmètre',
            description: 'Détection - 29/04/2025 09:45',
            camera: 'Caméra périmètre'
          },
        ]);
      }
    } catch (error) {
      console.error('Erreur générale lors de la récupération des alertes:', error);
      setError('Impossible de communiquer avec le serveur');
      
      // Utiliser des données de démonstration
      setAlerts([
        {
          id: '1',
          title: 'Caméra secteur Nord',
          description: 'Détection - 29/04/2025 14:30',
          camera: 'Caméra secteur Nord'
        },
        {
          id: '2',
          title: 'Caméra zone X',
          description: 'Détection - 29/04/2025 13:15',
          camera: 'Caméra zone X'
        },
        {
          id: '3',
          title: 'Caméra secteur Est',
          description: 'Détection - 29/04/2025 11:22',
          camera: 'Caméra secteur Est'
        },
        {
          id: '4',
          title: 'Caméra périmètre',
          description: 'Détection - 29/04/2025 09:45',
          camera: 'Caméra périmètre'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les alertes au chargement
  useEffect(() => {
    fetchAlerts();
    
    // Actualiser les alertes toutes les 60 secondes
    const interval = setInterval(() => {
      fetchAlerts();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAlertCardPress = () => {
    // Si on a des données réelles, utiliser celles-ci
    if (latestDetection) {
      navigation.navigate('Detection', { 
        camera: latestDetection.camera_name,
        detectionId: latestDetection.id
      });
    } else {
      // Sinon utiliser des données de démonstration
      navigation.navigate('Detection', { 
        camera: 'Camera zone X'
      });
    }
  };

  const renderAlertItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.alertItem}
      onPress={() => navigation.navigate('Detection', { 
        camera: item.camera,
        detectionId: item.id 
      })}
    >
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
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => Alert.alert('Options', 'Options supplémentaires à implémenter')}
      >
        <Feather name="more-vertical" size={24} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  // Déterminer le contenu de la carte principale
  const mainCardTitle = latestDetection ? 'Alerte détectée!' : 'Alerte';
  const mainCardSubtitle = latestDetection ? latestDetection.camera_name : 'Camera zone X';
  const mainCardDate = latestDetection ? 
    new Date(latestDetection.detection_time).toLocaleString('fr-FR') : 
    'Dernière détection';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e0e0e0" barStyle="dark-content" />
      
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertes</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchAlerts}
        >
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Message d'erreur si présent */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Carte d'alerte principale */}
      <View style={styles.alertCardContainer}>
        <TouchableOpacity 
          style={styles.alertCard}
          onPress={handleAlertCardPress}
        >
          <View style={styles.alertCardContent}>
            <View style={styles.alertDetails}>
              <Text style={styles.alertCardTitle}>{mainCardTitle}</Text>
              <Text style={styles.alertCardSubtitle}>{mainCardSubtitle}</Text>
              <Text style={styles.alertCardDate}>{mainCardDate}</Text>
            </View>
            <View style={styles.alertCardIconsContainer}>
              <View style={styles.triangleShape}></View>
              <View style={styles.squareShape}></View>
              <View style={styles.circleShape}>
                <Text style={styles.circleText}>!</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Liste des alertes */}
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderText}>Historique des alertes</Text>
      </View>
      
      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchAlerts}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="history" size={60} color="#9e9e9e" />
              <Text style={styles.emptyText}>Aucune alerte dans l'historique</Text>
            </View>
          ) : null
        }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    marginHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  alertCardContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  alertCard: {
    backgroundColor: '#e74c3c', // Rouge pour l'alerte
    borderRadius: 15,
    overflow: 'hidden',
    height: 170,
  },
  alertCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  alertDetails: {
    flex: 1,
  },
  alertCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  alertCardSubtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  alertCardDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  alertCardIconsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  triangleShape: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 15,
  },
  squareShape: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 15,
  },
  circleShape: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  listHeaderContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    paddingTop: 5,
    flexGrow: 1,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9e9e9e',
    marginTop: 10,
    textAlign: 'center',
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