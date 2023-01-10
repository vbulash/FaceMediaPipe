export default class FaceCircle {
	constructor (cx, cy, radius) {
		this.cx = parseInt(cx);
		this.cy = parseInt(cy);
		this.radius = parseInt(radius);
	}

	inFace(landmark) {
		return ((this.cx - this.cx * landmark.x * 2) ** 2 + 
				(this.cy - this.cy * landmark.y * 2) ** 2) < this.radius ** 2;
	}

	landmarksInFace(landmarks) {
		for (let landmark of landmarks)
			if (!this.inFace(landmark))
				return false;
		return true;
	}
}
