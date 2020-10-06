import React, { Component } from "react";
import PropTypes from "prop-types";
import Grid from "./Grid";
import Node from "./Node";
import { actions, modes } from "../utils/constants";
import {
	Legend,
	Main,
	MainItem,
	AlgName,
	ActionsDisplay,
	LevelsHeader,
	Level,
	LevelInfo,
	LevelInfoItem,
	ReplayButton,
	Controls,
	Mode,
	CurrentLevel,
	Action,
	ActionButton,
} from "../styled/Game";

import { Warning } from "../styled/Config";

class Game extends Component {
	constructor(props) {
		super(props);
		const { config: { algs } } = this.props;
		const { manual } = modes;
		this.state = {
			level: 1,
			levelsCompleted: [],
			algs,
			numOfFinishedAlgs: 0,
			action: actions.start,
			mode: manual,
			modeClickable: true,
			playClickable: true,
			nextClickable: true,
			exitReplayClickable: false,
			replayMode: false,
			replayLevel: 0,
			replayWarning: false,
		};
		this.gridRefs = [];
	}

	handleInfo = (algInfo) => {
		const { levelsCompleted } = this.state;
		if (levelsCompleted.length === algInfo.level - 1) {
			levelsCompleted.push({
				level: algInfo.level, info: [], obstacles: algInfo.obstacles, show: false,
			});
			levelsCompleted[algInfo.level - 1].info.push(algInfo.info);
		} else {
			levelsCompleted[algInfo.level - 1].info.push(algInfo.info);
		}
		this.setState({ levelsCompleted });
	};

	displayMessage = (action) => {
		const { modifyButtonClickability } = this;
		this.setState({ action }, () => {
			const { action: currentAction } = this.state;
			modifyButtonClickability(currentAction);
		});
	};

	modifyButtonClickability = (action) => {
		const { mode } = this.state;
		const { displayMessage } = this;
		const { startLevel, algsRunning, obstaclesGenerated } = actions;
		const { manual } = modes;
		if (action === algsRunning) {
			this.setState({ playClickable: false, nextClickable: false });
		}
		if (action === obstaclesGenerated && mode === manual) {
			setTimeout(() => {
				displayMessage(startLevel);
				this.setState({ playClickable: true });
			}, 1000);
		}
	}

	handlePlay = () => {
		const { algs } = this.state;
		const { displayMessage } = this;
		const { algsRunning } = actions;
		displayMessage(algsRunning);
		for (let i = 0; i < algs.length; i++) {
			this.gridRefs[i].handleAlg();
		}
	}

	handleAlgFinish = () => {
		const {
			algs, mode, replayMode, numOfFinishedAlgs,
		} = this.state;
		const { handleNextLevel, handlePlay, displayMessage } = this;
		const { complete, nextLevel } = actions;
		const { manual } = modes;
		this.setState({ numOfFinishedAlgs: numOfFinishedAlgs + 1 });
		if (numOfFinishedAlgs === algs.length - 1) {
			this.setState({ numOfFinishedAlgs: 0 });
			if (replayMode) {
				return this.handleReplayFinished();
			}
			if (mode === manual) {
				this.displayMessage(nextLevel);
				this.setState({ nextClickable: true });
			} else {
				displayMessage(complete);
				setTimeout(() => {
					handleNextLevel();
					setTimeout(() => handlePlay(), 2500);
				}, 1500);
			}
		}
	}

	handleNextLevel = () => {
		const {
			level, algs, replayMode, levelsCompleted,
		} = this.state;
		if (replayMode) return;
		for (let i = 0; i < algs.length; i++) {
			this.gridRefs[i].clearNodesForNextLevel();
		}
		this.setState({ level: level + 1 });
		const obstacles = this.gridRefs[0].getObstacles(levelsCompleted.length);
		setTimeout(() => {
			for (let i = 0; i < algs.length; i++) {
				this.gridRefs[i].setObstacles(obstacles);
			}
		}, 1000);
	};

