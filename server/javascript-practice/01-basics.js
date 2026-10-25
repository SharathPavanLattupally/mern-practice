// Task 2: variables, data types, conditions, loops and functions

const studentName = "Sharath"; // const: binding cannot be reassigned
let studentAge = 26; // let: can be reassigned
studentAge += 1;

const marks = 85; // number
const isEnrolled = true; // boolean
const subjects = ["JavaScript", "React", "Node.js"]; // array
const student = { id: 101, name: studentName, marks }; // object shorthand
const middleName = null; // intentional absence of a value
let optionalNote; // undefined because no value was assigned

console.log("--- Variables and data types ---");
console.log({ studentName, studentAge, marks, isEnrolled, subjects, student, middleName, optionalNote });

console.log("--- Conditional ---");
if (marks >= 40) {
  console.log("Pass");
} else {
  console.log("Fail");
}

console.log("--- Loop ---");
for (const subject of subjects) console.log(subject);

console.log("--- Reusable and arrow functions ---");
function calculateBonus(score, bonus = 5) {
  return score + bonus;
}
const greetStudent = (name) => `Hello, ${name}!`;
console.log("Bonus marks:", calculateBonus(marks));
console.log(greetStudent(studentName));

console.log("--- Type and value checks ---");
console.log("marks is a number:", typeof marks === "number");
console.log("middleName is null:", middleName === null);
