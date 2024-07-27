const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array];
    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = clonedArray[i];
        clonedArray[i] = clonedArray[randomIndex];
        clonedArray[randomIndex] = original;
    }
    return clonedArray;
}

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension');
    if (dimensions % 2 !== 0) {
        throw new Error("Размер поля должен быть четным числом.");
    }

    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);

    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, 1fr)">
            ${items.map(item => `
                <div class="card" onclick="flipCard(this)">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
        </div>
    `;

    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.boardContainer.innerHTML = '';
    selectors.boardContainer.appendChild(parser.querySelector('.board'));
};

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');
    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerText = `${state.totalFlips} moves`;
        selectors.timer.innerText = `Time: ${state.totalTime} sec`;
    }, 1000);
};

const resetGame = () => {
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;

    clearInterval(state.loop);
    state.loop = null;
    selectors.start.classList.remove('disabled');

    selectors.win.innerHTML = '';
    selectors.moves.innerText = '0 moves';
    selectors.timer.innerText = 'Time: 0 sec';

    generateGame();
    state.gameStarted = false;
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;
};

const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    card.classList.add('flipped');

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }

    // Проверяем, если игрок перевернул все карточки
    if (!document.querySelectorAll('.card:not(.matched)').length) {
        setTimeout(() => {
            selectors.win.innerHTML = `
                <span class="win-text">
                    Вы победили!<br />
                    За <span class="highlight">${state.totalFlips}</span> ходов<br />
                    За <span class="highlight">${state.totalTime}</span> секунд
                </span>
            `;
        }, 1000);

    }
};

selectors.start.addEventListener('click', resetGame);

// Генерация игры при загрузке страницы
window.onload = () => {
    generateGame();
};
