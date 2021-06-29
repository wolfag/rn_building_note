import React, {useRef, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

export default function Draggable(props) {
  const {
    renderText,
    isCircle,
    renderSize,
    imageSource,
    renderColor,
    children,
    shouldReverse,
    onReverse,
    disabled,
    animatedViewProps,
    touchableOpacityProps,
    onDrag,
    onPress,
    onDragRelease,
    onLongPress,
    onPressIn,
    onPressOut,
    onRelease,
    x,
    y,
    z,
    minX,
    minY,
    maxX,
    maxY,
  } = props;

  const pan = useRef(new Animated.ValueXY());

  const offsetFromStart = useRef({x: 0, y: 0});

  const childSize = useRef({x: renderSize, y: renderSize});

  const startBounds = useRef();

  const isDragging = useRef(false);

  const getBounds = useCallback(() => {
    const left = x + offsetFromStart.current.x;
    const top = y + offsetFromStart.current.y;
    return {
      left,
      top,
      right: left + childSize.current.x,
      bottom: top + childSize.current.y,
    };
  }, [x, y]);

  const shouldStartDrag = useCallback(
    gestureState => {
      return (
        !disabled &&
        (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2)
      );
    },
    [disabled],
  );

  const reversePosition = useCallback(() => {
    const originalOffset = {x: 0, y: 0};
    const newOffset = onReverse ? onReverse() : originalOffset;
    Animated.spring(pan.current, {
      toValue: newOffset || originalOffset,
      useNativeDriver: false,
    }).start();
  }, [pan, onReverse]);

  const onPanResponderRelease = useCallback(
    (e, gestureState) => {
      isDragging.current = false;
      if (onDragRelease) {
        onDragRelease(e, getBounds());
        onRelease(e, true);
      }
      if (shouldReverse) {
        reversePosition();
      } else {
        pan.current.flattenOffset();
      }
    },
    [onDragRelease, shouldReverse, onRelease, reversePosition, getBounds],
  );

  const onPanResponderGrant = useCallback(
    (e, gestureState) => {
      startBounds.current = getBounds();
      isDragging.current = true;
      if (!shouldReverse) {
        pan.current.setOffset(offsetFromStart.current);
        pan.current.setValue({x: 0, y: 0});
      }
    },
    [getBounds, shouldReverse],
  );

  const handleOnDrag = useCallback(
    (e, gestureState) => {
      const {dx, dy} = gestureState;
      const {top, right, left, bottom} = startBounds.current;
      const far = 999999999;
      const changeX = clamp(
        dx,
        Number.isFinite(minX) ? minX - left : -far,
        Number.isFinite(maxX) ? maxX - right : far,
      );
      const changeY = clamp(
        dy,
        Number.isFinite(minY) ? minY - top : -far,
        Number.isFinite(maxY) ? maxY - bottom : far,
      );
      pan.current.setValue({x: changeX, y: changeY});
      onDrag(e, gestureState);
    },
    [maxX, maxY, minX, minY, onDrag],
  );

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        shouldStartDrag(gestureState),
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        shouldStartDrag(gestureState),
      onPanResponderGrant,
      onPanResponderMove: Animated.event([], {
        listener: handleOnDrag,
        useNativeDriver: false,
      }),
      onPanResponderRelease,
    });
  }, [
    handleOnDrag,
    onPanResponderGrant,
    onPanResponderRelease,
    shouldStartDrag,
  ]);

  useEffect(() => {
    const curPan = pan.current;
    if (shouldReverse) {
      reversePosition();
    } else {
      curPan.addListener(c => (offsetFromStart.current = c));
    }
    return () => {
      curPan.removeAllListeners();
    };
  }, [shouldReverse, reversePosition]);

  const positionCss = useMemo(() => {
    const window = Dimensions.get('window');
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: window.width,
      height: window.height,
    };
  }, []);

  const dragItemCss = useMemo(() => {
    const style = {
      top: y,
      left: x,
      elevation: z,
      zIndex: z,
    };
    if (renderColor) {
      style.backgroundColor = renderColor;
    }
    if (isCircle) {
      style.borderRadius = renderSize;
    }

    if (children) {
      return {...style, alignSelf: 'baseline'};
    }
    return {
      ...style,
      justifyContent: 'center',
      width: renderSize,
      height: renderSize,
    };
  }, [children, isCircle, renderColor, renderSize, x, y, z]);

  const touchableContent = useMemo(() => {
    if (children) {
      return children;
    } else if (imageSource) {
      return (
        <Image
          style={{width: renderSize, height: renderSize}}
          source={imageSource}
        />
      );
    } else {
      return <Text style={styles.text}>{renderText}</Text>;
    }
  }, [children, imageSource, renderSize, renderText]);

  const handleOnLayout = useCallback(event => {
    const {height, width} = event.nativeEvent.layout;
    childSize.current = {x: width, y: height};
  }, []);

  const handlePressOut = useCallback(
    event => {
      onPressOut(event);
      if (!isDragging.current) {
        onRelease(event, false);
      }
    },
    [onPressOut, onRelease],
  );

  return (
    <View pointerEvents="box-none" style={positionCss}>
      <Animated.View
        {...animatedViewProps}
        {...panResponder.panHandlers}
        style={pan.current.getLayout()}>
        <TouchableOpacity
          {...touchableOpacityProps}
          onLayout={handleOnLayout}
          style={dragItemCss}
          onPressOut={handlePressOut}
          {...{
            disabled,
            onLongPress,
            onPressIn,
            onPress,
          }}>
          {touchableContent}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

Draggable.defaultProps = {
  renderText: '＋',
  renderSize: 36,
  shouldReverse: false,
  disabled: false,
  onDrag: () => {},
  onPress: () => {},
  onDragRelease: () => {},
  onLongPress: () => {},
  onPressIn: () => {},
  onPressOut: () => {},
  onRelease: () => {},
  x: 0,
  y: 0,
  z: 1,
};

Draggable.propTypes = {
  /**** props that should probably be removed in favor of "children" */
  renderText: PropTypes.string,
  isCircle: PropTypes.bool,
  renderSize: PropTypes.number,
  imageSource: PropTypes.number,
  renderColor: PropTypes.string,
  /**** */
  children: PropTypes.element,
  shouldReverse: PropTypes.bool,
  disabled: PropTypes.bool,
  animatedViewProps: PropTypes.object,
  touchableOpacityProps: PropTypes.object,
  onDrag: PropTypes.func,
  onPress: PropTypes.func,
  onDragRelease: PropTypes.func,
  onLongPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  onRelease: PropTypes.func,
  onReverse: PropTypes.func,
  x: PropTypes.number,
  y: PropTypes.number,
  // z/elevation should be removed because it doesn't sync up visually and haptically
  z: PropTypes.number,
  minX: PropTypes.number,
  minY: PropTypes.number,
  maxX: PropTypes.number,
  maxY: PropTypes.number,
};

const styles = StyleSheet.create({
  text: {color: '#fff', textAlign: 'center'},
  test: {backgroundColor: 'red'},
  debugView: {
    backgroundColor: '#ff000044',
    position: 'absolute',
    borderColor: '#fced0ecc',
    borderWidth: 4,
  },
});
