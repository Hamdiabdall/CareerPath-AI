const { transporter } = require('../config/email');

/**
 * Email Service for CareerPath AI
 */

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<void>}
 */
const sendOTP = async (email, otpCode) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"CareerPath AI" <noreply@careerpath.ai>',
    to: email,
    subject: 'Vérification de votre compte CareerPath AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CareerPath AI</h1>
          </div>
          <div class="content">
            <h2>Vérification de votre email</h2>
            <p>Bonjour,</p>
            <p>Merci de vous être inscrit sur CareerPath AI. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
            <div class="otp-code">${otpCode}</div>
            <p><strong>Ce code expire dans 10 minutes.</strong></p>
            <p>Si vous n'avez pas créé de compte sur CareerPath AI, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CareerPath AI. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      CareerPath AI - Vérification de votre email
      
      Bonjour,
      
      Merci de vous être inscrit sur CareerPath AI. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :
      
      Code: ${otpCode}
      
      Ce code expire dans 10 minutes.
      
      Si vous n'avez pas créé de compte sur CareerPath AI, vous pouvez ignorer cet email.
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send notification email when job offer is deleted
 * @param {string} email - Recipient email
 * @param {string} jobTitle - Title of the deleted job
 * @param {string} companyName - Name of the company
 * @returns {Promise<void>}
 */
const sendJobDeletedNotification = async (email, jobTitle, companyName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"CareerPath AI" <noreply@careerpath.ai>',
    to: email,
    subject: 'Offre supprimée - CareerPath AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .job-info { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CareerPath AI</h1>
          </div>
          <div class="content">
            <h2>Offre supprimée</h2>
            <p>Bonjour,</p>
            <p>Nous vous informons que l'offre d'emploi suivante a été supprimée :</p>
            <div class="job-info">
              <strong>${jobTitle}</strong><br>
              ${companyName}
            </div>
            <p>Votre candidature associée à cette offre a également été supprimée.</p>
            <p>N'hésitez pas à consulter d'autres offres sur notre plateforme.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CareerPath AI. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      CareerPath AI - Offre supprimée
      
      Bonjour,
      
      Nous vous informons que l'offre d'emploi suivante a été supprimée :
      
      ${jobTitle} - ${companyName}
      
      Votre candidature associée à cette offre a également été supprimée.
      
      N'hésitez pas à consulter d'autres offres sur notre plateforme.
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTP,
  sendJobDeletedNotification,
};
