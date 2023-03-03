startGame(16, 16, 40)
startTimer()
function startTimer() {
  let startTime = null;
  let timerId = null;
  let timerRunning = false;
  const gameTimer = document.querySelector('.game_time');

  gameTimer.innerHTML = '<span class="score-0"></span><span class="score-0"></span><span class="score-0"></span>';

  function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    if (elapsedTime >= 999 || startBtn.classList.contains('win')) {
      clearInterval(timerId);
      timerRunning = false;
      if (startBtn.classList.contains('win')) {
        alert('Победа!')
      }
      return;
    }
  
    if (elapsedTime >= 999) {
      clearInterval(timerId);
      gameTimer.innerHTML = '<span class="score-9"></span><span class="score-9"></span><span class="score-9"></span>';
      return;
    }
    const formattedTime = elapsedTime.toString().padStart(3, '0');
    gameTimer.innerHTML = '';
    for (let i = 0; i < formattedTime.length; i++) {
      const digit = formattedTime.charAt(i);
      const span = document.createElement('span');
      span.classList.add(`score-${digit}`);
      gameTimer.appendChild(span);
    }
  }

  function handleGameEnd() {
    clearInterval(timerId);
    timerRunning = false;
  }

  function handleFieldBtnClick() {
    if (!timerRunning) {
      startTime = new Date().getTime();
      timerId = setInterval(updateTimer, 1000);
      timerRunning = true;
    }
  }

  document.querySelectorAll('.field_btns button').forEach(btn => {
    btn.addEventListener('click', handleFieldBtnClick);
  });
  document.querySelector('.start').addEventListener('click', () => {
    startTime = new Date().getTime();
    timerId = setInterval(updateTimer, 1000);
    timerRunning = true;
  });
  document.querySelector('.game_time').addEventListener('click', handleGameEnd);
}

const startBtn = document.querySelector('.start')
startBtn.addEventListener('click', resetGame)

function handleStartMouseDown() {
  startBtn.classList.remove('start')
  startBtn.classList.remove('lose')
  startBtn.classList.remove('win')
  startBtn.classList.add('start_pressed')
}

function handleStartMouseUp() {
  startBtn.classList.remove('start_pressed')
  startBtn.classList.remove('lose')
  startBtn.classList.remove('win')
  startBtn.classList.add('start')
}

startBtn.addEventListener('mousedown', handleStartMouseDown)
startBtn.addEventListener('mouseup', handleStartMouseUp)

function resetGame() {
  startGame(16, 16, 40)
  cellStates = [];
  clearInterval(timerId);
  const gameTimer = document.querySelector('.game_time');
  gameTimer.innerHTML = '<span class="score-0"></span><span class="score-0"></span><span class="score-0"></span>';
  const field = document.querySelector('.field_btns');
  field.removeEventListener('click', handleClick);
  field.removeEventListener('mousedown', handleFieldMouseDown);
  field.removeEventListener('mouseup', handleFieldMouseUp);
  field.removeEventListener('contextmenu', toggleFlag);
  const cells = field.querySelectorAll('button');
  cells.forEach(cell => {
    cell.disabled = false;
    cell.classList.remove('open', 'flag', 'question', 'question_pressed', 'bomb', 'bomb_red');
    cell.innerHTML = '';
  });
}

