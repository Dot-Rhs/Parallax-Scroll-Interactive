import {
  loadSprite,
  makeSprite,
  makeLayer,
  makeInfiniteScroll,
  getMousePos,
} from "./utils.js";

let currListener;

const container = document.querySelector(".container");

new ResizeObserver(() => {
  document.documentElement.style.setProperty(
    "--scale",
    Math.min(
      container.parentElement.offsetWidth / container.offsetWidth,
      container.parentElement.offsetHeight / container.offsetHeight,
    ),
  );
}).observe(container.parentElement);

const main = async () => {
  const canvas = document.getElementById("gameCanvas");

  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const [layer1, layer2, layer3, layer4] = await Promise.all([
    loadSprite("./assets/1.png"),
    loadSprite("./assets/2.png"),
    loadSprite("./assets/3.png"),
    loadSprite("./assets/4.png"),
  ]);

  const layer1Obj = makeSprite(ctx, layer1, { x: 0, y: -100 }, 4);
  const layer2Obj = makeLayer(ctx, layer2, { x: 0, y: -100 }, 4);
  const layer3Obj = makeLayer(ctx, layer3, { x: 0, y: -100 }, 4);
  const layer4Obj = makeLayer(ctx, layer4, { x: 0, y: -100 }, 4);

  // Change speeds on mouse move?

  let dt;
  let oldTimeStamp = 0;

  const debugMode = false;
  let fps;
  const defaultSpeed = 150;
  let speed = defaultSpeed;

  const gameLoop = (timeStamp) => {
    dt = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    fps = Math.round(1 / dt);
    console.log("DEAFULT: ", speed, defaultSpeed);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layer1Obj.draw();
    makeInfiniteScroll(dt, layer2Obj, speed * dt * -110);
    makeInfiniteScroll(dt, layer3Obj, speed * dt * -190);
    makeInfiniteScroll(dt, layer4Obj, speed * dt * -450);

    if (debugMode) {
      ctx.font = "128px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(fps, 25, 120);
    }

    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);

  let timestamp = null;
  let lastMouseX = null;
  let lastMouseY = null;

  const setDefaultSpeed = () => (speed = defaultSpeed);

  // Listener for calculating drag
  const dragSpeed = () => {
    canvas.addEventListener(
      "mousedown",
      (e) => {
        if (timestamp === null) {
          timestamp = Date.now();
          lastMouseX = e.screenX;
          lastMouseY = e.screenY;
          return;
        }
      },
      { signal: currListener.signal },
    );

    canvas.addEventListener(
      "mouseup",
      (e) => {
        var now = Date.now();
        var dt = now - timestamp;
        var dx = e.screenX - lastMouseX;
        var speedX = Math.round((dx / dt) * 1000);

        timestamp = now;
        lastMouseX = e.screenX;
        lastMouseY = e.screenY;

        speed = isNaN(speedX) || speedX < 0 ? 0 : speedX;
      },
      { signal: currListener.signal },
    );
  };

  const mouseSpeed = () => {
    canvas.addEventListener(
      "mousemove",
      (e) => {
        if (timestamp === null) {
          timestamp = Date.now();
          lastMouseX = e.screenX;
          lastMouseY = e.screenY;
          return;
        }

        var now = Date.now();
        var dt = now - timestamp;
        var dx = e.screenX - lastMouseX;
        var speedX = Math.round((dx / dt) * 1000);

        timestamp = now;
        lastMouseX = e.screenX;
        lastMouseY = e.screenY;

        speed = isNaN(speedX) || speedX < 0 ? 0 : speedX;
      },
      { signal: currListener.signal },
    );
  };

  const clickSpeed = () => {
    canvas.addEventListener(
      "mousedown",
      (e) => {
        speed = e.offsetX;
      },
      { signal: currListener.signal },
    );
  };

  const positionSpeed = () => {
    canvas.addEventListener(
      "mousemove",
      (e) => {
        speed = e.offsetX;
      },
      { signal: currListener.signal },
    );
  };

  // ADD SLOWING - will have to add min speeds to layers etc

  // Option keys should match form value
  const options = {
    default: setDefaultSpeed,
    click: clickSpeed,
    position: positionSpeed,
    speed: mouseSpeed,
    "drag-speed": dragSpeed,
  };

  const formListener = document.getElementById("speed-type");

  // Listen for change event on form and fire relevant
  // function based on the value
  formListener.addEventListener("change", (e) => {
    if (e.target && e.target.matches("input[type='radio']")) {
      if (currListener && currListener.signal) currListener.abort();

      currListener = new AbortController();

      return options[e.target.value]();
    }
  });

  // Listener for vertical scroll based on mouse position
  canvas.addEventListener("mousemove", (e) => {
    layer2Obj.head.pos.y = e.offsetY / 20 - 100;
    layer2Obj.tail.pos.y = e.offsetY / 20 - 100;

    layer3Obj.head.pos.y = e.offsetY / 50 - 100;
    layer3Obj.tail.pos.y = e.offsetY / 50 - 100;

    layer4Obj.head.pos.y = e.offsetY / -50 - 100;
    layer4Obj.tail.pos.y = e.offsetY / -50 - 100;
  });
};

main();
