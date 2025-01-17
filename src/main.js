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

  console.log("LAYER: ", layer1);

  const layer1Obj = makeSprite(ctx, layer1, { x: 0, y: -100 }, 4);
  const layer2Obj = makeLayer(ctx, layer2, { x: 0, y: -100 }, 4);
  const layer3Obj = makeLayer(ctx, layer3, { x: 0, y: -100 }, 4);
  const layer4Obj = makeLayer(ctx, layer4, { x: 0, y: -100 }, 4);

  // Change speeds on mouse move?

  let dt;
  let oldTimeStamp = 0;

  const debugMode = true;
  let fps;
  let speed = 150;

  const gameLoop = (timeStamp) => {
    dt = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    fps = Math.round(1 / dt);

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

  const clickSpeed = () => {
    canvas.addEventListener(
      "mousedown",
      (e) => {
        console.log("CLACK AVTIVE");

        speed = e.offsetX;
      },
      { signal: currListener.signal },
    );
  };

  function positionSpeed() {
    canvas.addEventListener(
      "mousemove",
      (e) => {
        console.log("POS ACTIVE");
        speed = e.offsetX;
      },
      { signal: currListener.signal },
    );
  }

  let timestamp = null;
  let lastMouseX = null;
  let lastMouseY = null;

  const mouseSpeed = () =>
    canvas.addEventListener("mousemove", function (e) {
      if (timestamp === null) {
        timestamp = Date.now();
        lastMouseX = e.screenX;
        lastMouseY = e.screenY;
        return;
      }

      var now = Date.now();
      var dt = now - timestamp;
      var dx = e.screenX - lastMouseX;
      var dy = e.screenY - lastMouseY;
      var speedX = Math.round((dx / dt) * 100);
      var speedY = Math.round((dy / dt) * 100);

      timestamp = now;
      lastMouseX = e.screenX;
      lastMouseY = e.screenY;
      console.log("SEEEED: ", speedX);

      speed = isNaN(speedX) || speedX < 0 ? 0 : speedX;
    });

  const clickListener = document.getElementById("speed-type");
  clickListener.addEventListener("change", (e) => {
    if (e.target && e.target.matches("input[type='radio']")) {
      if (currListener && currListener.signal) currListener.abort();
      currListener = new AbortController();

      console.log(getMousePos(canvas, e));
      if (e.target.value === "Click") clickSpeed();
      if (e.target.value === "Position") positionSpeed();
      if (e.target.value == "Speed") mouseSpeed();
    }
  });
};

function end() {
  currListener.abort();
}
document.getElementById("john").addEventListener("click", () => end());

main();
