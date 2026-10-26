// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A wandering prefix constrains both ends of the starting interval",
    "input": "{\"differences\":[3,-5,4,2,-6,1,5,-2],\"lower\":-4,\"upper\":9}"
  },
  {
    "label": "A prefix range wider than the bounds is impossible",
    "input": "{\"differences\":[8,-2,5],\"lower\":0,\"upper\":6}"
  },
  {
    "label": "Zero differences allow every bounded starting value",
    "input": "{\"differences\":[0,0,0,0],\"lower\":-3,\"upper\":4}"
  },
  {
    "label": "Exactly one translation fits",
    "input": "{\"differences\":[2,-5,3],\"lower\":-3,\"upper\":2}"
  }
];
