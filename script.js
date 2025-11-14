document.addEventListener('DOMContentLoaded', () => {
    // ポモドーロ関連の要素
    const pomodoroContainer = document.getElementById('pomodoro-container');
    const timeDisplay = document.getElementById('time');
    const modeDisplay = document.getElementById('mode');
    const startStopButton = document.getElementById('start-stop');
    const resetTimerButton = document.getElementById('reset-timer');
    const clockButton = document.getElementById('clock-button');
    const pomodoroCountDisplay = document.getElementById('pomodoro-count');
    const totalMinutesDisplay = document.getElementById('total-minutes');
    const resetStatsButton = document.getElementById('reset-stats');
    
    // 時刻表示関連の要素
    const clockContainer = document.getElementById('clock-container');
    const currentTimeDisplay = document.getElementById('current-time');
    const backButton = document.getElementById('back-button');

    // 共通の要素
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const colorModeBtn = document.getElementById('color-mode-btn');

    const WORK_TIME = 25 * 60;
    const SHORT_BREAK_TIME = 5 * 60;
    const LONG_BREAK_TIME = 15 * 60;

    let pomodoroTimer;
    let clockTimer;
    let timeLeft = WORK_TIME;
    let isRunning = false;
    let pomodoroCount = 0;
    let totalMinutes = 0;
    let currentMode = 'Study';

    // --- 初期化 ---
    loadStats();
    updateDisplay();
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // --- データ保存・読込 ---
    function saveStats() {
        localStorage.setItem('pomodoroCount', pomodoroCount);
        localStorage.setItem('totalMinutes', totalMinutes);
    }
    function loadStats() {
        const savedPomodoros = localStorage.getItem('pomodoroCount');
        const savedMinutes = localStorage.getItem('totalMinutes');
        if (savedPomodoros) {
            pomodoroCount = parseInt(savedPomodoros, 10);
            pomodoroCountDisplay.textContent = pomodoroCount;
        }
        if (savedMinutes) {
            totalMinutes = parseFloat(savedMinutes);
            totalMinutesDisplay.textContent = Math.floor(totalMinutes);
        }
    }

    // --- 通知・効果音 ---
    function sendNotification(message) {
        if (Notification.permission === 'granted') new Notification('Pomodoro Timer', { body: message });
    }

    // ★★★ この関数を書き換えました ★★★
    function playSound() {
        // 'sound.mp3'という名前の音声ファイルを再生します
        // もしファイル名が違う場合は、ここの名前を書き換えてください
        const sound = new Audio('sound.mp3');
        sound.play();
    }

    // --- UI切替 ---
    function showClockView() {
        pomodoroContainer.classList.add('hidden');
        clockContainer.classList.remove('hidden');
        updateClock();
        clockTimer = setInterval(updateClock, 1000);
    }
    function showPomodoroView() {
        clearInterval(clockTimer);
        clockContainer.classList.add('hidden');
        pomodoroContainer.classList.remove('hidden');
    }
    function updateClock() {
        const now = new Date();
        const format = (num) => num.toString().padStart(2, '0');
        currentTimeDisplay.textContent = `${format(now.getHours())}:${format(now.getMinutes())}:${format(now.getSeconds())}`;
    }

    // --- ポモドーロタイマーのコア機能 ---
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    function startTimer() {
        if (timeLeft <= 0) return;
        isRunning = true;
        startStopButton.textContent = 'Stop';
        pomodoroTimer = setInterval(() => {
            timeLeft--;
            if (currentMode === 'Study') {
                totalMinutes += 1/60;
                totalMinutesDisplay.textContent = Math.floor(totalMinutes);
            }
            updateDisplay();
            if (timeLeft < 0) {
                stopTimer();
                timeLeft = 0;
                updateDisplay();
                playSound();
                sendNotification("Session complete!");
                prepareNextSession();
                if (!clockContainer.classList.contains('hidden')) {
                    showPomodoroView();
                }
            }
        }, 1000);
    }
    function stopTimer() {
        isRunning = false;
        startStopButton.textContent = 'Start';
        clearInterval(pomodoroTimer);
        saveStats();
    }
    function prepareNextSession() {
        if (currentMode === 'Study') {
            pomodoroCount++;
            pomodoroCountDisplay.textContent = pomodoroCount;
            saveStats();
            if (pomodoroCount % 4 === 0) {
                currentMode = 'Long Break';
                timeLeft = LONG_BREAK_TIME;
                modeDisplay.textContent = 'Long Break';
                document.body.classList.add('break-bg');
            } else {
                currentMode = 'Short Break';
                timeLeft = SHORT_BREAK_TIME;
                modeDisplay.textContent = 'Short Break';
                document.body.classList.add('break-bg');
            }
        } else {
            currentMode = 'Study';
            timeLeft = WORK_TIME;
            modeDisplay.textContent = 'Study';
            document.body.classList.remove('break-bg');
        }
        updateDisplay();
    }
    function resetTimer() {
        stopTimer();
        currentMode = 'Study';
        timeLeft = WORK_TIME;
        modeDisplay.textContent = 'Study';
        document.body.classList.remove('break-bg');
        updateDisplay();
    }
    function resetStats() {
        if (confirm('Are you sure you want to reset your stats?')) {
            pomodoroCount = 0;
            totalMinutes = 0;
            pomodoroCountDisplay.textContent = '0';
            totalMinutesDisplay.textContent = '0';
            saveStats();
        }
    }

    // --- イベントリスナー ---
    startStopButton.addEventListener('click', () => {
        if (isRunning) stopTimer();
        else startTimer();
    });
    resetTimerButton.addEventListener('click', resetTimer);
    resetStatsButton.addEventListener('click', resetStats);
    clockButton.addEventListener('click', showClockView);
    backButton.addEventListener('click', showPomodoroView);
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
        } else {
            document.exitFullscreen();
        }
    });
    colorModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('monochrome');
    });
});
