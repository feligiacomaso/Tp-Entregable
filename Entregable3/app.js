const $ = (selector) => document.querySelector(selector);

const sceneSources = [
  'images/imagen-1.png',
  'images/imagen-2.png',
  'images/imagen-3.png',
  'images/imagen-4.png',
  'images/imagen-5.png',
  'images/imagen-6.png',
];
const scenes = sceneSources.map(() => new Image());
const filters = ['grayscale', 'brightness', 'negative', 'grayscale', 'brightness', 'negative'];
const tileFilters = {
  grayscale: 'grayscale(1)',
  brightness: 'brightness(1.3)',
  negative: 'invert(1)',
};
const timeLimits = [0, 0, 0, 20, 20, 20];
let level = 1;
let selectedScene = 0;
const usedScenes = new Set();
let activeShape = { columns: 2, rows: 2, count: 4 };
let activeOriginal;
let pieces = [];
let timeValue = 0;
let timerId;
let started = false;
let helpUsed = false;

function levelShape() {
  const columns = level < 3 ? 2 : level < 5 ? 3 : 4;
  return { columns, rows: 2, count: columns * 2 };
}

function loadSceneImages() {
  return Promise.all(scenes.map((image, index) => new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', () => reject(new Error(`No se pudo cargar ${sceneSources[index]}`)), {
      once: true,
    });
    image.src = sceneSources[index];
  })));
}

function drawScene(canvas, index, shape = { columns: 1, rows: 1 }) {
  const context = canvas.getContext('2d');
  const { columns, rows } = shape;
  const width = canvas.width;
  const height = canvas.height;
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

  context.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height,
  );
}

function makeImage(index, square = false, shape = levelShape()) {
  const imageShape = square ? { columns: 1, rows: 1 } : shape;
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = (canvas.width * imageShape.rows) / imageShape.columns;
  drawScene(canvas, index, imageShape);
  return canvas;
}

function setLevelLabel() {
  $('#levelLabel').textContent = `NIVEL ${level}/6`;
  $('#levelLabel').classList.remove('hidden');
}

function showGallery() {
  started = false;
  clearInterval(timerId);
  $('#brand').classList.remove('in-game');
  $('#levelLabel').classList.remove('in-game');
  setLevelLabel();
  $('#previewCount').classList.add('hidden');
  $('#gallery').classList.remove('hidden');
  $('#preview').classList.add('hidden');
  $('#preview').classList.remove('is-blurred');
  $('#previewOverlay').classList.add('hidden');
  $('#game').classList.add('hidden');
  $('#game').classList.remove('won');
  $('#board').classList.remove('hidden');
  $('#helpCard').classList.add('hidden');
  $('#winScreen').classList.add('hidden');
  $('#timer').classList.add('hidden');
  $('#timer').classList.remove('in-game');
  $('#helpTimeChange').classList.add('hidden');
  $('#loss').classList.add('hidden');
  $('#selectImage').classList.remove('hidden');
  $('#selectImage').disabled = false;

  const grid = $('#imageGrid');
  grid.innerHTML = '';
  scenes.forEach((scene, index) => {
    const thumbnail = makeImage(index, true);
    thumbnail.className = 'thumbnail';
    if (usedScenes.has(index)) thumbnail.classList.add('used');
    thumbnail.dataset.index = index;
    thumbnail.setAttribute('aria-label', `Imagen ${index + 1}`);
    grid.append(thumbnail);
  });
}

