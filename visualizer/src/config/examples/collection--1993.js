// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Upgrade consolidates several descendant owners",
    "input": "{\"parent\":[-1,0,0,1,1,2,2,3,3],\"operations\":[[\"lock\",7,11],[\"lock\",4,22],[\"unlock\",7,22],[\"upgrade\",1,33],[\"lock\",8,44],[\"upgrade\",3,55],[\"unlock\",1,33],[\"upgrade\",0,66]]}"
  },
  {
    "label": "Upgrade fails when no descendant is locked",
    "input": "{\"parent\":[-1,0,0],\"operations\":[[\"upgrade\",0,7],[\"lock\",1,8],[\"unlock\",1,8],[\"upgrade\",0,7]]}"
  },
  {
    "label": "A locked ancestor blocks upgrade but not ordinary lock",
    "input": "{\"parent\":[-1,0,1,2],\"operations\":[[\"lock\",0,9],[\"lock\",3,10],[\"upgrade\",1,11],[\"unlock\",0,9],[\"upgrade\",1,11]]}"
  },
  {
    "label": "Only the owner may unlock an already locked node",
    "input": "{\"parent\":[-1,0],\"operations\":[[\"lock\",1,4],[\"lock\",1,5],[\"unlock\",1,5],[\"unlock\",1,4]]}"
  },
  {
    "label": "Single node",
    "input": "{\"parent\":[-1],\"operations\":[[\"lock\",0,1]]}"
  },
  {
    "label": "Repeated lock and unlock by one user",
    "input": "{\"parent\":[-1,0],\"operations\":[[\"lock\",1,2],[\"unlock\",1,2],[\"lock\",1,2]]}"
  },
  {
    "label": "Chain of twelve nodes",
    "input": "{\"parent\":[-1,0,1,2,3,4,5,6,7,8,9,10],\"operations\":[[\"lock\",11,3],[\"upgrade\",10,4],[\"unlock\",11,3],[\"lock\",0,5]]}"
  },
  {
    "label": "Long run: 12 nodes, 20 operations",
    "input": "{\"parent\":[-1,0,1,2,3,2,0,3,4,3,2,0],\"operations\":[[\"lock\",10,8],[\"unlock\",5,6],[\"lock\",1,2],[\"lock\",10,3],[\"upgrade\",4,3],[\"unlock\",8,7],[\"lock\",8,8],[\"upgrade\",9,1],[\"unlock\",2,1],[\"lock\",4,3],[\"lock\",2,6],[\"upgrade\",1,6],[\"upgrade\",4,5],[\"lock\",4,7],[\"lock\",10,7],[\"unlock\",8,8],[\"lock\",5,3],[\"unlock\",0,4],[\"lock\",5,8],[\"lock\",8,1]]}"
  }
];
