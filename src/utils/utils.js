export function Queue() {
  this.elements = [];
}

Queue.prototype.enqueue = function (e) {
  this.elements.push(e);
};

Queue.prototype.dequeue = function () {
  return this.elements.shift();
};

Queue.prototype.isEmpty = function () {
  return this.elements.length === 0;
};

Queue.prototype.length = function () {
  return this.elements.length;
};

Queue.prototype.reverse = function () {
  return this.elements.reverse();
};

export function Stack() {
  this.elements = [];
}

Stack.prototype.push = function (e) {
  this.elements.push(e);
};

Stack.prototype.pop = function () {
  return this.elements.pop();
};

Stack.prototype.peek = function () {
  return this.elements[this.elements.length - 1];
};

Stack.prototype.isEmpty = function () {
  return this.elements.length === 0;
};

Stack.prototype.length = function () {
  return this.elements.length;
};

export function getRandom(max) {
  return Math.floor(Math.random() * max);
}

export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
