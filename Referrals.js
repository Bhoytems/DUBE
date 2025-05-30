// Sample referral data (updated for 100 DUBE per referral)
const referralData = {
    totalReferrals: 5,
    earnedFromReferrals: 500, // 5 referrals * 100 DUBE each
    referrals: [
        { name: "User1", date: "2023-05-01", earned: 100 },
        { name: "User2", date: "2023-05-05", earned: 100 },
        { name: "User3", date: "2023-05-10", earned: 100 },
        { name: "User4", date: "2023-05-15", earned: 100 },
        { name: "User5", date: "2023-05-20", earned: 100 }
    ]
};

// DOM Elements
const referralLink = document.getElementById('referral-link');
const copyBtn = document.getElementById('copy-btn');
const totalReferrals = document.getElementById('total-referrals');
const earnedReferrals = document.getElementById('earned-referrals');
const referralsList = document.getElementById('referrals-list');

// Initialize referral page
function initReferrals() {
    // Set referral link (you would generate this dynamically in a real app)
    const userId = localStorage.getItem('dubeUserId') || 'user' + Math.floor(Math.random() * 1000);
    referralLink.value = `https://dube-airdrop.com?ref=${userId}`;
    
    // Set stats
    totalReferrals.textContent = referralData.totalReferrals;
    earnedReferrals.textContent = referralData.earnedFromReferrals + ' DUBE';
    
    // Populate referrals list
    populateReferralsList();
    
    // Set up copy button
    copyBtn.addEventListener('click', copyReferralLink);
}

// Populate referrals list
function populateReferralsList() {
    referralsList.innerHTML = '';
    
    referralData.referrals.forEach(ref => {
        const item = document.createElement('div');
        item.className = 'referral-item';
        
        item.innerHTML = `
            <span>${ref.name}</span>
            <span>${ref.date}</span>
            <span>+${ref.earned} DUBE</span>
        `;
        
        referralsList.appendChild(item);
    });
}

// Copy referral link to clipboard
function copyReferralLink() {
    referralLink.select();
    document.execCommand('copy');
    
    // Change button text temporarily
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
}

// Initialize the referrals page
document.addEventListener('DOMContentLoaded', initReferrals);