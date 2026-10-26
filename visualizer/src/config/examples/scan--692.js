// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Frequency ranking with lexical ties",
    "input": "{\"words\":[\"cedar\",\"elm\",\"birch\",\"cedar\",\"maple\",\"elm\",\"birch\",\"cedar\",\"fir\",\"elm\",\"fir\",\"ash\"],\"k\":4}"
  },
  {
    "label": "All equally frequent",
    "input": "{\"words\":[\"pear\",\"apple\",\"plum\",\"fig\"],\"k\":3}"
  },
  {
    "label": "Only one distinct word",
    "input": "{\"words\":[\"moss\",\"moss\",\"moss\"],\"k\":1}"
  },
  {
    "label": "Ask for all distinct words",
    "input": "{\"words\":[\"oak\",\"pine\",\"oak\",\"fir\"],\"k\":3}"
  }
];
