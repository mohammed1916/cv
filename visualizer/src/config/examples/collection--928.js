// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unique clean regions compete with a shared infected boundary",
    "input": "{\"graph\":[[1,0,1,0,0,0,0,1,0],[0,1,0,0,0,1,0,1,0],[1,0,1,1,0,0,0,0,0],[0,0,1,1,1,0,0,0,0],[0,0,0,1,1,0,0,0,0],[0,1,0,0,0,1,1,0,0],[0,0,0,0,0,1,1,0,0],[1,1,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,1,1]],\"initial\":[0,1]}"
  },
  {
    "label": "Removing a connector saves clean nodes beyond that infected vertex",
    "input": "{\"graph\":[[1,1,0,0,0,0],[1,1,1,0,0,0],[0,1,1,1,0,0],[0,0,1,1,1,0],[0,0,0,1,1,1],[0,0,0,0,1,1]],\"initial\":[0,1]}"
  },
  {
    "label": "Shared clean exposure yields no saved component and a tie",
    "input": "{\"graph\":[[1,0,1,0,0],[0,1,1,0,0],[1,1,1,1,0],[0,0,1,1,1],[0,0,0,1,1]],\"initial\":[1,0]}"
  },
  {
    "label": "An isolated infected node can be removed with no clean nodes saved",
    "input": "{\"graph\":[[1,0,0],[0,1,0],[0,0,1]],\"initial\":[2,0]}"
  }
];
