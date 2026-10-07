// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Border ones enclose interior zeros",
    "input": "{\"grid\":[[1,1,1,1,0],[1,0,0,1,1],[1,0,0,1,0],[1,1,1,1,1],[0,1,0,1,1]]}"
  },
  {
    "label": "No ones",
    "input": "{\"grid\":[[0,0],[0,0]]}"
  },
  {
    "label": "Only singleton squares",
    "input": "{\"grid\":[[1,0,1],[0,1,0]]}"
  },
  {
    "label": "Entire grid border qualifies",
    "input": "{\"grid\":[[1,1,1],[1,0,1],[1,1,1]]}"
  }
];
