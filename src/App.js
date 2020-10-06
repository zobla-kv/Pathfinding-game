import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from "react-router-dom";
import Config from "./components/Config";
import Game from "./components/Game";

class App extends Component {
	constructor() {
		super();
		this.state = {};
	}

	handleStart = (config) => {
		this.setState({ config });
	}

	handleGameOver = () => {
		this.setState({ config: null });
	}

	render() {
		const { config } = this.state;
		const { handleStart, handleGameOver } = this;
		return (
			<Router>
				<Switch>
					<Route exact path="/config">
						{!config ? <Config onStart={handleStart} /> : <Redirect to="/game" />}
					</Route>
					<Route exact path="/game">
						{config ? <Game config={config} onGameOver={handleGameOver} /> : <Redirect to="/config" />}
					</Route>
					<Route path="*">
						<Redirect to="/config" />
					</Route>
				</Switch>
			</Router>
		);
	}
}

export default App;
