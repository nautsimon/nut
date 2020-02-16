import React, { Component } from "react";
import {
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableHighlight
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
      modalVisible: false,
      identifedAs: "",
      takeAnother: false,
      calories: "",
      fat: "",
      sodium: "",
      protein: "",
      satFat: "",
      fiber: "",
      calcium: "",
      loading: false
    };

    this.modalNotVisible = this.modalNotVisible.bind(this);
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === "granted" });
  }
  takePicture = async function() {
    if (this.camera) {
      // Pause the camera's preview
      this.camera.pausePreview();

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
    // Initialise Clarifai api
    const Clarifai = require("clarifai");

    const app = new Clarifai.App({
      apiKey: "334d8689506f484faeb4ce66a15c84e1"
    });

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
    let getId = function(input) {
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
            console.warn(error);
          })
          .finally(function() {
            console.warn(id);
            resolve(id);
          });
      });
    };

    let getNut = function(id) {
      var calories = "0";
      var fat = "0";
      var sodium = "0";
      var protein = "0";
      var satFat = "0";
      var fiber = "0";
      var calcium = "0";
      var takeAnother = false;
      return new Promise(function(resolve, reject) {
        axios
          .get(
            "https://api.nal.usda.gov/fdc/v1/" +
              id +
              "?api_key=r1cp9Tfs8GhQENWYJuXzRHMhHdB5Badyi6fgkIfE"
          )
          .then(function(response) {
            if (typeof response.data.labelNutrients === "object") {
              if (typeof response.data.labelNutrients.calories === "object") {
                calories = response.data.labelNutrients.calories.value;
                console.warn("calories", calories);
              }
              if (typeof response.data.labelNutrients.fat === "object") {
                fat = response.data.labelNutrients.fat.value;
                console.warn("fat", typeof fat);
              }
              if (typeof response.data.labelNutrients.sodium === "object") {
                sodium = response.data.labelNutrients.sodium.value;
                console.warn("sodium", typeof sodium);
              }
              if (typeof response.data.labelNutrients.protein === "object") {
                protein = response.data.labelNutrients.protein.value;
                console.warn("protein", typeof protein);
              }
              if (
                typeof response.data.labelNutrients.saturatedFat === "object"
              ) {
                satFat = response.data.labelNutrients.satFat.value;
                console.warn("satFat", satFat);
              }
              if (typeof response.data.labelNutrients.fiber === "object") {
                fiber = response.data.labelNutrients.fiber.value;
                console.warn("fiber", fiber);
              }
              if (typeof response.data.labelNutrients.calcium === "object") {
                calcium = response.data.labelNutrients.calcium.value;
                console.warn("calcium", calcium);
              }

              // console.warn(Object.keys(response.data.labelNutrients));
              // console.warn(Object.values(response.data.labelNutrients));
              // keys = Object.keys(response.data.labelNutrients);
              // data = Object.values(response.data.labelNutrients);
              // if  ()
            }
            // handle success if statement if typeof is object then do alert to say take pic again
            else {
              takeAnother = true;
            }
          })

          .catch(function(error) {
            // handle error
            console.warn(error);
          })

          .finally(function() {
            console.warn(takeAnother, calories, sodium);
            if (takeAnother) {
              Alert.alert("retake picture", "", { cancelable: false });
              this.camera.resumePreview();
              this.setState((previousState, props) => ({
                takeAnother: "takeAnother",
                loading: false
              }));
            } else {
              console.warn(
                calories,
                fat,
                sodium,
                protein,
                satFat,
                fiber,
                calcium
              );
              var temp = [
                calories,
                fat,
                sodium,
                protein,
                satFat,
                fiber,
                calcium
              ];
              resolve(temp);
            }
          });
      });
    };

    getId(identifiedImage)
      .then(id => {
        return getNut(id);
      })
      .then(temp => {
        console.warn(temp);
        return this.setState({
          calories: temp[0],
          fat: temp[1],
          sodium: temp[2],
          protein: temp[3],
          satFat: temp[4],
          fiber: temp[5],
          calcium: temp[6],
          identifedAs: identifiedImage,
          loading: false,
          modalVisible: true
        });
      });
  }
  // Dismiss the acitivty indicator
  //   this.getNutInfo(identifiedImage);
  //   this.setState((previousState, props) => ({
  //     identifedAs: identifiedImage,
  //     loading: false,
  //     modalVisible: true
  //   }));
  // }

  modalNotVisible() {
    this.camera.resumePreview();
    this.setState((previousState, props) => ({
      modalVisible: false
    }));
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
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modalVisible}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <View
                  style={{
                    width: 300,
                    height: 300
                  }}
                >
                  <Text>Calories: {this.state.calories}</Text>
                  <Text>Fat: {this.state.fat}</Text>
                  <Text>Sodium: {this.state.sodium}</Text>
                  <Text>Protein: {this.state.protein}</Text>
                  <Text>Saturated Fat: {this.state.satFat}</Text>
                  <Text>Fiber: {this.state.fiber}</Text>
                  <Text>Calcium: {this.state.calcium}</Text>
                  <TouchableHighlight onPress={() => this.modalNotVisible()}>
                    <Text>Close</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </Modal>

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
