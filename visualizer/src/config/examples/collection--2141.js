// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven batteries require energy redistribution through swaps",
    "input": "{\"n\":3,\"batteries\":[4,11,7,18,6,9,3]}"
  },
  {
    "label": "One computer can consume every battery in sequence",
    "input": "{\"n\":1,\"batteries\":[5,8,2,11]}"
  },
  {
    "label": "Exactly one battery per computer is limited by the smallest",
    "input": "{\"n\":3,\"batteries\":[9,4,16]}"
  },
  {
    "label": "A huge battery cannot power two computers simultaneously",
    "input": "{\"n\":2,\"batteries\":[100,1,1]}"
  }
];
