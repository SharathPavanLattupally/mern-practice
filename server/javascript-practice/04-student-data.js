// Shared data module used by the import/export exercise
export const studentRecords = [
  { id: 201, name: "Meera", marks: 88, department: "CSE" },
  { id: 202, name: "Dev", marks: 67, department: "IT" },
  { id: 203, name: "Sara", marks: 94, department: "ECE" }
];

export function getStudentById(id) {
  return studentRecords.find((student) => student.id === id) ?? null;
}

export default function getStudentCount() {
  return studentRecords.length;
}
