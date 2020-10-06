export default class Stack {
	constructor() {
		this.elements = [];
	}

	push = e => this.elements.push(e);

	pop = () => this.elements.pop();

	peek = () => this.elements[this.elements.length - 1];

	isEmpty = () => this.elements.length === 0;

	length = () => this.elements.length;

	reverse = () => this.elements.reverse();
}
