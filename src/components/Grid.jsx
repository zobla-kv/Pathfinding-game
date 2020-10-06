import React, { Component } from "react";
import PropTypes from "prop-types";
import Node from "./Node";
import Queue from "../utils/queue";
import Stack from "../utils/stack";
import PriorityQueue from "../utils/priorityQueue";
import { actions, fnModes } from "../utils/constants";
import * as _ from "../utils/utils";

class Grid extends Component {
	constructor(props) {
		super(props);
		const { height, width, alg } = this.props;
		this.state = {
			alg: null,
			nodes: [],
			searchSpeed: 2000 / (height * width),
		};
		const nodes = [];
		for (let i = 0; i < height; i++) {
			const row = [];
			for (let j = 0; j < width; j++) {
				row.push({
					position: [i, j],
					visited: false,
				});
			}
			nodes.push(row);
		}
		this.state.nodes = nodes;
		const { bfs, dijkstra, trace } = this;
		const Bfs = "Breadth first search";
		const Dijkstra = "Dijkstra";
		const Trace = "Trace";
		// convert alg from strings to method
		if (alg.name === Bfs) {
			this.state.alg = bfs;
		}
		if (alg.name === Dijkstra) {
			this.state.alg = dijkstra;
		}
		if (alg.name === Trace) {
			this.state.alg = trace;
		}
	}

	componentDidMount = () => {
		const { startPosition, endPosition } = this.props;
		const { handlePlacement } = this;
		handlePlacement(startPosition, endPosition);
	}

	getGridStyle = () => {
		const { height, width } = this.props;
		return {
			height: 27 * height,
			width: 27 * width,
			border: "3px solid blue",
			marginBottom: "5%",
		};
	}

	handlePlacement = (startPosition, endPosition) => {
		const { nodes } = this.state;
		const { onMessage } = this.props;
		const { startLevel } = actions;
		const startX = startPosition[0];
		const startY = startPosition[1];
		const endX = endPosition[0];
		const endY = endPosition[1];
		// set start
		nodes[startX][startY].startNode = true;
		nodes[startX][startY].visited = true;
		nodes[startX][startY].distance = 0;
		nodes[startX][startY].obstacleFree = true;
		nodes[startX][startY].runner = true;
		// set end
		nodes[endX][endY].endNode = true;
		nodes[endX][endY].obstacleFree = true;
		this.setState({ nodes }, () => {
			onMessage(startLevel);
		});
	};

