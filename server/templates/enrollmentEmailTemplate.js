
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function enrollmentEmailTemplate(student) {
  const studentName = escapeHtml(student.fullName);
  const studentEmail = escapeHtml(student.email);
  const courseName = escapeHtml(
    student.courseId?.courseName || student.course || "Not specified"
  );
  const courseCode = escapeHtml(student.courseId?.courseCode || "N/A");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Enrollment Confirmation</title>
      </head>
      <body style="margin:0; padding:24px; background:#f4f6f8; font-family:Arial,sans-serif;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; padding:30px;">
          <h2 style="color:#2563eb;">Enrollment Successful!</h2>

          <p>Hello ${studentName},</p>

          <p>
            Your student registration has been completed successfully.
            Welcome to our Student Management System!
          </p>

          <div style="background:#f1f5f9; padding:20px; border-radius:8px;">
            <h3>Enrollment Details</h3>
            <p><strong>Student Name:</strong> ${studentName}</p>
            <p><strong>Email:</strong> ${studentEmail}</p>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Course Code:</strong> ${courseCode}</p>
          </div>

          <p>
            Please keep this email for your records.
          </p>

          <p>Thank you,<br />Student Management System</p>
        </div>
      </body>
    </html>
  `;
}
