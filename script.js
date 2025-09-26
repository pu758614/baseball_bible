// 棒球查經遊戲邏輯

// 遊戲狀態
const gameState = {
    // 隊伍名稱
    teamNames: {
        team1: "攻擊隊",
        team2: "守備隊"
    },
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
    // 已經出過的題目
    usedQuestions: [],

    // 題目庫
    questions: {
        single: [
            "以色列百姓都同意遵守神的律法，並且發誓遵行嗎？(v29)",
            "百姓立誓不再將女兒嫁給外邦人，也不娶外邦人的女兒嗎？(v30)",
            "百姓同意在安息日和聖日，不從外邦人那裡買貨物嗎？(v31)",
            "他們決定每七年放棄耕種，並豁免債務嗎？(v31)",
            "百姓承諾每年奉獻三分之一舍客勒作為聖殿的使用費用嗎？(v32)",
            "百姓答應供應祭壇上的常獻祭、素祭、燔祭等嗎？(v33)",
            "他們決定每年投籤，按時將木柴送到神的殿中焚燒嗎？(v34)",
            "他們承諾將土產初熟之物和牲畜頭生的奉到殿中嗎？(v35-36)",
            "百姓說要把初熟之麥子、酒和油帶到利未人那裡嗎？(v37)",
            "百姓有說「我們必不撇棄我們神的殿」嗎？(v39)",
            "百姓願意將自己的兒子娶外邦人嗎？(v30)",
            "他們決定將十分之一交給國王作為稅收嗎？(v37)",
            "當利未人收取十分之一的時候，亞倫的兄弟中，會有一個祭司與利未人同在嗎？(v38)",
            "他們每逢七年會豁免債務嗎？(v31)",
            "他們承諾每年奉獻一舍客勒作為聖殿的使用費嗎？(v32)",
            "他們承諾每七年獻上特別的贖罪祭嗎？(v31)",
            "百姓說要把祭司的衣服當作供物奉獻嗎？(v36)",
            "他們決定將頭生的孩子獻為奴僕嗎？(v36)",
            "以色列人說不要把初熟之果子帶進聖殿嗎？(v35)",
            "他們同意撇棄神的殿，不再奉獻嗎？(v39)"
        ],
        double: [
            "百姓與祭司立約，是要遵行什麼？A. 摩西的律法 B. 列王的法令 C. 亞達薛西王的命令 D. 自己的傳統 (v29)",
            "百姓立誓不可與誰通婚？A. 利未人 B. 外邦人 C. 祭司 D. 本族人 (v30)",
            "百姓在安息日決定怎麼做？A. 多做買賣 B. 出去打仗 C. 不買外邦人的貨物 D. 種田 (v31)",
            "他們每幾年要免債？A. 每三年 B. 每五年 C. 每七年 D. 每十年 (v31)",
            "百姓定規每年奉獻多少舍客勒作為聖殿費用？A. 二分之一 B. 三分之一 C. 一舍客勒 D. 十分之一 (v32)",
            "百姓承諾要供應哪些祭物？A. 常獻祭、素祭、燔祭 B. 金牛犢 C. 外邦神像 D. 新的歌詩 (v33)",
            "他們如何決定誰要送木柴？A. 輪流表決 B. 投籤 C. 祭司挑選 D. 王下命令 (v34)",
            "百姓要把什麼奉到殿中？A. 初熟的果子 B. 金銀器皿 C. 武器 D. 書卷 (v35)",
            "百姓要把頭生的牲畜奉給誰？A. 祭司 B. 君王 C. 利未人 D. 長老 (v36)",
            "百姓要將五穀、新酒和油交給誰？A. 利未人 B. 君王 C. 外邦商人 D. 士兵 (v37)",
            "利未人收了十分之一要怎麼做？A. 自己留下 B. 送到倉房 C. 拿去做買賣 D. 分給百姓 (v38)",
            "祭司亞倫的子孫要與誰一同收十分之一？A. 外邦人 B. 利未人 C. 君王 D. 文士 (v38)",
            "利未人把十分之一送到聖殿時，要送到哪裡？A. 城門 B. 聖所的倉房 C. 王宮 D. 會堂 (v38-39)",
            "倉房裡存放什麼？A. 五穀、新酒、油 B. 武器 C. 石頭 D. 衣服 (v39)",
            "(單選題)最後百姓共同的決心是什麼？A. 不撇棄神的殿 B. 建更多城牆 C. 與外邦人立約 D. 出埃及 (v39)"
        ],
        triple: [
            "百姓立誓的主要內容有哪些？A. 遵守律法 B. 不與外邦人通婚 C. 守安息日 D. 擴張疆界 (v29-31)",
            "百姓同意的安息日規定是什麼？A. 不做工 B. 不買賣 C. 豁免債務 D. 建造新城 (v31)",
            "聖殿需要哪些經費支持？A. 燔祭 B. 素祭 C. 守節 D. 軍隊 (v32-33)",
            "百姓要供應的東西有哪些？A. 初熟的果子 B. 頭生的牲畜 C. 新酒 D. 兵器 (v35-37)",
            "百姓要把什麼帶到祭司的倉房？A. 十分之一 B. 五穀 C. 新酒 D. 外邦貨 (v37-39)",
            "參與管理倉房的有哪些人？A. 祭司 B. 利未人 C. 歌唱的 D. 守門的 (v38-39)",
            "百姓對「十分之一」的規定是什麼？A. 要交給利未人 B. 利未人再交十分之一 C. 全數留下 D. 部分給祭司 (v37-38)",
            "百姓承諾獻上的包括哪些？A. 麥子 B. 酒 C. 油 D. 武器 (v35-37)",
            "百姓定規按時送木柴是為了什麼？A. 保證祭壇常有火 B. 按律法要求 C. 預防外敵 D. 供應燔祭 (v34)",
            "百姓最後的總結承諾有哪些？A. 不撇棄神的殿 B. 供應倉房 C. 與外邦人結盟 D. 照顧祭司和利未人 (v39)"
        ],
        homerun: [
            "誰負責收取百姓的十分之一？",
            "百姓在安息日承諾不做什麼？(v31)",
            "初生的兒子要怎樣處理？ (v.36)",
            "百姓定規每年奉獻多少舍客勒作為聖殿使用費？(v32)",
            "最後百姓的總結承諾是什麼？(v39)"
        ]
    },
    // 當前題目
    currentQuestion: null,
    currentQuestionType: null,
    // 遊戲設定
    settings: {
    }
};