function selectRandomImage() {
  const allThumbnails = [...document.querySelectorAll('.thumbnail')];
  const thumbnails = allThumbnails.filter((thumbnail) => (
    !usedScenes.has(Number(thumbnail.dataset.index))
  ));
  if (!thumbnails.length) return;

  $('#selectImage').disabled = true;
  $('#selectImage').classList.add('hidden');
  let position = Math.floor(Math.random() * thumbnails.length);
  const selectedPosition = Math.floor(Math.random() * thumbnails.length);
  const selectedThumbnail = thumbnails[selectedPosition];
  selectedScene = Number(selectedThumbnail.dataset.index);
  usedScenes.add(selectedScene);
  const extraTurns = Math.floor(Math.random() * 3);
  const steps = thumbnails.length * (2 + extraTurns)
    + ((selectedPosition - position + thumbnails.length) % thumbnails.length) + 1;
  let step = 0;

  function moveSelector() {
    thumbnails.forEach((thumbnail) => thumbnail.classList.remove('highlight'));
    thumbnails[position].classList.add('highlight');
    step += 1;

    if (step >= steps) {
      thumbnails[position].classList.add('selected');
      allThumbnails.forEach((thumbnail) => {
        if (Number(thumbnail.dataset.index) !== selectedScene) thumbnail.classList.add('fade-out');
      });
      setTimeout(showPreview, 700);
      return;
    }

    position = (position + 1) % thumbnails.length;
    const progress = step / steps;
    setTimeout(moveSelector, 180 + progress ** 2 * 620);
  }

  moveSelector();
}
function showPreview() {
  $('#gallery').classList.add('hidden');
  $('#preview').classList.remove('hidden', 'is-blurred');
  $('#previewOverlay').classList.add('hidden');
  $('#difficultyPrompt').classList.add('hidden');
  $('#brand').classList.remove('in-game');
  $('#levelLabel').classList.remove('in-game');
  setLevelLabel();

  activeShape = levelShape();
  activeOriginal = makeImage(selectedScene, false, activeShape);
  drawStageImage($('#previewCanvas'), activeOriginal);

  let seconds = 3;
  $('#previewCount').textContent = seconds;
  $('#previewCount').classList.remove('hidden');
  animateCountdown();
  const countdown = setInterval(() => {
    seconds -= 1;
    if (seconds > 0) {
      $('#previewCount').textContent = seconds;
      animateCountdown();
      return;
    }

    clearInterval(countdown);
    $('#previewCount').classList.add('hidden');
    $('#preview').classList.add('is-blurred');
    $('#difficultyPrompt').classList.toggle('hidden', level < 4);
    $('#previewOverlay').classList.remove('hidden');
  }, 1000);
}

function animateCountdown() {
  const counter = $('#previewCount');
  counter.classList.remove('countdown-tick');
  void counter.offsetWidth;
  counter.classList.add('countdown-tick');
}

function drawStageImage(canvas, source) {
  canvas.width = source.width;
  canvas.height = source.height;
  const maxWidth = Math.min(680, window.innerWidth - 64);
  const maxHeight = Math.max(120, window.innerHeight - 260);
  const scale = Math.min(maxWidth / source.width, maxHeight / source.height);
  canvas.style.width = `${source.width * scale}px`;
  canvas.style.height = `${source.height * scale}px`;
  canvas.getContext('2d').drawImage(source, 0, 0);
}

function beginLevel() {
  $('#brand').classList.add('in-game');
  $('#levelLabel').classList.add('in-game');
  setLevelLabel();
  $('#preview').classList.add('hidden');
  $('#previewCount').classList.add('hidden');
  $('#game').classList.remove('hidden', 'won');
  $('#game').classList.toggle('with-help', level >= 4);
  $('#board').classList.remove('hidden');
  $('#winScreen').classList.add('hidden');
  $('#helpCard').classList.toggle('hidden', level < 4);
  $('#timer').classList.remove('hidden');
  $('#timer').classList.add('in-game');
  $('#helpTimeChange').classList.add('hidden');
  helpUsed = false;
  $('#helpAction').disabled = false;
  $('#helpAction').textContent = 'Pedir ayuda';
  $('#helpPenalty').textContent = 'La ayuda fija una pieza correcta y quita 5 segundos.';

  setupBoard();
  startTimer(timeLimits[level - 1]);
}

function setupBoard() {
  const { columns, rows, count } = activeShape;
  const source = makeImage(selectedScene, false, activeShape);
  const board = $('#board');
  board.style.setProperty('--columns', columns);
  board.style.setProperty('--rows', rows);
  board.style.aspectRatio = `${columns} / ${rows}`;
  fitBoard();
  board.innerHTML = '';
  pieces = [];
  started = true;

  for (let index = 0; index < count; index += 1) {
    const tile = document.createElement('button');
    const x = index % columns;
    const y = Math.floor(index / columns);
    const turns = 1 + Math.floor(Math.random() * 3);
    const pieceImage = document.createElement('canvas');

    pieceImage.width = 300;
    pieceImage.height = 300;
    pieceImage.getContext('2d').drawImage(
      source,
      x * source.width / columns,
      y * source.height / rows,
      source.width / columns,
      source.height / rows,
      0,
      0,
      pieceImage.width,
      pieceImage.height,
    );

    tile.className = 'tile';
    tile.setAttribute('aria-label', `Pieza ${index + 1}`);
    tile.append(pieceImage);
    tile.style.filter = tileFilters[filters[level - 1]];
    tile.style.transform = `rotate(${turns * 90}deg)`;
    tile.onclick = () => rotatePiece(index, -1);
    tile.oncontextmenu = (event) => {
      event.preventDefault();
      rotatePiece(index, 1);
    };
    pieces.push({ tile, turns, locked: false });
    board.append(tile);
  }
}

