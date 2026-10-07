// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different water needs trigger several river returns",
    "input": "{\"plants\":[3,5,2,6,4,1,7,3],\"capacity\":9}"
  },
  {
    "label": "Exact remaining water does not require a refill",
    "input": "{\"plants\":[4,3,2],\"capacity\":9}"
  },
  {
    "label": "Every plant requires a full can",
    "input": "{\"plants\":[6,6,6,6],\"capacity\":6}"
  },
  {
    "label": "One plant is one step away",
    "input": "{\"plants\":[5],\"capacity\":8}"
  }
];
