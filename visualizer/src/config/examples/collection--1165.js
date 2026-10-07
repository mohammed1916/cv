// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Travel on a reversed keyboard",
    "input": "{\"keyboard\":\"zyxwvutsrqponmlkjihgfedcba\",\"word\":\"cedarforest\"}"
  },
  {
    "label": "Repeated presses have zero movement",
    "input": "{\"keyboard\":\"abcdefghijklmnopqrstuvwxyz\",\"word\":\"aaaaa\"}"
  },
  {
    "label": "Jump between keyboard ends",
    "input": "{\"keyboard\":\"abcdefghijklmnopqrstuvwxyz\",\"word\":\"azaza\"}"
  },
  {
    "label": "Start at the first supplied key",
    "input": "{\"keyboard\":\"qwertyuiopasdfghjklzxcvbnm\",\"word\":\"qqq\"}"
  }
];
