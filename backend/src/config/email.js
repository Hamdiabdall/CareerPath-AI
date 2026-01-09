const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // For development/testing without real SMTP
  if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_EMAIL === 'true') {
    return {
      sendMail: async (mailOptions) => {
        console.log('Mock email sent:', mailOptions.to, mailOptions.subject);
        return { messageId: 'mock-message-id' };
      },
    };
  }

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Verify transporter connection
const verifyEmailConnection = async () => {
  try {
    if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_EMAIL === 'true') {
      console.log('Email service: Mock mode enabled');
      return true;
    }
    
    await transporter.verify();
    console.log('Email service: Connected successfully');
    return true;
  } catch (error) {
    console.error('Email service: Connection failed -', error.message);
    return false;
  }
};

module.exports = { transporter, verifyEmailConnection, createTransporter };
