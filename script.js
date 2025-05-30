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
    cancelReading();
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
  const minutes = parseInt(document.getElementById("timerInput").value || "0");
  if (minutes > 0) {
    clearTimeout(stopTimer); // 防止重复定时
    stopTimer = setTimeout(() => {
      cancelReading();
      alert("⏰ 时间到，已停止朗读。");
    }, minutes * 60 * 1000);
  }
  isPlaying = true;
  speakChunk();
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

function cancelReading() {
  speechSynthesis.cancel();
  isPlaying = false;
  clearTimeout(stopTimer);
}
