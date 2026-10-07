// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different runs keep their most expensive balloon",
    "input": "{\"colors\":\"aaabccddddeeffa\",\"neededTime\":[4,9,2,6,8,3,5,12,7,1,3,10,6,2,11]}"
  },
  {
    "label": "No adjacent equal colors",
    "input": "{\"colors\":\"abcde\",\"neededTime\":[5,3,8,2,9]}"
  },
  {
    "label": "One repeated run",
    "input": "{\"colors\":\"zzzz\",\"neededTime\":[4,11,2,7]}"
  },
  {
    "label": "One balloon",
    "input": "{\"colors\":\"q\",\"neededTime\":[8]}"
  }
];
