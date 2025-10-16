const { createClock, timers } = require('@sinonjs/fake-timers');

let clock;

export function mockTime(time) {
  if (!time) {
    throw new Error('Time mocks require a starting date.');
  }
  clock = createClock();
  global.Date = clock.Date;
  setTime(time);
}

export function unmockTime() {
  global.Date = timers.Date;
}

export function setTime(time) {
  if (typeof time === 'string') {
    time = new Date(time);
  }
  if (time instanceof Date) {
    time = time.getTime();
  }
  clock.setSystemTime(time);
}

export function advanceTime(ms) {
  clock.setSystemTime(Date.now() + ms);
}
