const playlistcContainer = document.querySelector(".playlist-container");
const errDiv = document.querySelector(".error");
const loadingDiv = document.querySelector(".loading");
const loginBtn = document.querySelector("#login-btn");
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const seekBar = document.getElementById("seek-bar");

async function getAccessToken() {
  try {
    loadingDiv.style.display = "block";
    errDiv.style.display = "none";
    const response = await fetch("http://localhost:3000/get-token");
    const data = await response.json();
    console.log("Access token fetched"); //debug
    if (data.error) {
      throw new Error(`Error fecthing data: ${data.error}`);
    }
    return data.access_token;
  } catch (error) {
    errDiv.textContent = `Error: ${error.message}. Please try again later`;
    errDiv.style.display = "block";
    loginBtn.style.display = "block";
    return null;
  } finally {
    loadingDiv.style.display = "none";
  }
}

async function Spotifyfetch(endpoint, token) {
  const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`API ${endpoint} status: ${response.status}`);

  if (response.status === 401) {
    window.location.href = "http://localhost:3000/login";
    throw new Error("Unauthorized: Please login again");
  }

  if (!response.ok) {
    throw new Error(
      `Error fetching data: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

function initializePlayer() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotifyfetch.Player();
  };
}

loginBtn.addEventListener("click", () => {
  window.location.href = "http://localhost:3000/login";
  console.log("Clicked");
});

async function getMyData() {
  try {
    loadingDiv.style.display = "block";
    const token = await getAccessToken();
    if (!token) return;
    loginBtn.style.display = "none";
    const me = await Spotifyfetch("me", token);
    console.log("User ID:", me.id);
    await getPlaylist(me.id, token);
  } catch (error) {
    errDiv.textContent = `Error fetching data: ${error.message}`;
    errDiv.style.display = "block";
  } finally {
    loadingDiv.style.display = "none";
  }
}

async function getPlaylist(userId, token) {
  try {
    let limit = 6;
    const data = await Spotifyfetch(`users/${userId}/playlists`, token);

    if (data.total > limit) {
      data.items = data.items.slice(0, limit);
    }

    console.log("Playlist data:", data);
    playlistcContainer.innerHTML = "";
    if (data.items.length === 0) {
      playlistcContainer.innerHTML =
        "<p>No playlists found. Create one in Spotify!</p>";
      return;
    }
    for (let playlist of data.items) {
      const tracks = await getPlaylistTracks(playlist.id, playlist.name, token);
      console.log(tracks);
      const playlistDiv = document.createElement("div");
      playlistDiv.classList.add("playlist");
      playlistDiv.innerHTML = `
        <h2>${playlist.name}</h2>
        <ul class="tracks-list"></ul>
      `;
      const tracksList = playlistDiv.querySelector(".tracks-list");
      tracks.forEach((track) => {
        const li = document.createElement("li");
        li.classList.add("track");
        li.textContent = `${track.name} - ${track.artists[0].name}`;
        tracksList.appendChild(li);
      });
      playlistcContainer.appendChild(playlistDiv);
    }
  } catch (err) {
    if (err.message.includes("404")) {
      playlistcContainer.innerHTML =
        "<p>No playlists found. Create one in Spotify!</p>";
    } else {
      errDiv.textContent = `Error fetching playlists: ${err.message}`;
      errDiv.style.display = "block";
    }
  }
}

async function getPlaylistTracks(playlistId, playlistName, token) {
  try {
    const data = await Spotifyfetch(
      `playlists/${playlistId}/tracks?offset=0&limit=4`,
      token
    );
    const tracks = data.items
      .map((item) => item.track)
      .filter((track) => track);
    return tracks;
  } catch (err) {
    console.error(`Error fetching tracks for ${playlistName}:`, err);
    return [];
  }
}

getMyData();

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  const enableMenuButtons = document.querySelector(".enableMenu");
  const dynamicToggleMenu = document.querySelector(".dynamicToggleMenu");
  const icons = document.querySelectorAll(".icons");
  console.log("Elements found:", {
    enableMenuButtons,
    dynamicToggleMenu,
    icons,
  });

  // Only add event listener if viewMoreButton exists
  const viewMoreButton = document.querySelector(".view-more");
  const hiddenSoundtracksGrid = document.querySelector(
    ".soundtrack-grid.hidden"
  );

  if (viewMoreButton && hiddenSoundtracksGrid) {
    viewMoreButton.addEventListener("click", () => {
      hiddenSoundtracksGrid.classList.toggle("hidden");
      viewMoreButton.textContent = hiddenSoundtracksGrid.classList.contains(
        "hidden"
      )
        ? "View More Soundtracks"
        : "View Less Soundtracks";
    });
  }

  // Check for saved theme in localStorage or system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  let initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
  console.log("Initial theme settings:", {
    savedTheme,
    systemPrefersDark,
    initialTheme,
  });

  // Apply initial theme
  if (
    initialTheme === "dark" ||
    (initialTheme === "system" && systemPrefersDark)
  ) {
    document.body.classList.add("dark-mode");
    console.log("Applied initial dark mode");
  }

  // Toggle menu visibility
  if (enableMenuButtons && dynamicToggleMenu) {
    enableMenuButtons.addEventListener("click", () => {
      console.log("Theme menu clicked");
      dynamicToggleMenu.classList.toggle("hidden");
      dynamicToggleMenu.classList.toggle("show");
    });
  }

  // Theme selection
  if (icons && icons.length > 0) {
    icons.forEach((icon) => {
      icon.addEventListener("click", () => {
        const theme = icon.getAttribute("data-theme");
        console.log("Theme selected:", theme);
        if (theme === "system") {
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          document.body.classList.toggle("dark-mode", prefersDark);
          localStorage.setItem("theme", "system");
        } else {
          document.body.classList.remove("dark-mode");
          if (theme === "dark") {
            document.body.classList.add("dark-mode");
          }
          localStorage.setItem("theme", theme);
        }
        if (dynamicToggleMenu) {
          dynamicToggleMenu.classList.add("hidden");
          dynamicToggleMenu.classList.remove("show");
        }
      });
    });
  }

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      console.log("System theme changed:", e.matches);
      if (localStorage.getItem("theme") === "system") {
        document.body.classList.toggle("dark-mode", e.matches);
      }
    });

  // Dialog Box Functionality
  const soundtrackItems = document.querySelectorAll(".soundtrack-item");
  const dialogs = {
    oppenheimer: document.getElementById("oppenheimer-dialog"),
    dune: document.getElementById("dune-dialog"),
    interstellar: document.getElementById("interstellar-dialog"),
  };
  const closeButtons = document.querySelectorAll(".close-dialog");

  // Add click event to each soundtrack item
  soundtrackItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      const dialog = Object.values(dialogs)[index];
      if (dialog) {
        dialog.classList.add("show");
        document.body.style.overflow = "hidden";
      }
    });
  });

  // Add click event to playlist items in dialogs
  const duration = document.querySelector(".playlist-item span");
  const playlistItems = document.querySelectorAll(".playlist-item");
  const previousButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  playlistItems.forEach((item) => {
    item.addEventListener("click", () => {
      const audioElement = item.querySelector("audio");
      if (audioElement) {
        playAudio(audioElement);
        // Update player UI
        const cover = item.querySelector("img")?.src;
        const title = item.querySelector("p")?.textContent;
        if (cover && playerImage) playerImage.src = cover;
        if (title && playerTitle) playerTitle.textContent = title;
        if (duration) duration.textContent = audioElement.duration;
      }
      if (previousButton) {
        previousButton.addEventListener("click", () => {
          playPreviousAudio();
          console.log("previous button clicked");
        });
      }
      if (nextButton) {
        nextButton.addEventListener("click", () => {
          playNextAudio();
          console.log("next button clicked");
        });
      }
    });
  });

  // Function to play previous audio
  const playPreviousAudio = () => {
    const currentAudio = document.querySelector("audio:not([paused])");
    if (currentAudio) {
      // Try to find the container in both playlist and album contexts
      const playlistContainer = currentAudio.closest(".playlist-container");
      const albumContainer = currentAudio.closest(".album");

      if (playlistContainer) {
        const playlistItems =
          playlistContainer.querySelectorAll(".playlist-item");
        const currentIndex = Array.from(playlistItems).findIndex(
          (item) => item.querySelector("audio") === currentAudio
        );

        if (currentIndex > 0) {
          const prevAudio =
            playlistItems[currentIndex - 1].querySelector("audio");
          if (prevAudio) {
            playAudio(prevAudio);
            console.log("Playing previous track from playlist:", prevAudio);
          }
        } else {
          const lastAudio =
            playlistItems[playlistItems.length - 1].querySelector("audio");
          if (lastAudio) {
            playAudio(lastAudio);
            console.log("Playing last track from playlist:", lastAudio);
          }
        }
      } else if (albumContainer) {
        const albumItems = document.querySelectorAll(".album");
        const currentIndex = Array.from(albumItems).findIndex(
          (item) => item.querySelector("audio") === currentAudio
        );

        if (currentIndex > 0) {
          const prevAudio = albumItems[currentIndex - 1].querySelector("audio");
          if (prevAudio) {
            playAudio(prevAudio);
            console.log("Playing previous track from album:", prevAudio);
          }
        } else {
          const lastAudio =
            albumItems[albumItems.length - 1].querySelector("audio");
          if (lastAudio) {
            playAudio(lastAudio);
            console.log("Playing last track from album:", lastAudio);
          }
        }
      } else {
        console.log("No valid container found for current audio");
      }
    } else {
      console.log("No currently playing audio found");
    }
  };

  // Function to play next audio
  const playNextAudio = () => {
    const currentAudio = document.querySelector("audio:not([paused])");
    if (currentAudio) {
      // Try to find the container in both playlist and album contexts
      const playlistContainer = currentAudio.closest(".playlist-dialog");
      const albumContainer = currentAudio.closest(".album");

      if (playlistContainer) {
        const playlistItems =
          playlistContainer.querySelectorAll(".playlist-item");
        const currentIndex = Array.from(playlistItems).findIndex(
          (item) => item.querySelector("audio") === currentAudio
        );

        if (currentIndex < playlistItems.length - 1) {
          const nextAudio =
            playlistItems[currentIndex + 1].querySelector("audio");
          if (nextAudio) {
            playAudio(nextAudio);
            console.log("Playing next track from playlist:", nextAudio);
          }
        } else {
          const firstAudio = playlistItems[0].querySelector("audio");
          if (firstAudio) {
            playAudio(firstAudio);
            console.log("Playing first track from playlist:", firstAudio);
          }
        }
      } else if (albumContainer) {
        const albumItems = document.querySelectorAll(".album");
        const currentIndex = Array.from(albumItems).findIndex(
          (item) => item.querySelector("audio") === currentAudio
        );

        if (currentIndex < albumItems.length - 1) {
          const nextAudio = albumItems[currentIndex + 1].querySelector("audio");
          if (nextAudio) {
            playAudio(nextAudio);
            console.log("Playing next track from album:", nextAudio);
          }
        } else {
          const firstAudio = albumItems[0].querySelector("audio");
          if (firstAudio) {
            playAudio(firstAudio);
            console.log("Playing first track from album:", firstAudio);
          }
        }
      } else {
        console.log("No valid container found for current audio");
      }
    } else {
      console.log("No currently playing audio found");
    }
  };

  // Close dialog when clicking close button
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest(".playlist-dialog");
      dialog.classList.remove("show");
      document.body.style.overflow = "";
    });
  });

  // Close dialog when clicking outside
  Object.values(dialogs).forEach((dialog) => {
    dialog?.addEventListener("click", (e) => {
      if (e.target === dialog) {
        dialog.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  });

  // play the music
  const audioElements = document.querySelectorAll("audio");
  const albumItems = document.querySelectorAll(".album");
  const playerImage = document.querySelector(".player-image img");
  const playerTitle = document.querySelector(".box h3");
  const playPauseButton = document.querySelector(".play-btn");
  const playButton = document.querySelector(".play-icon");
  const pauseButton = document.querySelector(".pause-icon");
  const progressBar = document.querySelector("#progress-bar");
  const currentTimeDisplay = document.querySelector(".current-time");
  const durationDisplay = document.querySelector(".total-time");
  const volumeSlider = document.querySelector("#volume");
  const volumeIcon = document.querySelector(".volume-controls svg");
  const percentageVolume = document.querySelector(".left-controlls span");
  const muteIcon = document.querySelector(".mute-icon");
  const speakerIcon = document.querySelector(".speaker-icon");
  let currentAudio = null;

  pauseButton.classList.add("hidden");
  // Function to format time in MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Function to update progress bar and time display
  const updateProgress = () => {
    if (currentAudio && progressBar) {
      const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
      progressBar.value = progress;
      if (currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(currentAudio.currentTime);
      }
    }
  };

  // Function to update duration display
  const updateDuration = () => {
    if (currentAudio && durationDisplay) {
      durationDisplay.textContent = formatTime(currentAudio.duration);
    }
  };

  // Function to handle progress bar interaction
  const handleProgressBarInteraction = (e) => {
    if (currentAudio && progressBar) {
      const progressBarRect = progressBar.getBoundingClientRect();
      const clickPosition = e.clientX - progressBarRect.left;
      const progressBarWidth = progressBarRect.width;
      const percentage = (clickPosition / progressBarWidth) * 100;
      const newTime = (percentage / 100) * currentAudio.duration;
      currentAudio.currentTime = newTime;
    }
  };

  // Function to handle mute icon click
  const handleMuteIconClick = () => {
    if (currentAudio) {
      currentAudio.muted = !currentAudio.muted;
      if (currentAudio.muted) {
        volumeIcon.innerHTML =
          '<path d="M16 20c-2.21 0-4-1.79-4-4v-8c0-2.21 1.79-4 4-4s4 1.79 4 4v8c0 2.21-1.79 4-4 4z"/><path d="M20 12h2v8h-2z"/><path d="M24 8h2v16h-2z"/><path d="M28 4h2v24h-2z"/>';
      } else {
        volumeIcon.innerHTML =
          '<path d="M16 20c-2.21 0-4-1.79-4-4v-8c0-2.21 1.79-4 4-4s4 1.79 4 4v8c0 2.21-1.79 4-4 4z"/><path d="M20 12h2v8h-2z"/><path d="M24 8h2v16h-2z"/>';
      }
    }
  };

  // Function to update volume
  const updateVolume = (volume) => {
    if (currentAudio) {
      currentAudio.volume = volume;
      // Update volume icon based on volume level
      percentageVolume.textContent = `${Math.round(volume * 100)}%`;
      localStorage.setItem("volume", volume);
      if (volumeIcon) {
        if (volume === 0) {
          // Mute icon
          volumeIcon.innerHTML =
            '<path d="M16 20c-2.21 0-4-1.79-4-4v-8c0-2.21 1.79-4 4-4s4 1.79 4 4v8c0 2.21-1.79 4-4 4z"/><path d="M20 12h2v8h-2z"/><path d="M24 8h2v16h-2z"/>';
        } else {
          // Speaker icon
          volumeIcon.innerHTML =
            '<path d="M16 20c-2.21 0-4-1.79-4-4v-8c0-2.21 1.79-4 4-4s4 1.79 4 4v8c0 2.21-1.79 4-4 4z"/><path d="M20 12h2v8h-2z"/><path d="M24 8h2v16h-2z"/><path d="M28 4h2v24h-2z"/>';
        }
      }
    }
  };

  // Add event listeners for progress bar
  if (progressBar) {
    progressBar.addEventListener("click", handleProgressBarInteraction);
    progressBar.addEventListener("mousedown", () => {
      document.addEventListener("mousemove", handleProgressBarInteraction);
    });
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", handleProgressBarInteraction);
    });
  }

  // Add event listener for volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      updateVolume(e.target.value);
      localStorage.setItem("volume", e.target.value);
    });

    // Load saved volume
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume) {
      volumeSlider.value = savedVolume;
      updateVolume(savedVolume);
    }
  }

  // Function to play audio
  const playAudio = (audio) => {
    // If the same audio is clicked, toggle play/pause
    if (currentAudio === audio) {
      if (audio.paused) {
        audio.play();
        updatePlayPauseButton(true);
      } else {
        audio.pause();
        updatePlayPauseButton(false);
      }
      return;
    }

    // Pause all other audio elements
    audioElements.forEach((a) => {
      if (a !== audio) {
        a.pause();
        a.currentTime = 0;
      }
    });

    // Play the selected audio
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    currentAudio = audio;
    updatePlayPauseButton(true);
    updateDuration();

    // Update player UI if elements exist
    if (playerImage && playerTitle) {
      const cover = audio.dataset.cover;
      const title = audio.dataset.title;
      if (cover) playerImage.src = cover;
      if (title) playerTitle.textContent = title;
    }

    // Save recently played track to localStorage
    const trackInfo = {
      cover: audio.dataset.cover,
      title: audio.dataset.title,
      timestamp: new Date().getTime(),
    };
    saveToRecentlyPlayed(trackInfo);

    // Add timeupdate event listener for progress bar
    audio.addEventListener("timeupdate", updateProgress);

    // Show now playing notification
    const notification = document.querySelector(".now-playing-notification");
    const notificationSong = document.querySelector(".notification-song");
    if (notification && notificationSong) {
      notificationSong.textContent = `${playerTitle.textContent} - ${playerArtist.textContent}`;
      notification.classList.add("show");

      // Hide notification after 3 seconds
      setTimeout(() => {
        notification.classList.remove("show");
      }, 3000);
    }
  };

  // Function to update play/pause button state
  const updatePlayPauseButton = (isPlaying) => {
    if (playPauseButton) {
      const playIcon = playPauseButton.querySelector("svg:first-child");
      const pauseIcon = playPauseButton.querySelector("svg:last-child");

      if (isPlaying) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      } else {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      }
    }
  };

  // Add click event to play/pause button
  if (playPauseButton) {
    playPauseButton.addEventListener("click", () => {
      if (currentAudio) {
        if (currentAudio.paused) {
          currentAudio.play();
          updatePlayPauseButton(true);
        } else {
          currentAudio.pause();
          updatePlayPauseButton(false);
        }
      }
    });
  }

  // Add click event to audio elements
  audioElements.forEach((audio) => {
    audio.addEventListener("click", () => {
      console.log("audio clicked:", audio.id);
      playAudio(audio);
    });
  });

  // Add click event to album items
  albumItems.forEach((album) => {
    album.addEventListener("click", () => {
      const audioContainer = album.querySelector(".audio-container");
      if (!audioContainer) {
        console.error("No audio container found for album:", album);
        return;
      }

      const audioId = audioContainer.getAttribute("data-audio");
      if (!audioId) {
        console.error("No audio ID found for album:", album);
        return;
      }

      const audio = audioContainer.querySelector("audio");
      if (audio) {
        console.log("album clicked, playing audio:", audioId);
        playAudio(audio);
      } else {
        console.error("Audio element not found in container:", audioId);
      }
    });
  });

  // Function to save track to recently played
  const saveToRecentlyPlayed = (trackInfo) => {
    let recentlyPlayed = JSON.parse(
      localStorage.getItem("recentlyPlayed") || "[]"
    );

    // Remove if track already exists
    recentlyPlayed = recentlyPlayed.filter(
      (track) => track.title !== trackInfo.title
    );

    // Add new track to beginning
    recentlyPlayed.unshift(trackInfo);

    // Keep only last 10 tracks
    if (recentlyPlayed.length > 10) {
      recentlyPlayed = recentlyPlayed.slice(0, 10);
    }

    localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
    updateRecentlyPlayedUI();
  };

  // Function to update recently played UI
  const updateRecentlyPlayedUI = () => {
    const recentTracksContainer = document.querySelector(".recent-tracks");
    if (!recentTracksContainer) return;

    const recentlyPlayed = JSON.parse(
      localStorage.getItem("recentlyPlayed") || "[]"
    );
    recentTracksContainer.innerHTML = "";

    recentlyPlayed.forEach((track) => {
      const trackElement = document.createElement("div");
      trackElement.className = "recent-track";
      trackElement.innerHTML = `
        <div class="track-image">
          <img src="${track.cover}" alt="${track.title}" />
        </div>
        <div class="track-info">
          <h3>${track.title}</h3>
          <p>${new Date(track.timestamp).toLocaleDateString()}</p>
        </div>
      `;
      recentTracksContainer.appendChild(trackElement);
    });
  };

  // Load recently played tracks on page load
  document.addEventListener("DOMContentLoaded", () => {
    updateRecentlyPlayedUI();
  });

  // Save theme preference
  if (icons && icons.length > 0) {
    icons.forEach((icon) => {
      icon.addEventListener("click", () => {
        const theme = icon.getAttribute("data-theme");
        localStorage.setItem("theme", theme);
        // ... existing theme change code ...
      });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.body.classList.toggle("dark-mode", savedTheme === "dark");
    }
  }

  // Add event listeners for previous and next buttons
  if (previousButton && nextButton) {
    previousButton.addEventListener("click", () => {
      console.log("Previous button clicked");
      if (currentAudio) {
        const playlistDialog = currentAudio.closest(".playlist-dialog");
        if (playlistDialog) {
          const playlistItems =
            playlistDialog.querySelectorAll(".playlist-item");
          const currentIndex = Array.from(playlistItems).findIndex(
            (item) => item.querySelector("audio") === currentAudio
          );

          if (currentIndex > 0) {
            const prevAudio =
              playlistItems[currentIndex - 1].querySelector("audio");
            if (prevAudio) {
              playAudio(prevAudio);
            }
          }
        }
      }
    });

    nextButton.addEventListener("click", () => {
      console.log("Next button clicked");
      if (currentAudio) {
        const playlistDialog = currentAudio.closest(".playlist-dialog");
        if (playlistDialog) {
          const playlistItems =
            playlistDialog.querySelectorAll(".playlist-item");
          const currentIndex = Array.from(playlistItems).findIndex(
            (item) => item.querySelector("audio") === currentAudio
          );

          if (currentIndex < playlistItems.length - 1) {
            const nextAudio =
              playlistItems[currentIndex + 1].querySelector("audio");
            if (nextAudio) {
              playAudio(nextAudio);
            }
          }
        }
      }
    });
  } else {
    console.warn("Previous or next button not found");
  }
});
