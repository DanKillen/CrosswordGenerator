const crosswordContainer = document.getElementById('crossword-container');
const cluesContainer = document.getElementById('clues-container');
const revealBtn = document.querySelector('#reveal-container button');
let focusMode = 'horizontal';
let placedWords = [];


async function fetchData() {
  const response = await fetch('/api/clues');
  const data = await response.json();
  return data;
}

function buildGrid(size) {
  const grid = new Array(size);
  for (let i = 0; i < size; i++) {
    grid[i] = new Array(size).fill('.');
  }
  return grid;
}

function createEmptyGrid(size) {
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push('.');
    }
    grid.push(row);
  }
  return grid;
}

function findWordsWithLength(words, length) {
  return words.filter((wordObj) => wordObj.answer.length === length);
}

function canPlaceWord(grid, word, x, y, isHorizontal) {
  const size = grid.length;
  let intersectCount = 0;

  for (let i = 0; i < word.length; i++) {
    const xi = isHorizontal ? x + i : x;
    const yi = isHorizontal ? y : y + i;

    if (xi < 0 || xi >= size || yi < 0 || yi >= size) {
      return false;
    }

    const cell = grid[yi][xi];
    if (cell !== '.' && cell !== word[i]) {
      return false;
    }

    if (cell === word[i]) {
      intersectCount++;
    }
  }

  if (placedWords.length > 0 && intersectCount === 0) {
    let hasIntersectingCharacter = false;
    for (let i = 0; i < placedWords.length; i++) {
      const placedWord = placedWords[i].word;
      for (let j = 0; j < word.length; j++) {
        if (placedWord.includes(word[j])) {
          hasIntersectingCharacter = true;
          break;
        }
      }
      if (hasIntersectingCharacter) break;
    }
    if (!hasIntersectingCharacter) return false;
  }

  return true;
}

function placeWord(grid, word, x, y, isHorizontal) {
  for (let i = 0; i < word.length; i++) {
    const xi = isHorizontal ? x + i : x;
    const yi = isHorizontal ? y : y + i;
    grid[yi][xi] = word[i];
  }
}

function generateCrossword(words, layout) {
  const size = 10;
  const grid = createEmptyGrid(size);


  for (let i = 0; i < layout.length; i++) {
    const { x, y, isHorizontal, length } = layout[i];
    let availableWords = words.slice();

    while (availableWords.length > 0) {
      const randomWordIndex = Math.floor(Math.random() * availableWords.length);
      const wordObj = availableWords[randomWordIndex];
      const word = wordObj.answer;

      if (word.length === length && canPlaceWord(grid, word, x, y, isHorizontal, placedWords)) {
        placeWord(grid, word, x, y, isHorizontal);
        placedWords.push({ x, y, isHorizontal, clue: wordObj.clue, word });
        break;
      }

      availableWords.splice(randomWordIndex, 1);
    }

    if (availableWords.length === 0) {
      console.warn(`Failed to place a word for the layout at index ${i}`);
    }
  }

  assignClueNumbers(placedWords);

  return { grid, placedWords };
}

function checkCorrectAnswers() {
  let correctCellsCount = 0;
  const totalCells = crosswordContainer.querySelectorAll('.cell').length;

  placedWords.forEach((wordObj, index) => {
    const wordCells = crosswordContainer.querySelectorAll(`.cell.wordid-${index}`);
    const allCorrect = Array.from(wordCells).every((cell) => cell.value === cell.dataset.char);

    wordCells.forEach((cell) => {
      if (allCorrect || cell.classList.contains('correct')) {
        cell.classList.add('correct');
        correctCellsCount++;
      } else {
        cell.classList.remove('correct');
      }
    });

    const clueElement = cluesContainer.querySelector(`p[data-word-id="${index}"]`);
    if (clueElement) {
      clueElement.style.color = allCorrect ? 'lightgreen' : '';
    }
  });

  if (correctCellsCount === totalCells) {
    alert('Well done!');
  }
}

crosswordContainer.addEventListener('input', (event) => {
  const { target } = event;
  if (target.matches('.cell')) {
    target.classList.remove('correct');
    checkCorrectAnswers();
  }
});

function letterEntry(input) {
  input.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();

    const currentX = parseInt(input.style.gridColumn) - 1;
    const currentY = parseInt(input.style.gridRow) - 1;

    let nextCell;

    if (focusMode === 'horizontal') {
      const nextX = currentX + 1;
      nextCell = document.getElementById(`cell-${nextX}-${currentY}`);
    } else {
      const nextY = currentY + 1;
      nextCell = document.getElementById(`cell-${currentX}-${nextY}`);
    }

    if (nextCell && nextCell.style.backgroundColor !== 'black') {
      nextCell.focus();
    }
    checkCorrectAnswers();
  });
}

