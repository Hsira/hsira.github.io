let textChunks = [];
let currentIndex = 0;
let isPlaying = false;
let utterance = null;

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
    speakChunk();
  };
  reader.readAsText(file, "utf-8");
});

document.getElementById("playBtn").addEventListener("click", () => {
  if (isPlaying) {
    speechSynthesis.cancel();
    isPlaying = false;
  } else {
    if (textChunks.length === 0) {
      const saved = JSON.parse(localStorage.getItem("bookContent") || "[]");
      if (saved.length > 0) textChunks = saved;
      currentIndex = parseInt(localStorage.getItem("lastIndex") || "0");
    }
    speakChunk();
  }
});

function speakChunk() {
  if (currentIndex >= textChunks.length) return;
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
  isPlaying = true;
}
