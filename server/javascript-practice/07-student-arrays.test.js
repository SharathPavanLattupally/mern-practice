import test from "node:test";
import assert from "node:assert/strict";
import {
  students,
  passedStudents,
  studentById,
  hasFailedStudent,
  totalMarks,
  averageMarks,
  studentsAlphabetically,
  studentResults,
  cseStudents,
  highestScorer
} from "./02-student-arrays.js";

test("filters students who passed", () => {
  assert.deepEqual(passedStudents.map((s) => s.name), ["Ravi", "Anita", "Priya", "Arjun"]);
});

test("finds student by ID and returns null for missing ID", () => {
  assert.equal(studentById(103)?.name, "Kiran");
  assert.equal(studentById(999), null);
});

test("calculates total and average marks", () => {
  assert.equal(totalMarks, 346);
  assert.equal(averageMarks, 69.2);
});

test("sorts alphabetically without changing original array", () => {
  assert.deepEqual(studentsAlphabetically.map((s) => s.name), ["Anita", "Arjun", "Kiran", "Priya", "Ravi"]);
  assert.equal(students[0].name, "Ravi");
});

test("transforms students into pass/fail results", () => {
  assert.deepEqual(studentResults.find((s) => s.id === 103), { id: 103, name: "Kiran", result: "Fail" });
});

test("checks failed students, department filter and highest scorer", () => {
  assert.equal(hasFailedStudent, true);
  assert.deepEqual(cseStudents.map((s) => s.name), ["Ravi", "Kiran"]);
  assert.equal(highestScorer?.name, "Anita");
  assert.equal(highestScorer?.marks, 92);
});
