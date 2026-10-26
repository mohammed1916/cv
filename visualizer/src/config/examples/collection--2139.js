// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Limited halvings combine with forced odd decrements",
    "input": "{\"target\":93,\"maxDoubles\":4}"
  },
  {
    "label": "No doubling permits only increments from one",
    "input": "{\"target\":37,\"maxDoubles\":0}"
  },
  {
    "label": "The starting value needs no moves",
    "input": "{\"target\":1,\"maxDoubles\":8}"
  },
  {
    "label": "A power of two uses repeated halving",
    "input": "{\"target\":128,\"maxDoubles\":10}"
  }
];
