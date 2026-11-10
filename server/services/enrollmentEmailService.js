
import transporter from "../config/email.js";
import { enrollmentEmailTemplate } from "../templates/enrollmentEmailTemplate.js";

export async function sendEnrollmentConfirmation(student) {
  const senderEmail =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;

  if (!senderEmail) {
    throw new Error("Email sender address is not configured.");
  }

  return transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME || "Student Management System",
      address: senderEmail,
    },
    to: student.email,
    subject: "Student Enrollment Confirmation",
    html: enrollmentEmailTemplate(student),
  });
}
