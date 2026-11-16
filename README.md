# 🎓 CampusEvents – Event Registration on Google Firebase

A real-time cloud web app where students sign in with Google and register for college events.
Organisers add events and see live participant lists. Built for the **Cloud Computing** course (B.Tech CSBS).

## Cloud services used (all free – Firebase Spark plan)
| Service | Purpose |
|---|---|
| Firebase Hosting | Hosts the web app with free HTTPS |
| Firebase Authentication | Google sign-in |
| Cloud Firestore | NoSQL real-time database (`events`, `registrations`) |
| Firestore Security Rules | Only logged-in users can register; only organisers add events |

## Architecture
Browser → Firebase Hosting → Firebase Auth → Cloud Firestore (real-time listeners)

## Features
- Google login
- Live event list with seat count
- One-click register / cancel (duplicate registration prevented)
- Organiser panel to add events and view participants

## Setup
1. Create a project at https://console.firebase.google.com (Spark plan, no card).
2. Enable **Authentication → Google** and **Firestore Database**.
3. Add a **Web app**, copy its config into `public/firebase-config.js`.
4. Put your organiser email in `public/firebase-config.js` and `firestore.rules`.
5. Deploy:
   ```
   npm install -g firebase-tools
   firebase login
   firebase use --add
   firebase deploy
   ```
6. Open the Hosting URL shown in the terminal.

## Folder structure
```
public/            index.html, style.css, app.js, firebase-config.js
firebase.json      Hosting + Firestore config
firestore.rules    Security rules
```

## Author
Name: ASHRAFUNISA M  USN:24BTRCB006
