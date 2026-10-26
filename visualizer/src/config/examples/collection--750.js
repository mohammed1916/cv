// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated one-column pairs form rectangles across several rows",
    "input": "{\"grid\":[[1,0,1,1,0],[1,1,1,0,1],[0,1,1,1,1],[1,0,1,1,1]]}"
  },
  {
    "label": "A single row cannot make a rectangle",
    "input": "{\"grid\":[[1,1,1,1]]}"
  },
  {
    "label": "A full three-by-four grid combines all row and column pairs",
    "input": "{\"grid\":[[1,1,1,1],[1,1,1,1],[1,1,1,1]]}"
  },
  {
    "label": "One one per row yields no corner pairs",
    "input": "{\"grid\":[[1,0,0],[0,1,0],[0,0,1]]}"
  }
];