	handleModeChange = () => {
		const { modeClickable, action } = this.state;
		let { mode } = this.state;
		const { startGameWithModeButton } = this;
		const { manual, auto } = modes;
		if (!modeClickable) return;
		mode = mode === manual ? auto : manual;
		this.setState({
			mode, modeClickable: false, playClickable: false, nextClickable: false,
		});
		if (mode === auto) {
			startGameWithModeButton(action);
		}
		setTimeout(() => {
			this.setState({ modeClickable: true });
		}, 500);
	};

	startGameWithModeButton = (action) => {
		const { handlePlay, handleNextLevel } = this;
		const { startLevel, nextLevel } = actions;
		if (action === nextLevel) {
			handleNextLevel();
			setTimeout(() => handlePlay(), 2500);
		}
		if (action === startLevel) {
			handlePlay();
		}
	}

	handleGameOver = () => {
		const { gameOver } = actions;
		this.displayMessage(gameOver);
		this.setState({ modeClickable: false });
	}

	handleReplay = (level) => {
		const { isReplayRunnable, preventReplay, runReplay } = this;
		const { replaying } = actions;
		const { manual } = modes;
		this.setState({ mode: manual });
		if (!isReplayRunnable()) {
			return preventReplay();
		}
		this.displayMessage(`${replaying} ${level}...`);
		this.setState({
			replayMode: true, replayLevel: level, exitReplayClickable: false, modeClickable: false,
		});
		setTimeout(() => {
			runReplay(level);
		}, 1000);
	};

	isReplayRunnable = () => {
		const { action } = this.state;
		const {
			startLevel, nextLevel, replayFinished, gameOver,
		} = actions;
		if (action !== startLevel && action !== nextLevel && action !== replayFinished && action !== gameOver) {
			return false;
		}
		return true;
	}

	preventReplay = () => {
		this.setState({ replayWarning: true });
		setTimeout(() => this.setState({ replayWarning: false }), 2000);
	}

	runReplay = (level) => {
		const { algs, levelsCompleted } = this.state;
		const { obstacles } = levelsCompleted[level - 1];
		for (let i = 0; i < algs.length; i++) {
			this.gridRefs[i].clearNodesForNextLevel();
			setTimeout(() => {
				if (level === 1) {
					this.gridRefs[i].handleAlg();
				} else {
					this.gridRefs[i].setObstacles(obstacles);
					setTimeout(() => {
						this.gridRefs[i].handleAlg();
					}, 1000);
				}
			}, 1000);
		}
	}

	handleReplayFinished = () => {
		const { replayFinished } = actions;
		this.displayMessage(replayFinished);
		this.setState({ exitReplayClickable: true });
	};

	handleLevelReturn = (level) => {
		const { exitReplayClickable } = this.state;
		if (!exitReplayClickable) return;
		this.setState({
			level, replayMode: false, exitReplayClickable: false, modeClickable: true,
		}, () => {
			this.handleNextLevel();
		});
	};

	handleConfig = () => {
		const { onGameOver } = this.props;
		onGameOver();
	}

	showLevelInfo(level) {
		let { levelsCompleted } = this.state;
		levelsCompleted = [...levelsCompleted];
		levelsCompleted[level - 1].show = true;
		this.setState({ levelsCompleted });
	}

	hideLevelInfo(level) {
		let { levelsCompleted } = this.state;
		levelsCompleted = [...levelsCompleted];
		levelsCompleted[level - 1].show = false;
		this.setState({ levelsCompleted });
	}

