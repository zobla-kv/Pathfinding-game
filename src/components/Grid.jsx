import React, { Component } from "react";
import Node from "./Node";
import * as _ from "../utils/utils";

class Grid extends Component {
  state = {
    height: this.props.height,
    width: this.props.width,
    startNode: [],
    endNode: [],
    nodes: [],
    levelsInfo: [],
  };

  constructor(props) {
    super(props);
    const nodes = [];
    for (let i = 0; i < this.state.height; i++) {
      const row = [];
      for (let j = 0; j < this.state.width; j++) {
        row.push({
          position: [i, j],
          visited: false,
        });
      }
      nodes.push(row);
    }
    this.state.nodes = nodes;
    this.props.onMessage("choose start position");
  }

  getObstacleFreePath(level) {
    let { nodes } = this.state;

    this.props.onMessage("generating obstacles...");

    this.generatePath().then((path) => {
      for (let i = 0; i < path.length(); i++) {
        const x = path.elements[i].position[0];
        const y = path.elements[i].position[1];
        nodes[x][y].obstacleFree = true;
      }
      nodes = this.clearNodesForNextAlg(nodes);

      this.generateObstacles(nodes, level);
    });
  }

  // reset properties for next level
  clearNodesForNextAlg(nodes) {
    for (let i = 0; i < this.state.height; i++)
      for (let j = 0; j < this.state.width; j++) {
        nodes[i][j].visited = false;
        nodes[i][j].discovered = false;
        nodes[i][j].isPath = false;
      }
    return nodes;
  }

  //prettier-ignore
  clearNodesForNextLevel() {
    const { nodes, height, width } = this.state;
    const levelsInfo = [...this.state.levelsInfo];
    const positions = [];

      for (let i = 0; i < height; i++)
        for (let j = 0; j < width; j++) {
          if (nodes[i][j].obstacle || nodes[i][j].startNode || nodes[i][j].endNode)
            positions.push(nodes[i][j]);  

        levelsInfo[levelsInfo.length - 1].positions = positions;
        
        nodes[i][j].visited = false;
        nodes[i][j].discovered = false;
        nodes[i][j].isPath = false;
        nodes[i][j].obstacle = false;
        nodes[i][j].obstacleFree = false;
      }
    this.setState({ levelsInfo, nodes });
  }

  generateObstacles(nodes, level) {
    const { height, width } = this.state;

    let numOfObstacles = 0;

    return new Promise((resolve) => {
      const placeObstacle = setInterval(() => {
        if (numOfObstacles === level) {
          clearInterval(placeObstacle);
          resolve();
        } else {
          const x = _.getRandom(height);
          const y = _.getRandom(width);
          if (!nodes[x][y].obstacleFree && !nodes[x][y].obstacle) {
            nodes[x][y].obstacle = true;
            numOfObstacles++;
            this.setState({ nodes });
          }
        }
      }, 50);
    }).then(() =>
      setTimeout(() => {
        this.props.onMessage("obstacles generated");
      }, 500)
    );
  }

  //prettier-ignore
  handlePlacement = (position) => {
    const i = position[0], j = position[1];
    const { nodes, startNode, endNode } = this.state;
    // if both set
    if(startNode.length > 0 && endNode.length > 0) return;
    // set start
    else if (startNode.length === 0) {
    this.props.onMessage('choose end position')
     nodes[i][j].startNode = true;
     nodes[i][j].visited = true;
     nodes[i][j].distance = 0;
     nodes[i][j].obstacleFree = true;
     const startNode = [i,j]
     this.setState({nodes, startNode})
    } else {
      // same position check
      if(JSON.stringify(startNode) === JSON.stringify(nodes[i][j].position))
        return this.props.onMessage("start and end can't have same position")
      else {
         // set end
        this.props.onMessage('click play to start');
        nodes[i][j].endNode = true;
        nodes[i][j].obstacleFree = true;
        const endNode = [i,j]
        this.setState({nodes, endNode})
      }
    }   
  };

