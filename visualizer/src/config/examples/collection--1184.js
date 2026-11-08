// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unequal forward and complementary routes",
    "input": "{\"distance\":[7,3,11,4,6,2,9,5],\"start\":6,\"destination\":2}"
  },
  {
    "label": "Same stop needs no travel",
    "input": "{\"distance\":[3,8,2],\"start\":1,\"destination\":1}"
  },
  {
    "label": "Equal routes",
    "input": "{\"distance\":[4,7,4,7],\"start\":0,\"destination\":2}"
  },
  {
    "label": "Zero-weight edges",
    "input": "{\"distance\":[0,0,9,2],\"start\":0,\"destination\":2}"
  },
  {
    "label": "Single stop",
    "input": "{\"distance\":[5],\"start\":0,\"destination\":0}"
  },
  {
    "label": "Adjacent stops",
    "input": "{\"distance\":[9,1],\"start\":1,\"destination\":0}"
  },
  {
    "label": "Largest edge lengths",
    "input": "{\"distance\":[10000,10000,0,10000],\"start\":0,\"destination\":3}"
  },
  {
    "label": "Long run: 60 edges",
    "input": "{\"distance\":[327,1318,4552,8698,9986,2311,1416,2700,228,7840,9523,7790,1320,7596,5979,1104,6678,5680,180,7513,5949,576,9932,182,4562,8651,6531,5117,7003,1533,7670,1627,8261,6624,9402,4809,3266,859,1496,9052,4278,506,3594,4053,6141,4290,5754,4776,2426,3031,2260,7569,598,7967,933,5108,8016,1611,9667,3037],\"start\":17,\"destination\":42}"
  }
];