function startGame(width, height, bombsCount) {
  const field = document.querySelector('.field_btns')
  field.addEventListener('contextmenu', toggleFlag)
  const cellsCount = width * height
  field.innerHTML = '<button class="btn"></button>'.repeat(cellsCount)
  const cells = [...field.children]

  let closedCount = cellsCount
  
  let bombs = [...Array(cellsCount).keys()]
  let firstClicked = false

  field.addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
      return
    }
    const index = cells.indexOf(e.target)
    const column = index % width
    const row = Math.floor(index / width)
    if (!firstClicked) {
      bombs = [...Array(cellsCount).keys()]
        .filter(i => i !== index)
        .sort(() => Math.random() - 0.5)
        .slice(0, bombsCount)
      firstClicked = true
    }
    open(row, column)
  })

  resetField()
  function resetField() {
    cells.forEach(cell => {
      cell.disabled = false;
      cell.classList.remove('flag', 'question', 'question_pressed');
    });
  }

  beginBombValue()
  function beginBombValue() {
    const beginValue = document.querySelector('.game_bombs_count');
    beginValue.innerHTML = '<span class="score-0"></span><span class="score-4"></span><span class="score-0"></span>';
  }

  function updateBombsCount() {
    const bombsCountElem = document.querySelector('.game_bombs_count');
    const bombsLeft = bombsCount - document.querySelectorAll('.field_btns button.bomb.open, .field_btns button.bomb.flag').length;
    const flagsCount = document.querySelectorAll('.field_btns button.flag, .field_btns button.question').length;
  
    let bombsMarked = flagsCount;
    if (bombsMarked < 0) {
      bombsMarked = 0;
    }
    if (bombsMarked > bombsLeft) {
      bombsMarked = bombsLeft;
    }
  
    bombsCountElem.innerHTML = '';
    const bombsLeftStr = (bombsLeft < 0 ? 0 : bombsLeft - bombsMarked).toString().padStart(3, '0');
    for (let i = 0; i < 3; i++) {
      const digit = bombsLeftStr.charAt(i);
      const span = document.createElement('span');
      span.classList.add(`score-${digit}`);
      bombsCountElem.appendChild(span);
    }
  
    const bombButtons = document.querySelectorAll('.field_btns button.bomb');
    if (bombsMarked === bombsLeft) {
      bombButtons.forEach(button => {
        if (!button.classList.contains('flag')) {
          button.disabled = true;
        }
      });
    } else {
      bombButtons.forEach(button => button.disabled = false);
    }
    return bombsMarked;
  }

  function isValid(row, column) {
    return row >= 0 && row < height && column >= 0 && column < width
  }

  function getCount(row, column) {
    let count = 0
    for(let i = -1; i <= 1; i++) {
      for(let j = -1; j <= 1; j++) {
        if(isBomb(row + j, column + i)) {
          count++
        }
      }
    }
    return count
  }

  function handleFieldMouseDown() {
    startBtn.classList.remove('start');
    startBtn.classList.add('wow');
  }

  function handleFieldMouseUp() {
    startBtn.classList.remove('wow');
    startBtn.classList.add('start');
  }

  field.addEventListener('mousedown', handleFieldMouseDown);
  field.addEventListener('mouseup', handleFieldMouseUp);

  function disableField() {
    const field = document.querySelector('.field_btns');
    const cells = field.querySelectorAll('button');
  
    cells.forEach((cell, index) => {
      cell.disabled = true;
  
      if(bombs.includes(index)) {
        cell.classList.add('bomb_cmpl');
      }
    });
  }
  
  let cellStates = [];

  function toggleFlag(e) {
    e.preventDefault();

    if (e.target.tagName !== 'BUTTON') {
      return;
    }

    const cell = e.target;
    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);

    if (cell.disabled === true) {
      return;
    }

    const flags = cellStates.filter(state => state === 'flag').length;

    if (flags >= bombsCount) {
      if (cellStates[cellIndex] !== 'flag') {
        return;
      }
    }

    if (cellStates[cellIndex] === 'flag') {
      cellStates[cellIndex] = 'question';
      cell.classList.remove('flag');
      cell.classList.add('question');
    } else if (cellStates[cellIndex] === 'question') {
      cellStates[cellIndex] = '';
      cell.classList.remove('question');
      cell.classList.add('question_pressed');
    } else if (cellStates[cellIndex] === 'question_pressed') {
      cellStates[cellIndex] = '';
      cell.classList.remove('question_pressed');
    } else {
      cellStates[cellIndex] = 'flag';
      cell.classList.add('flag');
    }
    updateBombsCount();
  }

  function open(row, column) {
    if(!isValid(row, column)) return
    
    const index = row * width + column
    const cell = cells[index]

    if(cell.disabled === true) return
    cell.disabled = true

    if(isBomb(row, column)) {
      cell.innerHTML = '<div class="bomb"></div>'
      disableField()
      startBtn.classList.add('lose')
      return
    }

    closedCount--
    if(closedCount <= bombsCount) {
      startBtn.classList.add('win')
      return
    }

    const count = getCount(row, column)

    if(count === 0) {
      cell.classList.add('back_pressed_null')
    }
    
    if(count !== 0) {
      const colors = ['green', 'blue', 'red', 'blue', 'brown', 'cyan', 'black', 'gray'];
      const notBomb = document.createElement('div');
      notBomb.className = 'notBomb';
      notBomb.style.color = colors[count - 1];
      notBomb.textContent = count;
      notBomb.classList.add('back_pressed')
      cell.appendChild(notBomb);
      return;
    }
    
    for(let i = -1; i <= 1; i++) {
      for(let j = -1; j <= 1; j++) {
        open(row + j, column + i)
      }
    }
  }

  function isBomb(row, column) {
    if(!isValid(row, column)) return false
    const index = row * width + column
    return bombs.includes(index)
  }
}