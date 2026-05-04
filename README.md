# Phishing Link Detection Chrome Extension

## About the Project

This project is a simple Chrome extension that helps users stay safe while browsing.  
It checks every website you visit and tries to figure out if it might be a phishing site.

Most people dont really check links before clicking. And honestly, fake websites look very real these days. This extension acts like a small safety layer that warns you before you enter anything sensitive.

---

## Features

- Real-time URL analysis  
- HTTPS check  
- Detection of suspicious domains  
- Keyword scanning (login, verify, bank, etc.)  
- Blacklist checking (optional API)  
- Risk classification:
  - Safe  
  - Medium Risk  
  - High Risk  
- Warning popup for unsafe sites  

---

## How It Works

When you open a website:

1. The extension captures the URL  
2. It checks if HTTPS is present  
3. It looks for weird patterns in the domain  
4. It compares the link with known phishing sites  
5. It scans for suspicious keywords  
6. Based on all this, it gives a risk level  

If the site looks dangerous, it shows a warning before you do anything.

---

## Tech Stack

- HTML  
- CSS  
- JavaScript  
- Chrome Extension APIs  

---

## Installation

1. Download or clone this repository  
2. Open Google Chrome  
3. Go to `chrome://extensions/`  
4. Enable **Developer Mode**  
5. Click on **Load unpacked**  
6. Select the project folder  

The extension should now be active

---

## Usage

- Open any website  
- The extension will run automatically  
- If the site is risky, a warning will appear  
- You can choose to continue or go back  

---

## Future Improvements

- Add machine learning based detection  
- Improve accuracy of risk scoring  
- Add user reporting system   

---

## Why This Project

This project was made keeping normal users in mind.  
Not everyone understands how phishing works, and thats okay.  

The goal is simple — help people avoid mistakes before they happen.

---

## Author

Amrit Kashyap  

---

## License

This project is for educational purposes.
