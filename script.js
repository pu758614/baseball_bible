// 棒球查經遊戲邏輯

// 遊戲狀態
const gameState = {
    // 隊伍分數
    scores: {
        team1: 0,
        team2: 0
    },
    // 當前局數
    currentInning: 1,
    totalInnings: 3,
    // 當前出局數
    outs: 0,
    // 當前攻擊隊 (1 或 2)
    currentTeam: 1,
    // 壘包狀態 (true 代表有跑者)
    bases: {
        first: false,
        second: false,
        third: false
    },
    // 遊戲是否進行中
    inProgress: false,
    // 計時器
    timer: null,
    timeLeft: 30,
    // 題目庫
    questions: {
        single: [
            "耶穌是從伯利恆出生的嗎？（是/否）",
            "摩西是否寫了五經？（是/否）",
            "大衛是否是以色列的第一位國王？（是/否）",
            "保羅在被囚期間是否寫了以弗所書？（是/否）",
            "挪亞方舟是否停在亞拉臘山上？（是/否）"
        ],
        double: [
            "耶穌的十二門徒不包括誰？ A.彼得 B.猶大 C.提摩太 D.約翰",
            "哪一卷福音書不是符類福音？ A.馬太福音 B.馬可福音 C.約翰福音 D.路加福音",
            "以下哪位不是舊約先知？ A.以賽亞 B.耶利米 C.巴拿巴 D.以西結",
            "耶穌在哪裡長大？ A.伯利恆 B.拿撒勒 C.耶路撒冷 D.埃及",
            "聖經中最短的經文是？ A.耶穌哭了 B.應當喜樂 C.神是愛 D.要常常禱告"
        ],
        triple: [
            "請解釋浪子回頭比喻中大兒子的態度",
            "解釋耶穌的「愛你的敵人」教導如何超越舊約律法",
            "對比彼得與猶大的背叛，為何結局不同？",
            "解釋保羅在哥林多前書13章中對愛的定義",
            "解釋耶穌在馬太福音5章中如何重新詮釋律法"
        ],
        homerun: [
            "如何把浪子回頭的教訓應用在現代生活？",
            "在面對職場衝突時，如何應用聖經的和解原則？",
            "請解釋羅馬書8章中保羅對預定論的教導，並談談它如何影響我們的信仰生活",
            "請背誦登山寶訓（馬太福音5-7章）的核心教導，並解釋如何在日常生活中實踐",
            "耶穌對門徒說「你們是世上的鹽，世上的光」，這對現代基督徒的社會責任有什麼啟示？"
        ]
    },
    // 當前題目
    currentQuestion: null,
    currentQuestionType: null,
    // 遊戲設定
    settings: {
        timerDuration: 30,
        enableSteal: true,
        enableHint: true
    }
};

// DOM 元素
const elements = {
    team1Score: document.getElementById('team1-score'),
    team2Score: document.getElementById('team2-score'),
    currentInning: document.getElementById('current-inning'),
    totalInnings: document.getElementById('total-innings'),
    outsCount: document.getElementById('outs-count'),
    battingTeam: document.getElementById('batting-team'),

    // 壘包和跑者
    firstBase: document.getElementById('first-base'),
    secondBase: document.getElementById('second-base'),
    thirdBase: document.getElementById('third-base'),
    runnerFirst: document.getElementById('runner-first'),
    runnerSecond: document.getElementById('runner-second'),
    runnerThird: document.getElementById('runner-third'),
    runnerHome: document.getElementById('runner-home'),

    // 題目區域
    questionContainer: document.getElementById('question-container'),
    questionDifficulty: document.getElementById('question-difficulty'),
    questionContent: document.getElementById('question-content'),
    timerCount: document.getElementById('timer-count'),

    // 按鈕
    hitButton: document.getElementById('hit-button'),
    answerButtons: document.getElementById('answer-buttons'),
    correctButton: document.getElementById('correct-button'),
    wrongButton: document.getElementById('wrong-button'),

    // 模態對話框
    settingsModal: document.getElementById('settings-modal'),
    gameOverModal: document.getElementById('game-over-modal'),
    continueGameModal: document.getElementById('continue-game-modal'),
    winnerDisplay: document.getElementById('winner-display'),
    finalScoreTeam1: document.getElementById('final-score-team1'),
    finalScoreTeam2: document.getElementById('final-score-team2'),

    // 已保存遊戲資訊
    savedInning: document.getElementById('saved-inning'),
    savedTotalInnings: document.getElementById('saved-total-innings'),
    savedTeam1Score: document.getElementById('saved-team1-score'),
    savedTeam2Score: document.getElementById('saved-team2-score'),
    savedCurrentTeam: document.getElementById('saved-current-team'),

    // 繼續遊戲按鈕
    continueGameButton: document.getElementById('continue-game'),
    startNewGameButton: document.getElementById('start-new-game'),

    // 設定
    inningsSetting: document.getElementById('innings-setting'),
    timerSetting: document.getElementById('timer-setting'),
    stealSetting: document.getElementById('steal-setting'),
    hintSetting: document.getElementById('hint-setting'),
    startGameButton: document.getElementById('start-game'),
    newGameButton: document.getElementById('new-game')
};

