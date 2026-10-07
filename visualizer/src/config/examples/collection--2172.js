// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several slot capacities compete for bitwise gains",
    "input": "{\"nums\":[7,3,5,2,6,1,4,7],\"numSlots\":4}"
  },
  {
    "label": "One slot accepts at most two values",
    "input": "{\"nums\":[2,7],\"numSlots\":1}"
  },
  {
    "label": "More slots than values leaves some unused",
    "input": "{\"nums\":[6,5],\"numSlots\":4}"
  },
  {
    "label": "Repeated values still consume separate capacity",
    "input": "{\"nums\":[3,3,3,3,3,3],\"numSlots\":3}"
  }
];
