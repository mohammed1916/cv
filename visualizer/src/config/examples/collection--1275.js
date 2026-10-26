// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A wins the last open row position",
    "input": "{\"moves\":[[0,0],[1,0],[0,2],[1,2],[2,1],[2,0],[0,1]]}"
  },
  {
    "label": "B completes a diagonal",
    "input": "{\"moves\":[[0,1],[0,0],[1,0],[1,1],[2,1],[2,2]]}"
  },
  {
    "label": "Game still pending",
    "input": "{\"moves\":[[1,1],[0,0],[2,2],[0,2]]}"
  },
  {
    "label": "A full board with no winner",
    "input": "{\"moves\":[[0,0],[0,1],[0,2],[1,1],[1,0],[1,2],[2,1],[2,0],[2,2]]}"
  }
];
