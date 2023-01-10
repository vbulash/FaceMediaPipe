export default class FaceDistance {
	constructor(canvasElement, bound) {
		this.canvasElement = canvasElement;
		this.bound = bound;
	}

	measure(landmarks) {
		let min = {
			x: 1,
			y: 1
		};
		let max = {
			x: 0,
			y: 0
		};
		landmarks.forEach((item) => {
			if (item.x < min.x) min.x = item.x;
			if (item.y < min.y) min.y = item.y;
			if (item.x > max.x) max.x = item.x;
			if (item.y > max.y) max.y = item.y;
		});
		min.x = parseInt(min.x * this.canvasElement.width);
		min.y = parseInt(min.y * this.canvasElement.height);
		max.x = parseInt(max.x * this.canvasElement.width);
		max.y = parseInt(max.y * this.canvasElement.height);
		if (max.x - min.x < this.bound * 0.7 || max.y - min.y < this.bound * 0.7)
			return 'Придвиньтесь ближе - лицо слишко далеко от камеры';
		return '';
	}
}