"use client";

import { useCallback, useEffect, useRef } from "react";

// Silence longer than this ends a wheel gesture
const GESTURE_GAP_MS = 200;
// Trackpad inertia ends with a long run of tiny deltas; those don't count
const MIN_DELTA = 4;
// Recent events compared against the gesture so far
const RECENT = 10;
const HISTORY = 70;

const averageOfLast = (list, n) => {
  const part = list.slice(-n);
  return part.reduce((sum, v) => sum + v, 0) / part.length;
};

/**
 * Turns mouse-wheel and trackpad input into single slider steps without the
 * slider ever getting stuck.
 *
 * A trackpad keeps firing wheel events for a second or two after the fingers
 * lift (inertia), and a mouse wheel spun steadily never pauses. Waiting for
 * the wheel to go quiet before accepting another step therefore swallows new
 * swipes and wheel notches, which feels like the slider is stuck.
 *
 * Instead a step is taken whenever the wheel is not slowing down: inertia only
 * ever slows down, while a new swipe or wheel notch does not. Steps are spaced
 * by `cooldown` (the slide transition time), and a fresh gesture that arrives
 * mid-transition runs as soon as the transition ends instead of being dropped.
 *
 * onStep(direction) receives 1 for down/right and -1 for up/left.
 */
export default function useWheelPaging(onStep, { cooldown = 700 } = {}) {
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;
  const state = useRef({ deltas: [], lastEventAt: 0, lastStepAt: -Infinity, timer: null });

  useEffect(() => () => clearTimeout(state.current.timer), []);

  return useCallback(
    (e) => {
      const s = state.current;
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const now = performance.now();
      const newGesture = now - s.lastEventAt > GESTURE_GAP_MS;
      if (newGesture) s.deltas = [];
      s.lastEventAt = now;
      if (Math.abs(delta) < MIN_DELTA) return;

      s.deltas.push(Math.abs(delta));
      if (s.deltas.length > HISTORY) s.deltas.shift();
      // Slowing down: the inertia of a swipe that has already moved the slider
      if (averageOfLast(s.deltas, RECENT) < averageOfLast(s.deltas, HISTORY)) return;

      const direction = delta > 0 ? 1 : -1;
      const step = () => {
        s.timer = null;
        s.lastStepAt = performance.now();
        onStepRef.current(direction);
      };

      const wait = s.lastStepAt + cooldown - now;
      if (wait <= 0) {
        clearTimeout(s.timer);
        step();
      } else if (newGesture && !s.timer) {
        s.timer = setTimeout(step, wait);
      }
    },
    [cooldown]
  );
}