function assignClueNumbers() {
  let clueNumber = 1;

  placedWords.forEach((wordObj, index) => {
    const { x, y, isHorizontal } = wordObj;

    if (index === 0 || (isHorizontal && placedWords[index - 1].y !== y) || (!isHorizontal && placedWords[index - 1].x !== x)) {
      wordObj.number = clueNumber++;
    } else {
      wordObj.number = placedWords[index - 1].number;
    }
  });
}

function renderCrossword(grid) {
  crosswordContainer.innerHTML = '';
  crosswordContainer.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;
  crosswordContainer.style.gridTemplateRows = `repeat(${grid.length}, 1fr)`;

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cellWrapper = document.createElement('div');
      cellWrapper.className = 'cell-wrapper';
      const input = document.createElement('input');
      input.classList.add('cell');
      input.maxLength = 1;
      input.style.gridColumn = x + 1;
      input.style.gridRow = y + 1;

      if (cell === '.') {
        input.value = '';
        input.readOnly = true;
        input.style.backgroundColor = 'black';
      } else {
        input.dataset.char = cell;
        input.id = `cell-${x}-${y}`;

        placedWords.forEach((wordObj, index) => {
          const { x: wordX, y: wordY, isHorizontal, word } = wordObj;

          if (wordX === x && wordY === y) {
            const cellNumber = document.createElement('div');
            cellNumber.classList.add('cell-number');
            cellNumber.textContent = wordObj.number;
            cellWrapper.appendChild(cellNumber);
          }
        
          for (let i = 0; i < word.length; i++) {
            const xi = isHorizontal ? wordX + i : wordX;
            const yi = isHorizontal ? wordY : wordY + i;
        
            const cell = document.getElementById(`cell-${xi}-${yi}`);
            if (cell) {
              cell.classList.add(`wordid-${index}`);
            }
          }
        });

        letterEntry(input);
      }
      cellWrapper.appendChild(input); // Change this line
      crosswordContainer.appendChild(cellWrapper); // Change this line
    });
  });
  renderClues();
}

function assignClueNumbers() {
  let clueNumber = 1;

  placedWords.forEach((wordObj, index) => {
    const { x, y, isHorizontal } = wordObj;

    if (index === 0 || (isHorizontal && placedWords[index - 1].y !== y) || (!isHorizontal && placedWords[index - 1].x !== x)) {
      wordObj.number = clueNumber++;
    } else {
      wordObj.number = placedWords[index - 1].number;
    }
  });
}

function renderClues() {
  cluesContainer.innerHTML = '';
  const acrossClues = document.createElement('div');
  acrossClues.innerHTML = '<h3>Across</h3>';
  const downClues = document.createElement('div');
  downClues.innerHTML = '<h3>Down</h3>';

  placedWords.forEach((wordObj, index) => {
    const clueElem = document.createElement('p');
    clueElem.innerText = `${wordObj.number}. ${wordObj.clue}`;
    clueElem.dataset.wordId = index;
    if (wordObj.isHorizontal) {
      acrossClues.appendChild(clueElem);
    } else {
      downClues.appendChild(clueElem);
    }
  });

  cluesContainer.appendChild(acrossClues);
  cluesContainer.appendChild(downClues);
}

async function init() {
  const cluesData = await fetch('/api/clues');
  const clues = await cluesData.json();
  const layout = [
    { x: 0, y: 0, isHorizontal: true, length: 10 },
    { x: 0, y: 0, isHorizontal: false, length: 5 },
    { x: 2, y: 0, isHorizontal: false, length: 5 },
    { x: 4, y: 0, isHorizontal: false, length: 5 },
    { x: 6, y: 0, isHorizontal: false, length: 5 },
    { x: 8, y: 0, isHorizontal: false, length: 5 },    
    { x: 6, y: 4, isHorizontal: true, length: 4 },
    { x: 7, y: 4, isHorizontal: false, length: 4 },      
    { x: 9, y: 4, isHorizontal: false, length: 6 },  
    { x: 0, y: 6, isHorizontal: true, length: 6 },
    { x: 0, y: 6, isHorizontal: false, length: 4 },  
    { x: 0, y: 8, isHorizontal: true, length: 4 },   
    { x: 4, y: 7, isHorizontal: false, length: 4 },
    { x: 4, y: 9, isHorizontal: true, length: 6 },
  ];

  const { grid, placedWords } = generateCrossword(clues, layout);
  assignClueNumbers();
  renderCrossword(grid, placedWords);
  const toggleFocusBtn = document.getElementById('toggle-focus-mode');

  toggleFocusBtn.addEventListener('click', () => {
    if (focusMode === 'horizontal') {
      focusMode = 'vertical';
      toggleFocusBtn.textContent = 'Writing Direction: Down';
    } else {
      focusMode = 'horizontal';
      toggleFocusBtn.textContent = 'Writing Direction: Across';
    }
  });
}

init();

revealBtn.onclick = () => {
  const cells = crosswordContainer.querySelectorAll('.cell');
  cells.forEach((cell) => {
    if (cell.dataset.char) {
      cell.value = cell.dataset.char;
    }
  });
};