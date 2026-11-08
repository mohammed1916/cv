// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Negative values and zeros inside the three sections",
    "input": "{\"arr\":[4,-1,2,0,7,-3,1,2,-2,5,0]}"
  },
  {
    "label": "Zero total still requires three nonempty parts",
    "input": "{\"arr\":[0,0,0,0,0]}"
  },
  {
    "label": "Total is not divisible by three",
    "input": "{\"arr\":[1,2,4,1]}"
  },
  {
    "label": "Divisible total but no valid pair of cuts",
    "input": "{\"arr\":[2,2,2,3]}"
  },
  {
    "label": "Three zeros",
    "input": "{\"arr\":[0,0,0]}"
  },
  {
    "label": "Equal values",
    "input": "{\"arr\":[4,4,4,4,4]}"
  },
  {
    "label": "Twelve values at the extremes",
    "input": "{\"arr\":[10,-10,10,-10,10,-10,10,-10,10,-10,10,-10]}"
  },
  {
    "label": "Long run: 12 values",
    "input": "{\"arr\":[6,2,-1,9,-8,-5,7,-10,-3,-9,-5,-8]}"
  },
];
