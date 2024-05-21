/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  Alert,
  PermissionsAndroid,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {webSocketClient} from './lib/network';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const fileUri = `${RNFS.DocumentDirectoryPath}/dmc`;

  const [hasPermission, setHasPermission] = useState(false);
  const [uniqueUuid, setUniqueUuid] = useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const storeUniqueID = async () => {
    try {
      const fileExists = await RNFS.exists(fileUri);
      if (!fileExists) {
        await RNFS.writeFile(fileUri, uuid());
        Alert.alert('File written', 'The file dmc has been written.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'External Storage Permission',
            message: 'This app needs access to your external storage',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED)
          setHasPermission(true);
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
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
