import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "amehharrison2020@gmail.com",
    pass: "xxpx zpui blmh lwgc",
  },
});

export const sendPasswordResetEmail = (email, username, link) => {
  const mailOptions = {
    from: "amehharrison2020@gmail.com",
    to: email,
    subject: "Reset your Heaven password",
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Heaven Password</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0; padding:0; background-color:#f6f8fa; font-family:'Inter',sans-serif;">
    <center>
      <table width="100%" bgcolor="#f6f8fa" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <table width="450" cellpadding="0" cellspacing="0" border="0" style="background:#fff; border-radius:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <tr>
                <td align="center" style="padding:32px 24px 0 24px;">
                  <img src="https://res.cloudinary.com/duowocved/image/upload/v1745845721/Frame_1000007866_fdncm0.png" alt="Heaven Logo" style="height:48px; width:48px;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 24px 0 24px;">
                  <h2 style="margin:0 0 12px 0; color:#222;">Reset Your Password</h2>
                  <p style="margin:0 0 16px 0; color:#444;">
                    Hi ${username},<br>
                    We received a request to reset your Heaven password. If you made this request, click the button below to set a new password:
                  </p>
                  <div style="text-align:center; margin:24px 0;">
                    <a href="${link}" style="display:inline-block; background:#f65200; color:#fff; text-decoration:none; padding:14px 0; border-radius:6px; font-weight:600; width:220px; font-size:16px;">
                      Reset Password
                    </a>
                  </div>
                  <p style="margin:0 0 12px 0; color:#666; font-size:14px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${link}" style="color:#f65200;">${link}</a>
                  </p>
                  <p style="margin:0 0 12px 0; color:#888; font-size:13px;">
                    This link will expire in 10 minutes for your security.
                  </p>
                  <p style="margin:0 0 12px 0; color:#888; font-size:13px;">
                    If you did not request a password reset, you can safely ignore this email.
                  </p>
                  <p style="margin:0 0 0 0; color:#222;">
                    Stay safe!<br>
                    <strong>The Heaven Team</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 32px 0 16px 0; color:#bbb; font-size:13px;">
                  Heaven &copy; 2025 &mdash; All Rights Reserved
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    console.log(info);
    if (error) {
      console.log(error);
    }
  });
};

export const sendAccountActivationMail = (email, username, link) => {
  const mailOptions = {
    from: "amehharrison2020@gmail.com",
    to: email,
    subject: "Activate your Heaven account",
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Activate Your Heaven Account</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0; padding:0; background-color:#f6f8fa; font-family:'Inter',sans-serif;">
    <center>
      <table width="100%" bgcolor="#f6f8fa" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <table width="450" cellpadding="0" cellspacing="0" border="0" style="background:#fff; border-radius:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <tr>
                <td align="center" style="padding:32px 24px 0 24px;">
                  <img src="https://res.cloudinary.com/duowocved/image/upload/v1745845721/Frame_1000007866_fdncm0.png" alt="Heaven Logo" style="height:48px; width:48px;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 24px 0 24px;">
                  <h2 style="margin:0 0 12px 0; color:#222;">Welcome to Heaven, ${username}!</h2>
                  <p style="margin:0 0 16px 0; color:#444;">
                    Thank you for signing up. Please confirm your email address to activate your Heaven account and start your journey.
                  </p>
                  <div style="text-align:center; margin:24px 0;">
                    <a href="${link}" style="display:inline-block; background:#f65200; color:#fff; text-decoration:none; padding:14px 0; border-radius:6px; font-weight:600; width:220px; font-size:16px;">
                      Activate Account
                    </a>
                  </div>
                  <p style="margin:0 0 12px 0; color:#666; font-size:14px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${link}" style="color:#f65200;">${link}</a>
                  </p>
                  <p style="margin:0 0 12px 0; color:#888; font-size:13px;">
                    This link will expire in 10 minutes for your security.
                  </p>
                  <p style="margin:0 0 12px 0; color:#888; font-size:13px;">
                    If you did not create a Heaven account, you can safely ignore this email.
                  </p>
                  <p style="margin:0 0 0 0; color:#222;">
                    See you inside!<br>
                    <strong>The Heaven Team</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 32px 0 16px 0; color:#bbb; font-size:13px;">
                  Heaven &copy; 2025 &mdash; All Rights Reserved
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(info);
    }
  });
};
