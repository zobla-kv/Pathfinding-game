export default class Queue {
	constructor() {
		this.elements = [];
	}

	enqueue = e => this.elements.push(e);

	dequeue = () => this.elements.shift();

	peek = () => this.elements[0];

	isEmpty = () => this.elements.length === 0;

	length = () => this.elements.length;

	reverse = () => this.elements.reverse();
}
