// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal mappings bridge two strict improvements",
    "input": "{\"num\":\"314159265358\",\"change\":[0,7,2,3,4,9,6,7,8,9]}"
  },
  {
    "label": "No digit can improve",
    "input": "{\"num\":\"987654\",\"change\":[0,1,2,3,4,5,6,7,8,9]}"
  },
  {
    "label": "Stop before a decrease and ignore later improvements",
    "input": "{\"num\":\"15251\",\"change\":[0,8,2,3,4,0,6,7,8,9]}"
  },
  {
    "label": "Mutation begins with a zero digit",
    "input": "{\"num\":\"100204\",\"change\":[9,1,2,3,4,5,6,7,8,9]}"
  }
];