	generateInfo = (algInfo) => {
		const { nodes } = this.state;
		const {
			replayMode, level, onInfo, height, width,
		} = this.props;
		if (replayMode) return;
		const obstacles = [];
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				if (nodes[i][j].obstacle) {
					obstacles.push(nodes[i][j].position);
				}
			}
		}
		const info = {
			level,
			info: {
				name: algInfo.name, visited: algInfo.numOfVisited, timeTaken: algInfo.timeTaken,
			},
			obstacles,
		};
		onInfo(info);
	}

	bfs = () => {
		const { nodes, searchSpeed } = this.state;
		const { startPosition } = this.props;
		const {
			generateInfo, startRunner, getNeighbours, getInfoTemplate,
		} = this;
		const queue = new Queue();
		const visited = [];
		const info = getInfoTemplate("breadth first search");
		let curNode = nodes[startPosition[0]][startPosition[1]];
		return new Promise((resolve) => {
			const search = setInterval(() => {
				visited.push(curNode);
				info.numOfVisited++;
				if (curNode.endNode) {
					clearInterval(search);
					resolve(visited);
				}
				// pass "diagonal" as second param to enable diagonal search
				const neighbours = getNeighbours(curNode);
				for (let i = 0; i < neighbours.length; i++) {
					queue.enqueue(neighbours[i]);
				}
				curNode = queue.dequeue();
			}, searchSpeed);
		})
			.then((visitedNodes) => {
				info.timeTaken = Number(new Date().getTime() / 1000 - info.timeTaken).toFixed(2);
				generateInfo(info);
				startRunner(visitedNodes);
			});
	};

	dijkstra = () => {
		const { nodes, searchSpeed } = this.state;
		const { startPosition } = this.props;
		const {
			getNeighbours, getHeuristicNodes, startRunner,
			getInfoTemplate, generateInfo, setFirstAsCurrent,
		} = this;
		const visited = [];
		const info = getInfoTemplate("dijkstra");
		let curNode = nodes[startPosition[0]][startPosition[1]];
		const priorityQueue = new PriorityQueue();
		return new Promise((resolve) => {
			const search = setInterval(() => {
				visited.push(curNode);
				info.numOfVisited++;
				if (curNode.endNode) {
					clearInterval(search);
					resolve(visited);
				}
				// pass "diagonal" as second param to enable diagonal search
				const neighbours = getNeighbours(curNode);
				if (neighbours.length === 0) {
					curNode = setFirstAsCurrent();
				} else {
					const heurNodes = getHeuristicNodes(neighbours);
					for (let i = 0; i < heurNodes.length; i++) {
						priorityQueue.enqueue(heurNodes[i], heurNodes[i].distance);
					}
					curNode = priorityQueue.dequeue();
				}
			}, searchSpeed);
		})
			.then((visitedNodes) => {
				info.timeTaken = Number(new Date().getTime() / 1000 - info.timeTaken).toFixed(2);
				generateInfo(info);
				startRunner(visitedNodes);
			});
	};

	trace = () => {
		const { nodes, searchSpeed } = this.state;
		const { startPosition } = this.props;
		const {
			getNeighbours, getHeuristicNodes, startRunner,
			getInfoTemplate, generateInfo, setFirstAsCurrent,
		} = this;
		const info = getInfoTemplate("trace");
		const visited = [];
		// stack keeps track of nodes that would be considered based on heuristics
		const stack = new Stack();
		let curNode = nodes[startPosition[0]][startPosition[1]];
		stack.push(curNode);
		return new Promise((resolve) => {
			const search = setInterval(() => {
				visited.push(curNode);
				info.numOfVisited++;
				if (curNode.endNode) {
					clearInterval(search);
					resolve(visited);
				}
				// pass "diagonal" as second param to enable diagonal search
				const neighbours = getNeighbours(curNode);
				// if all neighbours visited
				if (neighbours.length === 0) {
					// this will speed up search
					if (!stack.isEmpty()) {
						curNode = stack.pop();
					} else {
						curNode = setFirstAsCurrent();
					}
				} else {
					// this is most likely to return 2 nodes with same heuristics
					const heurNodes = getHeuristicNodes(neighbours);
					// prevent algorithm from checking unnecessary nodes after making wrong turn
					// will speed up search
					if (!stack.isEmpty() && heurNodes[0].heuristic > stack.peek().heuristic) {
						curNode = stack.pop();
					} else {
						// if there are two nodes returned from getHeuristicNodes
						// put one on stack and set the other as current
						if (heurNodes[1]) {
							stack.push(heurNodes[1]);
						}
						[curNode] = heurNodes;
					}
				}
			}, searchSpeed);
		})
			.then((visitedNodes) => {
				info.timeTaken = Number(new Date().getTime() / 1000 - info.timeTaken).toFixed(2);
				generateInfo(info);
				startRunner(visitedNodes);
			});
	}

	getInfoTemplate = name => ({
		name,
		numOfVisited: 0,
		timeTaken: new Date().getTime() / 1000,
	})

	setFirstAsCurrent = () => {
		// pick first unvisited of all discovered and set as current
		const { nodes } = this.state;
		const { height, width } = this.props;
		let curNode;
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				if (nodes[i][j].discovered && !nodes[i][j].visited) {
					curNode = nodes[i][j];
					break;
				}
			}
		}
		return curNode;
	}

	getHeuristicNodes = (nodes) => {
		const { endPosition } = this.props;
		const x1 = endPosition[0];
		const y1 = endPosition[1];
		for (let i = 0; i < nodes.length; i++) {
			const x2 = nodes[i].position[0];
			const y2 = nodes[i].position[1];
			const dx = x1 - x2;
			const dy = y1 - y2;
			nodes[i].heuristic = Math.abs(dx + dy);
		}
		const minNodes = [];
		let min = nodes[0].heuristic;
		for (let i = 1; i < nodes.length; i++) {
			if (nodes[i].heuristic < min) {
				min = nodes[i].heuristic;
			}
		}
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i].heuristic === min) {
				minNodes.push(nodes[i]);
			}
		}
		return minNodes;
	}

	startRunner = (path, mode) => {
		const { nodes } = this.state;
		const {
			width, height, level, onAlgFinish, onGameOver,
		} = this.props;
		const endNode = path[path.length - 1];
		const stack = new Stack();
		stack.push(endNode);
		// get path
		while (!stack.peek().startNode) {
			// push parent of the current node on stack
			stack.push(stack.peek().parent);
		}
		if (mode === fnModes.initial) {
			// return without updating ui
			return stack;
		}
		// animate
		let i = 0;
		stack.reverse();
		return new Promise((resolve) => {
			const run = setInterval(() => {
				if (i === stack.length() - 1) {
					clearInterval(run);
					resolve();
				}
				if (i > 0) {
					const prevX = stack.elements[i - 1].position[0];
					const prevY = stack.elements[i - 1].position[1];
					nodes[prevX][prevY].runner = false;
				}
				const x = stack.elements[i].position[0];
				const y = stack.elements[i].position[1];
				nodes[x][y].runner = true;
				this.setState({ nodes });
				i++;
			}, 50);
		})
			.then(() => {
				if (height * width - level < stack.length()) {
					onGameOver();
				} else {
					onAlgFinish();
				}
			});
	}

	getNeighbours = (curNode, mode) => {
		const { nodes } = this.state;
		const { width, height } = this.props;
		const i = curNode.position[0];
		const j = curNode.position[1];
		nodes[i][j].visited = true;
		const neighbours = [];
		// top
		if (i - 1 >= 0 && !nodes[i - 1][j].discovered && !nodes[i - 1][j].obstacle) {
			nodes[i - 1][j].discovered = true;
			nodes[i - 1][j].parent = curNode;
			nodes[i - 1][j].distance = curNode.distance + 1;
			neighbours.push(nodes[i - 1][j]);
		}
		// right
		if (j + 1 < width && !nodes[i][j + 1].discovered && !nodes[i][j + 1].obstacle) {
			nodes[i][j + 1].discovered = true;
			nodes[i][j + 1].parent = curNode;
			nodes[i][j + 1].distance = curNode.distance + 1;
			neighbours.push(nodes[i][j + 1]);
		}
		// down
		if (i + 1 < height && !nodes[i + 1][j].discovered && !nodes[i + 1][j].obstacle) {
			nodes[i + 1][j].discovered = true;
			nodes[i + 1][j].parent = curNode;
			nodes[i + 1][j].distance = curNode.distance + 1;
			neighbours.push(nodes[i + 1][j]);
		}
		// left
		if (j - 1 >= 0 && !nodes[i][j - 1].discovered && !nodes[i][j - 1].obstacle) {
			nodes[i][j - 1].discovered = true;
			nodes[i][j - 1].parent = curNode;
			nodes[i][j - 1].distance = curNode.distance + 1;
			neighbours.push(nodes[i][j - 1]);
		}
		if (mode === fnModes.diagonal) {
			// top-right
			if (i - 1 >= 0 && j + 1 < width && !nodes[i - 1][j + 1].discovered && !nodes[i - 1][j + 1].obstacle) {
				nodes[i - 1][j + 1].discovered = true;
				nodes[i - 1][j + 1].parent = curNode;
				neighbours.push(nodes[i - 1][j + 1]);
			}
			// down-right
			if (i + 1 < height && j + 1 < width && !nodes[i + 1][j + 1].discovered && !nodes[i + 1][j + 1].obstacle) {
				nodes[i + 1][j + 1].discovered = true;
				nodes[i + 1][j + 1].parent = curNode;
				neighbours.push(nodes[i + 1][j + 1]);
			}
			// down-left
			if (i + 1 < height && j - 1 >= 0 && !nodes[i + 1][j - 1].discovered && !nodes[i + 1][j - 1].obstacle) {
				nodes[i + 1][j - 1].discovered = true;
				nodes[i + 1][j - 1].parent = curNode;
				neighbours.push(nodes[i + 1][j - 1]);
			}
			// top-left
			if (i - 1 >= 0 && j - 1 >= 0 && !nodes[i - 1][j - 1].discovered && !nodes[i - 1][j - 1].obstacle) {
				nodes[i - 1][j - 1].discovered = true;
				nodes[i - 1][j - 1].parent = curNode;
				neighbours.push(nodes[i - 1][j - 1]);
			}
		}
		if (mode === fnModes.initial) {
			return neighbours;
		}
		this.setState({ nodes });
		return neighbours;
	}

	generatePath = () => {
		const { nodes } = this.state;
		const { startPosition, endPosition } = this.props;
		const { getNeighbours, startRunner, setFirstAsCurrent } = this;
		let curNode = nodes[startPosition[0]][startPosition[1]];
		const visitedNodes = [];
		while (!curNode.endNode) {
			visitedNodes.push(curNode);
			const neighbours = getNeighbours(curNode);
			// if it has nowhere to go ( all neighbours visited ), pick first unvisited of all and set it as current
			if (neighbours.length === 0) {
				curNode = setFirstAsCurrent();
			} else {
				const random = _.getRandom(neighbours.length);
				const x = neighbours[random].position[0];
				const y = neighbours[random].position[1];
				curNode = nodes[x][y];
			}
		}
		visitedNodes.push(curNode);
		const path = startRunner(visitedNodes, "initial");
		// calculate distance
		const dx = endPosition[0] - startPosition[0];
		const dy = endPosition[1] - startPosition[1];
		const distance = Math.abs(dx + dy) + 1;
		// algorithm doesn't return shortest path
		// calls itself until it does
		// will ensure new path that obstales are not generated on for every level
		if (path.length() !== distance) {
			this.clearNodesForNextAlg();
			return this.generatePath();
		}
		return path;
	}

	getObstacles = (level) => {
		const { height, width } = this.props;
		const { setObstacleFreePath } = this;
		setObstacleFreePath();
		const { nodes } = this.state;
		const obstacles = [];
		while (obstacles.length < level) {
			const x = _.getRandom(height);
			const y = _.getRandom(width);
			if (!nodes[x][y].obstacleFree && !nodes[x][y].obstacle) {
				nodes[x][y].obstacleFree = true;
				obstacles.push(nodes[x][y].position);
			}
		}
		this.clearNodesForNextAlg();
		return obstacles;
	}

	setObstacles = (obstacles) => {
		const { nodes } = this.state;
		const { onMessage, replayMode } = this.props;
		const { obstaclesGenerated } = actions;
		let i = 0; // num of obstacles placed
		while (i < obstacles.length) {
			nodes[obstacles[i][0]][obstacles[i][1]].obstacle = true;
			this.setState({ nodes });
			i++;
		}
		if (!replayMode) {
			onMessage(obstaclesGenerated);
		}
	}

	setObstacleFreePath = () => {
		const { nodes } = this.state;
		const { onMessage } = this.props;
		const { generatePath } = this;
		const { generatingObstacles } = actions;
		onMessage(generatingObstacles);
		const path = generatePath();
		for (let i = 0; i < path.length(); i++) {
			const x = path.elements[i].position[0];
			const y = path.elements[i].position[1];
			nodes[x][y].obstacleFree = true;
		}
		this.setState({ nodes });
	}

	clearNodesForNextAlg = () => {
		const { nodes } = this.state;
		const { height, width } = this.props;
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				nodes[i][j].visited = false;
				nodes[i][j].discovered = false;
			}
		}
		this.setState({ nodes });
	}

	clearNodesForNextLevel = () => {
		const { nodes } = this.state;
		const {
			height, width, startPosition, endPosition,
		} = this.props;
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				nodes[i][j].visited = false;
				nodes[i][j].discovered = false;
				nodes[i][j].obstacle = false;
				nodes[i][j].obstacleFree = false;
			}
		}
		nodes[endPosition[0]][endPosition[1]].runner = false;
		nodes[endPosition[0]][endPosition[1]].obstacleFree = true;
		nodes[startPosition[0]][startPosition[1]].runner = true;
		nodes[startPosition[0]][startPosition[1]].obstacleFree = true;
		this.setState({ nodes });
	}

	handleAlg = () => {
		const { alg } = this.state;
		alg();
	}

	render() {
		const { nodes } = this.state;
		const { getGridStyle } = this;
		return (
			<div style={getGridStyle()}>
				{nodes.map(e => e.map(el => <Node key={el.position} info={el} />))}
			</div>
		);
	}
}

Grid.propTypes = {
	height: PropTypes.number.isRequired,
	width: PropTypes.number.isRequired,
	startPosition: PropTypes.oneOfType([PropTypes.array]).isRequired,
	endPosition: PropTypes.oneOfType([PropTypes.array]).isRequired,
	alg: PropTypes.oneOfType([PropTypes.object]).isRequired,
	onAlgFinish: PropTypes.func.isRequired,
	onMessage: PropTypes.func.isRequired,
	onGameOver: PropTypes.func.isRequired,
	onInfo: PropTypes.func.isRequired,
	replayMode: PropTypes.bool.isRequired,
	level: PropTypes.number.isRequired,
};

export default Grid;
