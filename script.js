startGame(16, 16, 40)
startTimer()
function startTimer() {
  let startTime = null;
  let timerId = null;
  let timerRunning = false;
  const gameTimer = document.querySelector('.game_time');
  gameTimer.textContent = '000';

  function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    if (elapsedTime >= 999) {
      clearInterval(timerId);
      gameTimer.textContent = '999';
      return;
    }
    const formattedTime = elapsedTime.toString().padStart(3, '0');
    gameTimer.textContent = formattedTime;
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
startBtn.addEventListener('click', restartGame)

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

function restartGame() {
  startBtn.classList.remove('win')
  startBtn.classList.remove('lose')
  startGame(16, 16, 40)
}

function startGame(width, height, bombsCount) {
  const field = document.querySelector('.field_btns')
  field.addEventListener('contextmenu', toggleFlag)
  const cellsCount = width * height
  field.innerHTML = '<button class="btn"></button>'.repeat(cellsCount)
  const cells = [...field.children]

  let closedCount = cellsCount
  
  const bombs = [...Array(cellsCount).keys()]
  .sort(() => Math.random() - 0.5).slice(0, bombsCount)

  field.addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
      return
    }
    const index = cells.indexOf(e.target)
    const column = index % width
    const row = Math.floor(index / width)
    open(row, column)
  })

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
  
  
  function toggleFlag(e) {
    e.preventDefault();
  
    if (e.target.tagName !== 'BUTTON') {
      return;
    }
  
    const cell = e.target;
    
    if(cell.disabled === true) {
      return;
    }
  
    if(cell.classList.contains('flag')) {
      cell.classList.remove('flag');
    } else {
      cell.classList.add('flag');
    }
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
    
    if(count !== 0) {
      const colors = ['green', 'blue', 'red', 'blue', 'brown', 'cyan', 'black', 'gray'];
      const notBomb = document.createElement('div');
      notBomb.className = 'notBomb';
      notBomb.style.color = colors[count - 1];
      notBomb.textContent = count;
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