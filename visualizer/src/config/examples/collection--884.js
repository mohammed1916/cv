// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicates within and across sentences",
    "input": "{\"s1\":\"cedar leaves drift past quiet cedar paths\",\"s2\":\"quiet streams carry leaves toward distant fields\"}"
  },
  {
    "label": "Same repeated word",
    "input": "{\"s1\":\"moss moss\",\"s2\":\"moss\"}"
  },
  {
    "label": "Disjoint short sentences",
    "input": "{\"s1\":\"red fox\",\"s2\":\"blue bird\"}"
  },
  {
    "label": "Repeated only within one sentence",
    "input": "{\"s1\":\"pine pine birch\",\"s2\":\"oak\"}"
  }
];
