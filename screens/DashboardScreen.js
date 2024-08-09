import React, { useState , useEffect , useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, Modal, TouchableOpacity ,Alert ,RefreshControl, ScrollView } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import MapView, { Polygon, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur'; // Importez BlurView depuis expo-blur

const Drawer = createDrawerNavigator();

const DashboardScreenContent = ({ pseudo }) => {
  
  return (
    <View style={styles.container2}>
      <Text style={styles.welcome}>Welcome Client!</Text>
      <Text style={styles.description}>This dashboard allows the customer to monitor their farm for any potential fire threats.</Text>
      <View style={styles.widgetContainer}>
        <View style={styles.widget}>
          <Icon name="thermostat" size={30} color="#000" />
          <Text style={styles.widgetText}>Temperature: -- ℃</Text>
        </View>
        <View style={styles.widget}>
          <Icon name="local-fire-department" size={30} color="#000" />
          <Text style={styles.widgetText}>Gas rate: -- ppm</Text>
        </View>
        <View style={styles.widget}>
          <Icon name="water-drop" size={30} color="#000" />
          <Text style={styles.widgetText}>Humidity: -- %</Text>
        </View>
        <View style={styles.widget}>
          <Icon name="speed" size={30} color="#000" />
          <Text style={styles.widgetText}>Wind Speed: -- km/h</Text>
        </View>
        <View style={styles.widget}>
          <Icon name="compress" size={30} color="#000" />
          <Text style={styles.widgetText}>Pressure: -- hPa</Text>
        </View>
      </View>
    </View>
  );
  
};

const PolygonMap = () => {
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [bounceValue, setBounceValue] = useState(new Animated.Value(1));

  useEffect(() => {
    fetch('http://192.168.1.12:8000/test/send_alert/')
      .then(response => response.json())
      .then(data => {
        console.log('Received data:', data);
        const { coordinates } = data;
        if (coordinates && Array.isArray(coordinates) && coordinates.length > 0) {
          const formattedCoordinates = coordinates.map(coord => ({
            latitude: coord.latitude,
            longitude: coord.longitude,
          }));
          setPolygonCoordinates(formattedCoordinates);
        } else {
          Alert.alert('No Data', 'No polygon data available.');
        }
      })
      .catch(error => {
        console.error('Error fetching alert:', error);
        Alert.alert('Error', 'An error occurred while fetching the alert.');
      });
  }, []);

  const getPolygonCenter = (coordinates) => {
    const latitudes = coordinates.map(point => point.latitude);
    const longitudes = coordinates.map(point => point.longitude);
    const latitude = latitudes.reduce((a, b) => a + b) / latitudes.length;
    const longitude = longitudes.reduce((a, b) => a + b) / longitudes.length;
    return { latitude, longitude };
  };

  const onPolygonPress = () => {
    const center = getPolygonCenter(polygonCoordinates);
    setSelectedArea({
      coordinate: center,
      name: 'Fire Detected >> cliquez pour parcourir ',
    });

  };

  const onMarkerPress = () => {
    setSelectedArea({
      ...selectedArea,
      name: 'Parcell ID >> 21',
    });
  };

  const onMapPress = () => {
    setSelectedArea(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType="satellite"
        initialRegion={{
          latitude: 37.230741,
          longitude: 10.135005,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={onMapPress}
      >
        {polygonCoordinates.length > 0 && (
          <Polygon
            coordinates={polygonCoordinates}
            strokeColor="#F00"
            fillColor="rgba(255,0,0,0.3)"
            strokeWidth={2}
            tappable={true}
            onPress={onPolygonPress}
          />
        )}
        {selectedArea && (
          <Marker
            coordinate={selectedArea.coordinate}
            title={selectedArea.name}
            onPress={onMarkerPress}
          >
            <Animated.View style={[styles.markerContainer, { transform: [{ scale: bounceValue }] }]}>
              <Text style={styles.markerText}>{selectedArea.name}</Text>
            </Animated.View>
          </Marker>
        )}
      </MapView>
    </View>
  );
};
function CustomDrawerContent(props) {
  
  return (
    <ImageBackground
      source={require('C:/Users/Heni/OneDrive/Bureau/appFarmGuard/assets/bckg1.jpg')}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 1 }}
    >
      <DrawerContentScrollView {...props}>
        <View style={styles.welcomeContainer}>
          <Icon name="person" size={60} color="#000" style={styles.welcomeIcon} />
          <Text style={styles.welcomeText}>CLIENT</Text>
        </View>
        <View style={styles.drawerItemContainer2}>
          <DrawerItem
            label="Dashboard"
            icon={() => <Icon name="dashboard" size={20} color="#000" />}
            onPress={() => props.navigation.navigate('Main')} // Use 'Main' instead of 'Dashboard'
            labelStyle={styles.drawerItemLabel}
          />
        </View>
        <View style={styles.drawerItemContainer}>
          <DrawerItem
            label="Alerte"
            icon={() => <Icon name="notifications" size={20} color="#000" />}
            onPress={() => props.navigation.navigate('Alerte')}
            labelStyle={styles.drawerItemLabel}
          />
        </View>
        <View style={styles.drawerItemContainer}>
          <DrawerItem
            label="Parcells"
            icon={() => <Icon name="map" size={20} color="#000" />}
            onPress={() => props.navigation.navigate('Parcells')}
            labelStyle={styles.drawerItemLabel}
          />
        </View> 
        <View style={styles.drawerItemContainer}>
          <DrawerItem
            label="Help"
            icon={() => <Icon name="help-outline" size={20} color="#000" />}
            onPress={() => alert('Link to help')}
            labelStyle={styles.drawerItemLabel}
          />
        </View>
        <View style={styles.drawerItemContainer3}>
          <DrawerItem
            label="Logout"
            icon={() => <Icon name="logout" size={20} color="#000" />}
            onPress={() => props.navigation.navigate('login')}
            labelStyle={styles.drawerItemLabel}
          />
        </View>
      </DrawerContentScrollView>
    </ImageBackground>
  );
}
// AlertScreen Component


////////////////////////////////////////////////////////////////////////////////////

const CustomAlert = ({ visible, onClose, onNavigate, parcelId, message }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.alertBox}>
          <Icon name="warning" size={50} color="#FFD700" />
          <Text style={styles.alertTitle}>Alert</Text>
          <Text style={styles.alertText}>Parcell ID: {parcelId}</Text>
          <Text style={styles.alertText}> {message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onNavigate}>
              <Text style={styles.buttonText}>Go to Parcells</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
///////////////////////////////////////////////////////////////////////////////////

const Alerte = () => {
  const [alert, setAlert] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const fetchAlert = async () => {
    try {
      const response = await fetch('http://192.168.1.12:8000/test/send_alert/', {
        method: 'GET',
      });
      const data = await response.json();
      if (response.ok) {
        setAlert(data);
        setModalVisible(true);
      } else {
        console.error('Failed to fetch alert:', data);
        Alert.alert('Error', 'Failed to fetch alert.');
      }
    } catch (error) {
      console.error('Error fetching alert:', error);
      Alert.alert('Error', 'An error occurred while fetching the alert.');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAlert(null); // Réinitialise l'état des alertes
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container4}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Alert Screen</Text>
      {alert ? (
        <View style={styles.alertContainer}>
          <Icon name="warning" size={50} color="#ff0000" />
          <Text style={styles.alertText2}>Parcell ID: {alert.parcel_id}</Text>
          <Text style={styles.alertText2}> {alert.message}</Text>
        </View>
      ) : (
        <View style={styles.noAlertContainer}>
          <Icon name="check-circle" size={50} color="#00ff00" />
          <Text style={styles.noAlertText}>No Fire Detected</Text>
          <Text style={styles.noAlertText}>No alerts</Text>
        </View>
      )}
          <TouchableOpacity style={styles.sendButton} onPress={fetchAlert}>
            <Text style={styles.buttonText2}>Search</Text>
          </TouchableOpacity>
      <CustomAlert
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onNavigate={() => {
          setModalVisible(false);
          navigation.navigate('Parcells');
        }}
        parcelId={alert?.parcel_id}
        message={alert?.message}
      />
    </ScrollView>
  );
};


function DashboardScreen({ pseudo }) {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="Main" options={{ title: 'Dashboard' }}>
          {(props) => <DashboardScreenContent {...props} pseudo={pseudo} />}
        </Drawer.Screen>
        <Drawer.Screen name="Alerte" component={Alerte} />
        <Drawer.Screen name="Parcells" component={PolygonMap} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
  },
  markerText: {
    color: 'black',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  drawerItemContainer: {
    backgroundColor: 'white',
    marginVertical: 5,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    height: 60,
    width: '85%',
    alignSelf: 'left',
    marginLeft: 0,
    marginBottom:10,
  },
  drawerItemContainer2: {
    backgroundColor: 'white',
    marginVertical: 5,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    height: 60,
    width: '85%',
    alignSelf: 'left',
    marginLeft: 0,
    marginTop:40,
    marginBottom:10,
  },
  drawerItemContainer3: {
    backgroundColor: 'white',
    marginVertical: 5,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    height: 60,
    width: '85%',
    alignSelf: 'left',
    marginLeft: 0,
    marginTop:10,
    marginBottom:10,
  },

  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    flexDirection: 'row', // Pour aligner l'icône et le texte horizontalement
    alignItems: 'center', // Centrer verticalement
    backgroundColor:'white',
    marginVertical: 5,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    height: 80,
    width: '95%',
    paddingHorizontal: 15,
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeIcon: {
    // Vous pouvez ajouter des styles supplémentaires pour l'icône ici
  },

  drawerItemLabel: {
    fontWeight: 'bold',  // Pour rendre le texte en gras
    color: 'black',
    fontSize: 18,
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
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 25,
  },

  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  widgetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  widget: {
    width: '45%',
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  widgetText: {
    marginTop: 10,
    fontSize: 16,
  },
  container2: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  container3: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alertContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alertText: {
    fontSize: 18,
    color: '#ff0000',
    marginTop: 10,
    textAlign:'center'
  },
  noAlertContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  noAlertText: {
    fontSize: 18,
    color: '#00ff00',
    marginTop: 10,
  },
  button9: {
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 25,
  },
  buttonContainer9: {
    marginTop: 20,
    backgroundColor: 'green'
  },

//modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  alertBox: {
    width: 340,
    padding: 20,
    backgroundColor: '#8B0000',
    borderRadius: 20,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  alertText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },

//l'alerte
  container4: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alertContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alertText: {
    fontSize: 22,
    color: '#fff',
    marginTop: 10,
    marginBottom:20,
    fontWeight: 'bold',
    textAlign:'center'
  },
  alertText2: {
    fontSize: 18,
    color: '#ff0000',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign:'center'
  },
  noAlertContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  noAlertText: {
    fontSize: 18,
    color: '#00ff00',
    marginTop: 10,
  },
//fetch button
  sendButton: {
    backgroundColor: '#175b27',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText2: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;