import { filters, timeLimits } from './config.js';
import { scenes, loadSceneImages, makeImage, drawStageImage } from './images.js';
import { createTimer } from './timer.js';
import { createBoardController } from './board.js';

const $ = (selector) => document.querySelector(selector);
let level = 1;
let selectedScene = 0;
const usedScenes = new Set();
let activeShape = { columns: 2, rows: 2, count: 4 };
let activeOriginal;
let started = false;
let helpUsed = false;
let timer;
let boardController;

function levelShape() {
  const columns = level < 3 ? 2 : level < 5 ? 3 : 4;
  return { columns, rows: 2, count: columns * 2 };
}

function setLevelLabel() {
  $('#levelLabel').textContent = `NIVEL ${level}/6`;
  $('#levelLabel').classList.remove('hidden');
}

function showGallery() {
  started = false;
  timer?.stop();
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

  started = true;
  boardController.setup();
  timer.start(timeLimits[level - 1]);
}

function requestHelp() {
  if (!started || level < 4 || helpUsed) return;
  if (!boardController.fixOneCorrectPiece()) return;
  helpUsed = true;
  $('#helpAction').disabled = true;
  $('#helpAction').textContent = 'Ayuda usada';
  $('#helpTimeChange').classList.remove('hidden');
  const remainingTime = timer.subtract(5);

  if (remainingTime <= 0) {
    loseLevel();
    return;
  }
  if (boardController.isSolved()) completeLevel();
}

function loseLevel() {
  started = false;
  timer?.stop();
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
  timer?.stop();
  $('#timer').classList.add('hidden');
  $('#helpCard').classList.add('hidden');
  $('#game').classList.add('won');

  boardController.revealOriginal();

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
  if (!$('#game').classList.contains('hidden')) boardController.fit();
  if (!$('#preview').classList.contains('hidden') && activeOriginal) {
    drawStageImage($('#previewCanvas'), activeOriginal);
  }
  if (!$('#winScreen').classList.contains('hidden')) positionWinControls();
});

boardController = createBoardController({
  getShape: () => activeShape,
  getScene: () => selectedScene,
  getLevel: () => level,
  getStarted: () => started,
  makeImage,
  filters,
  onSolved: completeLevel,
});
timer = createTimer({ element: $('#timer'), onExpire: loseLevel });
loadSceneImages().then(showGallery).catch((error) => console.error(error));
