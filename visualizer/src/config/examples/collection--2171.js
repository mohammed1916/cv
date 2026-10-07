// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Emptying small bags can beat trimming every bag",
    "input": "{\"beans\":[4,17,6,12,3,19,8,12,15]}"
  },
  {
    "label": "Equal bag sizes already satisfy the condition",
    "input": "{\"beans\":[7,7,7,7]}"
  },
  {
    "label": "One bag needs no removal",
    "input": "{\"beans\":[21]}"
  },
  {
    "label": "One huge bag can make emptying all small bags optimal",
    "input": "{\"beans\":[1,2,3,100]}"
  }
];
