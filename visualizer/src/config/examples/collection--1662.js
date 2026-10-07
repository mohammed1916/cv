// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different chunk boundaries describe one phrase",
    "input": "{\"word1\":[\"pine\",\"fo\",\"rest\",\"path\"],\"word2\":[\"pi\",\"neforest\",\"pa\",\"th\"]}"
  },
  {
    "label": "Same prefix but different length",
    "input": "{\"word1\":[\"cedar\"],\"word2\":[\"ce\",\"dars\"]}"
  },
  {
    "label": "Different middle character",
    "input": "{\"word1\":[\"moss\",\"y\"],\"word2\":[\"most\",\"y\"]}"
  },
  {
    "label": "Single identical chunks",
    "input": "{\"word1\":[\"fern\"],\"word2\":[\"fern\"]}"
  }
];
