import * as mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Parse a DOCX file and extract plain text content
 * @param filePath - Absolute path to the .docx file
 * @returns Promise<string> - Extracted plain text from the document
 * @throws Error if file path is invalid, file doesn't exist, or parsing fails
 */
export async function parseDocx(filePath: string): Promise<string> {
  // Validate file path
  if (!filePath || filePath.trim() === '') {
    throw new Error('File path is required');
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist');
  }

  // Check if file has .docx extension
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.docx') {
    throw new Error('File must be a .docx file');
  }

  try {
    // Extract raw text from the DOCX file
    const result = await mammoth.extractRawText({ path: filePath });

    // Trim whitespace and return
    return result.value.trim();
  } catch (error) {
    // Handle parsing errors gracefully
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse DOCX file: ${errorMessage}`);
  }
}
