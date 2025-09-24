import React from "react";
import PropTypes from "prop-types";

const Node = ({
	info: {
		startNode, endNode, visited, discovered, obstacle, runner,
	},
	legend,
}) => {
	const getBgc = () => {
		if (startNode) {
			return "blue";
		}
		if (endNode) {
			return "red";
		}
		if (obstacle) {
			return "saddleBrown";
		}
		if (visited) {
			return "cyan";
		}
		if (discovered) {
			return "darkViolet";
		}
	};

	const getBorder = () => {
		if (legend) {
			return "none";
		}
		return "1px solid black";
	};

	const nodeStyle = {
		height: 25,
		width: 25,
		border: getBorder(),
		display: "inline-block",
		marginBottom: -5,
		backgroundColor: getBgc(),
	};

	const runnerStyle = {
		height: 25,
		width: 25,
		backgroundImage: "url(runner-new.png)",
		backgroundSize: "100%",
		position: 'relative',
		top: '-2px'
	};

	return (
		<div style={nodeStyle}>
			{runner && <div style={runnerStyle} />}
		</div>
	);
};

Node.propTypes = {
	info: PropTypes.oneOfType([PropTypes.object]).isRequired,
	runner: PropTypes.bool,
	legend: PropTypes.bool,
};

Node.defaultProps = {
	runner: false,
	legend: false,
};

export default Node;
