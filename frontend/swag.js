import React, { Component } from "react";
import {
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import axios from "axios";
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPermission: null,
      type: Camera.Constants.Type.back,
      predictions: [],
      nutInfo: {},
      identifedAs: "",
      loading: false
    };
    this.getNutInfo = this.getNutInfo.bind(this);
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === "granted" });
  }
  takePicture = async function() {
    if (this.camera) {
      // Pause the camera's preview
      this.camera.pausePreview();
      console.warn("start");
      // Set the activity indicator
      this.setState((previousState, props) => ({
        loading: true
      }));

      // Set options
      const options = {
        base64: true
      };

      // Get the base64 version of the image
      const data = await this.camera.takePictureAsync(options);

      // Get the identified image
      this.identifyImage(data.base64);
    } else {
      this.camera.pausePreview();
    }
  };
  identifyImage(imageData) {
    console.warn("image rec");
    // Initialise Clarifai api
    const Clarifai = require("clarifai");

    const app = new Clarifai.App({
      apiKey: "334d8689506f484faeb4ce66a15c84e1"
    });
    console.warn("apireg");
    // Identify the image

    app.models
      .predict(Clarifai.FOOD_MODEL, { base64: imageData })
      .then(response =>
        this.displayAnswer(
          response.outputs[0].data.concepts[0].name
        ).catch(err => alert(err))
      );
  }

  displayAnswer(identifiedImage) {
    // Dismiss the acitivty indicator
    console.warn(identifiedImage);
    // this.getNutInfo(identifiedImage);
    this.setState((previousState, props) => ({
      identifedAs: identifiedImage,
      loading: false
    }));

    // Show an alert with the answer on
    Alert.alert(this.state.nutInfo, "", { cancelable: false });

    // Resume the preview
    this.camera.resumePreview();
  }
  getNutInfo(input) {
    var nuts = {};
    // var fat = "";
    // var satFat = "";
    // var transFat = "";
    // var cholesterol = "";
    // var carbohydrates = "";
    // var fiber = "";
    // var sugars = "";
    // var protein = "";
    // var calcium = "";
    // var iron = "";
    // var potassium = "";
    // var calories = "";
    // var portion = "";
    console.warn("started");
    let getId = function() {
      return new Promise(function(resolve, reject) {
        axios
          .get(
            "https://api.nal.usda.gov/fdc/v1/search?api_key=r1cp9Tfs8GhQENWYJuXzRHMhHdB5Badyi6fgkIfE&generalSearchInput=" +
              input +
              "&requireAllWords=true"
          )

          .then(function(response) {
            // handle success
            id = "" + response.data.foods[0].fdcId;

            //console.log(response.data.foods[0].fdcId);
          })
          .catch(function(error) {
            // handle error
            console.log(error);
          })
          .finally(function() {
            resolve(id);
          });
      });
    };

    let getNut = function(id) {
      return new Promise(function(resolve, reject) {
        axios
          .get(
            "https://api.nal.usda.gov/fdc/v1/" +
              id +
              "?api_key=r1cp9Tfs8GhQENWYJuXzRHMhHdB5Badyi6fgkIfE"
          )
          .then(function(response) {
            // handle success
            // portion = response.data.servingSize + response.data.servingSizeUnit;
            // fat = response.data.labelNutrients.fat.value;
            // satFat = response.data.labelNutrients.satFat.value;
            // transFat = response.data.labelNutrients.transFat.value;
            // cholesterol = response.data.labelNutrients.cholesterol.value;
            // carbohydrates = response.data.labelNutrients.carbohydrates.value;
            // fiber = response.data.labelNutrients.fiber.value;
            // sugars = response.data.labelNutrients.sugars.value;
            // protein = response.data.labelNutrients.protein.value;
            // calcium = response.data.labelNutrients.calcium.value;
            // iron = response.data.labelNutrients.iron.value;
            // potassium = response.data.labelNutrients.potassium.value;
            // calories = response.data.labelNutrients.calories.value;
            // nuts = {
            //   portion: portion,
            //   fat: fat,
            //   satFat: satFat,
            //   transFat: transFat,
            //   cholesterol: cholesterol,
            //   carbohydrates: carbohydrates,
            //   fiber: fiber,
            //   sugars: sugars,
            //   protein: protein,
            //   calcium: calcium,
            //   iron: iron,
            //   potassium: potassium,
            //   calories: calories
            // };
            nuts = {
              portion:
                response.data.servingSize + response.data.servingSizeUnit,
              fat: response.data.labelNutrients.fat.value,
              satFat: response.data.labelNutrients.satFat.value,
              transFat: response.data.labelNutrients.transFat.value,
              cholesterol: response.data.labelNutrients.cholesterol.value,
              carbohydrates: response.data.labelNutrients.carbohydrates.value,
              fiber: response.data.labelNutrients.fiber.value,
              sugars: response.data.labelNutrients.sugars.value,
              protein: response.data.labelNutrients.protein.value,
              calcium: response.data.labelNutrients.calcium.value,
              iron: response.data.labelNutrients.iron.value,
              potassium: response.data.labelNutrients.potassium.value,
              calories: response.data.labelNutrients.calories.value
            };
            // nuts = [
            //   response.data.labelNutrients.calories.value,
            //   response.data.labelNutrients.fat.value,
            //   response.data.labelNutrients.satFat.value,
            //   response.data.labelNutrients.transFat.value,
            //   response.data.labelNutrients.cholesterol.value,
            //   response.data.labelNutrients.carbohydrates.value,
            //   response.data.labelNutrients.fiber.value,
            //   response.data.labelNutrients.sugars.value,
            //   response.data.labelNutrients.protein.value,
            //   response.data.labelNutrients.calcium.value,
            //   response.data.labelNutrients.iron.value,
            //   response.data.labelNutrients.potassium.value,
            //   response.data.labelNutrients.calories.value
            // ];
          })

          .catch(function(error) {
            // handle error
            console.log(error);
          })

          .finally(function() {
            resolve(nuts);
          });
      });
    };
    getId(input)
      .then(id => {
        return getNut(id);
      })
      .then(nuts => {
        console.warn(nuts);
        return this.setState((previousState, props) => ({
          nutInfo: nuts
        }));
      });
  }

  handleCameraType = () => {
    const { cameraType } = this.state;

    this.setState({
      cameraType:
        cameraType === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
    });
  };
  render() {
    if (this.hasPermission === null) {
      return <View />;
    } else if (this.hasPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <FontAwesome name="camera" style={{ color: "#fff", fontSize: 40 }} />
          <Camera
            style={{ flex: 1 }}
            type={this.state.cameraType}
            ref={ref => {
              this.camera = ref;
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "column",
                justifyContent: "flex-end"
              }}
            >
              <ActivityIndicator
                size="large"
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
                color="#fff"
                animating={this.state.loading}
              />
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 20
              }}
            >
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  alignItems: "center",
                  backgroundColor: "transparent"
                }}
              >
                <Ionicons
                  name="ios-photos"
                  style={{ color: "#fff", fontSize: 40 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  alignItems: "center",
                  backgroundColor: "transparent"
                }}
                onPress={() => this.takePicture()}
              >
                <FontAwesome
                  name="camera"
                  style={{ color: "#fff", fontSize: 40 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  alignItems: "center",
                  backgroundColor: "transparent"
                }}
                onPress={() => this.handleCameraType()}
              >
                <MaterialCommunityIcons
                  name="camera-switch"
                  style={{ color: "#fff", fontSize: 40 }}
                />
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
