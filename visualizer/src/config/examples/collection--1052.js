// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A sliding calm interval competes across several busy periods",
    "input": "{\"customers\":[4,9,2,7,5,8,3,11,6,4,10,2],\"grumpy\":[0,1,1,0,1,1,0,1,0,1,1,0],\"minutes\":4}"
  },
  {
    "label": "Nobody was grumpy, so recovery adds nothing",
    "input": "{\"customers\":[3,7,4,9],\"grumpy\":[0,0,0,0],\"minutes\":2}"
  },
  {
    "label": "The interval covers every minute",
    "input": "{\"customers\":[6,2,8,4],\"grumpy\":[1,0,1,1],\"minutes\":4}"
  },
  {
    "label": "Zero-customer minutes can enter and leave the window",
    "input": "{\"customers\":[0,5,0,7,0],\"grumpy\":[1,1,0,1,1],\"minutes\":1}"
  }
];
