// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several original sentences have different lengths",
    "input": "{\"sentences\":[\"lanterns glow beside the quiet river\",\"we carry warm bread through the old garden gate\",\"rain arrives\",\"small boats drift beneath silver clouds\"]}"
  },
  {
    "label": "One word is still one complete sentence",
    "input": "{\"sentences\":[\"harbor\"]}"
  },
  {
    "label": "Equal word counts share the maximum",
    "input": "{\"sentences\":[\"green leaves sway\",\"bright stars shine\",\"calm waters ripple\"]}"
  },
  {
    "label": "A later sentence establishes the maximum",
    "input": "{\"sentences\":[\"we wait\",\"birds sing nearby\",\"a winding path reaches the distant village\"]}"
  }
];
