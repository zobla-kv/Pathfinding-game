import React from "react";
// couldn't use styled component here as I was getting noticeable performance drop
// code below would replace current one if used

// import { NodeWrapper } from "../styled/Game";
// const Node = ({ info, onStart }) => (<NodeWrapper info={info} onClick={() => onStart(info.position)} />
// );

//prettier-ignore
const Node = ({ info: { position, startNode, endNode, visited, discovered, obstacle, isPath}, onStart}) => {

  const getBgc = () => {
    if (startNode) return "blue";
    else if (endNode) return "red";
    else if (obstacle) return "saddleBrown";
    else if (isPath) return "yellow";
    else if (visited) return "cyan";
    else if (discovered) return "darkViolet";
  };

  const style = {
    width: 25,
    height: 25,
    border: "1px solid black",
    display: "inline-block",
    marginBottom: -5,
    backgroundColor: getBgc()
  }

  return (
    <div
      style={style}
      onClick={() => onStart(position)}
    ></div>
  );
};

export default Node;
