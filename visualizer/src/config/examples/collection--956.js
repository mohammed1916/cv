// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rods can be skipped or assigned to either support",
    "input": "{\"rods\":[3,8,5,11,7,4,6]}"
  },
  {
    "label": "Equal rods make two matching supports directly",
    "input": "{\"rods\":[9,9]}"
  },
  {
    "label": "No nonempty equal supports leaves height zero",
    "input": "{\"rods\":[2,5]}"
  },
  {
    "label": "The tallest equal result may skip a long outlier",
    "input": "{\"rods\":[4,6,10,27]}"
  }
];
