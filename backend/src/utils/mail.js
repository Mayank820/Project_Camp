import Mailgen from "mailgen";
import nodemailer from "nodemailer";

/**
 * This function sends an email. You pass an options object containing:
    email: recipient's email
    subject: subject line
    mailGenContent: content for the email (from emailVerifictaionContent or passwordResetContent)
 */

const sendMail = async (options) => {
  // Create a Mailgen instance
  // We pass in our configuration as well as the product details
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://mailgen.js/",
    },
  });

  // Generate an HTML email with the provided contents
  var emailHtml = mailGenerator.generate(options.mailGenContent);
  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  var emailText = mailGenerator.generatePlaintext(options.mailGenContent);

  // Configure Nodemailer (Mailtrap SMTP used)
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  // actual mail to be sent
  const mail = {
    from: process.env.MAILTRAP_SENDEREMAIL,
    to: options.email,
    subject: options.subject,
    text: emailText, // plain‑text body
    html: emailHtml, // HTML body
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    throw new Error(`Email error: ${error.message}`);
  }
};

// it is the factory oriented programming
// it generates the email verification content
const emailVerifictaionContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to Task Manager! We're very excited to have you on board.",
      action: {
        instructions: "To get started with Task Manager, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const passwordResetContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset your password ",
      action: {
        instructions: "To reset your password, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const taskAssignmentContent = (assigneeName, taskTitle, taskUrl) => {
  return {
    body: {
      name: assigneeName,
      intro: `You have been assigned a new task: **${taskTitle}**`,
      action: {
        instructions: "Click the button below to view the task:",
        button: {
          color: "#007bff",
          text: "View Task",
          link: taskUrl || "#",
        },
      },
      outro: "If you have any questions, contact your project manager.",
    },
  };
};

const taskReminderContent = (username, taskTitle, dueMessage, taskUrl) => {
  return {
    body: {
      name: username,
      intro: dueMessage, // dynamic based on due/overdue
      action: {
        instructions: "Click below to open the task:",
        button: {
          color: "#F57C00",
          text: "View Task",
          link: taskUrl,
        },
      },
      outro: "Don't forget to complete your task!",
    },
  };
};

export {
  sendMail,
  emailVerifictaionContent,
  passwordResetContent,
  taskAssignmentContent,
  taskReminderContent,
};

// sendMail({
//   email: user.email,
//   subject: "verify the account",
//   mailGenContent: emailVerifictaionContent(username, ``),
// });
