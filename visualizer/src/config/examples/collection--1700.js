// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Preferences exhaust before the sandwich stack ends",
    "input": "{\"students\":[0,1,0,1,1,0,1,0,1,1],\"sandwiches\":[1,0,1,0,0,1,0,0,1,1]}"
  },
  {
    "label": "Every student can eat",
    "input": "{\"students\":[1,0,1,0],\"sandwiches\":[0,0,1,1]}"
  },
  {
    "label": "Top sandwich blocks everyone",
    "input": "{\"students\":[1,1,1],\"sandwiches\":[0,1,1]}"
  },
  {
    "label": "One matching student",
    "input": "{\"students\":[0],\"sandwiches\":[0]}"
  }
];
