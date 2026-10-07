// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several Euclidean phases batch repeated subtraction runs",
    "input": "{\"num1\":233,\"num2\":89}"
  },
  {
    "label": "One number already zero needs no operation",
    "input": "{\"num1\":0,\"num2\":47}"
  },
  {
    "label": "Equal positive numbers reach zero in one subtraction",
    "input": "{\"num1\":36,\"num2\":36}"
  },
  {
    "label": "A small divisor compresses a long subtraction run",
    "input": "{\"num1\":999999,\"num2\":1}"
  }
];
