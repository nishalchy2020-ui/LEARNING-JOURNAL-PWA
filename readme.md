# Learning Journal PWA

A Progressive Web App (PWA) for documenting weekly learning reflections, built with **Flask**, **JavaScript**, and **Chart.js**. This app allows users to add reflections, track moods, and visualize learning progress over time. It is fully installable on devices, works offline, and provides a mobile-friendly experience.

---

## Features

- **Add Reflections:** Users can write and save weekly learning reflections.
- **Mood Tracking:** Assign a mood (Happy, Neutral, Sad, Excited, Frustrated) to each reflection.
- **Dashboard:** Visualizes the mood distribution of all reflections using charts.
- **Offline Access:** Service worker caches assets and reflections for offline usage.
- **PWA Installable:** Can be installed like a native mobile app using the `beforeinstallprompt` event.
- **Export JSON:** Download all reflections as a JSON file for backup or analysis.
- **Quick-Access Navigation:** Recently added reflections are easily accessible.
- **Theme Toggle:** Light and dark modes with persistence via localStorage.

---

## Technologies Used

- **Backend:** Python Flask
- **Frontend:** HTML, CSS, JavaScript
- **Charts:** Chart.js for mood visualization
- **PWA Features:** Service worker, manifest.json, offline overlay
- **Data Storage:** JSON file (`backend/reflections.json`)

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/learning-journal-pwa.git
   cd learning-journal-pwa
```
2. **Install dependencies**
```bash
pip install flask
```

3. **Run the Flask app**
```bash
python app.py
```

4. **Open your browser and navigate to**
```bash
http://127.0.0.1:5000/
```
#project structure
learning-journal-pwa/
│
├── backend/
│   └── reflections.json
├── templates/
│   ├── index.html
│   ├── journal.html
│   ├── projects.html
│   ├── dashboard.html
│   └── about.html
├── static/
│   ├── css/
│   ├── js/
│   └── manifest.json
├── app.py
└── README.md

Copyright © 2025-2026 Nishal Chaudhary