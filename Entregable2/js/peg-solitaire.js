const size = 7;
const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];

function isValid(row, column) {
    return (row >= 2 && row <= 4) || (column >= 2 && column <= 4);
}

export function setupPegSolitaire(root, player, launchButton) {
    const board = root.querySelector("#peg-board");
    const moveCount = root.querySelector("#peg-moves");
    const pegCount = root.querySelector("#peg-left");
    const timeLabel = root.querySelector("#peg-time");
    const status = root.querySelector("#peg-status");
    const result = root.querySelector("#peg-result");
    const resultTitle = root.querySelector("#peg-result-title");
    const resultMessage = root.querySelector("#peg-result-message");
    const replayButton = root.querySelector("#peg-replay");
    let pegs;
    let cells;
    let selected = null;
    let moves = 0;
    let seconds = 0;
    let started = false;
    let ended = false;
    let timer;

    const formatTime = value => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
    const countPegs = () => pegs.flat().filter(Boolean).length;
    const isLegal = (row, column, dr, dc) => {
        const toRow = row + dr;
        const toColumn = column + dc;
        return toRow >= 0 && toRow < size && toColumn >= 0 && toColumn < size
            && isValid(toRow, toColumn) && !pegs[toRow][toColumn]
            && pegs[row + dr / 2][column + dc / 2];
    };
    const hasMoves = () => pegs.some((line, row) => line.some((hasPeg, column) => hasPeg
        && directions.some(([dr, dc]) => isLegal(row, column, dr, dc))));

    const render = () => {
        const targets = new Set();
        if (selected) directions.forEach(([dr, dc]) => {
            if (isLegal(selected.row, selected.column, dr, dc)) {
                targets.add(`${selected.row + dr}-${selected.column + dc}`);
            }
        });

        cells.forEach((line, row) => line.forEach((cell, column) => {
            if (!cell) return;
            const hasPeg = pegs[row][column];
            cell.classList.toggle("is-occupied", hasPeg);
            cell.classList.toggle("is-selected", selected?.row === row && selected?.column === column);
            cell.classList.toggle("is-valid-target", targets.has(`${row}-${column}`));
            cell.disabled = !started || ended;
            cell.setAttribute("aria-pressed", String(selected?.row === row && selected?.column === column));
            cell.setAttribute("aria-label", hasPeg ? `Ficha en fila ${row + 1}, columna ${column + 1}` : `Espacio vacío en fila ${row + 1}, columna ${column + 1}`);
            cell.innerHTML = hasPeg ? '<img class="peg-minion" src="img/peg-token.svg?v=2" alt="Ficha minion" draggable="false">' : "";
        }));

        moveCount.textContent = moves;
        pegCount.textContent = countPegs();
        timeLabel.textContent = formatTime(seconds);
    };

    const finishIfNeeded = () => {
        const remaining = countPegs();
        if (remaining === 1) {
            ended = true;
            clearInterval(timer);
            resultTitle.textContent = "¡Ganaste!";
            resultMessage.textContent = "Dejaste una sola ficha en el tablero.";
        } else if (!hasMoves()) {
            ended = true;
            clearInterval(timer);
            resultTitle.textContent = "Fin de la partida";
            resultMessage.textContent = `No quedan movimientos. Te quedaron ${remaining} fichas.`;
        }
        if (ended) {
            status.textContent = "";
            result.hidden = false;
            root.classList.add("is-ended");
        }
    };

    const playAt = (row, column) => {
        if (!started || ended) return;
        if (pegs[row][column]) {
            selected = selected?.row === row && selected?.column === column ? null : { row, column };
            status.textContent = selected ? "Elegí un espacio marcado para mover la ficha." : "Seleccioná una ficha y saltá sobre otra hacia un espacio vacío.";
        } else if (selected) {
            const dr = row - selected.row;
            const dc = column - selected.column;
            if (directions.some(([legalRow, legalColumn]) => legalRow === dr && legalColumn === dc)
                && isLegal(selected.row, selected.column, dr, dc)) {
                pegs[selected.row][selected.column] = false;
                pegs[selected.row + dr / 2][selected.column + dc / 2] = false;
                pegs[row][column] = true;
                selected = null;
                moves++;
                status.textContent = "Buen movimiento. Seguí buscando la solución.";
                render();
                finishIfNeeded();
            } else {
                status.textContent = "Ese salto no es válido. Elegí un espacio marcado.";
            }
        }
        render();
    };

    const buildBoard = () => {
        cells = Array.from({ length: size }, () => Array(size).fill(null));
        board.replaceChildren();
        for (let row = 0; row < size; row++) {
            for (let column = 0; column < size; column++) {
                if (!isValid(row, column)) {
                    const filler = document.createElement("span");
                    filler.className = "peg-cell is-invalid";
                    filler.setAttribute("aria-hidden", "true");
                    board.append(filler);
                    continue;
                }
                const cell = document.createElement("button");
                cell.type = "button";
                cell.className = "peg-cell";
                cell.setAttribute("role", "gridcell");
                cell.addEventListener("click", () => playAt(row, column));
                cells[row][column] = cell;
                board.append(cell);
            }
        }
    };

    const reset = () => {
        pegs = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => isValid(row, column) && !(row === 3 && column === 3)));
        selected = null;
        moves = 0;
        seconds = 0;
        ended = false;
        result.hidden = true;
        root.classList.remove("is-ended");
        resultTitle.textContent = "";
        resultMessage.textContent = "";
        status.textContent = started ? "Seleccioná una ficha y saltá sobre otra hacia un espacio vacío." : "Tocá Jugar para comenzar.";
        render();
        if (started) finishIfNeeded();
    };

    buildBoard();
    launchButton.addEventListener("click", () => {
        started = true;
        player.classList.add("is-playing");
        status.textContent = "Seleccioná una ficha y saltá sobre otra hacia un espacio vacío.";
        timer = setInterval(() => {
            seconds++;
            timeLabel.textContent = formatTime(seconds);
        }, 1000);
        render();
    }, { once: true });
    replayButton.addEventListener("click", () => {
        clearInterval(timer);
        reset();
        timer = setInterval(() => {
            seconds++;
            timeLabel.textContent = formatTime(seconds);
        }, 1000);
    });
    reset();
}
