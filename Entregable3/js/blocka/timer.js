export function createTimer({ element, onExpire }) {
  let value = 0;
  let intervalId;

  function update() {
    const minutes = String(Math.floor(value / 60)).padStart(2, '0');
    const seconds = String(Math.abs(value % 60)).padStart(2, '0');
    element.textContent = `${minutes}:${seconds}`;
  }

  return {
    start(limit) {
      clearInterval(intervalId);
      value = limit || 0;
      update();
      intervalId = setInterval(() => {
        value += limit ? -1 : 1;
        update();
        if (limit && value <= 0) onExpire();
      }, 1000);
    },
    stop() { clearInterval(intervalId); },
    subtract(seconds) {
      value -= seconds;
      update();
      return value;
    },
    get value() { return value; },
  };
}
