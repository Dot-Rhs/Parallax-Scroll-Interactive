export const loadSprite = async (path) => {
  return new Promise((res, rej) => {
    const img = new Image();
    img.src = path + "?t=" + new Date().getTime();
    img.onload = () => res(img);
    img.onerror = (err) => rej(err);
  });
};

export const makeSprite = (ctx, sprite, pos, scale = 1) => {
  return {
    width: sprite.width,
    height: sprite.height,
    pos,
    scale,
    draw() {
      ctx.drawImage(
        sprite,
        this.pos.x,
        this.pos.y,
        this.width * 4,
        this.height * 4,
      );
    },
  };
};

export const makeLayer = (ctx, sprite, pos, scale = 1) => {
  return {
    head: makeSprite(ctx, sprite, pos, scale),
    tail: makeSprite(
      ctx,
      sprite,
      {
        x: pos.x + sprite.width * scale,
        y: pos.y,
      },
      scale,
    ),
  };
};

export const makeInfiniteScroll = (dt, layer, speed) => {
  if (layer.head.pos.x + layer.head.width * layer.head.scale < 0) {
    layer.head.pos.x = layer.tail.pos.x + layer.tail.width * layer.tail.scale;
  }

  if (layer.tail.pos.x + layer.tail.width * layer.tail.scale < 0) {
    layer.tail.pos.x = layer.head.pos.x + layer.head.width * layer.head.scale;
  }

  layer.head.pos.x += speed * dt;
  layer.head.draw();
  layer.tail.pos.x += speed * dt;
  layer.tail.draw();
};

export function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

export const calculateSpeed = (currentSpeed) => {
  if (currentSpeed > 30) {
    return currentSpeed * 0.999;
  }

  if (currentSpeed < 30 && currentSpeed > 0) return currentSpeed * 0.99;

  if (Math.round(currentSpeed) === 0) return 0;
};
