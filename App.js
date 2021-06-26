/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState, useCallback, useRef} from 'react';
import {SafeAreaView, View, Image, Alert, Dimensions, Text} from 'react-native';
import Draggable from './src/components/Draggable';
import ImageZoom from 'react-native-image-pan-zoom';

const {width, height} = Dimensions.get('window');

const PointSize = 50;
const Scale = 1;

const imgPath =
  'https://wcs.smartdraw.com/floor-plan/img/achitectural-drawig-example.png?bn=15100111798';

const App = () => {
  const [imgSize, setImgSize] = useState({w: 200, h: 200});
  const [points, setPoints] = useState([]);
  const [layout, setLayout] = useState({});
  const [window, setWindow] = useState({width, height});
  const timeout = useRef();
  const currentClick = useRef();

  useEffect(() => {
    Image.getSize(imgPath, (w, h) => {
      setImgSize({w: w * Scale, h: h * Scale});
    });
  }, []);

  useEffect(() => {
    const orientationChange = e => {
      setWindow({width: e.window.width, height: e.window.height});
    };
    Dimensions.addEventListener('change', orientationChange);
    return () => {
      Dimensions.removeEventListener('change', orientationChange);
    };
  }, []);

  const addPoint = useCallback(() => {
    if (!currentClick.current) {
      return;
    }
    setPoints([
      ...points,
      {
        id: new Date().getTime(),
        x: currentClick.current.locationX + layout.x - PointSize / 2,
        y: currentClick.current.locationY + layout.y + PointSize / 2,
      },
    ]);
  }, [points, setPoints, layout, currentClick]);

  // console.log({imgSize, width});

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'yellow', padding: 20}}>
      <View
        onTouchStart={e => {
          currentClick.current = JSON.parse(
            JSON.stringify({
              locationX: e.nativeEvent.locationX,
              locationY: e.nativeEvent.locationY,
            }),
          );
          // timeout.current = setTimeout(() => {
          //   Alert.alert(
          //     'Add new marker',
          //     'Do you want to add new marker here?',
          //     [
          //       {
          //         text: 'Add',
          //         onPress: addPoint,
          //       },
          //       {
          //         text: 'Cancel',
          //         onPress: null,
          //         style: 'cancel',
          //       },
          //     ],
          //   );
          // }, 300);
        }}
        onTouchEnd={() => {
          if (timeout.current) {
            clearTimeout(timeout.current);
          }
        }}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            borderWidth: 2,
            borderColor: 'red',
          }}
          onLayout={e => {
            setLayout(e.nativeEvent.layout);
            // console.log({layout: e.nativeEvent});
          }}>
          {/* <Image
            source={{uri: imgPath}}
            style={{width: imgSize.w, height: imgSize.h}}
            resizeMode="cover"
            onLayout={e => {
              // console.log({l: e.nativeEvent.layout});
              // setLayout(e.nativeEvent.layout);
            }}
          /> */}
          <ImageZoom
            onMove={e => {
              console.log({move: e});
            }}
            onClick={e => {
              setPoints([
                ...points,
                {
                  id: new Date().getTime(),
                  x: e.locationX,
                  y: e.locationY,
                },
              ]);
            }}
            cropWidth={width}
            cropHeight={height}
            imageWidth={imgSize.w}
            imageHeight={imgSize.h}>
            <Image
              style={{width: imgSize.w, height: imgSize.h}}
              source={{
                uri: imgPath,
              }}
            />
          </ImageZoom>
        </View>
      </View>
      {points.map((p, i) => {
        return (
          <Draggable
            key={p.id}
            x={p.x - (imgSize.w / 2 - window.width / 2) - PointSize / 2}
            y={p.y - (imgSize.h / 2 - window.height / 2) - PointSize / 2}
            renderSize={PointSize}
            renderColor="black"
            renderText={`${i}`}
            isCircle
            onPress={() => alert('touched!!')}
            onPressOut={e => {
              console.log({e: e.nativeEvent});
            }}
          />
        );
      })}
      <Draggable
        x={0}
        y={0}
        renderSize={56}
        renderColor="black"
        renderText="0"
        isCircle
        onPress={() => alert('touched!!')}
        onPressOut={e => {
          console.log({e: e.nativeEvent});
        }}
      />
      <Draggable
        x={width - PointSize}
        y={height - PointSize}
        renderSize={56}
        renderColor="black"
        renderText="max"
        isCircle
        onPress={() => alert('touched!!')}
        onPressOut={e => {
          console.log({e: e.nativeEvent});
        }}
      />
    </SafeAreaView>
  );
};
export default App;
