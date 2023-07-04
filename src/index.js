import { getRandomValues } from 'node:crypto';
import { EventEmitter } from 'node:events';

import robot from 'robotjs';

// Speed up the mouse.
robot.setMouseDelay(2);

const twoPI = Math.PI * 2.0;
const screenSize = robot.getScreenSize();
const eventEmitter = new EventEmitter();

console.log('Screen size', screenSize);

// const height = (screenSize.height / 2) - 10;
// const width = screenSize.width;
// let y;

// for (let x = 0; x < width; x++) {

//   y = height * Math.sin((twoPI * x) / width) + height;

//   robot.moveMouse(x, y);

// }

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

  // robot.moveMouse(getRandomNumber(0, screenSize.height), getRandomNumber(0, screenSize.width));
  robot.moveMouse(getRandomNumber(0, 10), getRandomNumber(0, 10));

});

(async () => {

  for await (const interval of timerPromise(10000)) {

    console.log(`Waited ${interval}`);

    eventEmitter.emit('moveMouse');

  }

})();
