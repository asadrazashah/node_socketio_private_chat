const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: `${process.env.FROM_EMAIL}`,
    pass: `${process.env.EMAIL_PASSWORD}`,
  },
});
//registration Email
const sendEmail = async (fullName, email, password) => {
  const mailOptions = {
    to: email,
    from: `kidney foundation <${process.env.FROM_EMAIL}>`,
    subject: "Account Verification",
    text: `Hi ${fullName} \n
     This is your password ${password} for kidney foundation of central PA . \n\n`,
  };
  try {
    const response = await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    return false;
  }
};

const sendForgotPasswordByEmail = async (email, password) => {
  const mailOptions = {
    to: email,
    from: `kidney foundation <${process.env.FROM_EMAIL}>`,
    subject: "Recover Password",
    html: `<p>You are receiving this because you (or someone else) have requested to recover the password for your account.\n\n 
        Here is your password ${password} for kidney foundation of central PA \n\n If you did not request this, please ignore this email.\n </p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    return false;
  }
};

const sendResetEmail = async (user, req, res) => {
  const mailOptions = {
    to: user.email,
    from: `videonPro<${process.env.FROM_EMAIL}>`,
    subject: "Your password has been changed",
    html: `<p>This is a confirmation that the password for your account ${user.email} has just been changed. </p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  sendEmail,
  sendResetEmail,
  sendForgotPasswordByEmail,
};
