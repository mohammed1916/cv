// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated keys have independent press durations",
    "input": "{\"releaseTimes\":[4,11,16,27,33,44,49,60],\"keysPressed\":\"cedarmap\"}"
  },
  {
    "label": "Lexicographically larger key wins a tie",
    "input": "{\"releaseTimes\":[5,10,15],\"keysPressed\":\"azm\"}"
  },
  {
    "label": "First press is longest",
    "input": "{\"releaseTimes\":[19,23,26,28],\"keysPressed\":\"pine\"}"
  },
  {
    "label": "Single key",
    "input": "{\"releaseTimes\":[17],\"keysPressed\":\"q\"}"
  }
];
