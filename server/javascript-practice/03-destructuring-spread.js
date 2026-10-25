// Task 2: object/array destructuring, spread/rest, optional chaining and nullish coalescing

const student = {
  id: 101,
  name: "Ravi",
  marks: 85,
  department: "CSE",
  contact: { email: "ravi@example.com" }
};

// Object destructuring
const { id, name, marks, department } = student;
console.log("Destructured object properties:", { id, name, marks, department });

// Array destructuring
const subjects = ["JavaScript", "React", "Node.js"];
const [firstSubject, secondSubject, ...remainingSubjects] = subjects;
console.log("Array destructuring:", { firstSubject, secondSubject, remainingSubjects });

// Spread: shallow-copy object and override selected fields without changing original
const updatedStudent = { ...student, marks: 95, department: "IT" };
console.log("Updated copy:", updatedStudent);
console.log("Original marks remain:", student.marks);

// Spread: copy array
const moreSubjects = [...subjects, "MongoDB"];
console.log("Copied array:", moreSubjects);

// Rest: collect any number of arguments into an array
function calculateTotal(...scores) {
  return scores.reduce((total, score) => total + score, 0);
}
console.log("Rest parameters total:", calculateTotal(80, 90, 70));

// Optional chaining: safely access nested properties that may be missing
console.log("Email:", student.contact?.email);
console.log("Missing phone:", student.contact?.phone);

// Nullish coalescing: fallback only for null or undefined (not for 0 or empty string)
const phone = student.contact?.phone ?? "Not provided";
const displayMarks = student.marks ?? "No marks";
console.log("Fallbacks:", { phone, displayMarks });
