import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	Header,
	Options,
	Option,
	OptionHeader,
	Algorithm,
	Add,
	Remove,
	NoAlg,
	Label,
	Input,
	Button,
	Warning,
} from "../styled/Config";

class Config extends Component {
	constructor() {
		super();
		this.state = {
			algs: [
				{
					id: 1,
					name: "Breadth first search",
				},
				{
					id: 2,
					name: "Dijkstra",
				},
				{
					id: 3,
					name: "Trace",
				},
			],
			selectedAlgs: [],
			warningMessage: "",
		};
		this.height = React.createRef();
		this.width = React.createRef();
		this.startPosition = React.createRef();
		this.endPosition = React.createRef();
	}

	handleAdd = (alg) => {
		const { algs, selectedAlgs } = this.state;
		const index = algs.findIndex(e => e.id === alg.id);
		selectedAlgs.push(alg);
		algs.splice(index, 1);
		this.setState({ algs, selectedAlgs });
	};

	handleRemove = (alg) => {
		const { algs, selectedAlgs } = this.state;
		const index = selectedAlgs.findIndex(e => e.id === alg.id);
		algs.push(alg);
		selectedAlgs.splice(index, 1);
		this.setState({ algs, selectedAlgs });
	};

	validateInput = async () => {
		let { warningMessage } = this.state;
		const { selectedAlgs } = this.state;
		const { positionToArray } = this;
		const { onStart } = this.props;
		const height = this.height.current.value;
		const width = this.width.current.value;
		const startPosition = positionToArray(this.startPosition.current.value);
		const endPosition = positionToArray(this.endPosition.current.value);
		if (
			!height ||
			!width ||
			isNaN(height) ||
			isNaN(width) ||
			height > 13 ||
			height < 2 ||
			width > 13 ||
			width < 2
		) {
			warningMessage = "Invalid grid size";
		} else if (
			isNaN(startPosition[0]) || isNaN(startPosition[1]) ||
			startPosition[0] < 0 || startPosition[0] > height - 1 ||
			startPosition[1] < 0 || startPosition[1] > width - 1) {
			warningMessage = "invalid start position";
		} else if (
			isNaN(endPosition[0]) || isNaN(endPosition[1]) ||
			endPosition[0] < 0 || endPosition[0] > height - 1 ||
			endPosition[1] < 0 || endPosition[1] > width - 1) {
			warningMessage = "invalid end position";
		} else if ((startPosition[0] === endPosition[0]) && (startPosition[1] === endPosition[1])) {
			warningMessage = "start and end can't have same positions";
		} else if (selectedAlgs.length === 0) {
			warningMessage = "No algorithms selected";
		}
		this.setState({ warningMessage });
		if (warningMessage) {
			this.clearWarningMessage();
		} else {
			const config = {
				height: Number(height),
				width: Number(width),
				algs: selectedAlgs,
				startPosition,
				endPosition,
			};
			onStart(config);
		}
	};

	clearWarningMessage = () => setTimeout(() => {
		this.setState({ warningMessage: "" });
	}, 2000);

	positionToArray(position) {
		const array = [];
		const x = Number(position.split(",")[0]);
		const y = Number(position.split(",")[1]);
		array.push(x, y);
		return array;
	}

	render() {
		const { algs, selectedAlgs, warningMessage } = this.state;
		const { validateInput } = this;
		return (
			<div>
				<Header>Pathfinding</Header>
				<Options>
					<Option>
						<OptionHeader>Select algorithms</OptionHeader>
						{algs.length === 0 ? (
							<NoAlg>No algorithms available</NoAlg>
						) : (
							algs.map(e => (
								<Algorithm key={e.id}>
									{e.name}
									<Add onClick={() => this.handleAdd(e)}>+</Add>
								</Algorithm>
							))
						)}
					</Option>
					<Option moveLeft>
						<OptionHeader>Select grid size</OptionHeader>
						<Label>Height (max 13)</Label>
						<Input type="text" ref={this.height} />
						<br />
						<Label moveTop>Width (max 13)</Label>
						<Input type="text" moveTop ref={this.width} />
					</Option>
					<Option>
						<OptionHeader>Select start/end</OptionHeader>
						<Label>Start position</Label>
						<Input type="text" ref={this.startPosition} />
						<br />
						<Label moveTop>End position</Label>
						<Input type="text" moveTop ref={this.endPosition} />
					</Option>
					<Option>
						<Button onClick={validateInput}>Play</Button>
						<br />
						<Warning>{warningMessage}</Warning>
					</Option>
					<Option>
						<OptionHeader>Selected algorithms</OptionHeader>
						{selectedAlgs.length === 0 ? (
							<NoAlg>No algorithms selected</NoAlg>
						) : (
							selectedAlgs.map(e => (
								<Algorithm key={e.id}>
									{e.name}
									<Remove onClick={() => this.handleRemove(e)}>&#8722;</Remove>
								</Algorithm>
							))
						)}
					</Option>
				</Options>
			</div>
		);
	}
}

Config.propTypes = {
	onStart: PropTypes.func.isRequired,
};

export default Config;