	render() {
		const legendItems = [
			{ id: 1, name: "runner", value: { runner: true } }, { id: 2, name: "start", value: { startNode: true } },
			{ id: 3, name: "end", value: { endNode: true } }, { id: 4, name: "obstacle", value: { obstacle: true } },
			{ id: 5, name: "visited", value: { visited: true } }, { id: 6, name: "discovered", value: { discovered: true } },
		];
		const {
			level, levelsCompleted, mode, action, modeClickable, playClickable, nextClickable,
			replayMode, replayLevel, exitReplayClickable, replayWarning, algs,
		} = this.state;
		const {
			config: {
				algs: selectedAlgs, width, height, startPosition, endPosition,
			},
		} = this.props;
		const {
			handlePlay, handleAlgFinish, handleNextLevel, handleInfo, displayMessage,
			handleModeChange, handleReplay, handleLevelReturn, handleGameOver, handleConfig,
		} = this;
		const {
			startLevel, nextLevel, generatingObstacles, obstaclesGenerated, algsRunning, complete, gameOver,
		} = actions;
		return (
			<div>
				<Legend>
					{legendItems.map(e => (
						<div key={e.id}>
							<Node info={e.value} legend />
							<br />
							{e.name}
						</div>
					))}
				</Legend>
				<Controls>
					<ActionsDisplay>
						<Mode>
							mode:
							{" "}
							{mode}
						</Mode>
						<CurrentLevel>
							level:
							{" "}
							{replayMode ? replayLevel : level}
						</CurrentLevel>
						<Action>{action}</Action>
					</ActionsDisplay>
					<ActionButton onClick={handleModeChange} clickable={modeClickable}>mode</ActionButton>
					{(action === startLevel || action === generatingObstacles || action === obstaclesGenerated)
					&& <ActionButton onClick={playClickable ? handlePlay : undefined} clickable={playClickable}>play</ActionButton>}
					{(action === nextLevel || action === algsRunning || action === complete)
					&& <ActionButton onClick={nextClickable ? handleNextLevel : undefined} clickable={nextClickable}>next</ActionButton>}
					{action === gameOver && <ActionButton onClick={handleConfig} clickable>config</ActionButton>}
					{replayMode
					&& (
						<ActionButton onClick={() => handleLevelReturn(levelsCompleted.length)} replay={replayMode} clickable={exitReplayClickable}>
							level
							{" "}
							{levelsCompleted.length + 1}
						</ActionButton>
					)}
				</Controls>
				<Main>
					{algs.map((e, i) => (
						<MainItem key={e.id}>
							<AlgName>{selectedAlgs[i].name}</AlgName>
							<Grid
								// eslint-disable-next-line no-return-assign
								ref={gridRef => this.gridRefs[i] = gridRef}
								height={height}
								width={width}
								startPosition={startPosition}
								endPosition={endPosition}
								alg={e}
								level={level}
								onAlgFinish={handleAlgFinish}
								onInfo={handleInfo}
								onMessage={displayMessage}
								onGameOver={handleGameOver}
								replayMode={replayMode}
							/>
						</MainItem>
					))}
				</Main>
				<Controls>
					<LevelsHeader>Levels completed</LevelsHeader>
					{levelsCompleted.length === 0 ? "no levels completed yet" : levelsCompleted.map((e, i) => (
						<Level key={e.level} onClick={() => (e.show ? this.hideLevelInfo(e.level) : this.showLevelInfo(e.level))}>
							{e.level}
							<ReplayButton
								onClick={(event) => {
									event.stopPropagation();
									handleReplay(e.level);
								}}
							>
								replay
							</ReplayButton>
							<br />
							{replayWarning && e.level === level && <Warning>wait for level to finish</Warning>}
							{e.info.map(el => (
								<LevelInfo key={el.name} show={levelsCompleted[i].show}>
									<LevelInfoItem onClick={event => event.stopPropagation()}>
										algorithm:
										{" "}
										{el.name}
									</LevelInfoItem>
									<LevelInfoItem onClick={event => event.stopPropagation()}>
										fields checked:
										{" "}
										{el.visited}
									</LevelInfoItem>
									<LevelInfoItem onClick={event => event.stopPropagation()}>
										time taken:
										{" "}
										{el.timeTaken}
										s
									</LevelInfoItem>
								</LevelInfo>
							))}
						</Level>
					))}
				</Controls>
			</div>
		);
	}
}

Game.propTypes = {
	config: PropTypes.oneOfType([PropTypes.object]).isRequired,
	onGameOver: PropTypes.func.isRequired,
};

export default Game;
