// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several successive mutations",
    "start": "ACGTACGT",
    "end": "TCGAACGA",
    "bank": [
      "TCGTACGT",
      "TCGAACGT",
      "TCGAACGA",
      "ACGAACGT"
    ]
  },
  {
    "label": "Target missing",
    "start": "GATTACAA",
    "end": "GATTACAG",
    "bank": [
      "GATTACAT"
    ]
  },
  {
    "label": "One mutation",
    "start": "CCGGAATT",
    "end": "CCGGAATC",
    "bank": [
      "CCGGAATC"
    ]
  },
  {
    "label": "Target isolated",
    "start": "AAAACCCC",
    "end": "GGGGTTTT",
    "bank": [
      "GGGGTTTT",
      "AAAACCCA"
    ]
  }
];