// DOM 元素
const elements = {
    // 隊伍名稱顯示
    team1NameDisplay: document.getElementById('team1-name-display'),
    team2NameDisplay: document.getElementById('team2-name-display'),
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

    // 得分特效
    scoreEffect: document.getElementById('score-effect'),
    scoreEffectText: document.getElementById('score-effect-text'),

    // 攻守交換提示
    teamSwitchEffect: document.getElementById('team-switch-effect'),
    teamSwitchText: document.getElementById('team-switch-text'),

    // 題目區域
    questionContainer: document.getElementById('question-container'),
    questionDifficulty: document.getElementById('question-difficulty'),
    questionContent: document.getElementById('question-content'),

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
    finalTeam1Name: document.getElementById('final-team1-name'),
    finalTeam2Name: document.getElementById('final-team2-name'),
    finalScoreTeam1: document.getElementById('final-score-team1'),
    finalScoreTeam2: document.getElementById('final-score-team2'),

    // 已保存遊戲資訊
    savedInning: document.getElementById('saved-inning'),
    savedTotalInnings: document.getElementById('saved-total-innings'),
    savedTeam1Name: document.getElementById('saved-team1-name'),
    savedTeam2Name: document.getElementById('saved-team2-name'),
    savedTeam1Score: document.getElementById('saved-team1-score'),
    savedTeam2Score: document.getElementById('saved-team2-score'),
    savedCurrentTeam: document.getElementById('saved-current-team'),

    // 繼續遊戲按鈕
    continueGameButton: document.getElementById('continue-game'),
    startNewGameButton: document.getElementById('start-new-game'),

    // 設定
    team1NameInput: document.getElementById('team1-name'),
    team2NameInput: document.getElementById('team2-name'),
    inningsSetting: document.getElementById('innings-setting'),
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
    gameState.teamNames = { team1: "攻擊隊", team2: "守備隊" };
    gameState.scores.team1 = 0;
    gameState.scores.team2 = 0;
    gameState.currentInning = 1;
    gameState.outs = 0;
    gameState.currentTeam = 1;
    gameState.bases = { first: false, second: false, third: false };
    gameState.inProgress = false;
    // 清空已使用題目清單
    gameState.usedQuestions = [];

    // 清空輸入框
    if (elements.team1NameInput) elements.team1NameInput.value = "";
    if (elements.team2NameInput) elements.team2NameInput.value = "";
}

