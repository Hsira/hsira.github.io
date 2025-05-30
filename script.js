let textChunks = [];
let currentIndex = 0;
let isPlaying = false;
let utterance = null;
let stopTimer = null;

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const content = reader.result;
    textChunks = content.split(/[\r\n]{2,}/); // 按段落切割
    currentIndex = 0;
    localStorage.setItem("bookContent", JSON.stringify(textChunks));
    localStorage.setItem("lastIndex", currentIndex);
    startReading();
  };
  reader.readAsText(file, "utf-8");
});

document.getElementById("playBtn").addEventListener("click", () => {
  if (isPlaying) {
    stopReading();
  } else {
    if (textChunks.length === 0) {
      const saved = JSON.parse(localStorage.getItem("bookContent") || "[]");
      if (saved.length > 0) textChunks = saved;
      currentIndex = parseInt(localStorage.getItem("lastIndex") || "0");
    }
    startReading();
  }
});

function startReading() {
  const durationMinutes = parseInt(document.getElementById("durationInput").value);
  if (!isNaN(durationMinutes) && durationMinutes > 0) {
    // 清除旧定时器
    if (stopTimer) clearTimeout(stopTimer);

    // 设置新定时器
    stopTimer = setTimeout(() => {
      stopReading();
      alert(`⏱️ ${durationMinutes} 分钟已到，朗读已自动停止`);
    }, durationMinutes * 60 * 1000);
  }

  isPlaying = true;
  speakChunk();
}

function stopReading() {
  speechSynthesis.cancel();
  isPlaying = false;
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
}

function speakChunk() {
  if (!isPlaying || currentIndex >= textChunks.length) return;

  const text = textChunks[currentIndex].trim();
  if (!text) {
    currentIndex++;
    speakChunk();
    return;
  }

  document.getElementById("currentText").textContent = text;

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.onend = () => {
    currentIndex++;
    localStorage.setItem("lastIndex", currentIndex);
    if (isPlaying) speakChunk();
  };

  speechSynthesis.speak(utterance);
}
