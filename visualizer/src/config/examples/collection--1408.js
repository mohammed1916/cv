// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several words contain other input words",
    "input": "{\"words\":[\"forest\",\"rest\",\"pinecone\",\"cone\",\"pine\",\"cedar\",\"ore\"]}"
  },
  {
    "label": "No word is contained in another",
    "input": "{\"words\":[\"oak\",\"fir\",\"elm\"]}"
  },
  {
    "label": "Containment can cross several lengths",
    "input": "{\"words\":[\"a\",\"rain\",\"train\",\"training\"]}"
  },
  {
    "label": "A lone word cannot match itself",
    "input": "{\"words\":[\"moss\"]}"
  }
];
