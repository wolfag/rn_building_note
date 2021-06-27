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

// const imgPath =
// 'https://images.vexels.com/media/users/3/193297/isolated/lists/4752adfc1ac1732ee4ebb62297016c15-covid-19-cartoon-icon.png';
const imgPath =
  'https://wcs.smartdraw.com/floor-plan/img/achitectural-drawig-example.png?bn=15100111798';

const App = () => {
  const [imgSize, setImgSize] = useState({w: 200, h: 200});
  const [points, setPoints] = useState([]);
  const [layout, setLayout] = useState({});
  const [window, setWindow] = useState({width, height});
  const [moveData, setMoveData] = useState({
    positionX: 0,
    positionY: 0,
    zoomCurrentDistance: 0,
    scale: 1,
  });

  const timeout = useRef();
  const currentClick = useRef();

  console.log({imgSize});

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
            overflow: 'hidden',
          }}
          onLayout={e => {
            setLayout(e.nativeEvent.layout);
          }}>
          <ImageZoom
            onMove={e => {
              console.log({move: e});
              setMoveData(e);
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
            cropWidth={Math.max(Math.min(imgSize.w, width), width) - 40}
            cropHeight={Math.max(Math.min(imgSize.h, height), height) - 40}
            imageWidth={imgSize.w}
            imageHeight={imgSize.h}>
            <Image
              style={{width: imgSize.w, height: imgSize.h}}
              source={{
                uri: imgPath,
              }}
            />
          </ImageZoom>
          {points.map((p, i) => {
            return (
              <Draggable
                key={p.id}
                x={
                  p.x * moveData.scale -
                  ((imgSize.w * moveData.scale) / 2 - window.width / 2) -
                  PointSize +
                  moveData.positionX * moveData.scale
                }
                y={
                  p.y * moveData.scale -
                  ((imgSize.h * moveData.scale) / 2 - window.height / 2) -
                  PointSize +
                  moveData.positionY * moveData.scale
                }
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
        </View>
      </View>
    </SafeAreaView>
  );
};
export default App;
