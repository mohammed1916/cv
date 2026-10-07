// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Reachable launch windows cross several blocked stretches",
    "input": "{\"s\":\"00100101000010000100\",\"minJump\":3,\"maxJump\":5}"
  },
  {
    "label": "Last position is blocked",
    "input": "{\"s\":\"00001\",\"minJump\":1,\"maxJump\":3}"
  },
  {
    "label": "No legal first landing",
    "input": "{\"s\":\"011100\",\"minJump\":1,\"maxJump\":2}"
  },
  {
    "label": "Fixed jump distance",
    "input": "{\"s\":\"0010010010\",\"minJump\":3,\"maxJump\":3}"
  }
];
