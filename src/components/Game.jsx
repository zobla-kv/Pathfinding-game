import React, { Component } from "react";
import Grid from "./Grid";
import Node from "./Node";
import {
  Legend,
  Main,
  MainItem,
  ActionsDisplay,
  LevelsHeader,
  Level,
  LevelInfo,
  LevelInfoItem,
  ReplayButton,
  Mode,
  CurrentLevel,
  Action,
  ActionButton,
} from "../styled/Game";

import { Warning } from "../styled/Config";

class Game extends Component {
  state = {
    level: 1,
    levelsCompleted: [],
    algs: [],
    currentAlg: 0,
    currentAction: "",
    mode: "manual",
    gameStarted: false,
    positionsSelected: false,
    replayMode: false,
    replayLevel: 0,
    replayWarning: false,
  };

  constructor(props) {
    super(props);
    this.grid = React.createRef();
    this.state.algs = this.props.config.algs;
  }

  componentDidMount() {
    const { algs } = this.state;
    const newAlgs = [];
    const bfs = this.grid.current.bfs;
    const dfs = this.grid.current.dfs;
    const bruteForce = this.grid.current.bruteForce;
    // convert algs from strings to methods
    for (let alg of algs) {
      if (alg === "Breadth first search") newAlgs.push(bfs);
      if (alg === "Depth first search") newAlgs.push(dfs);
      if (alg === "Brute force search") newAlgs.push(bruteForce);
    }
    this.setState({ algs: newAlgs });
  }

  handleGameOver = () => {
    this.displayMessage("game over, click config to play again");
    this.setState({ gameStarted: false });
  };

  handleNextLevel = (mode) => {
    const { level, algs, currentAlg, replayMode } = this.state;
    if (replayMode && currentAlg === algs.length) return;
    if (currentAlg === algs.length) {
      this.grid.current.clearNodesForNextLevel();
      if (mode === "replay") this.grid.current.getObstacleFreePath(level - 1);
      else {
        this.grid.current.getObstacleFreePath(level);
        this.setState({ level: level + 1 });
      }
      this.handleNextAlgorithm();
    } else this.handleNextAlgorithm();
  };

  handleNextAlgorithm = () => {
    const { currentAction } = this.state;
    if (currentAction === "start the game first") return;
    let { algs, currentAlg: current } = this.state;
    if (current === algs.length) current = 0;
    else {
      algs[current]();
      current++;
    }
    this.setState({ currentAlg: current, gameStarted: true });
  };

  showLevelInfo(level) {
    const levelsCompleted = [...this.state.levelsCompleted];
    levelsCompleted[level - 1].show = true;
    this.setState({ levelsCompleted });
  }

  hideLevelInfo(level) {
    const levelsCompleted = [...this.state.levelsCompleted];
    levelsCompleted[level - 1].show = false;
    this.setState({ levelsCompleted });
  }

  handleInfo = (levelsInfo) => {
    this.setState({ levelsCompleted: levelsInfo });
  };

  //prettier-ignore
  displayMessage = (action) => {
    const {mode} = this.state;
    if(action === 'click play to start') this.setState({ positionsSelected: true })
    this.setState({ currentAction: action }, ()=> {
      if(action === "obstacles generated" || action === "wait for level to finish" || action === "can't replay last level") 
      setTimeout(() => {
        mode === 'manual'? this.displayMessage("click play to start this level") : this.handleNextAlgorithm()
      }, 1000);
    });
   
  };

  handleModeChange = () => {
    let { mode, gameStarted, currentAction, replayMode } = this.state;
    if (!gameStarted || replayMode) return this.preventModeChange();
    if (currentAction === "click play to start this level")
      this.handleNextAlgorithm();
    mode = mode === "manual" ? "auto" : "manual";
    this.setState({ mode });
  };

  preventModeChange = () => {
    const { currentAction, gameStarted, replayMode } = this.state;
    if (!gameStarted) this.displayMessage("start the game first");
    else if (replayMode) this.displayMessage("not available in replay mode");
    setTimeout(() => {
      this.displayMessage(currentAction);
    }, 1000);
  };