// 初始化遊戲
function initGame() {
    // 添加事件監聽器
    setupEventListeners();

    // 添加頁面關閉前保存遊戲狀態的事件
    window.addEventListener('beforeunload', saveGameState);

    // 檢查是否有保存的遊戲狀態
    const savedState = localStorage.getItem('baseballBibleGameState');

    if (savedState) {
        const parsedState = JSON.parse(savedState);

        // 只有當遊戲狀態為進行中時才詢問是否繼續
        if (parsedState.inProgress) {
            // 更新繼續遊戲對話框中的資訊
            updateContinueGameDialog(parsedState);

            // 顯示繼續遊戲對話框
            elements.continueGameModal.style.display = 'flex';

            // 重要：確保設定對話框不顯示
            elements.settingsModal.style.display = 'none';
        } else {
            // 如果保存的遊戲已結束，顯示設定對話框
            resetGameState();
            elements.settingsModal.style.display = 'flex';
        }
    } else {
        // 如果沒有保存的遊戲狀態，重置並顯示設定對話框
        resetGameState();
        elements.settingsModal.style.display = 'flex';
    }
}

// 重置遊戲狀態
function resetGameState() {
    gameState.scores.team1 = 0;
    gameState.scores.team2 = 0;
    gameState.currentInning = 1;
    gameState.outs = 0;
    gameState.currentTeam = 1;
    gameState.bases = { first: false, second: false, third: false };
    gameState.inProgress = false;
    clearInterval(gameState.timer);
    gameState.timeLeft = gameState.settings.timerDuration;
}

// 更新UI
function updateUI() {
    // 更新分數
    elements.team1Score.textContent = gameState.scores.team1;
    elements.team2Score.textContent = gameState.scores.team2;

    // 更新局數
    elements.currentInning.textContent = gameState.currentInning;
    elements.totalInnings.textContent = gameState.totalInnings;

    // 更新出局數
    elements.outsCount.textContent = gameState.outs;

    // 更新當前攻擊隊
    elements.battingTeam.textContent = gameState.currentTeam === 1 ? '攻擊隊' : '守備隊';

    // 更新壘包
    updateBases();

    // 更新計時器
    elements.timerCount.textContent = gameState.timeLeft;
}

// 更新壘包顯示
function updateBases() {
    // 更新跑者顯示
    elements.runnerFirst.style.display = gameState.bases.first ? 'block' : 'none';
    elements.runnerSecond.style.display = gameState.bases.second ? 'block' : 'none';
    elements.runnerThird.style.display = gameState.bases.third ? 'block' : 'none';
}

