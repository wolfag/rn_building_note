/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {SafeAreaView} from 'react-native';

import Canvas from './src/components/Canvas';
const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <Canvas />
    </SafeAreaView>
  );
};
export default App;
