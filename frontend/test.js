import React from "react";
import { Text, View, TouchableOpacity, FlatList } from "react-native";
import { Camera, Permissions, ImageManipulator } from "expo";

const Clarifai = require("clarifai");

const clarifai = new Clarifai.App({
  apiKey: "YOUR_API_KEY"
});
process.nextTick = setImmediate;

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    predictions: []
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }
  capturePhoto = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      return photo.uri;
    }
  };
  resize = async photo => {
    let manipulatedImage = await ImageManipulator.manipulate(
      photo,
      [{ resize: { height: 300, width: 300 } }],
      { base64: true }
    );
    return manipulatedImage.base64;
  };
  predict = async image => {
    let predictions = await clarifai.models.predict(
      Clarifai.GENERAL_MODEL,
      image
    );
    return predictions;
  };
  objectDetection = async () => {
    let photo = await this.capturePhoto();
    let resized = await this.resize(photo);
    let predictions = await this.predict(resized);
    this.setState({ predictions: predictions.outputs[0].data.concepts });
  };

  render() {
    const { hasCameraPermission, predictions } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "column",
                justifyContent: "flex-end"
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignSelf: "flex-start",
                  alignItems: "center"
                }}
              >
                <FlatList
                  data={predictions.map(prediction => ({
                    key: `${prediction.name} ${prediction.value}`
                  }))}
                  renderItem={({ item }) => (
                    <Text
                      style={{ paddingLeft: 15, color: "white", fontSize: 20 }}
                    >
                      {item.key}
                    </Text>
                  )}
                />
              </View>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignItems: "center",
                  backgroundColor: "blue",
                  height: "10%"
                }}
                onPress={this.objectDetection}
              >
                <Text style={{ fontSize: 30, color: "white", padding: 15 }}>
                  {" "}
                  Detect Objects{" "}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type}>
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            flexDirection: "row"
          }}
        >
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: "flex-end",
              alignItems: "center"
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10, color: "white" }}>
              {" "}
              Flip{" "}
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

class CameraComponent extends Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text> No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            style={{ flex: 1, justifyContent: "space-between" }}
            type={this.state.type}
          >
            <Header
              searchBar
              rounded
              style={{
                position: "absolute",
                backgroundColor: "transparent",
                left: 0,
                top: 0,
                right: 0,
                zIndex: 100,
                alignItems: "center"
              }}
            >
              <View style={{ flexDirection: "row", flex: 4 }}>
                <Ionicons name="md-camera" style={{ color: "white" }} />
                <Item style={{ backgroundColor: "transparent" }}>
                  <Icon
                    name="ios-search"
                    style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                  ></Icon>
                </Item>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flex: 2,
                  justifyContent: "space-around"
                }}
              >
                <Icon
                  name="ios-flash"
                  style={{ color: "white", fontWeight: "bold" }}
                />
                <Icon
                  onPress={() => {
                    this.setState({
                      type:
                        this.state.type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back
                    });
                  }}
                  name="ios-reverse-camera"
                  style={{ color: "white", fontWeight: "bold" }}
                />
              </View>
            </Header>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 30,
                marginBottom: 15,
                alignItems: "flex-end"
              }}
            >
              <Ionicons
                name="ios-map"
                style={{ color: "white", fontSize: 36 }}
              ></Ionicons>
              <View></View>
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="circle-outline" // This is the icon which should take and save image
                  style={{ color: "white", fontSize: 100 }}
                ></MaterialCommunityIcons>
                <Icon
                  name="ios-images"
                  style={{ color: "white", fontSize: 36 }}
                />
              </View>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

export default CameraComponent;
