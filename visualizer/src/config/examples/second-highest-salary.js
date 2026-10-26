// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated salaries and several ranks",
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
    "n": 3
  },
  {
    "label": "Every salary tied",
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
        "salary": 7200,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7200,
        "managerId": 11,
        "departmentId": 1
      }
    ],
    "n": 2
  },
  {
    "label": "Rank missing",
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
      }
    ],
    "n": 5
  },
  {
    "label": "One employee",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      }
    ],
    "n": 1
  }
];