// 更新UI
function updateUI() {
    // 更新隊伍名稱
    elements.team1NameDisplay.textContent = gameState.teamNames.team1;
    elements.team2NameDisplay.textContent = gameState.teamNames.team2;

    // 更新分數
    elements.team1Score.textContent = gameState.scores.team1;
    elements.team2Score.textContent = gameState.scores.team2;

    // 更新局數
    elements.currentInning.textContent = gameState.currentInning;
    elements.totalInnings.textContent = gameState.totalInnings;

    // 更新出局數
    elements.outsCount.textContent = gameState.outs;

    // 更新當前攻擊隊
    elements.battingTeam.textContent = gameState.currentTeam === 1 ?
        gameState.teamNames.team1 : gameState.teamNames.team2;

    // 更新壘包
    updateBases();
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

    // 添加鍵盤快捷鍵
    document.addEventListener('keydown', (event) => {
        // 空白鍵 - 打擊（只在遊戲進行中且打擊按鈕可見時生效）
        if (event.code === 'Space' && gameState.inProgress &&
            elements.hitButton.style.display !== 'none') {
            event.preventDefault(); // 防止頁面滾動
            // 添加視覺反饋
            elements.hitButton.classList.add('active');
            setTimeout(() => {
                handleHit();
                elements.hitButton.classList.remove('active');
            }, 100);
        }

        // 只有當題目顯示時才處理答題快捷鍵
        else if (elements.questionContainer.style.display === 'block') {
            // Z 鍵 - 答對
            if (event.key.toLowerCase() === 'z') {
                // 添加視覺反饋
                elements.correctButton.classList.add('active');
                setTimeout(() => {
                    handleCorrectAnswer();
                    elements.correctButton.classList.remove('active');
                }, 100);
            }
            // C 鍵 - 答錯
            else if (event.key.toLowerCase() === 'c') {
                // 添加視覺反饋
                elements.wrongButton.classList.add('active');
                setTimeout(() => {
                    handleWrongAnswer();
                    elements.wrongButton.classList.remove('active');
                }, 100);
            }
        }
    });

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
            gameState.teamNames = parsedState.teamNames || { team1: "攻擊隊", team2: "守備隊" };
            gameState.scores = parsedState.scores;
            gameState.currentInning = parsedState.currentInning;
            gameState.totalInnings = parsedState.totalInnings;
            gameState.outs = parsedState.outs;
            gameState.currentTeam = parsedState.currentTeam;
            gameState.bases = parsedState.bases;
            gameState.settings = parsedState.settings;
            // 恢復已使用過的題目清單
            gameState.usedQuestions = parsedState.usedQuestions || [];

            // 設定值到設定面板（以便下次開始新遊戲時使用相同設定）
            elements.inningsSetting.value = gameState.totalInnings;

            // 填充隊伍名稱輸入欄位
            if (elements.team1NameInput && elements.team2NameInput) {
                elements.team1NameInput.value = gameState.teamNames.team1;
                elements.team2NameInput.value = gameState.teamNames.team2;
            }

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

    // 獲取隊伍名稱（若未輸入則使用預設值）
    let team1Name = elements.team1NameInput.value.trim();
    let team2Name = elements.team2NameInput.value.trim();

    gameState.teamNames.team1 = team1Name || "攻擊隊";
    gameState.teamNames.team2 = team2Name || "守備隊";

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
}

// 獲取隨機題目
function getRandomQuestion() {
    // 將所有題目放入一個陣列
    const allQuestions = [];

    // 遍歷所有類型的題目並加入陣列
    for (const type of ['single', 'double', 'triple', 'homerun']) {
        gameState.questions[type].forEach(question => {
            // 創建唯一識別符來判斷題目是否已使用過
            const questionId = `${type}:${question}`;

            // 如果題目未使用過，則加入可選題目陣列
            if (!gameState.usedQuestions.includes(questionId)) {
                allQuestions.push({
                    type: type,
                    question: question,
                    id: questionId
                });
            }
        });
    }

    // 如果所有題目都已經用過了，則重置已使用題目列表
    if (allQuestions.length === 0) {
        gameState.usedQuestions = [];
        // 重新獲取所有題目
        for (const type of ['single', 'double', 'triple', 'homerun']) {
            gameState.questions[type].forEach(question => {
                allQuestions.push({
                    type: type,
                    question: question,
                    id: `${type}:${question}`
                });
            });
        }
    }

    // 從未使用過的題目中隨機選一題
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const selectedQuestion = allQuestions[randomIndex];

    // 將此題目標記為已使用
    gameState.usedQuestions.push(selectedQuestion.id);

    // 設置當前題目
    gameState.currentQuestion = selectedQuestion.question;
    gameState.currentQuestionType = selectedQuestion.type;
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
            difficultyText = '二壘題（單選題）';
            hitResult = '二壘打';
            break;
        case 'triple':
            difficultyText = '三壘題（複選題）';
            hitResult = '三壘打';
            break;
        case 'homerun':
            difficultyText = '全壘打題（問答題）';
            hitResult = '全壘打';
            break;
    }

    elements.questionDifficulty.textContent = `${difficultyText} - ${hitResult}`;
    elements.questionContent.textContent = gameState.currentQuestion;

    // 顯示題目容器
    elements.questionContainer.style.display = 'block';
}



