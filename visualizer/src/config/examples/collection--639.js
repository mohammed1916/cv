// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Wildcards and zeros require both single and pair multiplicities",
    "input": "{\"s\":\"*1*0*2*8*\"}"
  },
  {
    "label": "A leading zero prevents every decoding",
    "input": "{\"s\":\"03*7\"}"
  },
  {
    "label": "Two wildcard pairs around zero change pair availability",
    "input": "{\"s\":\"**0**\"}"
  },
  {
    "label": "A wildcard after three cannot join it into a letter",
    "input": "{\"s\":\"3*7\"}"
  }
];