  //prettier-ignore
  replayLevel = (level) => {
    const { levelsCompleted, currentAction: action, gameStarted } = this.state;
    if(levelsCompleted.length < level + 1 && !gameStarted) return this.displayMessage("can't replay last level")
    this.setState({replayLevel: level, mode: "manual"})
    if(action !== 'click play to start' && action !== 'click play to start this level' && action !== 'click play to start replay' && action !== "replay finished" && action !== "game over, click config to play again"){
      this.setState({replayWarning: true})
      setTimeout(() => this.setState({replayWarning: false}), 2000)
    } 
    else {
      this.displayMessage(`replaying level ${level}...`);
      this.setState({ replayMode: true });
      this.grid.current.replayLevel(levelsCompleted[level - 1]);
    }
  };

  handleReplayExit = () => {
    this.displayMessage("replay finished");
  };

  //prettier-ignore
  handleLevelReturn = () => {
    this.setState({ replayMode: false }, () => this.handleNextLevel("replay"));
  };

  //prettier-ignore
  render() {  
    const legendItems = [{name: 'start', value: {startNode: true}}, {name: 'end', value: {endNode: true}}, 
                         {name: 'obstacle', value: {obstacle: true}}, {name: 'visited', value: {visited: true}},
                         {name: 'discovered', value: {discovered: true}},{name: 'path', value: {isPath: true}}]    
          
    const {level, levelsCompleted, mode, currentAction: action, replayMode, replayLevel, replayWarning} = this.state;
    return (
      <div>
        <Legend>
          {legendItems.map((e, i) => <div key={i}><Node info={e.value} /><br />{e.name}</div>)}
        </Legend>
        <Main>
          <MainItem>
            <Grid
              ref={this.grid}
              height={this.props.config.height}
              width={this.props.config.width}
              level={this.state.level}
              onNextLevel={this.handleNextLevel}
              onInfo={this.handleInfo}
              numOfAlgs={this.state.algs.length}
              onMessage={this.displayMessage}
              onGameOver={this.handleGameOver}
              replayMode={this.state.replayMode}
              currentAlg={this.state.currentAlg}
          />
            <ActionsDisplay>
              <Mode onClick={this.handleModeChange}>mode: {mode}</Mode>
              <CurrentLevel>level: {replayMode? replayLevel : level}</CurrentLevel>
              <Action>{action}</Action>
            </ActionsDisplay>
            {(action === "replay finished" && <ActionButton onClick={() => this.handleLevelReturn(level)} replay={replayMode}>level {level}</ActionButton>) ||
            ((action === "click play to start" || action === "click play to start this level" || action === "click play to start replay") && <ActionButton onClick={this.handleNextAlgorithm} mode={mode}>Play</ActionButton>) ||
            ((action === "game over, click config to play again" || action === "can't replay last level") && <ActionButton onClick={this.props.onGameOver} config>Config</ActionButton>)}
          </MainItem> 
          <MainItem levels> 
            <LevelsHeader>Levels completed</LevelsHeader>
            {levelsCompleted.length === 0 ? "no levels completed yet" : levelsCompleted.map((e,i) => 
              <Level key={i} onClick={() => e.show? this.hideLevelInfo(e.level) : this.showLevelInfo(e.level)}>
                {e.level}
                {e.info.map((e,j) => 
                  <LevelInfo  key={j} show={levelsCompleted[i].show}>
                    <LevelInfoItem onClick={(event)=> event.stopPropagation()}>algorithm: {e.name}</LevelInfoItem>
                    <LevelInfoItem onClick={(event)=> event.stopPropagation()}>fields checked: {e.visited}</LevelInfoItem>
                    <LevelInfoItem onClick={(event)=> event.stopPropagation()}>time taken: {e.timeTaken}s</LevelInfoItem>
                  </LevelInfo>)}
                  <ReplayButton onClick={(event) => {
                    event.stopPropagation();
                    this.replayLevel(e.level)
                  }} show={levelsCompleted[i].show}>Replay</ReplayButton>
                  <br />
                  {replayWarning && e.level === replayLevel && <Warning>wait for level to finish</Warning>}
              </Level>
            )}
          </MainItem>
        </Main>
      </div>
    );
  }
}

export default Game;
