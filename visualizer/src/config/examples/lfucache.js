// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Frequency then recency breaks ties",
    "capacity": 3,
    "ops": [
      {
        "type": "put",
        "key": 11,
        "val": 41
      },
      {
        "type": "put",
        "key": 22,
        "val": 52
      },
      {
        "type": "put",
        "key": 33,
        "val": 63
      },
      {
        "type": "get",
        "key": 11
      },
      {
        "type": "get",
        "key": 22
      },
      {
        "type": "put",
        "key": 44,
        "val": 74
      },
      {
        "type": "get",
        "key": 33
      },
      {
        "type": "put",
        "key": 55,
        "val": 85
      },
      {
        "type": "get",
        "key": 44
      },
      {
        "type": "get",
        "key": 11
      }
    ]
  },
  {
    "label": "Zero capacity",
    "capacity": 0,
    "ops": [
      {
        "type": "put",
        "key": 7,
        "val": 17
      },
      {
        "type": "get",
        "key": 7
      }
    ]
  },
  {
    "label": "Update existing value",
    "capacity": 1,
    "ops": [
      {
        "type": "put",
        "key": 5,
        "val": 15
      },
      {
        "type": "put",
        "key": 5,
        "val": 35
      },
      {
        "type": "get",
        "key": 5
      },
      {
        "type": "put",
        "key": 8,
        "val": 18
      },
      {
        "type": "get",
        "key": 5
      }
    ]
  }
];
