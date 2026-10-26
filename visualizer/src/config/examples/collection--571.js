// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unsorted frequency blocks place middle ranks across values",
    "input": "{\"numbers\":[{\"num\":18,\"frequency\":2},{\"num\":-7,\"frequency\":3},{\"num\":4,\"frequency\":4},{\"num\":30,\"frequency\":1},{\"num\":11,\"frequency\":2}]}"
  },
  {
    "label": "One repeated value owns both central ranks",
    "input": "{\"numbers\":[{\"num\":42,\"frequency\":8}]}"
  },
  {
    "label": "Even size averages two different middle values",
    "input": "{\"numbers\":[{\"num\":-5,\"frequency\":1},{\"num\":8,\"frequency\":1}]}"
  },
  {
    "label": "Odd size selects one central rank twice",
    "input": "{\"numbers\":[{\"num\":2,\"frequency\":2},{\"num\":9,\"frequency\":1},{\"num\":15,\"frequency\":2}]}"
  }
];
