import { sceneSources } from './config.js';

export const scenes = sceneSources.map(() => new Image());

export function loadSceneImages() {
  return Promise.all(scenes.map((image, index) => new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', () => reject(new Error(`No se pudo cargar ${sceneSources[index]}`)), {
      once: true,
    });
    image.src = sceneSources[index];
  })));
}

export function drawScene(canvas, index, shape = { columns: 1, rows: 1 }) {
  const context = canvas.getContext('2d');
  const { columns, rows } = shape;
  const image = scenes[index];
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = columns / rows;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
    cropX = (sourceWidth - cropWidth) / 2;
  } else {
    cropHeight = sourceWidth / targetRatio;
    cropY = (sourceHeight - cropHeight) / 2;
  }

  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
}

export function makeImage(index, square = false, shape = { columns: 2, rows: 2 }) {
  const imageShape = square ? { columns: 1, rows: 1 } : shape;
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = (canvas.width * imageShape.rows) / imageShape.columns;
  drawScene(canvas, index, imageShape);
  return canvas;
}

export function drawStageImage(canvas, source) {
  canvas.width = source.width;
  canvas.height = source.height;
  const maxWidth = Math.min(680, window.innerWidth - 64);
  const maxHeight = Math.max(120, window.innerHeight - 260);
  const scale = Math.min(maxWidth / source.width, maxHeight / source.height);
  canvas.style.width = `${source.width * scale}px`;
  canvas.style.height = `${source.height * scale}px`;
  canvas.getContext('2d').drawImage(source, 0, 0);
}
