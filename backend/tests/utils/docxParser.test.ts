import { parseDocx } from '../../src/utils/docxParser';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

// Mock mammoth for controlled testing
jest.mock('mammoth');

describe('docxParser', () => {
  const testFilesDir = path.join(__dirname, '../fixtures/docx');

  beforeAll(() => {
    // Create test fixtures directory
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseDocx - Validation', () => {
    it('should throw an error if file path is empty', async () => {
      await expect(parseDocx('')).rejects.toThrow('File path is required');
    });

    it('should throw an error if file path is whitespace only', async () => {
      await expect(parseDocx('   ')).rejects.toThrow('File path is required');
    });

    it('should throw an error if file does not exist', async () => {
      const nonExistentPath = path.join(testFilesDir, 'non-existent.docx');
      await expect(parseDocx(nonExistentPath)).rejects.toThrow('File does not exist');
    });

    it('should throw an error if file is not a .docx file', async () => {
      const txtFile = path.join(testFilesDir, 'test.txt');
      fs.writeFileSync(txtFile, 'test content');

      await expect(parseDocx(txtFile)).rejects.toThrow('File must be a .docx file');

      // Cleanup
      fs.unlinkSync(txtFile);
    });

    it('should accept file path with uppercase .DOCX extension', async () => {
      const docxFile = path.join(testFilesDir, 'TEST.DOCX');
      fs.writeFileSync(docxFile, 'dummy content');

      (mammoth.extractRawText as jest.Mock).mockResolvedValue({ value: 'test text' });

      const result = await parseDocx(docxFile);
      expect(result).toBe('test text');

      // Cleanup
      fs.unlinkSync(docxFile);
    });
  });

  describe('parseDocx - Text Extraction', () => {
    it('should return empty string for empty docx content', async () => {
      const docxFile = path.join(testFilesDir, 'empty.docx');
      fs.writeFileSync(docxFile, 'dummy content');

      (mammoth.extractRawText as jest.Mock).mockResolvedValue({ value: '' });

      const result = await parseDocx(docxFile);
      expect(result).toBe('');

      // Cleanup
      fs.unlinkSync(docxFile);
    });

    it('should parse valid docx file and return plain text', async () => {
      const docxFile = path.join(testFilesDir, 'sample.docx');
      fs.writeFileSync(docxFile, 'dummy content');

      const expectedText = 'This is a sample DOCX document with some text content.';
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({ value: expectedText });

      const result = await parseDocx(docxFile);
      expect(result).toBe(expectedText);
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ path: docxFile });

      // Cleanup
      fs.unlinkSync(docxFile);
    });

    it('should trim whitespace from extracted text', async () => {
      const docxFile = path.join(testFilesDir, 'whitespace.docx');
      fs.writeFileSync(docxFile, 'dummy content');

      const textWithWhitespace = '   \n\n  Sample text with whitespace  \n\n  ';
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({ value: textWithWhitespace });

      const result = await parseDocx(docxFile);
      expect(result).toBe('Sample text with whitespace');

      // Cleanup
      fs.unlinkSync(docxFile);
    });

    it('should preserve internal line breaks and formatting', async () => {
      const docxFile = path.join(testFilesDir, 'formatted.docx');
      fs.writeFileSync(docxFile, 'dummy content');

      const formattedText = 'Line 1\nLine 2\n\nLine 3';
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({ value: formattedText });

      const result = await parseDocx(docxFile);
      expect(result).toBe(formattedText);

      // Cleanup
      fs.unlinkSync(docxFile);
    });
  });

  describe('parseDocx - Error Handling', () => {
    it('should handle mammoth parsing errors gracefully', async () => {
      const docxFile = path.join(testFilesDir, 'corrupted.docx');
      fs.writeFileSync(docxFile, 'dummy content');

      const mockError = new Error('Failed to parse: Invalid ZIP file');
      (mammoth.extractRawText as jest.Mock).mockRejectedValue(mockError);

      await expect(parseDocx(docxFile)).rejects.toThrow('Failed to parse DOCX file: Failed to parse: Invalid ZIP file');

      // Cleanup
      fs.unlinkSync(docxFile);
    });

    it('should provide detailed error message for parsing failures', async () => {
      const docxFile = path.join(testFilesDir, 'error.docx');
      fs.writeFileSync(docxFile, 'dummy content');

      (mammoth.extractRawText as jest.Mock).mockRejectedValue(new Error('XML parsing error'));

      await expect(parseDocx(docxFile)).rejects.toThrow(/^Failed to parse DOCX file:/);

      // Cleanup
      fs.unlinkSync(docxFile);
    });

    it('should handle unknown errors during parsing', async () => {
      const docxFile = path.join(testFilesDir, 'unknown-error.docx');
      fs.writeFileSync(docxFile, 'dummy content');

      // Throw a non-Error object
      (mammoth.extractRawText as jest.Mock).mockRejectedValue('Unknown error string');

      await expect(parseDocx(docxFile)).rejects.toThrow('Failed to parse DOCX file: Unknown error');

      // Cleanup
      fs.unlinkSync(docxFile);
    });
  });

  afterAll(() => {
    // Cleanup test fixtures directory
    if (fs.existsSync(testFilesDir)) {
      const files = fs.readdirSync(testFilesDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testFilesDir, file));
      });
      fs.rmdirSync(testFilesDir);
    }
  });
});
