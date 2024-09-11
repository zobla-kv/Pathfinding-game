<h3>Functionalities:</h3>
- Choose grid size and algorithms you want to run
- Observe Parallel run of the multiple algorithms on the same level
- After level is complete show statistics of each algorithm (number of nodes searched, time it took to find etc.)
- Watch replay of the level
<h3>1. Installation:</h3> 
clone --> open bash in cloned folder/code editor --> npm install --> npm start 
<h3>2. Notes:</h3> 
- grid height or width can't be 1 <br /> 
- replay can only be ran once current level is finished (when play button for starting next level appears) <br />
- when entering start/end positions, enter them with comma between, eg. 5,6 <br />
- button named "mode" will switch modes between "autoplay" and "manual" <br />
- dijkstra modified to use heuristic <br />
- algorithm search speed depends on grid size, will run slower as grid gets smaller
