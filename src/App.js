import React, { Component } from "react";
import Config from "./components/Config";
import Game from "./components/Game";
import { Wrapper } from "./styled/Config";

class App extends Component {
  state = {
    page: "Config",
    opacity: 1,
    config: {
      height: 0,
      width: 0,
      algs: [],
    },
  };

  handlePlay = (height, width, algs) => {
    this.setState({ config: { height, width, algs } });
    this.fadeOut();
  };

  fadeOut = () => {
    let { opacity, page } = this.state;
    return new Promise((resolve) => {
      const animate = setInterval(() => {
        if (opacity < 0) {
          clearInterval(animate);
          resolve();
        }
        opacity -= 0.05;
        this.setState({ opacity });
      }, 30);
    }).then(() => {
      page = page === "Config" ? "Game" : "Config";
      this.setState({ page });
      this.fadeIn();
    });
  };

  fadeIn = () => {
    let { opacity } = this.state;
    const animate = setInterval(() => {
      if (opacity > 1) clearInterval(animate);
      opacity += 0.05;
      this.setState({ opacity });
    }, 30);
  };

  render() {
    const { page, opacity, config } = this.state;
    return (
      <div>
        <Wrapper opacity={opacity}>
          {page === "Config" && <Config onPlay={this.handlePlay} />}
        </Wrapper>
        <Wrapper opacity={opacity}>
          {page === "Game" && (
            <Game config={config} onGameOver={this.fadeOut} />
          )}
        </Wrapper>
      </div>
    );
  }
}

export default App;
