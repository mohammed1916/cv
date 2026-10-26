// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Targets lie beneath different branches of a deeper tree",
    "input": "{\"root\":[40,18,65,9,27,52,81,null,12,23,31,47,59,74,90],\"startValue\":12,\"destValue\":59}"
  },
  {
    "label": "Start is the root so no upward step is needed",
    "input": "{\"root\":[8,3,14,null,6,11,19],\"startValue\":8,\"destValue\":11}"
  },
  {
    "label": "Destination is an ancestor of the start",
    "input": "{\"root\":[20,10,30,5,15,null,35],\"startValue\":15,\"destValue\":10}"
  },
  {
    "label": "A skewed tree preserves missing child positions",
    "input": "{\"root\":[4,null,9,null,16,null,25],\"startValue\":9,\"destValue\":25}"
  }
];
