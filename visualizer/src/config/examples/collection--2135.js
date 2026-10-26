// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different deleted letters reveal several source masks",
    "input": "{\"startWords\":[\"fern\",\"oak\",\"redx\",\"pine\",\"ash\",\"elm\"],\"targetWords\":[\"infer\",\"koal\",\"pines\",\"flash\",\"helms\",\"bark\"]}"
  },
  {
    "label": "A target with no matching reduced set is rejected",
    "input": "{\"startWords\":[\"abc\",\"def\"],\"targetWords\":[\"abxy\",\"deyz\"]}"
  },
  {
    "label": "A one-letter source can gain one distinct letter",
    "input": "{\"startWords\":[\"q\"],\"targetWords\":[\"qt\",\"tq\",\"qx\"]}"
  },
  {
    "label": "Rearrangement alone is insufficient without an added letter",
    "input": "{\"startWords\":[\"abc\"],\"targetWords\":[\"bca\",\"abcd\"]}"
  }
];
