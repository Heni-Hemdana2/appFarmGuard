import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
  Linking
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DetectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const cameraName = route.params?.camera || "Caméra inconnue";
  const detectionId = route.params?.detectionId || null;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [latestDetection, setLatestDetection] = useState(null);
  const [error, setError] = useState(null);

  
// URL de l'API - assurez-vous que cette URL est correcte et accessible
  // Pour les tests sur l'émulateur Android, utilisez 10.0.2.2 au lieu de 127.0.0.1
  // Pour iOS simulateur, utilisez localhost
  // Pour un appareil réel, utilisez l'adresse IP de votre ordinateur sur le réseau local
  const API_URL = 'http://127.0.0.1:8000/api';

  // Fonction pour récupérer le token JWT
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
      console.error('Error getting token:', error);
      setError('Authentification requise. Veuillez vous reconnecter.');
      return null;
    }
  };

  // Charger la détection spécifique si un ID est fourni
  const fetchDetectionById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) return;

      console.log(`Récupération de la détection avec l'ID: ${id}`);
      
      // On pourrait créer un endpoint spécifique pour récupérer une détection par ID,
      // mais ici on va utiliser l'endpoint existant pour récupérer les détections et filtrer
      const response = await axios.get(`${API_URL}/detections/?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      const detection = response.data.find(d => d.id.toString() === id.toString());
      
      if (detection) {
        console.log(`Détection trouvée: ${detection.id}`);
        setLatestDetection(detection);
      } else {
        console.log(`Détection avec ID ${id} non trouvée`);
        // Si la détection spécifique n'est pas trouvée, on récupère la dernière pour cette caméra
        fetchLatestDetection();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la détection:', error);
      setError(error.response?.data?.error || 'Impossible de récupérer les données de détection');
      // On essaie quand même de récupérer la dernière détection
      fetchLatestDetection();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger la dernière détection
  const fetchLatestDetection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) return;

      console.log(`Récupération de la dernière détection pour: ${cameraName}`);
      
      // Utiliser le nom de la caméra du paramètre de route
      const encodedCameraName = encodeURIComponent(cameraName);
      const response = await axios.get(`${API_URL}/latest-detection/${encodedCameraName}/`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      if (response.data) {
        console.log(`Dernière détection récupérée: ${response.data.id}`);
        setLatestDetection(response.data);
      } else {
        console.log('Aucune détection trouvée');
        setError('Aucune détection trouvée pour cette caméra');
      }
    } catch (error) {
      console.error('Error fetching detection:', error);
      
      // Gestion des différentes erreurs
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        if (error.response.status === 404) {
          setError('Aucune détection trouvée pour cette caméra');
        } else {
          setError(error.response.data?.error || 'Erreur serveur');
        }
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        setError('Impossible de joindre le serveur');
      } else {
        // Erreur lors de la configuration de la requête
        setError('Erreur de configuration de la requête');
      }
      
      // Simuler des données de test en cas d'erreur
      setLatestDetection({
        id: 1,
        camera_name: cameraName,
        detection_time: new Date().toISOString(),
        image_url: null, // Pas d'image
        detection_data: {
          data: [
            [100, 150, 200, 250, 0.92, 1, 'Feu', 'Feu'],
            [300, 350, 400, 450, 0.85, 1, 'Feu', 'Fumée']
          ]
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour récupérer la dernière image YOLO
  const fetchLatestYoloImage = async () => {
    try {
      // Vérifier si on a déjà une URL d'image
      if (latestDetection && latestDetection.image_url) {
        return;
      }
      
      setLoading(true);
      
      const token = await getToken();
      if (!token) return;

      console.log('Récupération de la dernière image YOLO');
      
      // Demander la dernière image YOLO
      const response = await axios.get(`${API_URL}/latest-yolo-image/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'image/jpeg' 
        },
        responseType: 'blob',
        timeout: 10000
      });

      // Créer une URL pour l'image blob
      const imageBlob = response.data;
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Mettre à jour l'objet de détection avec cette URL
      if (latestDetection) {
        setLatestDetection({
          ...latestDetection,
          image_url: imageUrl
        });
      }
      
      console.log('Image YOLO récupérée');
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image YOLO:', error);
      // Ne pas afficher d'erreur ici car c'est une fonctionnalité secondaire
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    setRefreshing(true);
    if (detectionId) {
      fetchDetectionById(detectionId);
    } else {
      fetchLatestDetection();
    }
  };

  // Charger les données au chargement du composant
  useEffect(() => {
    // Si un ID de détection est fourni, on récupère cette détection spécifique
    if (detectionId) {
      fetchDetectionById(detectionId);
    } else {
      // Sinon, on récupère la dernière détection pour cette caméra
      fetchLatestDetection();
    }
    
    // Si on ne trouve pas d'image via l'API normale, on essaie de récupérer la dernière image YOLO
    const yoloImageTimeout = setTimeout(() => {
      if (!latestDetection || !latestDetection.image_url) {
        fetchLatestYoloImage();
      }
    }, 2000);
    
    // Rafraîchir les données toutes les 30 secondes si on est en mode "dernière détection"
    let interval;
    if (!detectionId) {
      interval = setInterval(() => {
        fetchLatestDetection();
      }, 30000);
    }
    
    return () => {
      clearTimeout(yoloImageTimeout);
      if (interval) clearInterval(interval);
    };
  }, [detectionId]);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Fonction pour partager la détection
  const shareDetection = () => {
    // Cette fonction serait à implémenter avec la fonctionnalité de partage réelle
    Alert.alert(
      'Partager cette alerte',
      'Souhaitez-vous partager cette alerte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Partager', 
          onPress: () => {
            // Logique de partage à implémenter
            Alert.alert('Partage', 'Fonctionnalité de partage à implémenter');
          }
        }
      ]
    );
  };

  // Fonction pour signaler l'alerte aux services d'urgence
  const reportEmergency = () => {
    Alert.alert(
      'Signaler une urgence',
      'Souhaitez-vous signaler cette alerte aux services d\'urgence?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Appeler les pompiers',
          onPress: () => {
            // Numéro des pompiers (à adapter selon le pays)
            Linking.openURL('tel:18');
          }
        },
        {
          text: 'Signaler dans l\'app',
          onPress: () => Alert.alert('Alerte signalée', 'Les services d\'urgence ont été notifiés')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détection</Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* Info caméra */}
        <View style={styles.cameraInfoContainer}>
          <Ionicons name="videocam" size={24} color="#4CAF50" style={styles.cameraIcon} />
          <Text style={styles.cameraNameText}>{cameraName}</Text>
          {detectionId && (
            <View style={styles.detectionIdContainer}>
              <Text style={styles.detectionIdText}>ID: {detectionId}</Text>
            </View>
          )}
        </View>
        
        {/* Loader */}
        {loading && !refreshing && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement des données de détection...</Text>
          </View>
        )}
        
        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#f44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Contenu de détection */}
        {latestDetection && !loading && (
          <View style={styles.detectionContainer}>
            {/* Carte d'image */}
            <View style={styles.imageCard}>
              <View style={styles.imageHeaderContainer}>
                <Text style={styles.timestamp}>
                  {formatDate(latestDetection.detection_time)}
                </Text>
                
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={shareDetection}
                >
                  <Ionicons name="share-outline" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              
              {latestDetection.image_url ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: latestDetection.image_url }}
                    style={styles.detectionImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <MaterialIcons name="image-not-supported" size={60} color="#9e9e9e" />
                  <Text style={styles.noImageText}>Aucune image disponible</Text>
                </View>
              )}
            </View>
            
            {/* Carte de détails */}
            <View style={styles.detailsCard}>
              <Text style={styles.detectionTitle}>
                Détections {latestDetection.detection_data?.data?.length > 0 ? 
                  `(${latestDetection.detection_data.data.length})` : '(0)'}
              </Text>
              
              {latestDetection.detection_data?.data?.length > 0 ? (
                <View style={styles.detectionsList}>
                  {latestDetection.detection_data.data.map((detection, index) => (
                    <View key={index} style={styles.detectionItem}>
                      <View style={styles.detectionIconContainer}>
                        <MaterialIcons 
                          name={detection[7].toLowerCase().includes('feu') ? "local-fire-department" : "warning"} 
                          size={28} 
                          color="#f44336" 
                        />
                      </View>
                      <View style={styles.detectionItemContent}>
                        <Text style={styles.detectionItemTitle}>{detection[7]}</Text>
                        <Text style={styles.detectionItemSubtitle}>
                          Confiance: {Math.round(detection[4] * 100)}% | 
                          Position: x:{Math.round(detection[0])}, y:{Math.round(detection[1])}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noDetectionsContainer}>
                  <Text style={styles.noDetectionsText}>
                    Aucune détection dans cette image
                  </Text>
                </View>
              )}
            </View>
            
            {/* Informations supplémentaires */}
            {latestDetection.detection_data?.data?.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>
                  Informations importantes
                </Text>
                <View style={styles.infoContent}>
                  <FontAwesome name="info-circle" size={20} color="#4CAF50" style={styles.infoIcon} />
                  <Text style={styles.infoText}>
                    Cette détection montre des signes potentiels d'incendie. Veuillez vérifier la situation et prendre les mesures appropriées si nécessaire.
                  </Text>
                </View>
              </View>
            )}
            
            {/* Bouton d'action */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={reportEmergency}
            >
              <Text style={styles.actionButtonText}>Signaler cette alerte</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  cameraInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cameraIcon: {
    marginRight: 10,
  },
  cameraNameText: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  detectionIdContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detectionIdText: {
    fontSize: 12,
    color: '#666',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4CAF50',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  detectionContainer: {
    padding: 15,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  imageHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    padding: 5,
  },
  imageWrapper: {
    padding: 10,
  },
  detectionImage: {
    width: '100%',
    height: 300,
    borderRadius: 5,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noImageText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9e9e9e',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  detectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detectionsList: {
    marginTop: 5,
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  detectionIconContainer: {
    backgroundColor: '#ffebee',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detectionItemContent: {
    flex: 1,
  },
  detectionItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detectionItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  noDetectionsContainer: {
    alignItems: 'center',
    padding: 15,
  },
  noDetectionsText: {
    fontSize: 16,
    color: '#9e9e9e',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetectionScreen;