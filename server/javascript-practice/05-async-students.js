import { pathToFileURL } from "node:url";
// Task 2: promises, async/await, try/catch, and async student lookup
import { students } from "./02-student-arrays.js";

// Promise-based asynchronous function
export function getStudentByIdPromise(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = students.find((item) => item.id === id);
      if (student) resolve(student);
      else reject(new Error(`Student with ID ${id} was not found`));
    }, 150);
  });
}

// async/await + try/catch for success and failure cases
export async function showStudent(id) {
  try {
    const student = await getStudentByIdPromise(id);
    console.log("Student found:", student);
    return student;
  } catch (error) {
    console.error("Could not retrieve student:", error.message);
    return null;
  }
}

// Example of an async function that always resolves to student information or null
export async function getStudentInformation(id) {
  try {
    return await getStudentByIdPromise(id);
  } catch {
    return null;
  }
}

// Demonstrate promise chaining and async/await
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  getStudentByIdPromise(102)
    .then((student) => console.log("Promise result:", student.name))
    .catch((error) => console.error(error.message));

  await showStudent(103);
  await showStudent(999); // demonstrates handled rejection
  console.log("Async information:", await getStudentInformation(101));
}
