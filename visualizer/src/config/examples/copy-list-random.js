// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Forward backward self and null pointers",
    "nodes": [
      {
        "val": 4,
        "random": 3
      },
      {
        "val": 8,
        "random": 0
      },
      {
        "val": 12,
        "random": 2
      },
      {
        "val": 16,
        "random": null
      },
      {
        "val": 20,
        "random": 1
      },
      {
        "val": 24,
        "random": 4
      }
    ]
  },
  {
    "label": "All random pointers absent",
    "nodes": [
      {
        "val": 3,
        "random": null
      },
      {
        "val": 7,
        "random": null
      },
      {
        "val": 11,
        "random": null
      }
    ]
  },
  {
    "label": "One self-pointer",
    "nodes": [
      {
        "val": 17,
        "random": 0
      }
    ]
  },
  {
    "label": "Empty list",
    "nodes": []
  },
  {
    "label": "Null random pointers only",
    "nodes": [
      {
        "val": 1,
        "random": null
      },
      {
        "val": 2,
        "random": null
      }
    ]
  },
  {
    "label": "Boundary values at the limit",
    "nodes": [
      {
        "val": 0,
        "random": 0
      },
      {
        "val": 100,
        "random": null
      },
      {
        "val": -100,
        "random": 1
      }
    ]
  },
  {
    "label": "Long run: 30 nodes",
    "nodes": [
      {
        "val": 1,
        "random": 7
      },
      {
        "val": 4,
        "random": 8
      },
      {
        "val": 7,
        "random": 8
      },
      {
        "val": 10,
        "random": 9
      },
      {
        "val": 13,
        "random": 10
      },
      {
        "val": 16,
        "random": 10
      },
      {
        "val": 19,
        "random": 11
      },
      {
        "val": 22,
        "random": 12
      },
      {
        "val": 25,
        "random": 12
      },
      {
        "val": 28,
        "random": 13
      },
      {
        "val": 31,
        "random": 14
      },
      {
        "val": 34,
        "random": 14
      },
      {
        "val": 37,
        "random": 15
      },
      {
        "val": 40,
        "random": 15
      },
      {
        "val": 43,
        "random": 16
      },
      {
        "val": 46,
        "random": 17
      },
      {
        "val": 49,
        "random": 17
      },
      {
        "val": 52,
        "random": 18
      },
      {
        "val": 55,
        "random": 19
      },
      {
        "val": 58,
        "random": 19
      },
      {
        "val": 61,
        "random": 20
      },
      {
        "val": 64,
        "random": 21
      },
      {
        "val": 67,
        "random": 21
      },
      {
        "val": 70,
        "random": 22
      },
      {
        "val": 73,
        "random": 23
      },
      {
        "val": 76,
        "random": 23
      },
      {
        "val": 79,
        "random": 24
      },
      {
        "val": 82,
        "random": 25
      },
      {
        "val": 85,
        "random": 25
      },
      {
        "val": 88,
        "random": 26
      }
    ]
  }
];
