// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several recursive ranges",
    "tree": {
      "val": 18,
      "left": {
        "val": 7,
        "left": {
          "val": 3
        },
        "right": {
          "val": 12
        }
      },
      "right": {
        "val": 29,
        "left": {
          "val": 24
        },
        "right": {
          "val": 35
        }
      }
    }
  },
  {
    "label": "Right chain",
    "tree": {
      "val": 3,
      "right": {
        "val": 8,
        "right": {
          "val": 15,
          "right": {
            "val": 24
          }
        }
      }
    }
  },
  {
    "label": "Single node",
    "tree": {
      "val": 17
    }
  }
];
