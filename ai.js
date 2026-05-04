// ===============================
// CLEAN ADVANCED RULE ENGINE
// ===============================


// ---------- Known Brands ----------
const knownBrands = [
    "paypal",
    "google",
    "facebook",
    "amazon",
    "apple",
    "microsoft",
    "instagram",
    "bankofamerica",
    "netflix",
    "linkedin",
    "chase",
    "wellsfargo",
    "coinbase",
    "binance",
    "gmail",
    "outlook",
    "github"
];

// Legitimate brand domains
const legitimateDomains = {
    "google": ["google.com"],
    "paypal": ["paypal.com"],
    "amazon": ["amazon.com", "amazon.in"],
    "facebook": ["facebook.com"],
    "instagram": ["instagram.com"],
    "microsoft": ["microsoft.com"],
    "linkedin": ["linkedin.com"],
    "netflix": ["netflix.com"]
};

// ---------- Weighted Phishing Keywords ----------
const phishingKeywords = {
    "login": 2,
    "signin": 2,
    "verify": 2,
    "secure": 1.5,
    "account": 1.5,
    "reset": 2,
    "password": 2.5,
    "confirm": 2,
    "update": 1.5,
    "free": 1,
    "gift": 1.5,
    "bonus": 1,
    "urgent": 2,
    "suspend": 2,
    "unlock": 2,
    "wallet": 1.5,
    "crypto": 1.5
};


// ---------- Risky TLD Scores ----------
const riskyTLDs = {
    "tk": 3,
    "xyz": 2.5,
    "zip": 2.5,
    "top": 2,
    "club": 1.5,
    "online": 1.5,
    "work": 1.5,
    "click": 2
};


// ---------- Utilities ----------

function normalizeDomain(domain) {
    return domain
        .replace(/0/g, "o")
        .replace(/1/g, "l")
        .replace(/3/g, "e")
        .replace(/5/g, "s")
        .replace(/@/g, "a");
}

function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1])
                matrix[i][j] = matrix[i - 1][j - 1];
            else
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
        }
    }
    return matrix[b.length][a.length];
}

function entropy(str) {
    let map = {};
    for (let c of str) map[c] = (map[c] || 0) + 1;
    let ent = 0;
    for (let key in map) {
        let p = map[key] / str.length;
        ent -= p * Math.log2(p);
    }
    return ent;
}


// ---------- Brand Similarity Scoring (0–1) ----------
function brandScore(domain, hostname) {

    let normalized = normalizeDomain(domain);

    // Detect Punycode IDN (homograph attacks like paypαl)
    if (normalized.startsWith("xn--")) {
        // Punycode format: xn--[ascii_chars]-[encoded_non_ascii]
        // Example: xn--paypl-g9d -> paypl (distance 1 to paypal)
        let punyParts = normalized.substring(4).split("-");
        if (punyParts.length > 1) {
            punyParts.pop(); // Remove the encoded non-ascii part
            let asciiBase = punyParts.join("-"); // What's left is the ASCII attempt
            if (asciiBase.length >= 3) {
                normalized = asciiBase;
            }
        }
    }

    // Extract full root domain (last 2 parts)
    let hostParts = hostname.split(".");
    let rootDomain = hostParts.slice(-2).join(".");

    const officialDomains = [
        "google.com",
        "paypal.com",
        "amazon.com",
        "facebook.com",
        "instagram.com",
        "microsoft.com",
        "linkedin.com",
        "netflix.com",
        "bankofamerica.com"
    ];

    for (let official of officialDomains) {
        if (rootDomain === official) {
            return 0; // Legitimate site
        }
    }

    for (let brand of knownBrands) {

        // Brand appears in fake domain
        if (normalized.includes(brand)) {
            return 1;
        }

        // Catch typos (paypa1 etc.)
        let distance = levenshtein(normalized, brand);
        if (distance <= 2) {
            return 1;
        }
    }

    return 0;
}  


// ---------- Keyword Score ----------
function keywordScore(url) {
    let score = 0;
    let lower = url.toLowerCase();

    for (let word in phishingKeywords) {
        if (lower.includes(word)) {
            score += phishingKeywords[word];
        }
    }

    return score;
}


// ---------- TLD Score ----------
function tldScore(hostname) {
    let parts = hostname.split(".");
    let tld = parts[parts.length - 1];
    return riskyTLDs[tld] || 0;
}


// ---------- Structure Score ----------
function structureScore(hostname) {

    let score = 0;
    let parts = hostname.split(".");

    // many subdomains
    if (parts.length > 4) score += 2;

    // multiple hyphens
    if ((hostname.match(/-/g) || []).length >= 3) score += 1.5;

    // long numeric sequences
    if (/\d{4,}/.test(hostname)) score += 1;

    // punycode IDN (homograph attacks)
    if (hostname.includes("xn--")) {
        score += 3.5; // High risk structure for untrusted domains
    } else if (hostname.includes("--")) {
        score += 1;
    }

    // high entropy
    if (entropy(hostname) > 4.2) score += 2;

    return score;
}


// ---------- MAIN ANALYSIS ----------
function analyzeURL(url) {

    const urlObj = new URL(url);
    let hostname = urlObj.hostname.toLowerCase();

    let parts = hostname.split(".");
    let domain = parts.length > 2
        ? parts[parts.length - 2]
        : parts[0];

    let brand = brandScore(domain, hostname);
    let keyword = keywordScore(url);
    let tld = tldScore(hostname);
    let structure = structureScore(hostname);
    let httpsPenalty = url.startsWith("https") ? 0 : 1.5;

    // Stronger weight for brand similarity
    let rawScore =
        (brand * 15) +
        keyword +
        tld +
        structure +
        httpsPenalty;

    // Brand + keyword multiplier (very important)
    if (brand > 0.8 && keyword > 0) {
        rawScore *= 1.3;
    }

    // Calibrated sigmoid
    let probability = 1 / (1 + Math.exp(-(rawScore - 5)));

    let level = "SAFE";
    if (probability > 0.8) level = "HIGH RISK";
    else if (probability > 0.45) level = "SUSPICIOUS";

    return {
        url,
        probability: probability.toFixed(3),
        level,
        details: {
            brandScore: brand,
            keywordScore: keyword,
            tldScore: tld,
            structureScore: structure,
            rawScore: rawScore.toFixed(2)
        }
    };
}