  // prettier-ignore
  generatePath = (mode,startNode = this.state.nodes[this.state.startNode[0]][[this.state.startNode[1]]]) => {
    const { nodes, height, width } = this.state;

    let curNode = startNode
    const path = []

    // from start node go to random neighbour then from that node go to random neighbour and so on till end node is reached

    return new Promise((resolve) => {
      let search = setInterval(() => {

        path.push(curNode)

        if(curNode.endNode) {
          clearInterval(search)
          resolve(path)
        }
        
        const neighbours = this.getNeighbours(curNode, 'initial');
        // if it has nowhere to go ( all neighbours visited ), pick first unvisited of all and set it as current 
        if(neighbours.length === 0){
          for(let i=0;i<height;i++)
            for(let j=0;j<width;j++)
            if(nodes[i][j].discovered && !nodes[i][j].visited){
              curNode = nodes[i][j];
              break;
            }
        }
        else{
            const random = _.getRandom(neighbours.length);
            const x = neighbours[random].position[0];
            const y = neighbours[random].position[1];
            curNode = nodes[x][y]
          }
       }, 10)
    })
    .then(path => this.getPath(path, 'initial'))
  };

  //prettier-ignore
  getPath(path, mode) {
    const { nodes, width, height } = this.state;
    const { level, replayMode, numOfAlgs, currentAlg} = this.props;
    const endNode = path[path.length-1]; 
    const stack = new _.Stack();
    stack.push(endNode);
    // get path
    while(!stack.peek().startNode) stack.push(stack.peek().parent) // push parent of the current node on stack

    // return without updating ui
    if(mode === 'initial') return stack;

    // update ui
    else {
        for(let i=0;i<stack.length();i++){
          const x = stack.elements[i].position[0]
          const y = stack.elements[i].position[1]
          nodes[x][y].isPath = true;  
        }
        this.setState({ nodes })

        setTimeout(() => {
          this.setState({nodes})
          this.clearNodesForNextAlg(nodes)
          // since algorithm doesn't generate shortest path, game may end on different level for same start and end positions
          if (height * width - stack.length() < level && currentAlg === numOfAlgs)  this.props.onGameOver()
          else if (replayMode && currentAlg === numOfAlgs) this.props.onMessage("replay finished")
          else this.props.onNextLevel()
        }, 2000);
    }
  }

  //prettier-ignore
  generateInfo(algInfo) {
    const { level, numOfAlgs, replayMode } = this.props;
    const levelsInfo = [...this.state.levelsInfo];

    if(replayMode) return;
    
    const info = {name: algInfo.name, visited: algInfo.numOfVisited, timeTaken: algInfo.timeTaken, show: false}
    if (levelsInfo.length === level - 1)
      levelsInfo.push({ level, info: [info], show: info.show });
    else {
      for(let i=0;i<levelsInfo.length;i++)
        if(levelsInfo[i].level === level)
          levelsInfo[i].info.push(info)
    }
      this.setState({ levelsInfo }, ()=> {
          const last = levelsInfo[levelsInfo.length - 1];
          if (last.info.length === numOfAlgs) 
            this.props.onInfo(this.state.levelsInfo); 
      });
  }

  //prettier-ignore
  bfs = (mode,startNode = this.state.nodes[this.state.startNode[0]][[this.state.startNode[1]]]) => {

    this.props.onMessage('breadth first search running...')
    const queue = new _.Queue();
    const path = [];
    const info = { name: "breadth first search", 
                   numOfVisited: 0, 
                   timeTaken: new Date().getTime() / 1000 } // time taken here is start time

    queue.enqueue(startNode);
    let curNode = startNode;

    return new Promise((resolve)=> {
      let search = setInterval(() => {
        path.push(curNode)
        info.numOfVisited++;

        if(curNode.endNode) {
          clearInterval(search)
          resolve(path);
        }

        const neighbours = this.getNeighbours(curNode, mode);   
        for(let i=0;i<neighbours.length;i++) 
          queue.enqueue(neighbours[i])
  
        curNode = queue.dequeue()
    }, 20); 
    })
    .then(path => {
      this.props.onMessage("breadth first search complete")
      info.timeTaken = Number(new Date().getTime() / 1000 - info.timeTaken).toFixed(2)
      this.generateInfo(info);
      this.getPath(path, mode)
    })
  };

  //prettier-ignore
  dfs = (mode, startNode = this.state.nodes[this.state.startNode[0]][[this.state.startNode[1]]]) => {

    this.props.onMessage('depth first search running...')
    const stack = new _.Stack();
    let curNode = startNode;
    const path = [];

    const info = { name: "depth first search", 
                   numOfVisited: 0, 
                   timeTaken: new Date().getTime() / 1000 } // time taken here is start time
    
    stack.push(startNode);
    
      let search = setInterval(() => {
        path.push(curNode)
        info.numOfVisited++;
        if(curNode.endNode) {
          clearInterval(search);
          this.props.onMessage("depth first search complete")
          info.timeTaken = Number(new Date().getTime() / 1000 - info.timeTaken).toFixed(2)
          this.generateInfo(info)
          this.getPath(path, mode);
        }

        let neighbours = this.getNeighbours(curNode, mode); 
        for(let i=0;i<neighbours.length;i++)
          stack.push(neighbours[i])
  
        curNode = stack.pop()
    }, 20); 

  }