// 處理正確答案
function handleCorrectAnswer() {

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
    // 記錄推進前的分數，用於計算得了多少分
    let beforeScoreTeam1 = gameState.scores.team1;
    let beforeScoreTeam2 = gameState.scores.team2;
    let totalRuns = 0;

    // 根據打擊類型決定推進壘包的邏輯
    switch (hitType) {
        case 'homerun':
            // 全壘打：所有壘上跑者得分，打者得分
            if (gameState.bases.third) {
                totalRuns++;
                gameState.bases.third = false;
            }
            if (gameState.bases.second) {
                totalRuns++;
                gameState.bases.second = false;
            }
            if (gameState.bases.first) {
                totalRuns++;
                gameState.bases.first = false;
            }
            // 打者本人也得分
            totalRuns++;
            break;

        case 'triple':
            // 三壘打：所有壘上跑者得分，打者到三壘
            if (gameState.bases.third) {
                totalRuns++;
            }
            if (gameState.bases.second) {
                totalRuns++;
            }
            if (gameState.bases.first) {
                totalRuns++;
            }
            // 打者到三壘
            gameState.bases = { first: false, second: false, third: true };
            break;

        case 'double':
            // 二壘打：二三壘跑者得分，一壘跑者到三壘，打者到二壘
            if (gameState.bases.third) {
                totalRuns++;
            }
            if (gameState.bases.second) {
                totalRuns++;
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
                totalRuns++;
            }
            // 二壘跑者到三壘
            gameState.bases.third = gameState.bases.second;
            // 一壘跑者到二壘
            gameState.bases.second = gameState.bases.first;
            // 打者到一壘
            gameState.bases.first = true;
            break;
    }

    // 一次性增加分數
    if (totalRuns > 0) {
        if (gameState.currentTeam === 1) {
            gameState.scores.team1 += totalRuns;
            // 顯示得分特效
            showScoreEffect(1, totalRuns);
        } else {
            gameState.scores.team2 += totalRuns;
            // 顯示得分特效
            showScoreEffect(2, totalRuns);
        }
    }
}

// 增加分數 (單個得分情況使用)
function addScore() {
    // 根據當前隊伍增加分數
    if (gameState.currentTeam === 1) {
        gameState.scores.team1++;
        // 顯示得分特效
        showScoreEffect(1, 1); // 傳入得分數1
    } else {
        gameState.scores.team2++;
        // 顯示得分特效
        showScoreEffect(2, 1); // 傳入得分數1
    }
}

// 顯示得分特效
function showScoreEffect(team, points) {
    // 設置特效文字 - 使用自定義隊伍名稱
    const teamName = team === 1 ? gameState.teamNames.team1 : gameState.teamNames.team2;
    elements.scoreEffectText.textContent = `恭喜 ${teamName} 得${points}分!`;

    // 顯示特效元素
    elements.scoreEffect.style.display = 'block';

    // 添加動畫結束監聽器，在動畫結束後隱藏特效
    const handleAnimationEnd = () => {
        elements.scoreEffect.style.display = 'none';
        elements.scoreEffect.removeEventListener('animationend', handleAnimationEnd);
    };

    elements.scoreEffect.addEventListener('animationend', handleAnimationEnd);

    // 重置動畫
    elements.scoreEffect.style.animation = 'none';
    elements.scoreEffect.offsetHeight; // 觸發重排，使動畫能夠重新開始
    elements.scoreEffect.style.animation = 'scoreEffect 3s ease-in-out'; // 更新為 3 秒
}

