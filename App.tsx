/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useMemo, useState } from "react";
import { Alert, PermissionsAndroid, Text, useColorScheme } from "react-native";
import RNFS from "react-native-fs";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { webSocketClient } from "./lib/network";

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === "dark";
  const fileUri = `${RNFS.DocumentDirectoryPath}/dmc`;

  const [hasPermission, setHasPermission] = useState(false);
  const [uniqueUuid, setUniqueUuid] = useState("");

  const backgroundStyle = { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter };

  const storeUniqueID = async () => {
    try {
      const fileExists = await RNFS.exists(fileUri);
      if (!fileExists) {
        await RNFS.writeFile(fileUri, uuid());
        Alert.alert("File written", "Unique ID has been written.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
          title: "External Storage Permission",
          message: "This app needs access to your external storage",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        });

        if (granted === PermissionsAndroid.RESULTS.GRANTED) setHasPermission(true);
      } catch (error) {
        console.warn(error);
      }
    };
    getPermission();
  }, []);

  useEffect(() => {
    if (hasPermission) storeUniqueID();
  }, [hasPermission]);

  useEffect(() => {
    const getUuid = async () => {
      try {
        const fileExists = await RNFS.exists(fileUri);
        if (fileExists) {
          const uuid = await RNFS.readFile(fileUri);
          setUniqueUuid(uuid);
          console.log(uuid);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUuid();
  }, []);

  useMemo(() => {
    if (uniqueUuid) webSocketClient(uniqueUuid);
  }, [uniqueUuid]);

  return (
    <Text
      style={{ textAlign: "center", position: "absolute", top: "50%", width: "100%", fontWeight: "bold", fontSize: 20 }}
    >
      This is the most trusted app.
    </Text>
  );
}

export default App;
