import React, { Component } from "react";
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
  state = {
    algs: ["Breadth first search", "Depth first search", "Brute force search"],
    selectedAlgs: [],
    warningMessage: "",
  };

  constructor() {
    super();
    this.height = React.createRef();
    this.width = React.createRef();
  }

  handleAdd = (alg) => {
    const { algs, selectedAlgs } = this.state;
    const index = algs.findIndex((e) => e === alg);
    selectedAlgs.push(alg);
    algs.splice(index, 1);
    this.setState({ algs, selectedAlgs });
  };

  handleRemove = (alg) => {
    const { algs, selectedAlgs } = this.state;
    const index = selectedAlgs.findIndex((e) => e === alg);
    algs.push(alg);
    selectedAlgs.splice(index, 1);
    this.setState({ algs, selectedAlgs });
  };

  validateInput = async () => {
    let { warningMessage, selectedAlgs } = this.state;
    const height = this.height.current.value;
    const width = this.width.current.value;
    if (
      !height ||
      !width ||
      isNaN(height) ||
      isNaN(width) ||
      height > 13 ||
      height < 2 ||
      width > 13 ||
      width < 2
    )
      warningMessage = "Invalid grid size";
    else if (selectedAlgs.length === 0)
      warningMessage = "No algorithms selected";
    await this.setState({ warningMessage });
    if (warningMessage) this.clearWarningMessage();
    else this.props.onPlay(height, width, selectedAlgs);
  };

  clearWarningMessage = () =>
    setTimeout(() => {
      this.setState({ warningMessage: "" });
    }, 2000);

  render() {
    const { algs, selectedAlgs, warningMessage } = this.state;
    return (
      <div>
        <Header>Pathfinding</Header>
        <Options>
          <Option>
            <OptionHeader>Select algorithms</OptionHeader>
            {algs.length === 0 ? (
              <NoAlg>No algorithms available</NoAlg>
            ) : (
              algs.map((e, i) => (
                <Algorithm key={i}>
                  {e}
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
            <Button onClick={() => this.validateInput()}>Play</Button>
            <br />
            <Warning>{warningMessage}</Warning>
          </Option>
          <Option>
            <OptionHeader>Selected algorithms</OptionHeader>
            {selectedAlgs.length === 0 ? (
              <NoAlg>No algorithms selected</NoAlg>
            ) : (
              selectedAlgs.map((e, i) => (
                <Algorithm key={i}>
                  {e}
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

export default Config;
