export default class PriorityQueue {
	constructor() {
		this.elements = [];
	}

	enqueue = (element, priority) => {
		if (this.elements.length === 0) {
			this.elements.push(element);
		} else {
			let added = false;
			for (let i = 0; i < this.elements.length; i++) {
				if (this.elements[i].priority > priority) {
					this.elements.splice(i, 0, element);
					added = true;
					break;
				}
			}
			if (!added) {
				this.elements.push(element);
			}
		}
	}

	dequeue = () => this.elements.shift();
}
