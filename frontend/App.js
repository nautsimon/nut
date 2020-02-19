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
      modalPort: false,
      loading: false,
      modalCheck: false
    };

    this.modalNotVisible = this.modalNotVisible.bind(this);
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === "granted" });
  }
  takePicture = async function() {
    if (this.camera) {
      this.camera.resumePreview();
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
          })
          .finally(function() {
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
            if (typeof response.data.labelNutrients !== "undefined") {
              if (
                typeof response.data.labelNutrients.calories !== "undefined"
              ) {
                calories = response.data.labelNutrients.calories.value;
                // console.warn("calories", calories);
              }
              if (typeof response.data.labelNutrients.fat !== "undefined") {
                fat = response.data.labelNutrients.fat.value;
                // console.warn("fat", typeof fat);
              }
              if (typeof response.data.labelNutrients.sodium !== "undefined") {
                sodium = response.data.labelNutrients.sodium.value;
                // console.warn("sodium", typeof sodium);
              }
              if (typeof response.data.labelNutrients.protein !== "undefined") {
                protein = response.data.labelNutrients.protein.value;
                // console.warn("protein", typeof protein);
              }
              if (
                typeof response.data.labelNutrients.saturatedFat !== "undefined"
              ) {
                satFat = response.data.labelNutrients.satFat.value;
                // console.warn("satFat", satFat);
              }
              if (typeof response.data.labelNutrients.fiber !== "undefined") {
                fiber = response.data.labelNutrients.fiber.value;
                // console.warn("fiber", fiber);
              }
              if (typeof response.data.labelNutrients.calcium !== "undefined") {
                calcium = response.data.labelNutrients.calcium.value;
                // console.warn("calcium", calcium);
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
            console.log(error);
          })

          .finally(function() {
            // console.warn(takeAnother, calories, sodium);
            if (takeAnother) {
              var temp = "damn";
              Alert.alert("retake picture", "", { cancelable: false });
              resolve(temp);
              // this.camera.resumePreview().then(() => {
              //   resolve(temp);
              // });
            } else {
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
        if (temp === "damn") {
          return this.modalNotVisible();
        } else {
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
        }
      });
  }

  modalNotVisible() {
    this.camera.resumePreview();
    this.setState((previousState, props) => ({
      modalVisible: false,
      loading: false,
      modalPort: false,
      modalCheck: false
    }));
  }
  modalSwitch() {
    this.camera.resumePreview();
    this.setState((previousState, props) => ({
      modalVisible: false,
      loading: false,
      modalPort: true,
      modalCheck: false
    }));
  }
  handleEating(portion) {
    var calories = this.state.calories * portion;
    var fat = this.state.fat * portion;
    var sodium = this.state.sodium * portion;
    var protein = this.state.protein * portion;
    var satFat = this.state.satFat * portion;
    var fiber = this.state.fiber * portion;
    var calcium = this.state.calcium * portion;

    let sendData = function(input) {
      return new Promise(function(resolve, reject) {
        // var data = querystring.stringify({
        //   params: JSON.stringify({
        //     calories: calories,
        //     fat: fat,
        //     sodium: sodium,
        //     protein: protein,
        //     satFat: satFat,
        //     fiber: fiber,
        //     calcium: calcium
        //   })
        // });
        // axios
        //   .post("http://nutr-268322.appspot.com/update/", data)
        axios
          .post("http://nutr-268322.appspot.com/update/", {
            calories: calories,
            fat: fat,
            sodium: sodium,
            protein: protein,
            satFat: satFat,
            fiber: fiber,
            calcium: calcium
          })

          .then(function(response) {
            // handle success
          })
          .catch(function(error) {
            // handle error
          })
          .finally(function() {
            resolve("swag");
          });
      });
    };

    sendData().then(() => {
      return this.setState((previousState, props) => ({
        modalPort: false
      }));
    });
  }

  handleCheck() {
    var temp = [];
    let getData = function(input) {
      return new Promise(function(resolve, reject) {
        axios
          .get("http://nutr-268322.appspot.com/get/")
          .then(function(response) {
            temp = [
              response.data.calories,
              response.data.fat,
              response.data.sodium,
              response.data.protein,
              response.data.satFat,
              response.data.fiber,
              response.data.calcium
            ];

            //console.log(response.data.foods[0].fdcId);
          })
          .catch(function(error) {
            // handle error
            console.warn(error);
          })
          .finally(function() {
            resolve(temp);
          });
      });
    };

    getData().then(temp => {
      return this.setState({
        calories: temp[0],
        fat: temp[1],
        sodium: temp[2],
        protein: temp[3],
        satFat: temp[4],
        fiber: temp[5],
        calcium: temp[6],
        modalCheck: true
      });
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
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modalCheck}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(25, 209, 252, 0.7)"
                }}
              >
                <View
                  style={{
                    width: 300,
                    height: 500
                  }}
                >
                  <Text>YOUR INTAKE FOR TODAY</Text>
                  <Text>Calories: {this.state.calories}</Text>
                  <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                    You need {2000 - this.state.calories} more calories to reach
                    your daily intake
                  </Text>
                  <Text>Fat: {this.state.fat} g</Text>
                  <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                    You need {52 - this.state.fat} g more calories to reach your
                    daily intake
                  </Text>
                  <Text>Sodium: {this.state.sodium} mg</Text>
                  <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                    You need {3400 - this.state.sodium} mg more calories to
                    reach your daily intake
                  </Text>

                  <Text>Protein: {this.state.protein} g</Text>
                  <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                    You need {56 - this.state.protein} g more calories to reach
                    your daily intake
                  </Text>
                  <Text>Saturated Fat: {this.state.satFat} g</Text>
                  <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                    You need {13 - this.state.satFat} g more calories to reach
                    your daily intake
                  </Text>
                  <Text>Fiber: {this.state.fiber} g</Text>
                  <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                    You need {27 - this.state.fiber} g more calories to reach
                    your daily intake
                  </Text>
                  <Text>Calcium: {this.state.calcium} mg</Text>
                  <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                    You need {1000 - this.state.calcium} mg more calories to
                    reach your daily intake
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between"
                    }}
                  >
                    <TouchableHighlight
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 3,
                        marginTop: 15,
                        width: 300,
                        backgroundColor: "rgba(57, 143, 198, 0.7)"
                      }}
                      onPress={() => this.modalNotVisible()}
                    >
                      <Text
                        style={{
                          padding: 10
                        }}
                      >
                        Cool
                      </Text>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            </Modal>
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
                  alignItems: "center",
                  backgroundColor: "rgba(25, 209, 252, 0.7)"
                }}
              >
                <View
                  style={{
                    width: 300,
                    height: 300
                  }}
                >
                  <Text>Food: {this.state.identifedAs}</Text>
                  <Text>Calories: {this.state.calories}</Text>
                  <Text>Fat: {this.state.fat} g</Text>
                  <Text>Sodium: {this.state.sodium} mg</Text>
                  <Text>Protein: {this.state.protein} g</Text>
                  <Text>Saturated Fat: {this.state.satFat} g</Text>
                  <Text>Fiber: {this.state.fiber} g</Text>
                  <Text>Calcium: {this.state.calcium} mg</Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between"
                    }}
                  >
                    <TouchableHighlight
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 3,
                        marginTop: 15,
                        backgroundColor: "rgba(57, 143, 198, 0.7)"
                      }}
                      onPress={() => this.modalNotVisible()}
                    >
                      <Text
                        style={{
                          padding: 10
                        }}
                      >
                        Cool, not eatin this
                      </Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 3,
                        marginTop: 15,

                        backgroundColor: "rgba(57, 143, 198, 0.7)"
                      }}
                      onPress={() => this.modalSwitch()}
                    >
                      <Text
                        style={{
                          padding: 10
                        }}
                      >
                        Nice, im eating this
                      </Text>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            </Modal>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modalPort}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(25, 209, 252, 0.7)"
                }}
              >
                <View
                  style={{
                    width: 300,
                    height: 300
                  }}
                >
                  <Text>Number of Servings</Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between"
                    }}
                  >
                    <TouchableHighlight
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 7,
                        marginTop: 7,
                        width: 90,
                        height: 90,
                        backgroundColor: "rgba(57, 143, 198, 0.7)"
                      }}
                      onPress={() => this.handleEating(1)}
                    >
                      <Text
                        style={{
                          padding: 10
                        }}
                      >
                        1
                      </Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 7,
                        marginTop: 7,
                        width: 90,
                        height: 90,
                        backgroundColor: "rgba(57, 143, 198, 0.7)"
                      }}
                      onPress={() => this.handleEating(2)}
                    >
                      <Text
                        style={{
                          padding: 10
                        }}
                      >
                        2
                      </Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 7,
                        marginTop: 7,
                        width: 90,
                        height: 90,
                        backgroundColor: "rgba(57, 143, 198, 0.7)"
                      }}
                      onPress={() => this.handleEating(3)}
                    >
                      <Text
                        style={{
                          padding: 10
                        }}
                      >
                        3
                      </Text>
                    </TouchableHighlight>
                  </View>
                  <TouchableHighlight
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      margin: 3,
                      marginTop: 15,
                      width: 300,
                      backgroundColor: "rgba(57, 143, 198, 0.7)"
                    }}
                    onPress={() => this.modalNotVisible()}
                  >
                    <Text
                      style={{
                        padding: 10
                      }}
                    >
                      Cancel
                    </Text>
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
                onPress={() => this.handleCheck()}
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
