const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
let model;

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve();
  });
}

async function loadModel() {
  model = await cocoSsd.load();
  console.log("Модель загружена!");
}

async function detectObjects() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const predictions = await model.detect(video);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  predictions.forEach(prediction => {
    if (prediction.class === 'monitor') { // Ищем именно монитор
      const [x, y, width, height] = prediction.bbox;

      // Рисуем обводку
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // Рисуем текст
      ctx.fillStyle = 'red';
      ctx.font = '18px Arial';
      ctx.fillText(`Monitor: ${Math.round(prediction.score * 100)}%`, x, y - 10);

      info.innerText = "Обнаружен монитор!";
    }
  });

  requestAnimationFrame(detectObjects);
}

async function init() {
  await setupCamera();
  await loadModel();
  detectObjects();
}

init();
