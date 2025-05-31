// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// DOM Elements
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userBalance = document.getElementById('user-balance');
const taskButtons = document.querySelectorAll('.task-btn');
const countdownElement = document.getElementById('countdown');

// User data
let userData = {
    balance: 0,
    lastBonusClaim: null,
    completedTasks: {},
    lastTelegramClaim: null
};

// Initialize the app
function initApp() {
    // Load user data from localStorage
    const savedData = localStorage.getItem('dubeUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }

    // Set Telegram user info if available
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const tgUser = tg.initDataUnsafe.user;
        userName.textContent = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || tgUser.username || 'Telegram User';
        
        if (tgUser.photo_url) {
            userPhoto.src = tgUser.photo_url;
        }
    } else {
        userName.textContent = 'Guest User';
    }

    // Update balance display
    updateBalance();

    // Check task statuses
    checkTaskStatuses();
}

// Update balance display
function updateBalance() {
    userBalance.textContent = userData.balance;
    saveUserData();
}

// Check all task statuses
function checkTaskStatuses() {
    const now = new Date();
    
    // Check daily bonus
    const lastBonusClaim = userData.lastBonusClaim ? new Date(userData.lastBonusClaim) : null;
    const dailyBonusBtn = document.querySelector('[data-task="daily"]');
    
    if (!lastBonusClaim) {
        dailyBonusBtn.disabled = false;
        dailyBonusBtn.textContent = 'Claim Bonus';
        dailyBonusBtn.nextElementSibling.style.display = 'none';
    } else {
        const nextBonusTime = new Date(lastBonusClaim.getTime() + 24 * 60 * 60 * 1000);
        
        if (now >= nextBonusTime) {
            dailyBonusBtn.disabled = false;
            dailyBonusBtn.textContent = 'Claim Bonus';
            dailyBonusBtn.nextElementSibling.style.display = 'none';
        } else {
            dailyBonusBtn.disabled = true;
            dailyBonusBtn.textContent = 'Claimed';
            dailyBonusBtn.nextElementSibling.style.display = 'block';
            startCountdown(nextBonusTime, countdownElement);
        }
    }
    
    // Check Telegram task (repeatable daily)
    const lastTelegramClaim = userData.lastTelegramClaim ? new Date(userData.lastTelegramClaim) : null;
    const telegramBtn = document.querySelector('[data-task="telegram"]');
    
    if (!lastTelegramClaim) {
        telegramBtn.disabled = false;
        telegramBtn.nextElementSibling.style.display = 'none';
    } else {
        const nextTelegramTime = new Date(lastTelegramClaim.getTime() + 24 * 60 * 60 * 1000);
        
        if (now >= nextTelegramTime) {
            telegramBtn.disabled = false;
            telegramBtn.nextElementSibling.style.display = 'none';
        } else {
            telegramBtn.disabled = true;
            telegramBtn.nextElementSibling.style.display = 'block';
            startCountdown(nextTelegramTime, telegramBtn.nextElementSibling.querySelector('span'));
        }
    }
    
    // Check other tasks (one-time)
    taskButtons.forEach(button => {
        const taskType = button.getAttribute('data-task');
        if (taskType !== 'daily' && taskType !== 'telegram' && userData.completedTasks[taskType]) {
            button.disabled = true;
            button.textContent = 'Completed';
        }
    });
}

// Start countdown timer
function startCountdown(targetTime, element) {
    function updateCountdown() {
        const now = new Date();
        const diff = targetTime - now;
        
        if (diff <= 0) {
            clearInterval(timer);
            checkTaskStatuses();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        element.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
}

// Complete task
function completeTask(taskType, points) {
    // Update balance
    userData.balance += points;
    
    // Update task status
    if (taskType === 'daily') {
        userData.lastBonusClaim = new Date().toISOString();
    } else if (taskType === 'telegram') {
        userData.lastTelegramClaim = new Date().toISOString();
    } else {
        userData.completedTasks[taskType] = true;
    }
    
    updateBalance();
    checkTaskStatuses();
    
    // Show confirmation
    tg.showPopup({
        title: 'Success!',
        message: `You earned ${points} DUBE!`,
        buttons: [{ type: 'ok' }]
    });
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('dubeUserData', JSON.stringify(userData));
}

// Event listeners
taskButtons.forEach(button => {
    button.addEventListener('click', () => {
        const taskType = button.getAttribute('data-task');
        const points = parseInt(button.getAttribute('data-points'));
        completeTask(taskType, points);
    });
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp)
