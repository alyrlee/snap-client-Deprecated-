import React, { Component } from "react";
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";
import Autocomplete from "react-google-autocomplete";
import AuthApiService from "../Services/auth-api-service";
import Geocode from "react-geocode";
Geocode.setApiKey("AIzaSyDPpPhiwe2nBilWB_ihli85BlyRID4DnpU");
Geocode.enableDebug();

export class MapContainer extends Component {
  state = {
    places: [],
    showingInfoWindow: false,
    visibleInfoWindowId: null,
    activeMarker: {},
    selectedPlace: {},
    stores: {},
    address: "",
    city: "",
    area: "",
    state: "",
    markers: [],
    cityStores: {},
    markerPosition: {
      lat: 0,
      lng: 0,
      city: "",
      state: "",
    },
    mapPosition: {
      lat: 0,
      lng: 0,
    },
    mapCenter: {
      lat: 42.3600825,
      lng: -71.0588801,
    },
    coordinates: {
      lat: 42.3600825,
      lng: -71.0588801,
    },
  };

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState(
          {
            mapPosition: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            markerPosition: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          },
          () => {
            Geocode.fromLatLng(
              position.coords.latitude,
              position.coords.longitude
            ).then(
              (response) => {
                console.log("geocode response", response);
                const address = response.results[0].formatted_address,
                  addressArray = response.results[0].address_components,
                  city = this.getCity(addressArray),
                  area = this.getArea(addressArray),
                  state = this.getState(addressArray);
                this.setState({
                  address: address ? address : "",
                  area: area ? area : "",
                  city: city ? city : "",
                  state: state ? state : "",
                });
                console.log("call getStoresByCityState?", city, state);
                this.getStoresByCityFromAPI(city, state);
              },
              (error) => {
                console.error(error);
              }
            );
          }
        );
      });
    } else {
      console.error("Geolocation is not supported by this browser!");
    }
  }
  getStoresByCityFromAPI = (city, state) => {
    AuthApiService.postCityState(city, state)
      .then((resJSON) => {
        this.setState({ cityStores: resJSON });
      })
      .catch((error) => {
        if (error.resJSON) console.error({ error: error });
      });
  };
  getCity = (addressArray) => {
    let city = "";
    for (let i = 0; i < addressArray.length; i++) {
      if (addressArray[i].types[0] && "locality" === addressArray[i].types[0]) {
        city = addressArray[i].long_name;
        return city;
      }
    }
  };
  getArea = (addressArray) => {
    let area = "";
    for (let i = 0; i < addressArray.length; i++) {
      if (addressArray[i].types[0]) {
        for (let j = 0; j < addressArray[i].types.length; j++) {
          if (
            "sublocality_level_1" === addressArray[i].types[j] ||
            "locality" === addressArray[i].types[j]
          ) {
            area = addressArray[i].long_name;
            return area;
          }
        }
      }
    }
  };
  getState = (addressArray) => {
    let state = "";
    for (let i = 0; i < addressArray.length; i++) {
      for (let i = 0; i < addressArray.length; i++) {
        if (
          addressArray[i].types[0] &&
          "administrative_area_level_1" === addressArray[i].types[0]
        ) {
          state = addressArray[i].short_name;
          return state;
        }
      }
    }
  };
  //review selectedPlace
  onChange = (event) => {
    event.preventDefault();
    this.props.onChange(this.state.data);
  };

  onInfoWindowOpen = (event) => {};

  onMarkerDragEnd = (event) => {
    let newLat = event.latLng.lat(),
      newLng = event.latLng.lng();
    Geocode.fromLatLng(newLat, newLng).then(
      (response) => {
        const address = response.results[0].formatted_address,
          addressArray = response.results[0].address_components,
          city = this.getCity(addressArray),
          area = this.getArea(addressArray),
          state = this.getState(addressArray);
        this.setState({
          address: address ? address : "",
          area: area ? area : "",
          city: city ? city : "",
          state: state ? state : "",
          markerPosition: {
            lat: newLat,
            lng: newLng,
            city: city,
            state: state,
          },
          mapPosition: {
            lat: newLat,
            lng: newLng,
          },
        });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  onPlaceSelected = (place) => {
    console.log("plc -> on selected", place);
    const city = place.address_components[0].long_name;
    const state = place.address_components[2].short_name;
    const address = place.formatted_address;

    this.getStoresByCityFromAPI(city, state);
    const { geometry } = place;
    if (geometry) {
      const { location } = place.geometry;
      if (location) {
        this.setState({
          mapCenter: {
            lat: location.lat(),
            lng: location.lng(),
          },
          markerPosition: {
            city: city,
            state: state,
            address: address,
          },
        });
      }
    }
  };
  onMarkerClick = (props, marker, e) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
      visibleInfoWindowId: true,
      markers: true,
    });
  };

  onClose = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        visibleInfoWindowId: false,
        showingInfoWindow: false,
        activeMarker: null,
        markers: null,
      });
    }
  };

  onMapClicked = (props) => {
    if (this.state.showingInfoWindow && this.state.visibleInfoWindowId) {
      this.setState({
        selectedPlace: props,
        showingInfoWindow: false,
        visibleInfoWindowId: false,
        activeMarker: null,
        markers: null,
      });
    }
  };

  createMarkers = () => {
    const { cityStores } = this.state;
    const isEmpty = Object.entries(cityStores).length === 0;
    if (!isEmpty) {
      const markers = cityStores.city.map((cs) => {
        return (
          <Marker
            key={`${cs.latitude}${cs.longitude}`}
            id={cs.ObjectId}
            name="SNAP store location"
            title={this.formatted_address}
            content=""
            position={{
              lat: cs.latitude,
              lng: cs.longitude,
            }}
            // onClick={() => this.onMarkerClick(cs.ObjectId)}
            onClick={() => this.setState({
              visibleInfoWindowId: cs.ObjectId},
            )}
          >
            <InfoWindow
              marker={this.state.createMarkers}
              onClose={this.onInfoWindowClose}
              visible={this.state.visibleInfoWindowId}
            >
              content={this.state.markers.address}
              <div>
                <h1>Details</h1>
              </div>
            </InfoWindow>

            <InfoWindow
              position={{
                lat: cs.latitude,
                lng: cs.longitude,
              }}
              visible={this.state.visibleInfoWindowId}
            ></InfoWindow>
          </Marker>
        );
      });
      return markers;
    }
  };
  render() {
    console.log("ML SLL state cityStores:", this.state.cityStores);
    return (
      <Map
        google={this.props.google}
        onReady={this.state.place}
        // style={{width: '100%', height: '100%', position: 'relative'}}
        className={"map"}
        zoom={13}
        initialCenter={{
          lat: this.state.mapCenter.lat,
          lng: this.state.mapCenter.lng,
        }}
        center={{
          lat: this.state.mapCenter.lat,
          lng: this.state.mapCenter.lng,
        }}
      >
        <Autocomplete
          input
          id="autocomplete"
          type="text"
          placeholder="Search"
          fields={[
            "address_components",
            "formatted_address",
            "place_id",
            "geometry",
            "name",
          ]}
          style={{
            width: "100%",
            height: "25px",
            paddingLeft: "16px",
            marginBottom: "100px",
          }}
          onPlaceSelected={this.onPlaceSelected}
          types={["(cities)"]}
          // input={value.toString()}
          value={this.state.input}
          componentRestrictions={{ country: "us" }}
          onChange={(e) => this.setState({ input: e.target.value })}
          onClick={(place, details = null) => {
            console.log("stores and details!!", place, details);
          }}
          terms={{
            key: "AIzaSyDPpPhiwe2nBilWB_ihli85BlyRID4DnpU",
            language: "en",
            input: "value",
          }}
        />
        {this.createMarkers()}
        {/*
        disable this marker if cs marker is in use 
        */}
        <Marker
          name="Current location"
          icon={{
            url:
              "https://cdn2.iconfinder.com/data/icons/IconsLandVistaMapMarkersIconsDemo/256/MapMarker_Marker_Outside_Chartreuse.png",
            scaledSize: new window.google.maps.Size(50, 50),
          }}
          onClick={this.onMarkerClick}
          position={{
            lat: this.state.mapCenter.lat,
            lng: this.state.mapCenter.lng,
          }}
        />
        <InfoWindow
          marker={this.state.activeMarker}
          onClose={this.onInfoWindowClose}
          visible={this.state.showingInfoWindow}
        >
          <div>
            <h1>{this.state.name}</h1>
          </div>
        </InfoWindow>
        <InfoWindow
          position={{
            lat: this.state.mapCenter.lat,
            lng: this.state.mapCenter.lng,
          }}
          visible={this.state.showingInfoWindow}
        >
          <small>
            Click on any of the markers to display an additional info.
          </small>
        </InfoWindow>
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyDPpPhiwe2nBilWB_ihli85BlyRID4DnpU",
})(MapContainer);
