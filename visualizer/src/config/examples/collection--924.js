// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Only uniquely infected components can be saved",
    "input": "{\"graph\":[[1,1,0,0,0,0,0,0,0],[1,1,1,0,0,0,0,0,0],[0,1,1,1,0,0,0,0,0],[0,0,1,1,0,0,0,0,0],[0,0,0,0,1,1,0,0,0],[0,0,0,0,1,1,1,0,0],[0,0,0,0,0,1,1,0,0],[0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,1,1]],\"initial\":[0,4,6,8]}"
  },
  {
    "label": "Two infected nodes cannot save their shared component by clearing one",
    "input": "{\"graph\":[[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]],\"initial\":[3,1]}"
  },
  {
    "label": "Equal saved sizes choose the smaller node index",
    "input": "{\"graph\":[[1,1,0,0,0,0],[1,1,0,0,0,0],[0,0,1,1,0,0],[0,0,1,1,0,0],[0,0,0,0,1,1],[0,0,0,0,1,1]],\"initial\":[4,2]}"
  },
  {
    "label": "A single infection can save its whole connected component",
    "input": "{\"graph\":[[1,1,0,0,0],[1,1,1,0,0],[0,1,1,1,0],[0,0,1,1,1],[0,0,0,1,1]],\"initial\":[3]}"
  }
];
