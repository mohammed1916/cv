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
  }
];
