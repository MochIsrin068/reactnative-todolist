import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Platform,
    PermissionsAndroid,
    ToastAndroid,
    StatusBar,
    Alert,
    ActivityIndicator
} from "react-native";
import MapView, {
    Marker,
    AnimatedRegion,
    Polyline,
    PROVIDER_GOOGLE
} from "react-native-maps";
import haversine from "haversine";
import Geolocation from 'react-native-geolocation-service'


const LATITUDE_DELTA = 0.0043;
const LONGITUDE_DELTA = 0.0043;


export async function request_location_runtime_permission() {

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'ReactNativeCode Location Permission',
                'message': 'ReactNativeCode App needs access to your location '
            }
        )

        if (
            Platform.OS === 'ios' ||
            (Platform.OS === 'android' && Platform.Version < 23)
        ) {
            return true
        }

        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        )
        if (hasPermission) {
            return true
        }

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true
        }

        if (granted === PermissionsAndroid.RESULTS.DENIED) {
            ToastAndroid.show(
                'Location Permission Denied By User.',
                ToastAndroid.LONG
            )
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            ToastAndroid.show(
                'Location Permission Revoked By User.',
                ToastAndroid.LONG
            )
        }
        return false
    } catch (err) {
        console.warn(err)
    }
}

class AnimatedMarkers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            latitude: 0,
            longitude: 0,
            routeCoordinates: [],
            distanceTravelled: 0,
            prevLatLng: {},
            isLoading: true,
            coordinate: new AnimatedRegion({
                latitude: 0,
                longitude: 0,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            })
        };
    }

    async componentDidMount() {

        const requestPermission = await request_location_runtime_permission()
        if (!requestPermission) {
            return
        }


        const { coordinate } = this.state;

        Geolocation.getCurrentPosition(position => {
            var lat = position.coords.latitude
            var long = position.coords.longitude

            console.log(`Lat : ${lat}`)
            console.log(`Long : ${long}`),

                this.setState({
                    isLoading: false,
                    latitude: lat,
                    longitude: long,
                    coordinate: new AnimatedRegion({
                        latitude: lat,
                        longitude: long,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA
                    })
                })
        },

            error => console.log(error),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 50,
                forceRequestLocation: true,
            }

        )

        this.watchID = Geolocation.watchPosition(
            position => {
                const { routeCoordinates, distanceTravelled } = this.state;
                const { latitude, longitude } = position.coords;

                const newCoordinate = {
                    latitude,
                    longitude
                };

                if (Platform.OS === "android") {
                    if (this.marker) {
                        this.marker._component.animateMarkerToCoordinate(
                            newCoordinate,
                            500
                        );
                    }
                } else {
                    coordinate.timing(newCoordinate).start();
                }

                this.setState({
                    latitude,
                    longitude,
                    isLoading: false,
                    routeCoordinates: routeCoordinates.concat([newCoordinate]),
                    distanceTravelled:
                        distanceTravelled + this.calcDistance(newCoordinate),
                    prevLatLng: newCoordinate
                });
            },
            error => console.log(error),
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000,
                distanceFilter: 10
            }
        );
    }

    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    }

    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });

    calcDistance = newLatLng => {
        const { prevLatLng } = this.state;
        return haversine(prevLatLng, newLatLng) || 0;
    };

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ alignItems: "center", flex: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        showUserLocation={true}
                        followUserLocation={true}
                        loadingEnabled={true}
                        region={this.getMapRegion()}
                    >
                        <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />
                        <Marker.Animated
                            ref={marker => {
                                this.marker = marker;
                            }}
                            coordinate={this.state.coordinate}
                        />
                    </MapView>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.bubble, styles.button]}>
                            <Text>{`Lat : ${this.state.latitude}`}</Text>
                            <Text>{`Long : ${this.state.longitude}`}</Text>
                            <Text style={styles.bottomBarContent}>
                                {parseFloat(this.state.distanceTravelled).toFixed(2)} km
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    map: {
        ...StyleSheet.absoluteFillObject
    },
    bubble: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20
    },
    latlng: {
        width: 200,
        alignItems: "stretch"
    },
    button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: "center",
        marginHorizontal: 10
    },
    buttonContainer: {
        flexDirection: "row",
        marginVertical: 20,
        backgroundColor: "transparent"
    }
});

export default AnimatedMarkers;