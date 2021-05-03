import React, {
  forwardRef,
  useLayoutEffect,
  useRef,
} from 'react';
import { Transition } from 'react-transition-group';
import {
  createTransitionStyle,
  getEnterTransitionProps,
  getExitTransitionProps,
  transitionDuration,
  transitionEasing,
} from './transitions';
import reflow from '../utils/reflow';
import useForkRef from '../utils/useForkRef';
import Box from '../Box';

const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';

const mapStateToVariantStyle = (state, props) => {
  const variantStyle = {
    entering: {
      transform: 'none',
    },
    entered: {
      transform: 'none',
    },
    exiting: (props) => ({
      [DIRECTION_LEFT]: {
        transform: 'translateX(100%)',
      },
      [DIRECTION_RIGHT]: {
        transform: 'translateX(-100%)',
      },
      [DIRECTION_UP]: {
        transform: 'translateY(100%)',
      },
      [DIRECTION_DOWN]: {
        transform: 'translateY(-100%)',
      },
    }[props.direction]),
    exited: (props) => ({
      [DIRECTION_LEFT]: {
        transform: 'translateX(100%)',
      },
      [DIRECTION_RIGHT]: {
        transform: 'translateX(-100%)',
      },
      [DIRECTION_UP]: {
        transform: 'translateY(100%)',
      },
      [DIRECTION_DOWN]: {
        transform: 'translateY(-100%)',
      },
    }[props.direction]),
  }[state];

  return (typeof variantStyle === 'function') ? variantStyle(props) : variantStyle;
};

const defaultEasing = {
  enter: transitionEasing.easeOut,
  exit: transitionEasing.sharp,
};

const defaultTimeout = {
  enter: transitionDuration.enteringScreen,
  exit: transitionDuration.leavingScreen,
};

/**
 * The Slide transition can be used for the Drawer component.
 */
const Slide = forwardRef((
  {
    appear = true,
    children,
    direction = DIRECTION_DOWN,
    easing = defaultEasing,
    in: inProp,
    style,
    timeout = defaultTimeout,
    ...other
  },
  ref,
) => {
  const nodeRef = useRef(null);
  const combinedRef = useForkRef(nodeRef, ref);

  useLayoutEffect(() => {
    if (inProp) {
      const node = nodeRef.current;
      reflow(node); // force reflow to make the transition work when animating appearance
    }
  }, [inProp]);

  return (
    <Transition
      appear={appear}
      in={inProp}
      nodeRef={nodeRef}
      timeout={timeout}
      {...other}
    >
      {(state, childProps) => {
        const transitionProps = inProp
          ? getEnterTransitionProps({ style, timeout, easing })
          : getExitTransitionProps({ style, timeout, easing });
        const transition = createTransitionStyle('transform', transitionProps);
        const variantStyle = mapStateToVariantStyle(state, { direction });
        const styleProps = {
          ...variantStyle,
          transition,
          visibility: (state === 'exited' && !inProp) ? 'hidden' : undefined,
        };

        if (typeof children === 'function') {
          return children(state, {
            ref: combinedRef,
            ...childProps,
            style: {
              ...styleProps,
              ...style,
            },
          });
        }

        return (
          <Box
            ref={combinedRef}
            {...childProps}
            {...styleProps}
            style={style}
          >
            {children}
          </Box>
        );
      }}
    </Transition>
  );
});

Slide.displayName = 'Slide';

export default Slide;
