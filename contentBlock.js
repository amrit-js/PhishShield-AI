(function () {
    // Read the payload directly from isolated storage
    chrome.storage.local.get(null, (allData) => {
        let result = window.phishShieldResult;

        if (!result) {
            for (let key in allData) {
                if (key.startsWith("phish_") && allData[key]) {
                    result = allData[key];
                }
            }
        }

        if (!result) return;
        fireAlert(result);
    });

    function fireAlert(result) {

        // Avoid injecting multiple times
        if (document.getElementById("phish-shield-alert-box") || document.getElementById("phish-shield-full-block")) return;

        const perc = Math.round(result.probability * 100);

        // FULL SCREEN WARNING FOR HIGH RISK (>= 70%)
        if (result.probability >= 0.70) {
            const overlay = document.createElement("div");
            overlay.id = "phish-shield-full-block";
            overlay.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            background: #b91c1c; /* Deep Chrome warning red */
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            color: white;
            transition: opacity 0.3s ease;
        `;

            const container = document.createElement("div");
            container.style.cssText = `
            max-width: 560px;
            padding: 48px;
            text-align: center;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 20px;
            backdrop-filter: blur(8px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

            const icon = document.createElement("div");
            icon.innerText = "🚨";
            icon.style.fontSize = "54px";
            icon.style.marginBottom = "24px";

            const title = document.createElement("h1");
            title.innerText = "Deceptive site ahead";
            title.style.cssText = "margin: 0 0 16px 0; font-size: 34px; font-weight: 700; letter-spacing: -0.5px;";

            const text = document.createElement("p");
            text.innerText = `PhishShield halted execution dynamically. This site has a ${perc}% Threat Probability and likely attempts to trick you into revealing passwords, messages, or credit card information.`;
            text.style.cssText = "margin: 0 0 36px 0; font-size: 16px; line-height: 1.6; color: #fecaca; font-weight: 400;";

            const btnGroup = document.createElement("div");
            btnGroup.style.cssText = "display: flex; flex-direction: column; gap: 16px; align-items: center;";

            const safetyBtn = document.createElement("button");
            safetyBtn.innerText = "Get me back to safety";
            safetyBtn.style.cssText = `
            width: 100%;
            padding: 16px 24px;
            background: white;
            color: #b91c1c;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        `;
            safetyBtn.onmouseover = () => { safetyBtn.style.transform = 'translateY(-2px)'; safetyBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'; };
            safetyBtn.onmouseout = () => { safetyBtn.style.transform = 'translateY(0)'; safetyBtn.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)'; };
            safetyBtn.onclick = () => { window.location.href = "https://google.com"; };

            const proceedBtn = document.createElement("button");
            proceedBtn.innerText = "Proceed anyway (unsafe)";
            proceedBtn.style.cssText = `
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            border: none;
            font-size: 14px;
            text-decoration: underline;
            font-family: inherit;
            cursor: pointer;
            padding: 8px;
            transition: color 0.2s;
        `;
            proceedBtn.onmouseover = () => proceedBtn.style.color = 'white';
            proceedBtn.onmouseout = () => proceedBtn.style.color = 'rgba(255, 255, 255, 0.6)';
            proceedBtn.onclick = () => {
                document.body.style.overflow = '';
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            };

            btnGroup.appendChild(safetyBtn);
            btnGroup.appendChild(proceedBtn);

            container.appendChild(icon);
            container.appendChild(title);
            container.appendChild(text);
            container.appendChild(btnGroup);

            overlay.appendChild(container);

            if (document.body) {
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
            } else {
                document.addEventListener("DOMContentLoaded", () => {
                    document.body.appendChild(overlay);
                    document.body.style.overflow = 'hidden';
                });
            }
        }
        // SUBTLE SLIDE-IN BANNER FOR SUSPICIOUS RISK (45% - 69%)
        else if (result.probability >= 0.45) {

            const overlay = document.createElement("div");
            overlay.id = "phish-shield-alert-box";
            overlay.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            width: 340px;
            background: linear-gradient(135deg, rgba(12,12,14,0.95), rgba(24,24,28,0.95));
            border: 1px solid rgba(245, 158, 11, 0.4);
            border-left: 4px solid #f59e0b;
            box-shadow: 0 16px 40px rgba(0,0,0,0.6);
            backdrop-filter: blur(12px);
            border-radius: 12px;
            color: white;
            font-family: 'Inter', system-ui, sans-serif;
            padding: 20px;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

            const title = document.createElement("h3");
            title.innerText = "⚠ Suspicious Site";
            title.style.cssText = `
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            color: #f59e0b;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

            const text = document.createElement("p");
            text.innerText = `PhishShield detected a ${perc}% risk probability. Click the extension icon to view the threat breakdown before entering passwords.`;
            text.style.cssText = "margin: 0; font-size: 13px; font-weight: 400; line-height: 1.5; color: #cbd5e1;";

            const btnGroup = document.createElement("div");
            btnGroup.style.display = "flex";
            btnGroup.style.gap = "10px";
            btnGroup.style.marginTop = "8px";

            const leaveBtn = document.createElement("button");
            leaveBtn.innerText = "Leave Site";
            leaveBtn.style.cssText = `
            flex: 1;
            padding: 10px;
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-family: inherit;
            font-size: 13px;
            transition: all 0.2s;
        `;
            leaveBtn.onmouseover = () => { leaveBtn.style.background = 'rgba(245, 158, 11, 0.25)'; };
            leaveBtn.onmouseout = () => { leaveBtn.style.background = 'rgba(245, 158, 11, 0.15)'; };
            leaveBtn.onclick = () => { window.location.href = "https://google.com"; };

            const ignoreBtn = document.createElement("button");
            ignoreBtn.innerText = "Dismiss";
            ignoreBtn.style.cssText = `
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.05);
            color: #94a3b8;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.2s;
        `;
            ignoreBtn.onmouseover = () => { ignoreBtn.style.background = 'rgba(255, 255, 255, 0.1)'; };
            ignoreBtn.onmouseout = () => { ignoreBtn.style.background = 'rgba(255, 255, 255, 0.05)'; };
            ignoreBtn.onclick = () => {
                overlay.style.opacity = 0;
                overlay.style.transform = 'translateY(-20px)';
                setTimeout(() => overlay.remove(), 500);
            };

            btnGroup.appendChild(leaveBtn);
            btnGroup.appendChild(ignoreBtn);

            overlay.appendChild(title);
            overlay.appendChild(text);
            // Wait for body just in case
            if (document.body) {
                document.body.appendChild(overlay);
            } else {
                document.addEventListener("DOMContentLoaded", () => document.body.appendChild(overlay));
            }

            requestAnimationFrame(() => {
                overlay.style.transform = "translateX(0)";
                overlay.style.opacity = "1";
            });
        }
    }
})();
