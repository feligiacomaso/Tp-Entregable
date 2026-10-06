const $ = (selector) => document.querySelector(selector);

const scenes = [
  ['SOL', ['#f5b431', '#e95842', '#315c71']],
  ['MAREA', ['#3c88a6', '#ecb75d', '#e77456']],
  ['ÓRBITA', ['#1d3158', '#854dab', '#e9bd68']],
  ['JARDÍN', ['#86ae55', '#f0c76f', '#ce6e5b']],
  ['NOCHE', ['#202c50', '#e07a55', '#e7c484']],
  ['FRUTA', ['#df6548', '#81ac59', '#f3c75f']],
];

const filters = ['grayscale', 'brightness', 'negative', 'grayscale', 'brightness', 'negative'];
const timeLimits = [0, 0, 0, 70, 60, 50];
let level = 1;
let selectedScene = 0;
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

function drawScene(canvas, index) {
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const [background, sun, foreground] = scenes[index][1];

  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.fillStyle = sun;
  context.beginPath();
  context.arc(width * 0.74, height * 0.3, height * 0.18, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = foreground;
  context.beginPath();
  context.moveTo(0, height * 0.75);
  context.quadraticCurveTo(width * 0.25, height * 0.3, width * 0.46, height * 0.72);
  context.quadraticCurveTo(width * 0.69, height * 0.36, width, height * 0.7);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.fill();
  context.fillStyle = '#171b22';
  context.globalAlpha = 0.22;
  context.fillRect(width * 0.12, height * 0.18, width * 0.09, height * 0.09);
  context.fillRect(width * 0.83, height * 0.76, width * 0.06, height * 0.06);
  context.globalAlpha = 1;
  context.fillStyle = '#fff';
  context.font = `600 ${Math.round(width * 0.08)}px Manrope, sans-serif`;
  context.fillText(scenes[index][0], width * 0.08, height * 0.9);
}

function applyFilter(canvas, filter) {
  const context = canvas.getContext('2d');
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    if (filter === 'grayscale') {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    } else if (filter === 'brightness') {
      data[i] *= 1.3;
      data[i + 1] *= 1.3;
      data[i + 2] *= 1.3;
    } else {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  }

  context.putImageData(image, 0, 0);
}

function makeImage(index, filter = null, square = false, shape = levelShape()) {
  const { columns, rows } = square ? { columns: 1, rows: 1 } : shape;
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = (canvas.width * rows) / columns;
  drawScene(canvas, index);
  if (filter) applyFilter(canvas, filter);
  return canvas;
}

function setLevelLabel() {
  $('#levelLabel').textContent = `NIVEL ${level}/6`;
  $('#levelLabel').classList.remove('hidden');
}

function showGallery() {
  started = false;
  clearInterval(timerId);
  $('#brand').classList.add('in-game');
  $('#levelLabel').classList.add('in-game');
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
  $('#loss').classList.add('hidden');
  $('#selectImage').classList.remove('hidden');
  $('#selectImage').disabled = false;

  const grid = $('#imageGrid');
  grid.innerHTML = '';
  scenes.forEach((scene, index) => {
    const thumbnail = makeImage(index, null, true);
    thumbnail.className = 'thumbnail';
    thumbnail.dataset.index = index;
    thumbnail.setAttribute('aria-label', `Imagen ${index + 1}`);
    grid.append(thumbnail);
  });

}

function selectRandomImage() {
  const thumbnails = [...document.querySelectorAll('.thumbnail')];
  $('#selectImage').disabled = true;
  $('#selectImage').classList.add('hidden');
  selectedScene = Math.floor(Math.random() * thumbnails.length);
  let position = Math.floor(Math.random() * thumbnails.length);
  const extraTurns = Math.floor(Math.random() * 3);
  const steps = thumbnails.length * (2 + extraTurns)
    + ((selectedScene - position + thumbnails.length) % thumbnails.length) + 1;
  let step = 0;

  function moveSelector() {
    thumbnails.forEach((thumbnail) => thumbnail.classList.remove('highlight'));
    thumbnails[position].classList.add('highlight');
    step += 1;

    if (step >= steps) {
      thumbnails[position].classList.add('selected');
      thumbnails.forEach((thumbnail) => {
        if (Number(thumbnail.dataset.index) !== selectedScene) thumbnail.classList.add('fade-out');
      });
      setTimeout(showPreview, 700);
      return;
    }

    position = (position + 1) % thumbnails.length;
    const progress = step / steps;
    const delay = 180 + progress ** 2 * 620;
    setTimeout(moveSelector, delay);
  }

  moveSelector();
}

function showPreview() {
  $('#gallery').classList.add('hidden');
  $('#preview').classList.remove('hidden');
  $('#preview').classList.remove('is-blurred');
  $('#previewOverlay').classList.add('hidden');
  $('#brand').classList.remove('in-game');
  $('#levelLabel').classList.remove('in-game');
  setLevelLabel();

  activeShape = levelShape();
  const canvas = $('#previewCanvas');
  activeOriginal = makeImage(selectedScene, null, false, activeShape);
  drawStageImage(canvas, activeOriginal);

  let seconds = 3;
  $('#previewCount').textContent = seconds;
  $('#previewCount').classList.remove('hidden');
  const countdown = setInterval(() => {
    seconds -= 1;
    if (seconds > 0) {
      $('#previewCount').textContent = seconds;
      return;
    }

    clearInterval(countdown);
    $('#previewCount').classList.add('hidden');
    $('#preview').classList.add('is-blurred');
    $('#previewOverlay').classList.remove('hidden');
  }, 1000);
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
  $('#game').classList.remove('hidden');
  $('#game').classList.remove('won');
  $('#game').classList.toggle('with-help', level >= 4);
  $('#board').classList.remove('hidden');
  $('#winScreen').classList.add('hidden');
  $('#helpCard').classList.toggle('hidden', level < 4);
  $('#timer').classList.remove('hidden');
  $('#timer').classList.add('in-game');
  helpUsed = false;
  $('#helpAction').disabled = false;
  $('#helpAction').textContent = 'Pedir ayuda';

  const limit = timeLimits[level - 1];
  $('#helpPenalty').textContent = 'La ayuda fija una pieza correcta y quita 5 segundos.';
  setupBoard();
  startTimer(limit);
}

function setupBoard() {
  const { columns, rows, count } = activeShape;
  const source = makeImage(selectedScene, filters[level - 1], false, activeShape);
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

    tile.className = 'tile';
    tile.setAttribute('aria-label', `Pieza ${index + 1}`);
    tile.style.backgroundImage = `url(${source.toDataURL()})`;
    tile.style.backgroundSize = `${columns * 100}% ${rows * 100}%`;
    tile.style.backgroundPosition = `${(x / (columns - 1)) * 100}% ${(y / (rows - 1)) * 100}%`;
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
  const widthLimit = Math.min(720, window.innerWidth - (mobile ? 32 : 350));
  const heightLimit = window.innerHeight - (mobile ? 292 : 170);
  const width = Math.max(120, Math.min(widthLimit, heightLimit * (columns / rows)));
  $('#board').style.width = `${width}px`;
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

function completeLevel() {
  started = false;
  clearInterval(timerId);
  $('#timer').classList.add('hidden');
  $('#board').classList.add('hidden');
  $('#helpCard').classList.add('hidden');
  $('#game').classList.add('won');

  const canvas = $('#solvedImage');
  drawStageImage(canvas, activeOriginal);
  $('#winScreen').classList.remove('hidden');
}

$('#startButton').onclick = beginLevel;
$('#selectImage').onclick = selectRandomImage;
$('#helpAction').onclick = requestHelp;
$('#nextLevel').onclick = () => {
  level = level === 6 ? 1 : level + 1;
  showGallery();
};
$('#mainMenu').onclick = () => {
  level = 1;
  showGallery();
};
$('#howButton').onclick = () => $('#instructions').showModal();
$('#closeInstructions').onclick = () => $('#instructions').close();
$('#instructions').onclick = (event) => {
  if (event.target.id === 'instructions') $('#instructions').close();
};
window.addEventListener('resize', () => {
  if (!$('#game').classList.contains('hidden')) fitBoard();
  if (!$('#preview').classList.contains('hidden') && activeOriginal) {
    drawStageImage($('#previewCanvas'), activeOriginal);
  }
  if (!$('#winScreen').classList.contains('hidden') && activeOriginal) {
    drawStageImage($('#solvedImage'), activeOriginal);
  }
});

showGallery();