  //prettier-ignore
  bruteForce = (mode, startNode = this.state.nodes[this.state.startNode[0]][[this.state.startNode[1]]]) => {
    this.props.onMessage("brute force search running...");
    const stack = new _.Stack();
    let curNode = startNode;
    const path = [];

    const info = {name: "brute force",numOfVisited: 0,timeTaken: new Date().getTime() / 1000}; // time taken here is start time

    stack.push(startNode);

    

    let search = setInterval(() => {
      path.push(curNode);
      info.numOfVisited++;
      if (curNode.endNode) {
        clearInterval(search);
        this.props.onMessage("brute force search complete");
        info.timeTaken = Number(
          new Date().getTime() / 1000 - info.timeTaken
        ).toFixed(2);
        this.generateInfo(info);
        this.getPath(path, mode);
      }

      let neighbours = this.getNeighbours(curNode, mode);
      neighbours = _.shuffle(neighbours);
      for (let i = 0; i < neighbours.length; i++) stack.push(neighbours[i]);

      curNode = stack.pop();
    }, 20);
  };

  //prettier-ignore
  getNeighbours(curNode, mode) {
    const { nodes, width, height } = this.state
    const i = curNode.position[0], j = curNode.position[1];
    nodes[i][j].visited = true;
    const neighbours = [];
    // top 
    if(i-1 >= 0 && !nodes[i-1][j].discovered && !nodes[i-1][j].obstacle) {
        nodes[i-1][j].discovered = true;
        nodes[i-1][j].parent = curNode;
        nodes[i-1][j].distance = curNode.distance + 1;
        neighbours.push(nodes[i-1][j])
    }
    // right
    if(j+1 < width && !nodes[i][j+1].discovered && !nodes[i][j+1].obstacle) {
        nodes[i][j+1].discovered = true;
        nodes[i][j+1].parent = curNode;
        nodes[i][j+1].distance = curNode.distance + 1;
        neighbours.push(nodes[i][j+1])  
    }
    // down
    if(i+1 < height && !nodes[i+1][j].discovered  && !nodes[i+1][j].obstacle) {
        nodes[i+1][j].discovered = true;
        nodes[i+1][j].parent = curNode;
        nodes[i+1][j].distance = curNode.distance + 1
        neighbours.push(nodes[i+1][j])
    }
    // left
    if(j-1 >= 0 && !nodes[i][j-1].discovered  && !nodes[i][j-1].obstacle) {
        nodes[i][j-1].discovered = true;
        nodes[i][j-1].parent = curNode;
        nodes[i][j-1].distance = curNode.distance + 1;
        neighbours.push(nodes[i][j-1]) 
    }

    if(mode === 'initial') return neighbours
    else {
      this.setState({ nodes })
      return neighbours;
    }
  }

  getGridSize(height, width) {
    return {
      height: 27 * height,
      width: 27 * width,
      border: "3px solid blue",
    };
  }

  replayLevel = (level) => {
    const { nodes } = this.state;
    const { positions } = level;

    for (let i = 0; i < nodes.length; i++)
      for (let j = 0; j < nodes.length; j++) {
        nodes[i][j].visited = false;
        nodes[i][j].discovered = false;
        nodes[i][j].isPath = false;
        nodes[i][j].obstacle = false;
        nodes[i][j].obstacleFree = false;
      }

    this.setState({ nodes });

    setTimeout(() => {
      this.props.onMessage("click play to start replay");

      for (let i = 0; i < positions.length; i++) {
        const x = positions[i].position[0];
        const y = positions[i].position[1];
        if (!nodes[x][y].startNode && !nodes[x][y].endNode)
          nodes[x][y].obstacle = true;

        this.setState({ nodes });
      }
    }, 1500);
  };

  render() {
    const { height, width } = this.state;
    return (
      <div style={this.getGridSize(height, width)}>
        {this.state.nodes.map((e) =>
          e.map((e) => (
            <Node key={e.position} onStart={this.handlePlacement} info={e} />
          ))
        )}
      </div>
    );
  }
}

export default Grid;
