document.addEventListener("DOMContentLoaded", () => {
    // Nav logic
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');

            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            views.forEach(view => {
                if (view.id === `view-${target}`) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });

    const escapeBtn = document.getElementById("escapeBtn");
    escapeBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.update(tabs[0].id, { url: "https://google.com" });
        });
    });

    // Populate data
    chrome.storage.local.get(["phishingResult"], (data) => {
        if (!data.phishingResult) return;

        const result = data.phishingResult;
        const percentage = Math.round(result.probability * 100);

        applyTheme(percentage, result);
        populateOverview(percentage, result);
        populateDetails(result);
    });

    function applyTheme(percentage, result) {
        let themeColor, themeGlow;

        if (result.level === "HIGH RISK" || percentage >= 80) {
            themeColor = '#ef4444'; // danger red
            themeGlow = 'rgba(239, 68, 68, 0.4)';
        } else if (result.level === "SUSPICIOUS" || percentage >= 40) {
            themeColor = '#f59e0b'; // warn yellow
            themeGlow = 'rgba(245, 158, 11, 0.4)';
        } else {
            themeColor = '#10b981'; // safe green
            themeGlow = 'rgba(16, 185, 129, 0.4)';
        }

        document.documentElement.style.setProperty('--theme-color', themeColor);
        document.documentElement.style.setProperty('--theme-glow', themeGlow);

        const statusBadge = document.getElementById('statusBadge');
        if (result.level === "HIGH RISK") {
            statusBadge.innerText = "High Risk";
            statusBadge.style.color = '#fff';
            statusBadge.style.background = '#ef4444';
            statusBadge.style.borderColor = '#ef4444';
        } else if (result.level === "SUSPICIOUS") {
            statusBadge.innerText = "Suspicious";
            statusBadge.style.color = '#000';
            statusBadge.style.background = '#f59e0b';
            statusBadge.style.borderColor = '#f59e0b';
        } else {
            statusBadge.innerText = "Safe";
            statusBadge.style.color = '#fff';
            statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        }
    }

    function populateOverview(percentage, result) {
        document.getElementById('scoreValue').innerText = percentage;

        const offset = 283 - (283 * percentage) / 100;
        // set timeout to allow transition to play cleanly after DOM paints
        setTimeout(() => {
            document.getElementById('scoreRing').style.strokeDashoffset = offset;
        }, 50);

        const titleText = document.getElementById('titleText');
        const descText = document.getElementById('descriptionText');
        const escapeBtn = document.getElementById('escapeBtn');

        if (result.level === "HIGH RISK" || percentage >= 80) {
            titleText.innerText = "Security Warning";
            titleText.style.color = 'var(--color-danger)';
            descText.innerText = "This website appears to impersonate a trusted brand. Entering credentials may result in account theft.";
            escapeBtn.classList.remove('hidden');
        } else if (result.level === "SUSPICIOUS" || percentage >= 40) {
            titleText.innerText = "Caution Needed";
            titleText.style.color = 'var(--color-warn)';
            descText.innerText = "This website shows phishing-like characteristics. Proceed with caution.";
            escapeBtn.classList.remove('hidden');
        } else {
            titleText.innerText = "Website Appears Safe";
            titleText.style.color = 'var(--color-safe)';
            descText.innerText = "No major phishing indicators detected on this domain. You are safe to proceed.";
            escapeBtn.classList.add('hidden');
        }
    }

    function populateDetails(result) {
        if (!result.details) return;

        // brandScore (ai.js uses 0 to 1)
        const bScore = result.details.brandScore;
        const brandPerc = Math.min(bScore * 100, 100);
        document.getElementById('brandScoreVal').innerText = bScore > 0 ? "Potential Spoofing" : "Clear";
        setTimeout(() => document.getElementById('brandScoreBar').style.width = brandPerc + '%', 150);

        // keywordScore (accumulates mostly 0 to ~10)
        const kScore = result.details.keywordScore;
        const kPerc = Math.min((kScore / 5) * 100, 100); // Normalize out of 5 for visually appealing progress
        document.getElementById('keywordScoreVal').innerText = kScore + " Risk Pts";
        setTimeout(() => document.getElementById('keywordScoreBar').style.width = kPerc + '%', 200);

        // tldScore (up to ~3)
        const tScore = result.details.tldScore;
        const tPerc = Math.min((tScore / 3) * 100, 100);
        document.getElementById('tldScoreVal').innerText = tScore + " Risk Pts";
        setTimeout(() => document.getElementById('tldScoreBar').style.width = tPerc + '%', 250);

        // structureScore 
        const sScore = result.details.structureScore;
        const sPerc = Math.min((sScore / 4) * 100, 100);
        document.getElementById('structureScoreVal').innerText = sScore + " Risk Pts";
        setTimeout(() => document.getElementById('structureScoreBar').style.width = sPerc + '%', 300);

        // URL
        document.getElementById('analyzedUrl').innerText = result.url || "--";
    }
});