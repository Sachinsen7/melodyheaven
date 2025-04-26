# Melody Haven 🎵

Melody Haven is a responsive, feature-rich music player web application built to deliver an immersive audio experience.  
With a unique user interface, seamless Spotify API integration for Premium users, and local audio playback for non-Premium users, it offers a versatile platform to enjoy music from trending hits and movie soundtracks.

## 📸 Melody Haven Screenshot

<!-- Replace with actual screenshot path -->

## 🚀 Features

- **Step-by-Step Responsiveness**: Adapts seamlessly to all devices (desktop, tablet, mobile).
- **Unique UI**:
  - Sleek box player with cover art, track title, progress bar, time displays, volume controls, like/dislike buttons.
  - Interactive dialogs for movie soundtracks (Oppenheimer, Dune, Interstellar) with clickable tracks.
  - Light, dark, and system theme toggling, persisted in localStorage.
  - Collapsible soundtrack grid with "View More/Less" functionality.
- **Spotify API Integration**:
  - Fetches and plays user playlists using Spotify Web Playback SDK (Spotify Premium required).
  - Robust OAuth authentication via Node.js server.
  - Falls back to local audio playback for non-Premium users.
- **Player Functionality**:
  - Play/pause, previous/next track, seek, volume control, mute.
  - Like/dislike tracks, saved in localStorage.
  - Recently played tracks stored for future UI updates.
- **Error Handling**:
  - User-friendly error messages (e.g., "Premium required", "No active device").

## 🎯 Demo

**Live Demo**: (Coming soon!)

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- Spotify Premium Account (optional for Spotify playback)
- Modern web browser (Chrome, Firefox, Edge, etc.)
- Audio files in the `public/assets` directory

### Setup

Clone the Repository:

````bash
git clone https://github.com/your-username/melody-haven.git
cd melody-haven

## Install Dependencies (for Spotify server):

npm install

Configure Spotify API (for Spotify playback):

Create a Spotify Developer account at Spotify Developer Dashboard.

Create an app to obtain SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.

## Create a .env file in the root directory:


SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

## Set the redirect URI in the Spotify Dashboard to:
http://localhost:3000/callback

Verify Audio Files:

Example structure:

public/assets/top-songs/12. positions.mp3
public/assets/Oppenheimer/Fission(128k).mp3


▶️ Running the App
For Local Audio Playback (No Spotify Premium)
Serve static files:


npm install -g serve
serve -s public
Open http://localhost:3000 in your browser.

For Spotify Playback (Requires Premium)
Start the Node.js server:


npm run dev
Open http://localhost:3000 and click "Login" to authenticate with Spotify.

Ensure a Spotify Premium account is active and no other Spotify devices are playing.

🎵 Usage

Trending Hits: Click an album (e.g., "Positions" by Ariana Grande) to play its track.

Movie Soundtracks: Click a soundtrack (e.g., Oppenheimer) to open its dialog, then select a track (e.g., "Fission") to play.

Player Controls
Play/Pause: Toggle playback.

Prev/Next: Navigate tracks in the playlist.

Progress Bar: Seek to a specific time.

Volume: Adjust or mute.

Like/Dislike: Save preferences to localStorage.

Theme Toggling
Switch between light, dark, or system themes via the menu.

Soundtrack Grid
Use "View More/Less" to expand/collapse soundtracks.


melody-haven/
├── public/
│   ├── assets/
│   │   ├── top-songs/          # Local audio for trending hits
│   │   ├── Oppenheimer/        # Soundtrack audio
│   │   ├── Dune/
│   │   ├── Interstellar/
│   │   └── images/             # Cover art and artist images
│   ├── index.html              # Main HTML file
│   ├── script.js               # JavaScript logic
│   └── styles.css              # CSS styles
├── server.js                   # Node.js server for Spotify OAuth
├── .env                        # Environment variables (not committed)
├── package.json                # Node.js dependencies
└── README.md                   # Project documentation


## 🧰 Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6)
- `<audio>` tag for local playback

### Backend
- Node.js with Express for Spotify OAuth

### APIs
- Spotify Web Playback SDK
- Spotify Web API (`/users/{id}/playlists`, `/playlists/{id}/tracks`)

### Tools
- `serve` for static file hosting
- `localStorage` for persisting themes, liked tracks, and recently played

## 🏆 Challenges & Solutions
- **Spotify Premium Limitation**: Fallback to local audio playback.
- **Content Security Policy (CSP)**: Configured CSP for local scripts and Spotify SDK.
- **Responsive Design**: Media queries and flexible layouts.
- **Real-Time UI Updates**: Synced UI with audio events.

## 🔮 Future Improvements
- Add a "Recently Played" UI.
- Implement genre filtering for `.box.genres` section.
- Support playlist creation and management.
- Host a live demo.

## 🤝 Contributing

Contributions are welcome!
Steps to contribute:

- Fork the repository.
- Create a feature branch:

```bash
git checkout -b feature/your-feature

- Commit your changes:
git commit -m "Add your feature"

- Push the branch:
git push origin feature/your-feature


- Open a pull request.

### 🙏 Acknowledgments
- Spotify Developer Documentation for API and SDK guidance.

- Audio files sourced from publicly available movie soundtracks and trending hits (demo purposes; ensure proper licensing for production use).

### 📬 Contact
- GitHub: Sachinsen7

- LinkedIn: sachinsen1
- Email: sachinsen1920@gmail.com


````
