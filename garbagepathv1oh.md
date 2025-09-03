Garbage Path - Project Archive
Version: 1.0 (Local-Only MVP)
Archive Date: Tuesday, September 2, 2025, 8:41 PM CDT
Status: Stable. All core single-user features are implemented and functional.

Description
Garbage Path is a mobile-first web application designed to track and document environmental cleanup efforts. This version allows a single user to track their cleanup routes, pin the location of collected litter with geotagged photos, and manage their data locally or via a personal cloud account.

Core Features Implemented in This Version
Terms of Use: A mandatory acceptance modal on the first visit.

User Authentication: Full sign-up, login, and logout functionality using Firebase (Email/Password).

Guest Mode: A "Skip for now" option that enables full app functionality using the browser's localStorage.

Geolocation:

"Find Me" button to show and center the user's current location.

"Start/Stop Tracking" to draw a continuous path on the map.

Photo Pinning:

Take or upload a photo to create a custom marker on the map at the current location.

Clickable pins with popups showing the photo.

Ability to add and save a title for each pin.

Ability to delete pins.

Data Management:

Conditional Save/Load: Saves to Firebase for logged-in users, localStorage for guests.

Export route and pin data as a GeoJSON file.

Monetization: A discreet "Support the Mission" button linked to a Buy Me a Coffee page.

Technology Stack
Frontend: HTML5, CSS3, Vanilla JavaScript (ESM)

Mapping: Mapbox GL JS

Backend (BaaS): Google Firebase

Authentication: For user accounts.

Firestore: For cloud data storage.

How to Run
Ensure all files are in the correct folder structure (index.html in the root, css/mapstyle.css in a css folder, js/mapscript.js in a js folder).

Use a local web server extension (like "Live Server" in VS Code) to open index.html.

The app requires browser permission to access the user's location.

Next Steps (Post-Archive)
With this version archived, development will proceed to the community-focused features, including:

Implementing the ability to publish completed routes to a public database.

Creating a feature to view all publicly shared community routes on the map.re
