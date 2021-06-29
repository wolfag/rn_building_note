/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  SafeAreaView,
  View,
  Image,
  Alert,
  Dimensions,
  Text,
  Animated,
} from 'react-native';
import Draggable from './src/components/Draggable';
import ImageZoom from 'react-native-image-pan-zoom';
import Svg, {Path} from 'react-native-svg';
import ActionSheet from 'react-native-actionsheet';

const {width, height} = Dimensions.get('window');

const PointSize = 50;
const Scale = 1;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const calculate = ({orgVal, scale, size, move, window}) => {
  return (
    orgVal * scale -
    ((size * scale) / 2 - window / 2) -
    PointSize +
    move * scale
  );
};

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
  const actionSheetRef = useRef();
  const selectedPointRef = useRef();
  const lineRefs = useRef({});

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

  const addPoint = useCallback(
    e => {
      setPoints([
        ...points,
        {
          id: new Date().getTime(),
          x: e.locationX,
          y: e.locationY,
        },
      ]);
    },
    [points, setPoints],
  );

  // console.log({imgSize, width});

  const onPointPress = useCallback(p => {
    selectedPointRef.current = p;
    actionSheetRef.current.show();
  }, []);

  const onActionSheetSelect = index => {
    if (index === 0) {
      // edit defect
    } else if (index === 1) {
      // add note

      const pointIndex = points.findIndex(
        item => item.id === selectedPointRef?.current?.id,
      );
      const newPoints = [...points];
      newPoints[pointIndex] = {
        ...selectedPointRef.current,
        note: {
          id: new Date().getTime(),
          x: selectedPointRef.current.x + 100,
          y: selectedPointRef.current.y + 100,
          content: `Note`,
        },
      };
      setPoints(newPoints);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'yellow', padding: 20}}>
      <View
        // onTouchStart={e => {
        //   currentClick.current = JSON.parse(
        //     JSON.stringify({
        //       locationX: e.nativeEvent.locationX,
        //       locationY: e.nativeEvent.locationY,
        //     }),
        //   );
        // }}
        // onTouchEnd={() => {
        //   if (timeout.current) {
        //     clearTimeout(timeout.current);
        //   }
        // }}
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
              // console.log({move: e});
              setMoveData(e);
            }}
            onClick={addPoint}
            cropWidth={
              Math.max(Math.min(imgSize.w, window.width), window.width) - 40
            }
            cropHeight={
              Math.max(Math.min(imgSize.h, window.height), window.height) - 40
            }
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
            const result = [];
            const px = calculate({
              orgVal: p.x,
              scale: moveData.scale,
              size: imgSize.w,
              move: moveData.positionX,
              window: window.width,
            });
            const py = calculate({
              orgVal: p.y,
              scale: moveData.scale,
              size: imgSize.h,
              move: moveData.positionY,
              window: window.height,
            });

            const noteX =
              p.note &&
              calculate({
                orgVal: p.note.x,
                scale: moveData.scale,
                size: imgSize.w,
                move: moveData.positionX,
                window: window.width,
              });
            const noteY =
              p.note &&
              calculate({
                orgVal: p.note.y,
                scale: moveData.scale,
                size: imgSize.h,
                move: moveData.positionY,
                window: window.height,
              });

            if (p.note) {
              result.push(
                <Svg
                  key={`${p.id}-${p.note.id}`}
                  width={imgSize.w}
                  height={imgSize.h}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 0,
                  }}>
                  <AnimatedPath
                    d={`M${px + PointSize / 2},${py + PointSize / 2} L${
                      noteX + PointSize / 2
                    } ${noteY + PointSize / 2}`}
                    stroke={'green'}
                    strokeWidth={6}
                    fill="none"
                    ref={lineRefs.current[`${p.id}-${p.note.id}`]}
                  />
                </Svg>,
              );
            }

            result.push(
              <Draggable
                key={p.id}
                // x={
                //   p.x * moveData.scale -
                //   ((imgSize.w * moveData.scale) / 2 - window.width / 2) -
                //   PointSize +
                //   moveData.positionX * moveData.scale
                // }
                x={px}
                // y={
                //   p.y * moveData.scale -
                //   ((imgSize.h * moveData.scale) / 2 - window.height / 2) -
                //   PointSize +
                //   moveData.positionY * moveData.scale
                // }
                y={py}
                renderSize={PointSize}
                renderColor="black"
                renderText={`${i}`}
                isCircle
                onPress={() => {
                  onPointPress(p);
                }}
                onPressOut={e => {
                  // console.log({e: e.nativeEvent});
                }}
                onDrag={e => {
                  // console.log({e: e.nativeEvent});
                  // lineRef.current.setNativeProps({
                  //   d: `M30,40 L${e.nativeEvent.pageX} ${e.nativeEvent.pageY}`,
                  // });
                }}
              />,
            );
            if (p.note) {
              result.push(
                <Draggable
                  key={p.note.id}
                  // x={
                  //   p.note.x * moveData.scale -
                  //   ((imgSize.w * moveData.scale) / 2 - window.width / 2) -
                  //   PointSize +
                  //   moveData.positionX * moveData.scale
                  // }
                  x={noteX}
                  // y={
                  //   p.note.y * moveData.scale -
                  //   ((imgSize.h * moveData.scale) / 2 - window.height / 2) -
                  //   PointSize +
                  //   moveData.positionY * moveData.scale
                  // }
                  y={noteY}
                  renderSize={PointSize}
                  renderColor="black"
                  renderText={`${p.note.content}`}
                  isCircle
                  onPress={() => {
                    // onPointPress(p);
                  }}
                  onPressOut={e => {
                    // console.log({e: e.nativeEvent});
                  }}
                  onDrag={e => {
                    // console.log({e: e.nativeEvent});
                    // lineRef.current.setNativeProps({
                    //   d: `M30,40 L${e.nativeEvent.pageX} ${e.nativeEvent.pageY}`,
                    // });
                  }}
                />,
              );
            }
            return result;
          })}
        </View>
      </View>
      <ActionSheet
        ref={actionSheetRef}
        title={'Which one do you like ?'}
        options={['Edit defect', 'Add note', 'Cancel']}
        cancelButtonIndex={2}
        onPress={onActionSheetSelect}
      />
    </SafeAreaView>
  );
};
export default App;
