// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// DOM Elements
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userBalance = document.getElementById('user-balance');
const dailyBonusBtn = document.getElementById('daily-bonus-btn');
const bonusTimer = document.getElementById('bonus-timer');
const countdownElement = document.getElementById('countdown');
const taskButtons = document.querySelectorAll('.task-btn');

// User data
let userData = {
    balance: 0,
    lastBonusClaim: null,
    completedTasks: []
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

    // Check daily bonus status
    checkDailyBonus();
}

// Update balance display
function updateBalance() {
    userBalance.textContent = userData.balance;
    saveUserData();
}

// Check daily bonus availability
function checkDailyBonus() {
    const now = new Date();
    const lastClaim = userData.lastBonusClaim ? new Date(userData.lastBonusClaim) : null;
    
    if (!lastClaim) {
        // Never claimed before
        dailyBonusBtn.disabled = false;
        dailyBonusBtn.textContent = 'Claim Bonus';
        bonusTimer.style.display = 'none';
        return;
    }

    const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
    
    if (now >= nextClaimTime) {
        // Bonus available
        dailyBonusBtn.disabled = false;
        dailyBonusBtn.textContent = 'Claim Bonus';
        bonusTimer.style.display = 'none';
    } else {
        // Bonus not available yet
        dailyBonusBtn.disabled = true;
        dailyBonusBtn.textContent = 'Already Claimed';
        bonusTimer.style.display = 'block';
        startCountdown(nextClaimTime);
    }
}

// Start countdown timer
function startCountdown(nextClaimTime) {
    function updateCountdown() {
        const now = new Date();
        const diff = nextClaimTime - now;
        
        if (diff <= 0) {
            clearInterval(timer);
            checkDailyBonus();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
}

// Claim daily bonus
function claimDailyBonus() {
    userData.balance += 50;
    userData.lastBonusClaim = new Date().toISOString();
    
    updateBalance();
    checkDailyBonus();
    
    // Show confirmation
    tg.showPopup({
        title: 'Bonus Claimed!',
        message: 'You have received 50 DUBE as your daily bonus.',
        buttons: [{ type: 'ok' }]
    });
}

// Complete task
function completeTask(taskType) {
    if (userData.completedTasks.includes(taskType)) {
        tg.showPopup({
            title: 'Already Completed',
            message: 'You have already completed this task.',
            buttons: [{ type: 'ok' }]
        });
        return;
    }
    
    let points = 0;
    switch (taskType) {
        case 'telegram':
            points = 50;
            break;
        case 'twitter':
            points = 30;
            break;
        case 'retweet':
            points = 20;
            break;
    }
    
    userData.balance += points;
    userData.completedTasks.push(taskType);
    updateBalance();
    
    tg.showPopup({
        title: 'Task Completed!',
        message: `You earned ${points} DUBE for completing this task.`,
        buttons: [{ type: 'ok' }]
    });
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('dubeUserData', JSON.stringify(userData));
}

// Event listeners
dailyBonusBtn.addEventListener('click', claimDailyBonus);

taskButtons.forEach(button => {
    button.addEventListener('click', () => {
        const taskType = button.getAttribute('data-task');
        completeTask(taskType);
    });
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);