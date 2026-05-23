// 棒球查經遊戲邏輯

// ===== 音效系統 (Web Audio API) =====
const SFX = (() => {
    let ctx;
    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    }

    function playTone(freq, type, duration, vol = 0.3, delay = 0) {
        const c = getCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, c.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime + delay);
        osc.stop(c.currentTime + delay + duration);
    }

    // 產生噪音（可自訂濾波器）
    function playNoise(duration, vol = 0.15, filterType = 'highpass', filterFreq = 3000) {
        const c = getCtx();
        const bufferSize = c.sampleRate * duration;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        const gain = c.createGain();
        const filter = c.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        src.buffer = buffer;
        gain.gain.setValueAtTime(vol, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        src.start();
    }

    // 模擬群眾噪音（多層隨機音調）
    function crowdNoise(baseFreqs, duration, vol, riseOrFall) {
        const c = getCtx();
        baseFreqs.forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            const delay = Math.random() * 0.05;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq + Math.random() * 40, c.currentTime + delay);
            if (riseOrFall === 'rise') {
                osc.frequency.linearRampToValueAtTime(freq * 1.3, c.currentTime + duration * 0.6);
            } else {
                osc.frequency.linearRampToValueAtTime(freq * 0.7, c.currentTime + duration * 0.6);
            }
            gain.gain.setValueAtTime(0.001, c.currentTime);
            gain.gain.linearRampToValueAtTime(vol, c.currentTime + duration * 0.15);
            gain.gain.setValueAtTime(vol, c.currentTime + duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime + delay);
            osc.stop(c.currentTime + duration);
        });
        // 加一層噪音模擬人聲雜訊
        playNoise(duration, vol * 0.5, 'bandpass', riseOrFall === 'rise' ? 2000 : 600);
    }

    return {
        // 打擊 - 球棒擊球聲（木棒撞擊 + 清脆迴響）
        hit() {
            const c = getCtx();
            // 撞擊瞬間 - 短促噪音爆發
            const impactLen = c.sampleRate * 0.06;
            const impactBuf = c.createBuffer(1, impactLen, c.sampleRate);
            const impactData = impactBuf.getChannelData(0);
            for (let i = 0; i < impactLen; i++) {
                impactData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.008));
            }
            const impactSrc = c.createBufferSource();
            const impactGain = c.createGain();
            impactSrc.buffer = impactBuf;
            impactGain.gain.value = 0.5;
            impactSrc.connect(impactGain);
            impactGain.connect(c.destination);
            impactSrc.start();

            // 木棒迴響 - 中頻共鳴
            playTone(800, 'sine', 0.08, 0.3);
            playTone(1200, 'sine', 0.05, 0.2, 0.01);
            // 球飛出的「鏗」聲
            playTone(2400, 'sine', 0.04, 0.12, 0.02);
            playTone(180, 'sine', 0.12, 0.2, 0.01);
        },
        // 答對 - 群眾歡呼聲
        correct() {
            crowdNoise([220, 280, 350, 440, 520, 600], 1.2, 0.06, 'rise');
            // 加上高音歡呼感
            playTone(800, 'sine', 0.3, 0.08, 0.1);
            playTone(1000, 'sine', 0.3, 0.08, 0.2);
            playTone(1200, 'sine', 0.4, 0.1, 0.3);
        },
        // 答錯 - 群眾噓聲
        wrong() {
            crowdNoise([150, 200, 250, 300, 180, 220], 1.0, 0.05, 'fall');
            // 加上低沉「噓」聲（噪音為主）
            playNoise(0.8, 0.12, 'bandpass', 4000);
            playNoise(0.6, 0.08, 'highpass', 5000);
        },
        // 得分 - 歡呼 + 上行音階
        score() {
            crowdNoise([250, 330, 400, 500, 600], 1.5, 0.05, 'rise');
            playTone(523, 'triangle', 0.12, 0.2);
            playTone(659, 'triangle', 0.12, 0.2, 0.1);
            playTone(784, 'triangle', 0.12, 0.2, 0.2);
            playTone(1047, 'triangle', 0.3, 0.25, 0.3);
        },
        // 全壘打 - 號角 + 大歡呼
        homerun() {
            crowdNoise([200, 280, 350, 440, 520, 650, 300], 2.5, 0.06, 'rise');
            playTone(523, 'triangle', 0.15, 0.25);
            playTone(659, 'triangle', 0.15, 0.25, 0.12);
            playTone(784, 'triangle', 0.15, 0.25, 0.24);
            playTone(1047, 'triangle', 0.5, 0.3, 0.36);
            playTone(784, 'triangle', 0.12, 0.15, 0.7);
            playTone(1047, 'triangle', 0.6, 0.3, 0.82);
        },
        // 攻守交換 - 哨聲
        switchTeam() {
            playTone(900, 'sine', 0.15, 0.2);
            playTone(1200, 'sine', 0.3, 0.25, 0.1);
        },
        // 遊戲結束 - 勝利旋律 + 歡呼
        gameOver() {
            crowdNoise([200, 280, 350, 440, 520, 650, 300, 400], 3.0, 0.05, 'rise');
            playTone(523, 'triangle', 0.2, 0.25);
            playTone(659, 'triangle', 0.2, 0.25, 0.18);
            playTone(784, 'triangle', 0.2, 0.25, 0.36);
            playTone(1047, 'triangle', 0.35, 0.3, 0.54);
            playTone(784, 'triangle', 0.15, 0.15, 0.8);
            playTone(1047, 'triangle', 0.15, 0.15, 0.95);
            playTone(1320, 'triangle', 0.7, 0.3, 1.1);
        },
        // 出局 - 三振下行音 + 小噓聲
        out() {
            crowdNoise([200, 250, 180], 0.6, 0.03, 'fall');
            playTone(440, 'sawtooth', 0.1, 0.12);
            playTone(350, 'sawtooth', 0.1, 0.12, 0.1);
            playTone(260, 'sawtooth', 0.3, 0.15, 0.2);
        }
    };
})();

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
            "1. 保羅說他是「為福音被囚的」嗎？(v1)",
            "2. 保羅勸信徒「用愛心互相寬容」嗎？(v2)",
            "3. 經文說用「信心」彼此聯絡嗎？(v3)",
            "4. 經文說身體只有一個，聖靈只有一個嗎？(v4)",
            "5. 經文提到「一主，一信，一浸」嗎？(v5)",
            "6. 神只是超乎眾人之上，但沒有住在眾人之內嗎？(v6)",
            "7. 我們各人蒙恩，都是照基督所量給各人的恩賜嗎？(v7)",
            "8. 基督升上遠超諸天之上，是要「審判萬有」嗎？(v10)",
            "9. 五種恩賜中，「牧師」和「教師」是分開算兩種的嗎？(v11)",
            "10. 恩賜的目的包括「成全聖徒、各盡其職、建立基督的身體」嗎？(v12)",
            "11. 保羅說我們要在「律法上」同歸於一嗎？(v13)",
            "12. 小孩子會中了「人的詭計和欺騙的法術」嗎？(v14)",
            "13. 經文說要用「公義」說誠實話嗎？(v15)",
            "14. 百節各按各職是說身體靠「元首基督」聯絡的嗎？(v15-16)",
            "15. 外邦人與神隔絕是因為「自己無知、心裡剛硬」嗎？(v18)",
            "16. 外邦人良心喪盡後，就放縱私慾、貪行種種的污穢嗎？(v19)",
            "17. 舊人是因「世界的引誘」漸漸變壞的嗎？(v22)",
            "18. 新人是照著神的形像造的，有真理的仁義和聖潔嗎？(v24)",
            "19. 信徒之所以要說實話，是因為我們是互相為「肢體」嗎？(v25)",
            "20. 從前偷竊的人勞力做正經事，只要能養活自己就好嗎？(v28)"
        ],
        double: [
            "21. 保羅說他是為誰被囚的？ A. 為主 B. 為福音 C. 為教會 D. 為律法 (v1)",
            "22. 第2節提到的四個品格，正確順序是？ A. 謙虛、溫柔、忍耐、愛心 B. 溫柔、謙虛、忍耐、寬容 C. 謙虛、溫柔、忍耐、寬容 D. 忍耐、溫柔、謙虛、愛心 (v2)",
            "23. 「竭力保守」的是什麼？ A. 教會的傳統 B. 聖靈所賜合而為一的心 C. 摩西的律法 D. 使徒的教訓 (v3)",
            "24. 第4-6節總共提到幾個「一」？ A. 五個 B. 六個 C. 七個 D. 八個 (v4-6)",
            "25. 第8節「所以經上說」引用的是哪裡的經文概念？ A. 創世記 B. 詩篇 C. 以賽亞書 D. 出埃及記 (v8)",
            "26. 「那降下的」是指誰？ A. 聖靈 B. 天使 C. 基督 D. 先知 (v9-10)",
            "27. 以下哪一個不是第11節提到的恩賜？ A. 使徒 B. 傳福音的 C. 長老 D. 教師 (v11)",
            "28. 「在真道上同歸於一」之後，接著提到什麼？ A. 建立教會 B. 認識神的兒子 C. 遵守律法 D. 傳揚福音 (v13)",
            "29. 「異教之風」使人怎樣？ A. 更加堅定 B. 飄來飄去隨從異端 C. 回歸真理 D. 離開教會 (v14)",
            "30. 身體在愛中建立自己，靠的是什麼？ A. 各體的功用彼此相助 B. 領袖的命令 C. 個人的努力 D. 外在的壓力 (v16)",
            "31. 外邦人與神的生命隔絕的原因是？ A. 神不揀選他們 B. 因自己無知、心裡剛硬 C. 因貧窮 D. 因戰爭 (v18)",
            "32. 第23節說要改換一新的是什麼？ A. 行為 B. 心志 C. 外貌 D. 環境 (v23)",
            "33. 不可給誰留地步？ A. 仇敵 B. 罪人 C. 魔鬼 D. 外邦人 (v27)",
            "34. 信徒受了聖靈的什麼，等候得贖的日子？ A. 恩膏 B. 印記 C. 能力 D. 感動 (v30)",
            "35. 第31節列出要除掉的惡行，以下哪個不在其中？ A. 苦毒 B. 嚷鬧 C. 毀謗 D. 嫉妒 (v31)",
            "36. 【金句】尼希米記 2:20「天上的神必使我們___。」空格應填？ A. 亨通 B. 得勝 C. 平安 D. 富足",
            "37. 【金句】尼希米記 2:20 尼希米說「我們作他___的，要起來建造」，空格是？ A. 子民 B. 僕人 C. 門徒 D. 管家",
            "38. 【金句】哥林多前書 3:6「我栽種了，___澆灌了，惟有神叫他生長。」空格是誰？ A. 彼得 B. 巴拿巴 C. 亞波羅 D. 提摩太",
            "39. 【金句】哥林多前書 3:6 誰叫他生長？ A. 使徒 B. 教會領袖 C. 神 D. 先知",
            "40. 【金句】哥林多前書 1:18 十字架的道理，在那滅亡的人看來是？ A. 愚拙 B. 絆繆 C. 可怕 D. 無用",
            "41. 【金句】哥林多前書 1:18 十字架的道理，在得救的人卻為神的什麼？ A. 智慧 B. 大能 C. 恩典 D. 榮耀"
        ],
        triple: [
            "42. 第4-6節提到的七個「一」包括哪些？ A. 一個身體 B. 一個聖靈 C. 一個指望 D. 一個教會 (v4-6)",
            "43. 基督「降下又升上」的目的是什麼？ A. 充滿萬有 B. 賜下恩賜 C. 擄掠仇敵 D. 審判世人 (v8-10)",
            "44. 第12節提到恩賜的三重目的是？ A. 成全聖徒 B. 各盡其職 C. 建立基督的身體 D. 擴張教會版圖 (v12)",
            "45. 以下哪些是v14提到「作小孩子」的危險？ A. 中了人的詭計 B. 被欺騙的法術影響 C. 被異教之風搖動 D. 失去救恩 (v14)",
            "46. 第16節中身體增長需要哪些條件？ A. 靠元首基督聯絡 B. 百節各按各職 C. 各體功用彼此相助 D. 遵守十誡 (v16)",
            "47. 外邦人的生命光景包括哪些描述？ A. 存虛妄的心 B. 心地昏昧 C. 良心喪盡 D. 凡事忍耐 (v17-19)",
            "48. 「穿上新人」的特質有哪些？ A. 真理 B. 仁義 C. 聖潔 D. 智慧 (v24)",
            "49. 保羅在v25-29勸勉信徒實踐哪些事？ A. 棄絕謊言說實話 B. 生氣不要犯罪 C. 勞力做正經事分給缺少的人 D. 每日禁食禱告 (v25-29)",
            "50. 第31節列出要除掉的有哪些？ A. 苦毒 B. 忿怒 C. 嚷鬧 D. 憂愁 (v31)",
            "51. 第32節要求信徒做到哪些？ A. 以恩慈相待 B. 存憐憫的心 C. 彼此饒恕 D. 彼此論斷 (v32)",
            "52. 【金句】尼希米記 2:20 描述了哪些事？ A. 天上的神使我們亨通 B. 我們要起來建造 C. 反對者在耶路撒冷無份無權無紀念 D. 我們要收取金銀財寶",
            "53. 【金句】哥林多前書 3:6 教導我們什麼？ A. 人只負責栽種與澆灌 B. 生長的權柄在於神 C. 不可貴在人的工作上 D. 人的努力沒有任何價值",
            "54. 【金句】哥林多前書 1:18 關於十字架的道理，以下哪些正確？ A. 在滅亡的人為愚拙 B. 在得救的人為神的大能 C. 對不同的人有不同的意義 D. 十字架的道理對所有人都是愚拙的"
        ],
        homerun: [
            "55. 請說出第4-6節提到的七個「一」。(v4-6)",
            "56. 基督所賜的五種恩賜是哪五種？(v11)",
            "57. 「脫去舊人、穿上新人」各是什麼意思？(v22-24)",
            "58. 第25-28節提到哪些生活上該改變的事？請說出三項即可。(v25-28)",
            "59. 第32節說信徒彼此之間應該怎樣？饒恕的標準是什麼？(v32)"
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

    // 壘包高亮
    elements.firstBase.classList.toggle('base-occupied', gameState.bases.first);
    elements.secondBase.classList.toggle('base-occupied', gameState.bases.second);
    elements.thirdBase.classList.toggle('base-occupied', gameState.bases.third);
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
            if (event.key.toLowerCase() === 'x') {
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

    // 打擊音效 + 特效
    SFX.hit();
    fireHitEffect();

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

    // 立即保存，避免關閉瀏覽器後題目重複
    saveGameState();

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

    // 答對音效
    SFX.correct();

    // 記錄推進前的壘包狀態
    const beforeBases = { ...gameState.bases };

    // 根據題目類型推進壘包
    const totalRuns = advanceBases(gameState.currentQuestionType);

    // 隱藏答案按鈕避免重複點擊
    elements.answerButtons.style.display = 'none';

    // 播放跑壘動畫，動畫結束後再顯示得分特效和更新 UI
    animateRunners(beforeBases, gameState.currentQuestionType, () => {
        // 跑壘動畫結束後才顯示得分特效
        if (totalRuns > 0) {
            const team = gameState.currentTeam;
            showScoreEffect(team, totalRuns);
        }
        // 重置題目區域
        resetQuestionArea();
        // 更新UI
        updateUI();
        // 保存遊戲狀態
        saveGameState();
    });
}

// 處理錯誤答案
function handleWrongAnswer() {

    // 答錯音效 + 特效
    SFX.wrong();
    fireWrongEffect();

    // 增加出局數
    gameState.outs++;

    // 檢查是否需要換邊
    if (gameState.outs >= 3) {
        SFX.out();
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

// ===== 跑壘動畫系統 =====

// 壘包座標 (相對於 .baseball-field 的位置，以百分比表示)
const BASE_POSITIONS = {
    home:   { x: 50, y: 91 },   // 本壘
    first:  { x: 83, y: 43 },   // 一壘
    second: { x: 50, y: 10 },   // 二壘
    third:  { x: 17, y: 43 },   // 三壘
    score:  { x: 50, y: 91 }    // 得分（回本壘）
};

// 建立一個動畫跑者 DOM 元素
function createAnimatedRunner() {
    const el = document.createElement('div');
    el.className = 'animated-runner';
    el.innerHTML = '<span class="runner-icon">⚾</span>';
    return el;
}

// 計算兩壘之間的路徑點（走弧線）
function getPathPoints(from, to, steps) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // 線性插值 + 弧度偏移讓跑壘走弧線
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        // 向內側偏移（讓跑壘路徑看起來更自然）
        const offsetX = (50 - midX) * 0.3 * Math.sin(t * Math.PI);
        const offsetY = (50 - midY) * 0.3 * Math.sin(t * Math.PI);
        points.push({
            x: from.x + (to.x - from.x) * t + offsetX * Math.sin(t * Math.PI),
            y: from.y + (to.y - from.y) * t + offsetY * Math.sin(t * Math.PI)
        });
    }
    return points;
}

// 播放單一跑者從 fromBase 到 toBase 的動畫
function animateOneRunner(field, fromBase, toBase, duration) {
    return new Promise(resolve => {
        const runner = createAnimatedRunner();
        field.appendChild(runner);

        const from = BASE_POSITIONS[fromBase];
        const to = BASE_POSITIONS[toBase];

        // 設定初始位置
        runner.style.left = from.x + '%';
        runner.style.top = from.y + '%';

        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            // ease-out 曲線
            const ease = 1 - Math.pow(1 - t, 3);

            // 弧線偏移
            const midX = (50 - (from.x + to.x) / 2) * 0.25;
            const midY = (50 - (from.y + to.y) / 2) * 0.25;
            const arcX = midX * Math.sin(t * Math.PI);
            const arcY = midY * Math.sin(t * Math.PI);

            const currentX = from.x + (to.x - from.x) * ease + arcX;
            const currentY = from.y + (to.y - from.y) * ease + arcY;

            runner.style.left = currentX + '%';
            runner.style.top = currentY + '%';

            // 跑動時的縮放彈跳效果
            const bounce = 1 + 0.15 * Math.sin(t * Math.PI * 4);
            runner.querySelector('.runner-icon').style.transform = `scale(${bounce})`;

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                // 動畫結束，得分的跑者加一個消失特效
                if (toBase === 'score') {
                    runner.classList.add('runner-score-fade');
                    setTimeout(() => runner.remove(), 400);
                } else {
                    runner.remove();
                }
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

// 計算每個跑者的移動路徑（強迫推進邏輯）
function getRunnerMoves(beforeBases, hitType) {
    const moves = [];
    const old = beforeBases;

    switch (hitType) {
        case 'homerun':
            if (old.third) moves.push({ from: 'third', to: 'score' });
            if (old.second) moves.push({ from: 'second', to: 'score' });
            if (old.first) moves.push({ from: 'first', to: 'score' });
            moves.push({ from: 'home', to: 'score' });
            break;

        case 'triple':
            if (old.third) moves.push({ from: 'third', to: 'score' });
            if (old.second) moves.push({ from: 'second', to: 'score' });
            if (old.first) moves.push({ from: 'first', to: 'score' });
            moves.push({ from: 'home', to: 'third' });
            break;

        case 'double':
            // 二壘跑者 → 得分（打者佔二壘，強迫）
            if (old.second) moves.push({ from: 'second', to: 'score' });
            // 一壘跑者 → 三壘（打者經過一壘，強迫）
            if (old.first) moves.push({ from: 'first', to: 'third' });
            // 三壘跑者 → 得分（只有一壘有人被擢過來才推進）
            if (old.third && old.first) moves.push({ from: 'third', to: 'score' });
            // 打者 → 二壘
            moves.push({ from: 'home', to: 'second' });
            break;

        case 'single':
            {
                const force2 = old.first;                // 一壘有人才擢二壘
                const force3 = old.first && old.second;  // 一二壘都有人才擢三壘

                // 三壘 → 得分（鏈式強迫）
                if (old.third && force3) moves.push({ from: 'third', to: 'score' });
                // 二壘 → 三壘（一壘有人才推進）
                if (old.second && force2) moves.push({ from: 'second', to: 'third' });
                // 一壘 → 二壘（打者佔一壘，強迫）
                if (old.first) moves.push({ from: 'first', to: 'second' });
                // 打者 → 一壘
                moves.push({ from: 'home', to: 'first' });
            }
            break;
    }
    return moves;
}

// 多壘跑動 — 需要拆成多段動畫（例如全壘打：home→1st→2nd→3rd→home）
function getMultiLegPath(from, to, hitType) {
    const order = ['home', 'first', 'second', 'third', 'score'];
    const startIdx = order.indexOf(from);
    let endIdx = order.indexOf(to);
    if (endIdx <= startIdx) endIdx = order.length - 1; // score

    const legs = [];
    for (let i = startIdx; i < endIdx; i++) {
        legs.push({ from: order[i], to: order[i + 1] });
    }
    return legs;
}

// 播放一個跑者的多段跑壘
async function animateMultiLeg(field, from, to, totalDuration) {
    const legs = getMultiLegPath(from, to);
    const legDuration = totalDuration / legs.length;

    const runner = createAnimatedRunner();
    field.appendChild(runner);

    const startPos = BASE_POSITIONS[from];
    runner.style.left = startPos.x + '%';
    runner.style.top = startPos.y + '%';

    for (const leg of legs) {
        await animateLeg(runner, BASE_POSITIONS[leg.from], BASE_POSITIONS[leg.to], legDuration);
    }

    // 結束處理
    if (to === 'score') {
        runner.classList.add('runner-score-fade');
        setTimeout(() => runner.remove(), 400);
    } else {
        runner.remove();
    }
}

// 播放一段跑壘（直接移動 DOM 元素）
function animateLeg(runner, from, to, duration) {
    return new Promise(resolve => {
        const startTime = performance.now();
        function step(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);

            const midX = (50 - (from.x + to.x) / 2) * 0.2;
            const midY = (50 - (from.y + to.y) / 2) * 0.2;
            const arcX = midX * Math.sin(t * Math.PI);
            const arcY = midY * Math.sin(t * Math.PI);

            runner.style.left = (from.x + (to.x - from.x) * ease + arcX) + '%';
            runner.style.top = (from.y + (to.y - from.y) * ease + arcY) + '%';

            const bounce = 1 + 0.12 * Math.sin(t * Math.PI * 5);
            runner.querySelector('.runner-icon').style.transform = `scale(${bounce})`;

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

// 主要動畫控制函數
function animateRunners(beforeBases, hitType, onComplete) {
    const field = document.querySelector('.baseball-field');
    const moves = getRunnerMoves(beforeBases, hitType);

    if (moves.length === 0) {
        onComplete();
        return;
    }

    // 先隱藏所有靜態跑者（動畫跑者會取代）
    elements.runnerFirst.style.display = 'none';
    elements.runnerSecond.style.display = 'none';
    elements.runnerThird.style.display = 'none';
    elements.runnerHome.style.display = 'none';

    // 計算總時間（壘數越多越長）
    const baseDuration = 400; // 每壘 400ms

    // 所有跑者同時跑
    const animations = moves.map(move => {
        const legs = getMultiLegPath(move.from, move.to);
        const totalDuration = legs.length * baseDuration;
        return animateMultiLeg(field, move.from, move.to, totalDuration);
    });

    Promise.all(animations).then(() => {
        onComplete();
    });
}

// 推進壘包
function advanceBases(hitType) {
    let totalRuns = 0;

    // 記錄推進前的壘包狀態
    const old = { ...gameState.bases };

    switch (hitType) {
        case 'homerun':
            // 全壘打：所有壘上跑者得分，打者得分
            if (old.third) totalRuns++;
            if (old.second) totalRuns++;
            if (old.first) totalRuns++;
            totalRuns++; // 打者
            gameState.bases = { first: false, second: false, third: false };
            break;

        case 'triple':
            // 三壘打：打者到三壘，經過所有壘包，全部強迫推進
            if (old.third) totalRuns++;
            if (old.second) totalRuns++;
            if (old.first) totalRuns++;
            gameState.bases = { first: false, second: false, third: true };
            break;

        case 'double':
            // 二壘打：打者到二壘
            // 二壘跑者 → 得分（打者佔二壘，強迫）
            if (old.second) totalRuns++;
            // 一壘跑者 → 三壘（打者經過一壘，強迫）
            // 三壘跑者 → 得分（只有一壘有人被擠過來才需推進）
            if (old.third && old.first) totalRuns++;
            else if (old.third && !old.first) { /* 三壘不動 */ }
            gameState.bases.third = old.first ? true : old.third;
            gameState.bases.second = true;
            gameState.bases.first = false;
            break;

        case 'single':
            // 安打：打者到一壘，鏈式強迫推進
            // 一壘 → 二壘（打者佔一壘，強迫）
            // 二壘 → 三壘（只有一壘有人被擠過來才推進）
            // 三壘 → 得分（只有一壘和二壘都有人才推進）
            {
                const force1 = true;           // 打者佔一壘，一壘永遠被迫
                const force2 = old.first;       // 一壘有人才能擠二壘
                const force3 = old.first && old.second; // 一二壘都有人才能擢三壘

                if (old.third && force3) totalRuns++;
                gameState.bases.third = (old.second && force2) ? true : (old.third && !force3 ? true : false);
                gameState.bases.second = (old.first && force1) ? true : (old.second && !force2 ? true : false);
                gameState.bases.first = true;
            }
            break;
    }

    // 一次性增加分數（不顯示特效，由動畫結束後觸發）
    if (totalRuns > 0) {
        if (gameState.currentTeam === 1) {
            gameState.scores.team1 += totalRuns;
        } else {
            gameState.scores.team2 += totalRuns;
        }
    }

    return totalRuns;
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

    // 分數數字跳動動畫
    const scoreEl = team === 1 ? elements.team1Score : elements.team2Score;
    scoreEl.classList.remove('score-pulse');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('score-pulse');

    // 得分音效
    if (points >= 4) {
        SFX.homerun();
    } else {
        SFX.score();
    }

    // 發射彩紙特效
    fireConfetti(points);

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

// 彩紙特效
function fireConfetti(points) {
    if (typeof confetti !== 'function') return;

    const count = Math.min(points * 80, 300);
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    // 基本彩紙
    confetti({
        ...defaults,
        particleCount: count,
        spread: 80,
        colors: ['#ffd700', '#ff6b6b', '#87ceeb', '#2ecc71', '#ffffff']
    });

    // 全壘打時加碼煙火效果
    if (points >= 4) {
        setTimeout(() => {
            confetti({ ...defaults, particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 } });
            confetti({ ...defaults, particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 } });
        }, 300);
        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: 150,
                spread: 160,
                startVelocity: 45,
                scalar: 1.2,
                shapes: ['star'],
                colors: ['#ffd700', '#ff4500', '#ff69b4']
            });
        }, 700);
    }
}

// 打擊特效 - 揮棒震動 + 星光閃爍
function fireHitEffect() {
    // 畫面震動
    const container = document.querySelector('.game-container');
    container.classList.add('hit-shake');
    setTimeout(() => container.classList.remove('hit-shake'), 500);

    // 棒球場閃光
    const field = document.querySelector('.baseball-field');
    field.classList.add('hit-flash');
    setTimeout(() => field.classList.remove('hit-flash'), 600);

    // 小型星光粒子
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 15,
            spread: 40,
            startVelocity: 20,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ffd700', '#ffffff', '#87ceeb'],
            scalar: 0.6,
            gravity: 0.8,
            ticks: 80,
            zIndex: 9999
        });
    }
}

