// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// DOM Elements (same as before)
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
    // Set Telegram user info
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const tgUser = tg.initDataUnsafe.user;
        userName.textContent = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || tgUser.username || 'Telegram User';
        
        if (tgUser.photo_url) {
            userPhoto.src = tgUser.photo_url;
        }
        
        // Load user data from Telegram backend
        loadUserData(tgUser.id);
    } else {
        userName.textContent = 'Guest User';
        tg.showAlert("Please open this app through Telegram");
    }
}

// Load user data from Telegram backend
function loadUserData(userId) {
    // In a real implementation, you would call your backend here
    // For now, we'll simulate it with localStorage
    const savedData = localStorage.getItem(`dubeUserData_${userId}`);
    if (savedData) {
        userData = JSON.parse(savedData);
    }
    
    updateUI();
}

// Save user data to Telegram backend
function saveUserData(userId) {
    // In a real implementation, you would send this to your backend
    localStorage.setItem(`dubeUserData_${userId}`, JSON.stringify(userData));
}

// Update UI
function updateUI() {
    userBalance.textContent = userData.balance;
    checkDailyBonus();
}

// ... (keep all your existing UI functions like checkDailyBonus, startCountdown) ...

// Claim daily bonus (updated for Telegram backend)
function claimDailyBonus() {
    const tgUser = tg.initDataUnsafe.user;
    userData.balance += 50;
    userData.lastBonusClaim = new Date().toISOString();
    
    saveUserData(tgUser.id);
    updateUI();
    
    tg.showPopup({
        title: 'Bonus Claimed!',
        message: 'You have received 50 DUBE as your daily bonus.',
        buttons: [{ type: 'ok' }]
    });
}

// Complete task (updated for Telegram backend)
function completeTask(taskType) {
    const tgUser = tg.initDataUnsafe.user;
    
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
    saveUserData(tgUser.id);
    updateUI();
    
    tg.showPopup({
        title: 'Task Completed!',
        message: `You earned ${points} DUBE for completing this task.`,
        buttons: [{ type: 'ok' }]
    });
}

// Event listeners
dailyBonusBtn.addEventListener('click', claimDailyBonus);
taskButtons.forEach(btn => btn.addEventListener('click', () => 
    completeTask(btn.getAttribute('data-task'))
));

// Initialize
document.addEventListener('DOMContentLoaded', initApp);