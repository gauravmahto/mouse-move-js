import { getRandomValues } from 'node:crypto';
import { EventEmitter } from 'node:events';

import robot from 'robotjs';

let [lastX, lastY] = [0, 0];

function getEnv() {

  const delayMs = Number(process.env.DELAY_MS);

  return {
    DELAY_MS: !Number.isNaN(delayMs) && delayMs > 999 ? delayMs : 10000
  };

}

const env = getEnv();

// Speed up the mouse.
// Sets the delay in milliseconds to sleep after a mouse event. This is 10ms by default.
robot.setMouseDelay(2);

const screenSize = robot.getScreenSize();
const eventEmitter = new EventEmitter();

console.log('Screen size', screenSize);

function getRandomNumber(start, end) {

  if (start >= 4294967296 ||
    end >= 4294967296 ||
    start > end) {

    throw new Error('Invalid range provided for getRandomNumber');

  }

  const range = end - start + 1;
  const byteArray = new Uint32Array(1);
  const maxValidValue = 4294967296 - (4294967296 % range);
  let randomValue;

  do {

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

  const currentLatestPos = robot.getMousePos();

  let [currX, currY] = [currentLatestPos.x, currentLatestPos.y];

  let randomXRange = [];
  let randomYRange = [];

  randomXRange = (currX + 5 > screenSize.width) ? [currX - 5, currX] : [currX, currX + 5];
  randomYRange = (currY + 5 > screenSize.height) ? [currY - 5, currY] : [currY, currY + 5];

  let [x, y] = [getRandomNumber(...randomXRange), getRandomNumber(...randomYRange)];

  if (lastX === currX &&
    lastY === currY) {

    [lastX, lastY] = [x, y];

    robot.moveMouseSmooth(x, y);

  } else {

    [lastX, lastY] = [currX, currY];

  }

});

(async () => {

  for await (const interval of timerPromise(env.DELAY_MS)) {

    console.log(`Waited ${interval}`);

    eventEmitter.emit('moveMouse');

  }

})();
