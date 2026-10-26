// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several words depend on different broken keys",
    "input": "{\"text\":\"silver lantern beside quiet river under maple branches\",\"brokenLetters\":\"vq\"}"
  },
  {
    "label": "No keys are broken",
    "input": "{\"text\":\"morning birds cross open fields\",\"brokenLetters\":\"\"}"
  },
  {
    "label": "Every word needs the same broken key",
    "input": "{\"text\":\"amber acacia atlas\",\"brokenLetters\":\"a\"}"
  },
  {
    "label": "Repeated words count separately",
    "input": "{\"text\":\"fern moss fern moss\",\"brokenLetters\":\"s\"}"
  }
];
