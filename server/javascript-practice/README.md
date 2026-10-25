# Task 2 — JavaScript Fundamentals

A set of runnable JavaScript exercises for the MERN Student Management System project.

## Requirements covered

1. `let` and `const`: `01-basics.js`
2. Strings, numbers, booleans, arrays, objects, `null` and `undefined`: `01-basics.js`
3. Conditionals and loops: `01-basics.js`
4. Function declarations, default parameters and arrow functions: `01-basics.js`
5. `map`, `filter`, `find`, `some`, `reduce`, and alphabetical sorting: `02-student-arrays.js`
6. Object and array destructuring: `03-destructuring-spread.js`
7. Spread and rest syntax: `03-destructuring-spread.js`
8. Named and default ES module exports/imports: `04-student-data.js`, `04-modules.js`
9. Promises and `async`/`await`: `05-async-students.js`, `06-api-fetch.js`
10. `try`/`catch`: `05-async-students.js`, `06-api-fetch.js`
11. `fetch()` with loading, success and error states: `06-api-fetch.js`
12. `JSON.stringify()` and `JSON.parse()`: `06-api-fetch.js`
13. Optional chaining and nullish coalescing: `03-destructuring-spread.js`

## Prerequisites

- A currently supported Node.js release with built-in `fetch` (Node.js 18+; a supported LTS release is recommended).
- No third-party npm packages are required for these exercises.

## Run the exercises

Open a terminal in this folder and run any command:

npm run basics
npm run arrays
npm run syntax
npm run modules
npm run async
npm run api


The API exercise calls `https://jsonplaceholder.typicode.com/users`, so internet access is needed for that exercise. If the API or network is unavailable, it catches the error and reports the failed state.

## Test the student array functions

node --test


## Notes

- The student data is intentionally local sample data; no database is connected in this task.
- `sort()` mutates an array, so the alphabetical result sorts a copy using spread syntax.
- `find()` returns `undefined` if there is no match; this exercise normalizes missing student lookups to `null` where appropriate.
- The API example checks `response.ok`, because `fetch()` does not reject for HTTP error status codes by itself.
