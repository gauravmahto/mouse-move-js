import { getRandomValues } from 'node:crypto';
import { EventEmitter } from 'node:events';

import robot from 'robotjs';

let [lastX, lastY] = [0, 0];

function getEnv() {
  const delayMs = Number(process.env.DELAY_MS);

  return {
    DELAY_MS: !Number.isNaN(delayMs) && delayMs > 0 ? delayMs : 10000
  };
}

const env = getEnv();

// Speed up the mouse.
// Sets the delay in milliseconds to sleep after a mouse event. This is 10ms by default.
robot.setMouseDelay(2);

const screenSize = robot.getScreenSize();
const eventEmitter = new EventEmitter();

console.log(`Screen size: ${screenSize.width}x${screenSize.height}`);

function getRandomNumber(start, end) {
  if (start > end) {
    throw new Error('Start must be less than or equal to end');
  }

  if (end >= 4294967296) {
    throw new Error('Range exceeds maximum safe integer for random generation');
  }

  const range = end - start + 1;
  const maxValidValue = 4294967296 - (4294967296 % range);
  let randomValue;

  do {
    const byteArray = new Uint32Array(1);
    getRandomValues(byteArray);
    randomValue = byteArray[0];
  } while (randomValue >= maxValidValue);

  return start + (randomValue % range);
}

function waitFor(timeMs) {
  return new Promise(res => setTimeout(res, timeMs));
}

async function* timerPromise(timeMs) {
  while (true) {
    yield Date.now();
    await waitFor(timeMs);
  }
}

eventEmitter.on('moveMouse', () => {
  const currentPos = robot.getMousePos();
  const [currX, currY] = [currentPos.x, currentPos.y];

  // Define a small range around the current position
  const margin = 5;
  const randomXRange = currX + margin > screenSize.width
    ? [Math.max(0, currX - margin), currX]
    : [currX, Math.min(screenSize.width - 1, currX + margin)];
  const randomYRange = currY + margin > screenSize.height
    ? [Math.max(0, currY - margin), currY]
    : [currY, Math.min(screenSize.height - 1, currY + margin)];

  const [x, y] = [
    getRandomNumber(...randomXRange),
    getRandomNumber(...randomYRange)
  ];

  // Always move the mouse to a new random position near the current one
  [lastX, lastY] = [x, y];
  robot.moveMouseSmooth(x, y);
});

(async () => {
  console.log(`Hey! Starting mouse mover with a delay of ${env.DELAY_MS}ms`);

  for await (const now of timerPromise(env.DELAY_MS)) {
    console.log(`Timer tick at ${new Date(now).toISOString()}`);
    eventEmitter.emit('moveMouse');
  }
})();
