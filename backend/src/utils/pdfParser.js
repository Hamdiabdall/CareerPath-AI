const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { FileInvalidTypeError } = require('./errors');

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromPDF = async (filePath) => {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new FileInvalidTypeError('File not found');
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.pdf') {
    throw new FileInvalidTypeError('Only PDF files are allowed');
  }

  try {
    // Read file buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Check PDF magic bytes (PDF files start with %PDF)
    const header = dataBuffer.slice(0, 4).toString();
    if (header !== '%PDF') {
      throw new FileInvalidTypeError('Invalid PDF file format');
    }

    // Parse PDF
    const data = await pdfParse(dataBuffer);

    // Clean and normalize text
    let text = data.text || '';
    
    // Normalize whitespace while preserving paragraph structure
    text = text
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\r/g, '\n')             // Normalize line endings
      .replace(/[ \t]+/g, ' ')          // Collapse multiple spaces/tabs
      .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
      .trim();

    return text;
  } catch (error) {
    if (error instanceof FileInvalidTypeError) {
      throw error;
    }
    // Handle pdf-parse errors
    if (error.message && error.message.includes('Invalid')) {
      throw new FileInvalidTypeError('Invalid or corrupted PDF file');
    }
    throw new FileInvalidTypeError(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromBuffer = async (buffer) => {
  try {
    // Check PDF magic bytes
    const header = buffer.slice(0, 4).toString();
    if (header !== '%PDF') {
      throw new FileInvalidTypeError('Invalid PDF file format');
    }

    // Parse PDF
    const data = await pdfParse(buffer);

    // Clean and normalize text
    let text = data.text || '';
    
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  } catch (error) {
    if (error instanceof FileInvalidTypeError) {
      throw error;
    }
    throw new FileInvalidTypeError(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Validate that a file is a valid PDF
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if valid PDF
 */
const isValidPDF = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.pdf') {
      return false;
    }

    const buffer = fs.readFileSync(filePath);
    const header = buffer.slice(0, 4).toString();
    return header === '%PDF';
  } catch (error) {
    return false;
  }
};

module.exports = {
  extractTextFromPDF,
  extractTextFromBuffer,
  isValidPDF,
};
