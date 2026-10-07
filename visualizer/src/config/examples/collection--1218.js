// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Useful predecessors appear among distracting values",
    "input": "{\"arr\":[8,3,6,1,4,-1,2,-3,0,-5,-2],\"difference\":-2}"
  },
  {
    "label": "Zero difference extends repeated values",
    "input": "{\"arr\":[6,2,6,6,3,6],\"difference\":0}"
  },
  {
    "label": "Positive difference chain",
    "input": "{\"arr\":[2,5,8,11,14],\"difference\":3}"
  },
  {
    "label": "No predecessor ever appears",
    "input": "{\"arr\":[1,4,7,10],\"difference\":2}"
  }
];
