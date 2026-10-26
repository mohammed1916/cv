// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A longer message contains internal spaces and trailing padding",
    "input": "{\"encodedText\":\"reltnl   irae o   v nrgw\",\"rows\":3}"
  },
  {
    "label": "One row preserves internal spaces",
    "input": "{\"encodedText\":\"quiet harbor  \",\"rows\":1}"
  },
  {
    "label": "Only padding decodes to an empty message",
    "input": "{\"encodedText\":\"        \",\"rows\":2}"
  },
  {
    "label": "A diagonal stops at the right edge before the last row",
    "input": "{\"encodedText\":\"ab c    \",\"rows\":4}"
  }
];
