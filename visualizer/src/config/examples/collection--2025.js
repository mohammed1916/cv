// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One replacement repairs different splits on either side",
    "input": "{\"nums\":[5,-2,3,0,4,-1,2,1],\"k\":3}"
  },
  {
    "label": "Keeping the original already maximizes balanced splits",
    "input": "{\"nums\":[0,0,0,0,0],\"k\":9}"
  },
  {
    "label": "Two values have only one possible split",
    "input": "{\"nums\":[4,11],\"k\":4}"
  },
  {
    "label": "Replacement equal to an existing value changes nothing there",
    "input": "{\"nums\":[2,2,2,2,2,2],\"k\":2}"
  }
];
