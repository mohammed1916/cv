// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Direct moves and skyline searches answer several start pairs",
    "input": "{\"heights\":[8,3,6,2,10,7,12,5,14],\"queries\":[[0,2],[1,3],[4,5],[6,8],[7,7],[8,0],[6,7]]}"
  },
  {
    "label": "Equal heights do not permit a strict upward move",
    "input": "{\"heights\":[5,5,5,5],\"queries\":[[0,1],[1,3],[2,2]]}"
  },
  {
    "label": "An increasing skyline resolves pairs at their right start",
    "input": "{\"heights\":[2,4,7,11],\"queries\":[[0,2],[3,1],[1,1]]}"
  },
  {
    "label": "A descending skyline has no later taller meeting",
    "input": "{\"heights\":[12,9,6,3],\"queries\":[[0,1],[1,2],[2,3]]}"
  }
];
