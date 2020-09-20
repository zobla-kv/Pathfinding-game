import styled from "styled-components";

//prettier-ignore
export const NodeWrapper = styled.div`
  width: 25px;
  height: 25px;
  border: 1px solid black;
  display: inline-block;
  margin-bottom: -4px;

  background-color: ${({ info: { startNode, endNode, visited, discovered, obstacle, isPath } }) => {
    if (startNode) return "blue";
    else if (endNode) return "red";
    else if (obstacle) return "brown";
    else if (isPath) return "yellow";
    else if (discovered) return "cyan";
    else if (visited) return "darkOrchid";
  }};
`;

export const Legend = styled.div`
  text-align: center;
  border-bottom: 1px solid white;
  margin-top: 2%;
  height: 50px;
  display: flex;
  justify-content: space-around;
`;

export const Main = styled.div`
  margin-top: 5%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
`;

export const MainItem = styled.div`
  font-size: 18px;
  width: ${(props) => props.levels && "350px"};
  height: ${(props) => props.levels && "100%"};
  font-size: ${(props) => props.levels && "14px"};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 655px) {
    margin-top: ${(props) => props.levels && "5%"};
  }
`;

export const ActionsDisplay = styled.div`
  position: relative;
  border: 1px solid white;
  height: 75px;
  width: 300px;
  margin-top: 10%;
  font-size: 14px;
`;

export const Action = styled.span`
  font-style: italic;
  font-family: Comic Sans MS;
  line-height: 80px;
`;

export const Mode = styled.span`
  position: absolute;
  top: 4%;
  left: 4%;
  height: 20px;

  &:hover {
    cursor: pointer;
  }
`;

export const CurrentLevel = styled.span`
  position: absolute;
  top: 4%;
  right: 4%;
  height: 20px;
`;

export const ActionButton = styled.button`
  height: 25px;
  min-width: 75px;
  margin-top: 4%;
  outline: none;
  background-color: blue;
  border-radius: 18px;
  border: 1px solid #337fed;
  cursor: pointer;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  display: ${({ mode, config, replay }) =>
    mode === "manual" ? "block" : config ? "block" : replay ? "block" : "none"};

  &:hover {
    cursor: pointer;
  }
`;

export const LevelsHeader = styled.div`
  margin-bottom: 10px;
  border-bottom: 1px solid blue;
  width: 75%;
  font-size: 24px;
`;
export const Level = styled.div`
  width: 100%;
  margin-bottom: 5px;
  font-size: 20px;
  &:hover {
    cursor: pointer;
  }
`;

export const LevelInfo = styled.div`
  border-top: 1px solid blue;
  padding: 4px 0 4px 0;
  display: ${({ show }) => (show ? "block" : "none")};
  cursor: default;
`;

export const LevelInfoItem = styled.div`
  text-align: left;
  padding-left: 2%;
  font-size: 14px;
`;

export const ReplayButton = styled.button`
  outline: none;
  background-color: blue;
  border-radius: 18px;
  border: 1px solid #337fed;
  color: #ffffff;
  display: ${({ show }) => (show ? "" : "none")};
  // margin-bottom: 15px;
  &:hover {
    cursor: pointer;
  }
`;