// 設置事件監聽器
function setupEventListeners() {
    // 打擊按鈕
    elements.hitButton.addEventListener('click', handleHit);

    // 答題結果按鈕
    elements.correctButton.addEventListener('click', handleCorrectAnswer);
    elements.wrongButton.addEventListener('click', handleWrongAnswer);

    // 設定按鈕
    elements.startGameButton.addEventListener('click', startGame);
    elements.newGameButton.addEventListener('click', () => {
        // 隱藏遊戲結束對話框
        elements.gameOverModal.style.display = 'none';

        // 重置遊戲狀態
        resetGameState();

        // 保存重置後的狀態
        saveGameState();

        // 顯示設定對話框
        elements.settingsModal.style.display = 'flex';
    });

    // 繼續遊戲對話框按鈕
    elements.continueGameButton.addEventListener('click', () => {
        // 隱藏繼續遊戲對話框
        elements.continueGameModal.style.display = 'none';

        // 直接從 localStorage 獲取保存的遊戲狀態
        const savedState = localStorage.getItem('baseballBibleGameState');

        if (savedState) {
            const parsedState = JSON.parse(savedState);

            // 直接恢復狀態
            gameState.scores = parsedState.scores;
            gameState.currentInning = parsedState.currentInning;
            gameState.totalInnings = parsedState.totalInnings;
            gameState.outs = parsedState.outs;
            gameState.currentTeam = parsedState.currentTeam;
            gameState.bases = parsedState.bases;
            gameState.settings = parsedState.settings;

            // 設定值到設定面板（以便下次開始新遊戲時使用相同設定）
            elements.inningsSetting.value = gameState.totalInnings;
            elements.timerSetting.value = gameState.settings.timerDuration;
            elements.stealSetting.checked = gameState.settings.enableSteal;
            elements.hintSetting.checked = gameState.settings.enableHint;

            // 關鍵步驟：確保遊戲狀態為進行中
            gameState.inProgress = true;

            // 更新UI
            updateUI();
        }
    });

    elements.startNewGameButton.addEventListener('click', () => {
        // 隱藏繼續遊戲對話框
        elements.continueGameModal.style.display = 'none';

        // 重置遊戲狀態
        resetGameState();

        // 保存重置後的狀態
        saveGameState();

        // 顯示設定對話框
        elements.settingsModal.style.display = 'flex';
    });
}

// 開始遊戲
function startGame() {
    // 從設定中獲取值
    gameState.totalInnings = parseInt(elements.inningsSetting.value);
    gameState.settings.timerDuration = parseInt(elements.timerSetting.value);
    gameState.settings.enableSteal = elements.stealSetting.checked;
    gameState.settings.enableHint = elements.hintSetting.checked;

    // 更新UI
    elements.totalInnings.textContent = gameState.totalInnings;

    // 隱藏設定對話框
    elements.settingsModal.style.display = 'none';

    // 設置遊戲進行狀態
    gameState.inProgress = true;

    // 初始化第一局
    updateUI();

    // 保存遊戲狀態
    saveGameState();
}

// 處理打擊按鈕
function handleHit() {
    if (!gameState.inProgress) return;

    // 抽取隨機題目
    getRandomQuestion();

    // 顯示題目
    showQuestion();

    // 隱藏打擊按鈕，顯示答案按鈕
    elements.hitButton.style.display = 'none';
    elements.answerButtons.style.display = 'flex';

    // 開始計時
    startTimer();
}

