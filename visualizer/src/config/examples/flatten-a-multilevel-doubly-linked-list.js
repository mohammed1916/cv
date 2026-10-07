// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Child chain interrupts a longer level",
    "structure": "4->8->12->16->20->null with child [24->28->32->null] at 12"
  },
  {
    "label": "No child chain",
    "structure": "3->7->11->15->null"
  },
  {
    "label": "Child at head",
    "structure": "9->13->null with child [17->21->null] at 9"
  }
];
