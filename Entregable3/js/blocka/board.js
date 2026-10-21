
import {
  filterGrayscale,
  filterNegative,
  filterBrightness30,
  filterBlur
} from './filters.js';

export function createBoardController({
  getShape,
  getScene,
  getLevel,
  getStarted,
  makeImage,
  filters,
  onSolved,
}) {
  const $ = (selector) => document.querySelector(selector);
  let pieces = [];


  function isSolved() {
    return pieces.every((piece) => piece.turns === 0);
  }


  function rotatePiece(index, direction) {
    const piece = pieces[index];
    if (!getStarted() || piece.locked) return;

    piece.turns = (piece.turns + direction + 4) % 4;
    piece.tile.style.transform = `rotate(${piece.turns * 90}deg)`;
    if (isSolved()) onSolved();
  }


  function fit() {
    const { columns, rows } = getShape();
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


  function setup() {
    const { columns, rows, count } = getShape();
    const source = makeImage(getScene(), false, getShape());
    const board = $('#board');
    board.style.setProperty('--columns', columns);
    board.style.setProperty('--rows', rows);
    board.style.aspectRatio = `${columns} / ${rows}`;
    fit();
    board.innerHTML = '';
    pieces = [];
    const filterName = filters[Math.floor(Math.random() * 4)];
      

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

      //Guarda OG
      const originalImage = document.createElement('canvas');
      originalImage.width = pieceImage.width;
      originalImage.height = pieceImage.height;
      originalImage.getContext('2d').drawImage(pieceImage, 0, 0);

      const pieceContext = pieceImage.getContext('2d');
      const sourcePixels = pieceContext.getImageData(0, 0, pieceImage.width, pieceImage.height );
      //const filterName = filters[Math.floor(Math.random() * 4)];
      let filteredPixels = sourcePixels;

      if (filterName === 'grayscale') {
        filteredPixels = filterGrayscale(pieceContext, sourcePixels);
      } else if (filterName === 'brightness') {
        filteredPixels = filterBrightness30(pieceContext, sourcePixels);
      } else if (filterName === 'negative') {
        filteredPixels = filterNegative(pieceContext, sourcePixels);
      }  else if (filterName === 'blur') {
        filteredPixels = filterBlur(pieceContext, sourcePixels);
      }

      // px ya mod al canvas
      pieceContext.putImageData(filteredPixels, 0, 0);

      tile.className = 'tile';
      tile.setAttribute('aria-label', `Pieza ${index + 1}`);
      tile.append(pieceImage);
      tile.style.transform = `rotate(${turns * 90}deg)`;
      tile.onclick = () => rotatePiece(index, -1);
      tile.oncontextmenu = (event) => {
        event.preventDefault();
        rotatePiece(index, 1);
      };
      pieces.push({ tile, turns, locked: false, originalImage });
      board.append(tile);
    }
  }


  function fixOneCorrectPiece() {
    const piece = pieces.find((item) => !item.locked && item.turns !== 0)
      || pieces.find((item) => !item.locked);
    if (!piece) return false;

    piece.turns = 0;
    piece.locked = true;
    piece.tile.style.transform = 'rotate(0deg)';
    piece.tile.classList.add('fixed');
    piece.tile.setAttribute('aria-label', `${piece.tile.getAttribute('aria-label')}, ubicada correctamente`);
    return true;
  }


  function revealOriginal() {
  pieces.forEach(({ tile, originalImage }) => {
    const canvas = tile.querySelector('canvas');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(originalImage, 0, 0);

    tile.style.transform = 'none';
    tile.classList.remove('fixed');
  });
}


  return {
    setup,
    fit,
    fixOneCorrectPiece,
    isSolved,
    revealOriginal,
  };
}
