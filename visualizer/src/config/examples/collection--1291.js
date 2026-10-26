// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several digit lengths share one inclusive range",
    "input": "{\"low\":250,\"high\":90000}"
  },
  {
    "label": "No sequential number in the interval",
    "input": "{\"low\":800,\"high\":850}"
  },
  {
    "label": "A candidate exactly matches both bounds",
    "input": "{\"low\":4567,\"high\":4567}"
  },
  {
    "label": "Highest possible sequential value",
    "input": "{\"low\":100000000,\"high\":1000000000}"
  }
];
