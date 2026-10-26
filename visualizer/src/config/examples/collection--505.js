// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several long rolls compete around staggered walls",
    "input": "{\"maze\":[[0,0,0,0,0,0,0],[0,1,1,0,1,1,0],[0,0,0,0,0,0,0],[1,0,1,1,1,0,1],[0,0,0,0,0,0,0],[0,1,0,1,0,1,0]],\"start\":[0,0],\"destination\":[5,6]}"
  },
  {
    "label": "The ball passes the target but cannot stop there",
    "input": "{\"maze\":[[0,0,0,0,0,0]],\"start\":[0,0],\"destination\":[0,3]}"
  },
  {
    "label": "Separated chambers have no route",
    "input": "{\"maze\":[[0,0,1,0],[0,0,1,0],[0,0,1,0]],\"start\":[0,0],\"destination\":[2,3]}"
  },
  {
    "label": "A single corridor counts every traversed cell",
    "input": "{\"maze\":[[0],[0],[0],[0],[0]],\"start\":[0,0],\"destination\":[4,0]}"
  }
];
