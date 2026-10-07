// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several excess character types compete for a short replacement",
    "input": "{\"s\":\"QQQQWWWWEERRQQER\"}"
  },
  {
    "label": "An already balanced string needs no replacement",
    "input": "{\"s\":\"QWERREWQ\"}"
  },
  {
    "label": "One repeated character needs three quarters replaced",
    "input": "{\"s\":\"QQQQQQQQ\"}"
  },
  {
    "label": "A tiny replacement can repair one surplus and deficit",
    "input": "{\"s\":\"QWERRQWQ\"}"
  }
];
