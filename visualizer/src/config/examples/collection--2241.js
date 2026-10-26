// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Deposits and successful withdrawals change later availability",
    "input": "{\"operations\":[[\"deposit\",[4,2,3,1,2]],[\"withdraw\",770],[\"withdraw\",60],[\"withdraw\",600],[\"deposit\",[2,1,0,1,0]],[\"withdraw\",250],[\"withdraw\",85]]}"
  },
  {
    "label": "Greedy preference may reject a non-greedy possible amount",
    "input": "{\"operations\":[[\"deposit\",[0,0,0,3,1]],[\"withdraw\",600],[\"withdraw\",500],[\"withdraw\",600]]}"
  },
  {
    "label": "An empty ATM cannot fulfill a withdrawal",
    "input": "{\"operations\":[[\"withdraw\",20],[\"deposit\",[1,0,0,0,0]],[\"withdraw\",20]]}"
  },
  {
    "label": "A failed attempt must preserve notes for a later request",
    "input": "{\"operations\":[[\"deposit\",[1,1,0,0,0]],[\"withdraw\",60],[\"withdraw\",70]]}"
  }
];
