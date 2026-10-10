(function () {
  const storageKey = "spiele-hub-sound-enabled";
  const volumeStorageKey = "spiele-hub-sound-volume";
  const soundToggle = document.getElementById("sound-toggle");
  const volumeControl = document.getElementById("sound-volume");
  let soundEnabled = localStorage.getItem(storageKey) !== "false";
  let volume = Number(localStorage.getItem(volumeStorageKey));
  if (!Number.isFinite(volume) || volume < 0 || volume > 1) volume = 1;

  function updateSoundToggle() {
    soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
    soundToggle.setAttribute("aria-label", soundEnabled ? "Ton ausschalten" : "Ton einschalten");
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.title = soundEnabled ? "Ton ausschalten" : "Ton einschalten";
  }

  window.isSoundEnabled = () => soundEnabled;
  window.getSoundVolume = () => volume;

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem(storageKey, String(soundEnabled));
    updateSoundToggle();
    window.dispatchEvent(new CustomEvent("soundpreferencechange", {
      detail: { enabled: soundEnabled }
    }));
  });

  volumeControl.value = String(Math.round(volume * 100));
  volumeControl.setAttribute("aria-valuetext", `${Math.round(volume * 100)} Prozent`);
  volumeControl.addEventListener("input", () => {
    volume = Number(volumeControl.value) / 100;
    localStorage.setItem(volumeStorageKey, String(volume));
    volumeControl.setAttribute("aria-valuetext", `${volumeControl.value} Prozent`);
    window.dispatchEvent(new CustomEvent("soundvolumechange", {
      detail: { volume }
    }));

    const shouldEnableSound = volume > 0;
    const shouldDisableSound = volume === 0;
    if ((shouldEnableSound || shouldDisableSound) && soundEnabled !== shouldEnableSound) {
      soundEnabled = shouldEnableSound;
      localStorage.setItem(storageKey, String(soundEnabled));
      updateSoundToggle();
      window.dispatchEvent(new CustomEvent("soundpreferencechange", {
        detail: { enabled: soundEnabled }
      }));
    }
  });

  const siteMenu = document.querySelector(".site-menu");
  siteMenu.addEventListener("toggle", () => {
    const existingOverlay = document.querySelector(".site-menu-overlay");
    if (existingOverlay) existingOverlay.remove();

    if (siteMenu.open) {
      const overlay = document.createElement("div");
      overlay.className = "site-menu-overlay";
      overlay.addEventListener("click", () => {
      siteMenu.open = false;
      });
      document.body.append(overlay);
    }
  });

  updateSoundToggle();
})();
