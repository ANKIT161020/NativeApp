import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import app from "../Auth/Auth";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getAuth, signOut } from "firebase/auth";
import axios from "axios";

const auth = getAuth(app);

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const Home = ({ navigation }) => {
  const [location, setLocation] = useState({
    latitude: 19.091796848650176,
    longitude: 72.90786925130544,
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const userEmail = auth.currentUser ? auth.currentUser.email : "User";
  const HamburgerName = userEmail.charAt(0).toUpperCase();

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") console.log("Permission Denied!");

    let location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    console.log(location);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("LogOut Successful");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const handleToggleSidebar = () => {
    setShowWelcome(!showWelcome);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      setResults(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {results.length !== 0 &&
          results.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon),
              }}
              title={location.display_name}
            />
          ))}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
        />
      </MapView>
      {showWelcome && (
        <View style={styles.sidebar}>
          <Text style={styles.emailText}>Welcome, {userEmail}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      )}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handleToggleSidebar}
      >
        <Text style={styles.toggleButtonText}>{HamburgerName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
        <Text style={styles.toggleButtonText}>+</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a location"
        value={query}
        onChangeText={(text) => setQuery(text)}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
  emailText: {
    fontSize: 20,
    marginBottom: 20,
  },
  map: {
    flex: 1,
    width: deviceWidth,
    height: deviceHeight,
  },
  toggleButton: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "grey",
    height: 60,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 150,
  },
  locationButton: {
    position: "absolute",
    top: 180,
    left: 20,
    backgroundColor: "grey",
    height: 60,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 150,
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
    textAlign: "center",
    marginTop: 5,
  },
  searchInput: {
    position: "absolute",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 50,
    width: 300,
    height: 35,
    fontSize: 16,
    top: 50,
    left: 5,
    backgroundColor: "white",
  },
  searchButton: {
    position: "absolute",
    top: 50,
    right: 5,
    padding: 8,
    backgroundColor: "grey",
    borderRadius: 4,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Home;