// 答錯特效 - 紅色閃爍 + 震動
function fireWrongEffect() {
    // 畫面紅色閃爍
    const container = document.querySelector('.game-container');
    container.classList.add('wrong-shake');
    setTimeout(() => container.classList.remove('wrong-shake'), 600);

    // 棒球場紅色閃爍
    const field = document.querySelector('.baseball-field');
    field.classList.add('wrong-flash');
    setTimeout(() => field.classList.remove('wrong-flash'), 600);

    // 紅色碎片噴出
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 30,
            spread: 70,
            startVelocity: 15,
            origin: { x: 0.5, y: 0.6 },
            colors: ['#e74c3c', '#c0392b', '#ff6b6b', '#333333'],
            scalar: 0.7,
            gravity: 1.2,
            ticks: 60,
            zIndex: 9999
        });
    }
}

// 遊戲結束慶祝彩紙
function fireGameOverConfetti() {
    if (typeof confetti !== 'function') return;

    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#ffd700', '#ff6b6b', '#87ceeb', '#2ecc71', '#ff69b4', '#ffffff'];

    (function frame() {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: colors,
            zIndex: 9999
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: colors,
            zIndex: 9999
        });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
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

    // 攻守交換音效 + 提示
    SFX.switchTeam();
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

    // 遊戲結束音效 + 慶祝彩紙
    SFX.gameOver();
    fireGameOverConfetti();

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