function fitBoard() {
  const { columns, rows } = activeShape;
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const withHelp = $('#game').classList.contains('with-help');
  const sideHelp = withHelp && window.innerWidth > 1000;
  const widthLimit = sideHelp
    ? Math.min(720, window.innerWidth - 424)
    : Math.min(mobile ? 620 : 720, window.innerWidth - (mobile ? 32 : withHelp ? 0 : 350));
  const heightLimit = window.innerHeight - (mobile ? 292 : 170);
  const width = Math.max(120, Math.min(widthLimit, heightLimit * (columns / rows)));
  const board = $('#board');
  board.style.width = `${width}px`;
  board.style.height = `${width * rows / columns}px`;
  $('#helpCard').style.width = withHelp && !sideHelp ? `${width}px` : '';
}

function rotatePiece(index, direction) {
  const piece = pieces[index];
  if (!started || piece.locked) return;

  piece.turns = (piece.turns + direction + 4) % 4;
  piece.tile.style.transform = `rotate(${piece.turns * 90}deg)`;
  if (pieces.every((item) => item.turns === 0)) completeLevel();
}

function startTimer(limit) {
  clearInterval(timerId);
  timeValue = limit || 0;
  updateTimer();
  timerId = setInterval(() => {
    timeValue += limit ? -1 : 1;
    updateTimer();
    if (limit && timeValue <= 0) loseLevel();
  }, 1000);
}

function updateTimer() {
  const minutes = String(Math.floor(timeValue / 60)).padStart(2, '0');
  const seconds = String(Math.abs(timeValue % 60)).padStart(2, '0');
  $('#timer').textContent = `${minutes}:${seconds}`;
}

function requestHelp() {
  if (!started || level < 4 || helpUsed) return;
  const piece = pieces.find((item) => !item.locked && item.turns !== 0)
    || pieces.find((item) => !item.locked);
  if (!piece) return;

  piece.turns = 0;
  piece.locked = true;
  piece.tile.style.transform = 'rotate(0deg)';
  piece.tile.classList.add('fixed');
  piece.tile.setAttribute('aria-label', `${piece.tile.getAttribute('aria-label')}, ubicada correctamente`);
  helpUsed = true;
  $('#helpAction').disabled = true;
  $('#helpAction').textContent = 'Ayuda usada';
  $('#helpTimeChange').classList.remove('hidden');
  timeValue -= 5;
  updateTimer();

  if (timeValue <= 0) {
    loseLevel();
    return;
  }
  if (pieces.every((item) => item.turns === 0)) completeLevel();
}

function loseLevel() {
  started = false;
  clearInterval(timerId);
  $('#loss').classList.remove('hidden');
}

function positionWinControls() {
  const board = $('#board').getBoundingClientRect();
  const heading = $('#winScreen h1');
  const action = $('#nextLevel');
  const titleTop = Math.max(8, board.top - heading.offsetHeight - 14);
  const actionTop = Math.min(
    window.innerHeight - action.offsetHeight - 12,
    board.bottom + 14,
  );

  $('#winScreen').style.setProperty('--win-center', `${board.left + board.width / 2}px`);
  $('#winScreen').style.setProperty('--win-title-top', `${titleTop}px`);
  $('#winScreen').style.setProperty('--win-action-top', `${actionTop}px`);
}

function completeLevel() {
  started = false;
  clearInterval(timerId);
  $('#timer').classList.add('hidden');
  $('#helpCard').classList.add('hidden');
  $('#game').classList.add('won');

  pieces.forEach(({ tile }) => {
    tile.style.transform = 'none';
    tile.style.filter = 'none';
    tile.classList.remove('fixed');
  });

  $('#winScreen').classList.remove('hidden');
  positionWinControls();
}

$('#startButton').onclick = beginLevel;
$('#selectImage').onclick = selectRandomImage;
$('#helpAction').onclick = requestHelp;
$('#nextLevel').onclick = () => {
  if (level === 6) {
    level = 1;
    usedScenes.clear();
  } else {
    level += 1;
  }
  showGallery();
};
$('#mainMenu').onclick = () => {
  level = 1;
  usedScenes.clear();
  showGallery();
};$('#howButton').onclick = () => $('#instructions').showModal();
$('#closeInstructions').onclick = () => $('#instructions').close();
$('#instructions').onclick = (event) => {
  if (event.target.id === 'instructions') $('#instructions').close();
};
window.addEventListener('resize', () => {
  if (!$('#game').classList.contains('hidden')) fitBoard();
  if (!$('#preview').classList.contains('hidden') && activeOriginal) {
    drawStageImage($('#previewCanvas'), activeOriginal);
  }
  if (!$('#winScreen').classList.contains('hidden')) positionWinControls();
});

loadSceneImages().then(showGallery).catch((error) => console.error(error));
