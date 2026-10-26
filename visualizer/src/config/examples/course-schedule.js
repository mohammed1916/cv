// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Branches merge before the final course",
    "numCourses": 8,
    "prerequisites": [
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        1
      ],
      [
        4,
        1
      ],
      [
        4,
        2
      ],
      [
        5,
        3
      ],
      [
        6,
        4
      ],
      [
        7,
        5
      ],
      [
        7,
        6
      ]
    ]
  },
  {
    "label": "Cycle blocks completion",
    "numCourses": 5,
    "prerequisites": [
      [
        1,
        0
      ],
      [
        2,
        1
      ],
      [
        3,
        2
      ],
      [
        1,
        3
      ],
      [
        4,
        0
      ]
    ]
  },
  {
    "label": "Independent courses",
    "numCourses": 5,
    "prerequisites": []
  },
  {
    "label": "Disconnected chains",
    "numCourses": 6,
    "prerequisites": [
      [
        1,
        0
      ],
      [
        2,
        1
      ],
      [
        4,
        3
      ],
      [
        5,
        4
      ]
    ]
  },
  {
    "label": "Single course",
    "numCourses": 1,
    "prerequisites": []
  }
];
