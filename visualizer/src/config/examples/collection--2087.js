// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Home lies across several required rows and columns",
    "input": "{\"startPos\":[4,1],\"homePos\":[1,5],\"rowCosts\":[8,3,11,6,9,4],\"colCosts\":[7,5,2,13,4,10,6]}"
  },
  {
    "label": "Starting at home costs nothing",
    "input": "{\"startPos\":[1,2],\"homePos\":[1,2],\"rowCosts\":[5,8,3],\"colCosts\":[4,9,6,2]}"
  },
  {
    "label": "Only row costs are needed",
    "input": "{\"startPos\":[0,1],\"homePos\":[3,1],\"rowCosts\":[100,2,7,4],\"colCosts\":[9,11]}"
  },
  {
    "label": "Zero-cost required crossings remain free",
    "input": "{\"startPos\":[1,0],\"homePos\":[0,2],\"rowCosts\":[0,7],\"colCosts\":[5,0,0]}"
  }
];
