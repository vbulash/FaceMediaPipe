import FaceCircle from './face_circle.js';
import FaceAngle from './face_angle.js';
import FaceDistance from './face_distance.js';

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
let stableIntervalId = null;
let frozen = false;
let saved = false;
const COUNTDOWN = 40;
let countdown = 0;

function onResults(results) {
	if (saved) return;

	let rect = {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	}
	if (videoElement.videoWidth > videoElement.videoHeight) {	// Горизонтальные пропорции камеры (ноутбук / десктоп)
		rect.x = parseInt((videoElement.videoWidth - videoElement.videoHeight) / 2);
		rect.w = videoElement.videoHeight;
		rect.y = 0;
		rect.h = videoElement.videoHeight;

		// canvasElement.height = videoElement.videoHeight;
		// canvasElement.width = videoElement.videoWidth;
	}
	canvasElement.height = videoElement.videoHeight;
	canvasElement.width = videoElement.videoWidth;

	const fc = new FaceCircle(canvasElement.width / 2, canvasElement.height / 2, Math.min(canvasElement.width, canvasElement.height) * 0.45);
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	canvasCtx.drawImage(
		results.image, 0, 0, canvasElement.width, canvasElement.height);
	if (results.multiFaceLandmarks) {
		for (const landmarks of results.multiFaceLandmarks) {
			let messages = [];
			let message = '';
			let circle_color = '';
			let mesh_color = '';
			// Лицо помещается или не помещается в круг
			if (fc.landmarksInFace(landmarks)) {
				circle_color = '#00FF00';
				mesh_color = '#00FF00';
			} else {
				circle_color = '#FF0000';
				mesh_color = '#FF0000';
				messages.push('Поместите лицо в окружность');
			}
			// Лицо далеко / близко
			const fd = new FaceDistance(canvasElement, fc.radius);
			message = fd.measure(landmarks);
			if (message) {
				mesh_color = '#FF0000';
				messages.push(message);
			}
			// Смещения / повороты лица по 3 осям
			const fa = new FaceAngle(canvasElement);
			// горизонтальное смещение
			message = fa.xaxis(landmarks);
			if (message) {
				mesh_color = '#FF0000';
				messages.push(message);
			}
			// вертикальное смещение
			// message = fa.yaxis(landmarks);
			// if (message)
			// 	messages.push(message);
			message = fa.tilt(landmarks);
			if (message) {
				mesh_color = '#FF0000';
				messages.push(message);
			}

			//
			canvasCtx.beginPath();
			canvasCtx.arc(fc.cx, fc.cy, fc.radius, 0, 2 * Math.PI);
			canvasCtx.strokeStyle = circle_color;
			canvasCtx.stroke();

			drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
				{ color: mesh_color + '20', lineWidth: 1 });
			// drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
			// drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
			// drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
			// drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
			// drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
			// drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30'});
			// drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
			// drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});

			if (messages.length > 0) {
				clearInterval(stableIntervalId);
				stableIntervalId = null;
				frozen = false;
				document.getElementById('message').innerHTML = messages.join('<br/>');
			} else if (frozen) {	// Идеальная картинка, только что сработал таймер
				document.getElementById('message').innerHTML = 'Снимок сделан';
				saved = true;
				clearInterval(stableIntervalId);
				stableIntervalId = null;
				frozen = false;

				// TODO Сохранить снимок
				/*
				var target = new Image();
				target.src = canvasElement.toDataURL();
				*/
			} else {	// Идеальная картинка, запускаем 3-секундный таймер
				document.getElementById('message').innerHTML = '';
				if (stableIntervalId == null) {
					countdown = COUNTDOWN;
					stableIntervalId = setInterval(() => {
						console.log('Снимок будет сделан через: ' + countdown.toString());
						document.getElementById('message').innerHTML = 'Снимок будет сделан через: ' + countdown.toString();
						if (countdown-- <= 0) {
							clearInterval(stableIntervalId);
							frozen = true;
						}
					}, 1000);
				}
			}
		}
	}
	canvasCtx.restore();
}

// document.getElementById('take').onclick = () => {
// 	camera.stop();
// };

const faceMesh = new FaceMesh({
	locateFile: (file) => {
		return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
	}
});
faceMesh.setOptions({
	selfieMode: true,
	maxNumFaces: 1,
	refineLandmarks: true,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
	onFrame: async () => {
		await faceMesh.send({ image: videoElement });
	},
	// width: 1280,
	// height: 720,
});
camera.start();
