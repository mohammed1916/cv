// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Separated X runs require different covering choices",
    "input": "{\"s\":\"XOOXXOXOOXXXOX\"}"
  },
  {
    "label": "Already converted text needs no moves",
    "input": "{\"s\":\"OOOOOOOO\"}"
  },
  {
    "label": "A final X uses a full segment shifted left",
    "input": "{\"s\":\"OOOOOX\"}"
  },
  {
    "label": "The smallest all-X string",
    "input": "{\"s\":\"XXX\"}"
  }
];
