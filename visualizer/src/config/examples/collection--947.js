// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Row and column chains connect stones across a larger cluster",
    "input": "{\"stones\":[[1,2],[1,6],[4,6],[4,9],[7,9],[10,3],[12,3],[15,15]]}"
  },
  {
    "label": "A single stone cannot be removed",
    "input": "{\"stones\":[[8,11]]}"
  },
  {
    "label": "Distinct rows and columns keep every stone isolated",
    "input": "{\"stones\":[[1,2],[3,4],[5,6],[7,8]]}"
  },
  {
    "label": "One shared row permits all but one removal",
    "input": "{\"stones\":[[6,1],[6,4],[6,9],[6,13]]}"
  }
];
