// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Ties managers and several departments",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 12,
        "name": "Oren",
        "salary": 8600,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7200,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 14,
        "name": "Ivo",
        "salary": 6400,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 15,
        "name": "Nila",
        "salary": 8100,
        "managerId": 11,
        "departmentId": 2
      },
      {
        "id": 16,
        "name": "Soren",
        "salary": 9300,
        "managerId": 11,
        "departmentId": 2
      },
      {
        "id": 17,
        "name": "Eli",
        "salary": 8100,
        "managerId": 15,
        "departmentId": 2
      },
      {
        "id": 18,
        "name": "Uma",
        "salary": 5900,
        "managerId": 15,
        "departmentId": 2
      }
    ],
    "departments": [
      {
        "id": 1,
        "name": "Design"
      },
      {
        "id": 2,
        "name": "Research"
      },
      {
        "id": 3,
        "name": "Operations"
      }
    ]
  },
  {
    "label": "One department",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 12,
        "name": "Oren",
        "salary": 8600,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7200,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 14,
        "name": "Ivo",
        "salary": 6400,
        "managerId": 11,
        "departmentId": 1
      }
    ],
    "departments": [
      {
        "id": 1,
        "name": "Design"
      }
    ]
  },
  {
    "label": "No employees",
    "employees": [],
    "departments": [
      {
        "id": 1,
        "name": "Design"
      },
      {
        "id": 2,
        "name": "Research"
      },
      {
        "id": 3,
        "name": "Operations"
      }
    ]
  },
  {
    "label": "Only one employee",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      }
    ],
    "departments": [
      {
        "id": 1,
        "name": "Design"
      },
      {
        "id": 2,
        "name": "Research"
      },
      {
        "id": 3,
        "name": "Operations"
      }
    ]
  }
];
