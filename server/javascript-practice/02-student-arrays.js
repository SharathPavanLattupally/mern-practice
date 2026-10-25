import { pathToFileURL } from "node:url";
// Task 2: student array exercises and required array methods

export const students = [
  { id: 101, name: "Ravi", marks: 85, department: "CSE" },
  { id: 102, name: "Anita", marks: 92, department: "ECE" },
  { id: 103, name: "Kiran", marks: 35, department: "CSE" },
  { id: 104, name: "Priya", marks: 76, department: "IT" },
  { id: 105, name: "Arjun", marks: 58, department: "ECE" }
];

export const passedStudents = students.filter((student) => student.marks >= 40);
export const studentById = (id) => students.find((student) => student.id === id) ?? null;
export const hasFailedStudent = students.some((student) => student.marks < 40);
export const totalMarks = students.reduce((total, student) => total + student.marks, 0);
export const averageMarks = students.length === 0 ? 0 : totalMarks / students.length;
// Copy first because sort() mutates its array.
export const studentsAlphabetically = [...students].sort((a, b) => a.name.localeCompare(b.name));
export const studentResults = students.map(({ id, name, marks }) => ({
  id,
  name,
  result: marks >= 40 ? "Pass" : "Fail"
}));
export const cseStudents = students.filter((student) => student.department === "CSE");
export const highestScorer = students.length === 0
  ? null
  : students.reduce((highest, current) => current.marks > highest.marks ? current : highest);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log("All students:", students);
  console.log("Passed students:", passedStudents.map(({ name }) => name));
  console.log("Student with ID 103:", studentById(103));
  console.log("Student with unknown ID:", studentById(999));
  console.log("Has failed student:", hasFailedStudent);
  console.log("Total marks:", totalMarks);
  console.log("Average marks:", averageMarks);
  console.log("Alphabetical order:", studentsAlphabetically.map(({ name }) => name));
  console.log("Transformed results:", studentResults);
  console.log("CSE students:", cseStudents.map(({ name }) => name));
  console.log("Highest scorer:", highestScorer);
}