// 獲取隨機題目
function getRandomQuestion() {
    // 隨機選擇題目類型
    const types = ['single', 'double', 'triple', 'homerun'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    // 根據類型選擇隨機題目
    const questions = gameState.questions[randomType];
    const randomIndex = Math.floor(Math.random() * questions.length);

    // 設置當前題目
    gameState.currentQuestion = questions[randomIndex];
    gameState.currentQuestionType = randomType;
}

// 顯示題目
function showQuestion() {
    // 設置題目類型顯示
    let difficultyText = '';
    let hitResult = '';

    switch (gameState.currentQuestionType) {
        case 'single':
            difficultyText = '一壘題（是非題）';
            hitResult = '安打';
            break;
        case 'double':
            difficultyText = '二壘題（選擇題，4個選項）';
            hitResult = '二壘打';
            break;
        case 'triple':
            difficultyText = '三壘題（問答題）';
            hitResult = '三壘打';
            break;
        case 'homerun':
            difficultyText = '全壘打題（進階問答題）';
            hitResult = '全壘打';
            break;
    }

    elements.questionDifficulty.textContent = `${difficultyText} - ${hitResult}`;
    elements.questionContent.textContent = gameState.currentQuestion;

    // 顯示題目容器
    elements.questionContainer.style.display = 'block';
}

// 開始計時器
function startTimer() {
    // 重設時間
    gameState.timeLeft = gameState.settings.timerDuration;
    elements.timerCount.textContent = gameState.timeLeft;

    // 清除舊的計時器
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }

    // 開始新的計時器
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        elements.timerCount.textContent = gameState.timeLeft;

        // 時間到
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            handleWrongAnswer(); // 時間到視為答錯
        }
    }, 1000);
}

// 處理正確答案
function handleCorrectAnswer() {
    // 停止計時器
    clearInterval(gameState.timer);

    // 根據題目類型推進壘包
    advanceBases(gameState.currentQuestionType);

    // 重置題目區域
    resetQuestionArea();

    // 更新UI
    updateUI();

    // 保存遊戲狀態
    saveGameState();
}

// 處理錯誤答案
function handleWrongAnswer() {
    // 停止計時器
    clearInterval(gameState.timer);

    // 增加出局數
    gameState.outs++;

    // 檢查是否需要換邊
    if (gameState.outs >= 3) {
        switchTeams();
    }

    // 重置題目區域
    resetQuestionArea();

    // 更新UI
    updateUI();

    // 保存遊戲狀態
    saveGameState();
}

// 重置題目區域
function resetQuestionArea() {
    // 隱藏題目容器
    elements.questionContainer.style.display = 'none';

    // 隱藏答案按鈕，顯示打擊按鈕
    elements.answerButtons.style.display = 'none';
    elements.hitButton.style.display = 'block';

    // 清空題目內容
    elements.questionContent.textContent = '';
    elements.questionDifficulty.textContent = '';
}

// 推進壘包
function advanceBases(hitType) {
    // 根據打擊類型決定推進壘包的邏輯
    switch (hitType) {
        case 'homerun':
            // 全壘打：所有壘上跑者得分，打者得分
            if (gameState.bases.third) {
                addScore();
                gameState.bases.third = false;
            }
            if (gameState.bases.second) {
                addScore();
                gameState.bases.second = false;
            }
            if (gameState.bases.first) {
                addScore();
                gameState.bases.first = false;
            }
            // 打者本人也得分
            addScore();
            break;

        case 'triple':
            // 三壘打：所有壘上跑者得分，打者到三壘
            if (gameState.bases.third) {
                addScore();
            }
            if (gameState.bases.second) {
                addScore();
            }
            if (gameState.bases.first) {
                addScore();
            }
            // 打者到三壘
            gameState.bases = { first: false, second: false, third: true };
            break;

        case 'double':
            // 二壘打：二三壘跑者得分，一壘跑者到三壘，打者到二壘
            if (gameState.bases.third) {
                addScore();
            }
            if (gameState.bases.second) {
                addScore();
            }
            // 一壘跑者到三壘
            gameState.bases.third = gameState.bases.first;
            // 打者到二壘
            gameState.bases.second = true;
            gameState.bases.first = false;
            break;

        case 'single':
            // 安打：三壘跑者得分，一二壘跑者各進一個壘，打者到一壘
            if (gameState.bases.third) {
                addScore();
            }
            // 二壘跑者到三壘
            gameState.bases.third = gameState.bases.second;
            // 一壘跑者到二壘
            gameState.bases.second = gameState.bases.first;
            // 打者到一壘
            gameState.bases.first = true;
            break;
    }
}

// 增加分數
function addScore() {
    if (gameState.currentTeam === 1) {
        gameState.scores.team1++;
    } else {
        gameState.scores.team2++;
    }
}

