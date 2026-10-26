// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unequal cans run out on different inward steps",
    "input": "{\"plants\":[3,5,2,6,4,1,5,3,2,4,6],\"capacityA\":9,\"capacityB\":11}"
  },
  {
    "label": "One middle plant uses the fuller initial can",
    "input": "{\"plants\":[7],\"capacityA\":8,\"capacityB\":12}"
  },
  {
    "label": "Every plant exactly empties a can",
    "input": "{\"plants\":[4,4,4,4,4,4],\"capacityA\":4,\"capacityB\":4}"
  },
  {
    "label": "An odd middle needs a final refill",
    "input": "{\"plants\":[4,5,4],\"capacityA\":6,\"capacityB\":6}"
  }
];
