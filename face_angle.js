export default class FaceAngle {
	constructor(canvasElement) {
		this.canvasElement = canvasElement;
	}

	xaxis(landmarks) {
		let diff = 0;
		let left = false;
		for (const points of [
			[6, 33, 263],	// Центральная точка переносицы / внешний угол левого глаза / внешний угол правого глаза
			[13, 61, 291],	// Центральная точка рта / левый угол рта / правый угол рта
			[1, 64, 294]	// Центральная точка носа / внешний угол левой ноздри / внешний угол правой ноздри
		]) {
			let x0 = landmarks[points[0]].x;		// Центральная точка для отсчета
			let x1 = x0 - landmarks[points[1]].x;	// Левая точка
			let x2 = landmarks[points[2]].x - x0;	// Правая точка
			left = left || (x1 < x2);
			diff = Math.max(diff, parseInt(Math.max(x1, x2) / (x1 + x2) * 100) - 50);
		}
		
		return diff > 10 ? 'Поверните голову ' + (left ? 'вправо' : 'влево') : '';
	}

	yaxis(landmarks) {
		let diff = 0;
		let up = false;

		const x1 = (landmarks[19].y - landmarks[1].y) * this.canvasElement.height;
		const x2 = (landmarks[94].y - landmarks[19].y) * this.canvasElement.height;
		const x3 = (landmarks[2].y - landmarks[94].y) * this.canvasElement.height;
		const x4 = (landmarks[164].y - landmarks[2].y) * this.canvasElement.height;
		
		console.log(
			'1 - 19: ' + x1.toString() + ' ' +
			'19 - 94: ' + x2.toString() + ' ' +
			'94 - 2: ' + x3.toString() + ' ' +
			'2 - 164: ' + x4.toString()
		);

		return '';
	}

	tilt(landmarks) {
		let diff = 0;
		let rightup = false;
		for (const points of [
			[33, 263],	// Внешний угол левого глаза / внешний угол правого глаза
			[61, 291],	// Левый угол рта / правый угол рта
			[64, 294]	// Внешний угол левой ноздри / внешний угол правой ноздри
		]) {
			let y1 = landmarks[points[0]].y * this.canvasElement.height;	// Левая точка
			let y2 = landmarks[points[1]].y * this.canvasElement.height;	// Правая точка
			rightup = rightup || (y1 > y2);
			diff = Math.max(diff, parseInt(Math.max(y1, y2) / (y1 + y2) * 100) - 50);
		}
		
		return diff > 3 ? 'Наклоните голову ' + (rightup ? 'вправо' : 'влево') : '';
	}
}