// 切換隊伍
function switchTeams() {
    // 重置出局數
    gameState.outs = 0;

    // 清空壘包
    gameState.bases = { first: false, second: false, third: false };

    // 切換攻擊隊
    gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;

    // 如果一整局都打完了
    if (gameState.currentTeam === 1) {
        gameState.currentInning++;

        // 檢查遊戲是否結束
        if (gameState.currentInning > gameState.totalInnings) {
            endGame();
        }
    }

    // 保存遊戲狀態
    saveGameState();
}

// 結束遊戲
function endGame() {
    // 設置遊戲狀態為非進行中
    gameState.inProgress = false;

    // 更新最終分數
    elements.finalScoreTeam1.textContent = gameState.scores.team1;
    elements.finalScoreTeam2.textContent = gameState.scores.team2;

    // 顯示贏家
    if (gameState.scores.team1 > gameState.scores.team2) {
        elements.winnerDisplay.textContent = '攻擊隊獲勝！';
    } else if (gameState.scores.team1 < gameState.scores.team2) {
        elements.winnerDisplay.textContent = '守備隊獲勝！';
    } else {
        elements.winnerDisplay.textContent = '平局！';
    }

    // 顯示遊戲結束對話框
    elements.gameOverModal.style.display = 'flex';

    // 保存遊戲狀態
    saveGameState();
}

// 保存遊戲狀態到 localStorage
function saveGameState() {
    // 創建要保存的狀態對象
    const stateToSave = {
        scores: gameState.scores,
        currentInning: gameState.currentInning,
        totalInnings: gameState.totalInnings,
        outs: gameState.outs,
        currentTeam: gameState.currentTeam,
        bases: gameState.bases,
        inProgress: gameState.inProgress,
        settings: gameState.settings
    };

    // 將狀態對象轉換為 JSON 字串並保存
    localStorage.setItem('baseballBibleGameState', JSON.stringify(stateToSave));
}

// 從 localStorage 讀取遊戲狀態
function loadGameState() {
    // 從 localStorage 獲取保存的遊戲狀態
    const savedState = localStorage.getItem('baseballBibleGameState');

    // 如果有保存的狀態，則解析並應用
    if (savedState) {
        const parsedState = JSON.parse(savedState);

        // 僅在遊戲進行中時才恢復狀態
        if (parsedState.inProgress) {
            gameState.scores = parsedState.scores;
            gameState.currentInning = parsedState.currentInning;
            gameState.totalInnings = parsedState.totalInnings;
            gameState.outs = parsedState.outs;
            gameState.currentTeam = parsedState.currentTeam;
            gameState.bases = parsedState.bases;
            gameState.inProgress = parsedState.inProgress;
            gameState.settings = parsedState.settings;

            // 設置設定值到設定面板（以便下次開始新遊戲時使用相同設定）
            elements.inningsSetting.value = gameState.totalInnings;
            elements.timerSetting.value = gameState.settings.timerDuration;
            elements.stealSetting.checked = gameState.settings.enableSteal;
            elements.hintSetting.checked = gameState.settings.enableHint;

            // 確保設定對話框不顯示
            elements.settingsModal.style.display = 'none';
        } else {
            // 如果遊戲已結束，重置遊戲狀態
            resetGameState();
        }
    } else {
        // 如果沒有保存的狀態，重置遊戲狀態
        resetGameState();
    }
}

// 更新繼續遊戲對話框中的資訊
function updateContinueGameDialog(savedState) {
    elements.savedInning.textContent = savedState.currentInning;
    elements.savedTotalInnings.textContent = savedState.totalInnings;
    elements.savedTeam1Score.textContent = savedState.scores.team1;
    elements.savedTeam2Score.textContent = savedState.scores.team2;
    elements.savedCurrentTeam.textContent = savedState.currentTeam === 1 ? '攻擊隊' : '守備隊';
}

// 頁面載入時初始化遊戲
window.addEventListener('DOMContentLoaded', initGame);
