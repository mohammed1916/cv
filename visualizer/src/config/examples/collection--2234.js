// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Completion rewards compete with raising the incomplete minimum",
    "input": "{\"flowers\":[2,8,4,11,6,3,9],\"newFlowers\":24,\"target\":10,\"full\":13,\"partial\":7}"
  },
  {
    "label": "All gardens already full have no partial component",
    "input": "{\"flowers\":[9,12,15],\"newFlowers\":20,\"target\":8,\"full\":5,\"partial\":100}"
  },
  {
    "label": "A strong partial reward can favor leaving one garden incomplete",
    "input": "{\"flowers\":[1,2,3],\"newFlowers\":30,\"target\":8,\"full\":2,\"partial\":20}"
  },
  {
    "label": "No new flowers preserves the existing full and minimum rewards",
    "input": "{\"flowers\":[3,7,10,4],\"newFlowers\":0,\"target\":7,\"full\":9,\"partial\":4}"
  }
];
