let textChunks = [];
let currentIndex = 0;
let isPlaying = false;
let utterance = null;
let stopTimeout = null;

const fileInput = document.getElementById("fileInput");
const playBtn = document.getElementById("playBtn");
const durationInput = document.getElementById("durationInput");
const currentText = document.getElementById("currentText");
const statusText = document.getElementById("statusText");

fileInput.addEventListener("change", (e) => {
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

playBtn.addEventListener("click", () => {
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
  const durationMinutes = parseInt(durationInput.value || "30");
  const durationMs = durationMinutes * 60 * 1000;

  // 先停止以前的超时
  clearTimeout(stopTimeout);

  // 启动朗读
  statusText.textContent = `朗读中，将在 ${durationMinutes} 分钟后停止`;
  isPlaying = true;
  speakChunk();

  // 设置定时停止
  stopTimeout = setTimeout(() => {
    stopReading();
    statusText.textContent = `✅ 已达设定时间（${durationMinutes} 分钟），朗读已自动停止`;
  }, durationMs);
}

function stopReading() {
  speechSynthesis.cancel();
  isPlaying = false;
  clearTimeout(stopTimeout);
  statusText.textContent = "⏸️ 已暂停朗读";
}

function speakChunk() {
  if (!isPlaying || currentIndex >= textChunks.length) return;

  const text = textChunks[currentIndex].trim();
  if (!text) {
    currentIndex++;
    speakChunk();
    return;
  }

  currentText.textContent = text;
  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.onend = () => {
    currentIndex++;
    localStorage.setItem("lastIndex", currentIndex);
    if (isPlaying) speakChunk();
  };
  speechSynthesis.speak(utterance);
}