// 顯示攻守交換提示
function showTeamSwitchEffect(team) {
    // 設置特效文字 - 顯示現在輪到哪個隊伍攻擊
    const teamName = team === 1 ? gameState.teamNames.team1 : gameState.teamNames.team2;
    elements.teamSwitchText.textContent = `換 ${teamName} 攻擊!`;

    // 顯示特效元素
    elements.teamSwitchEffect.style.display = 'block';

    // 添加動畫結束監聽器，在動畫結束後隱藏特效
    const handleAnimationEnd = () => {
        elements.teamSwitchEffect.style.display = 'none';
        elements.teamSwitchEffect.removeEventListener('animationend', handleAnimationEnd);
    };

    elements.teamSwitchEffect.addEventListener('animationend', handleAnimationEnd);

    // 重置動畫
    elements.teamSwitchEffect.style.animation = 'none';
    elements.teamSwitchEffect.offsetHeight; // 觸發重排，使動畫能夠重新開始
    elements.teamSwitchEffect.style.animation = 'scoreEffect 3s ease-in-out'; // 使用相同的動畫效果
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
            return; // 遊戲結束時不顯示攻守交換提示
        }
    }

    // 顯示攻守交換提示
    showTeamSwitchEffect(gameState.currentTeam);

    // 更新 UI
    updateUI();

    // 保存遊戲狀態
    saveGameState();
}

// 結束遊戲
function endGame() {
    // 設置遊戲狀態為非進行中
    gameState.inProgress = false;

    // 更新隊伍名稱
    elements.finalTeam1Name.textContent = gameState.teamNames.team1;
    elements.finalTeam2Name.textContent = gameState.teamNames.team2;

    // 更新最終分數
    elements.finalScoreTeam1.textContent = gameState.scores.team1;
    elements.finalScoreTeam2.textContent = gameState.scores.team2;

    // 顯示贏家
    if (gameState.scores.team1 > gameState.scores.team2) {
        elements.winnerDisplay.textContent = `${gameState.teamNames.team1}獲勝！`;
    } else if (gameState.scores.team1 < gameState.scores.team2) {
        elements.winnerDisplay.textContent = `${gameState.teamNames.team2}獲勝！`;
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
        teamNames: gameState.teamNames,
        scores: gameState.scores,
        currentInning: gameState.currentInning,
        totalInnings: gameState.totalInnings,
        outs: gameState.outs,
        currentTeam: gameState.currentTeam,
        bases: gameState.bases,
        inProgress: gameState.inProgress,
        settings: gameState.settings,
        usedQuestions: gameState.usedQuestions // 保存已使用過的題目清單
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
            // 恢復隊伍名稱
            gameState.teamNames = parsedState.teamNames || { team1: "攻擊隊", team2: "守備隊" };
            gameState.scores = parsedState.scores;
            gameState.currentInning = parsedState.currentInning;
            gameState.totalInnings = parsedState.totalInnings;
            gameState.outs = parsedState.outs;
            gameState.currentTeam = parsedState.currentTeam;
            gameState.bases = parsedState.bases;
            gameState.inProgress = parsedState.inProgress;
            gameState.settings = parsedState.settings;
            // 恢復已使用過的題目清單
            gameState.usedQuestions = parsedState.usedQuestions || [];

            // 設置設定值到設定面板（以便下次開始新遊戲時使用相同設定）
            elements.inningsSetting.value = gameState.totalInnings;

            // 如果有隊伍名稱，填充輸入欄位
            if (gameState.teamNames) {
                elements.team1NameInput.value = gameState.teamNames.team1;
                elements.team2NameInput.value = gameState.teamNames.team2;
            }

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
    // 使用保存的隊伍名稱（如果有）
    const teamNames = savedState.teamNames || { team1: "攻擊隊", team2: "守備隊" };

    // 更新顯示
    if (elements.savedTeam1Name) elements.savedTeam1Name.textContent = teamNames.team1;
    if (elements.savedTeam2Name) elements.savedTeam2Name.textContent = teamNames.team2;

    elements.savedInning.textContent = savedState.currentInning;
    elements.savedTotalInnings.textContent = savedState.totalInnings;
    elements.savedTeam1Score.textContent = savedState.scores.team1;
    elements.savedTeam2Score.textContent = savedState.scores.team2;
    elements.savedCurrentTeam.textContent = savedState.currentTeam === 1 ?
        teamNames.team1 : teamNames.team2;
}

// 頁面載入時初始化遊戲
window.addEventListener('DOMContentLoaded', initGame);
