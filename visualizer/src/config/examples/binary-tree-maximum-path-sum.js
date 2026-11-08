// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Best path excludes a negative ancestor",
    "input": "[-12,8,17,4,11,-9,23,null,6,-3,5]"
  },
  {
    "label": "All negative",
    "input": "[-8,-3,-14,-9,-6]"
  },
  {
    "label": "Chain",
    "input": "[4,null,-2,null,9,null,7]"
  },
  {
    "label": "Singleton",
    "input": "[17]"
  },
  {
    "label": "Equal values on a route",
    "input": "[2,2,2,2,2]"
  },
  {
    "label": "Boundary values at the limit",
    "input": "[1000,-1000,1000,null,null,-1000,1000]"
  },
  {
    "label": "Long run: 15 values",
    "input": "[89,38,55,92,-83,-9,78,69,44,19,4,-12,-74,-7,95]"
  }
];
