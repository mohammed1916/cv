// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Distribute spaces from both ends and wide gaps",
    "input": "{\"text\":\"   cedar  grove     under  moon   \"}"
  },
  {
    "label": "One word gets trailing spaces",
    "input": "{\"text\":\"    fern  \"}"
  },
  {
    "label": "No spaces to move",
    "input": "{\"text\":\"oak\"}"
  },
  {
    "label": "Remainder follows the last word",
    "input": "{\"text\":\" a  b c \"}"
  }
];
