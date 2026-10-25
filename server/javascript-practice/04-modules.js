// Task 2: ES modules. Named and default imports from 04-student-data.js
import getStudentCount, { studentRecords, getStudentById } from "./04-student-data.js";

console.log("Student records:", studentRecords);
console.log("Student count:", getStudentCount());
console.log("Student 202:", getStudentById(202));
console.log("Missing student:", getStudentById(999));
