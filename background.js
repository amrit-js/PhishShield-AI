importScripts("ai.js");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.status !== "complete" || !tab.url) return;

    if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://") ||
        tab.url.startsWith("chrome-error://")
    ) return;

    let result = analyzeURL(tab.url);

    chrome.storage.local.set({ phishingResult: result });

    // Badge & System Notification
    // Restored threshold to 45% (0.45)
    if (result.probability >= 0.45) {
        const perc = Math.round(result.probability * 100);
        const isHigh = result.probability >= 0.8;
        
        const badgeColor = isHigh ? "#ef4444" : "#f59e0b";
        chrome.action.setBadgeText({ text: "!", tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: badgeColor });

        // Tiny transparent base64 PNG, since Chrome requires an iconUrl for notifications
        const fallbackIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        chrome.notifications.create({
            type: "basic",
            iconUrl: fallbackIcon,
            title: isHigh ? "High Risk Site Detected" : "Suspicious Site",
            message: \`PhishShield detected a \${perc}% threat probability. Click the extension view for details.\`,
            priority: 2
        });

    } else {
        chrome.action.setBadgeText({ text: "", tabId: tabId });
    }

});