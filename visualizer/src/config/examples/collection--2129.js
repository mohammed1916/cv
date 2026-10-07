// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed case and short connectors follow different rules",
    "input": "{\"title\":\"a QUIET riVER OF bRIGHT lanTERNS IN the NIGHT\"}"
  },
  {
    "label": "One-letter and two-letter words stay lowercase",
    "input": "{\"title\":\"A I To OF BY aN\"}"
  },
  {
    "label": "A single long word is normalized",
    "input": "{\"title\":\"hARBOR\"}"
  },
  {
    "label": "Already normalized words remain stable",
    "input": "{\"title\":\"Green Leaves in the Garden\"}"
  }
];
