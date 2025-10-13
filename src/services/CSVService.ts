/**
 * CSV Service
 * Handles CSV file parsing, validation, and template generation for bulk student enrollment
 */

import { parse } from 'csv-parse/sync';
import { CSVValidator, BulkEnrollmentData } from '../utils/csvValidator';

export class CSVService {
  /**
   * Generate CSV template for bulk enrollment
   * Returns a CSV string with headers and example row
   */
  async generateTemplate(): Promise<string> {
    console.log('📄 CSVService: Generating CSV template for bulk enrollment');

    const headers = [
      'Student First Name',
      'Student Last Name',
      'Student Date of Birth (YYYY-MM-DD)',
      'Student Gender (Male/Female/Other)',
      'Student Email',
      'Student Phone',
      'Student Address',
      'Grade Level',
      'Academic Year',
      'Guardian First Name',
      'Guardian Last Name',
      'Guardian Email',
      'Guardian Phone',
      'Guardian Relation (Father/Mother/Guardian/Other)',
      'Guardian Age'
    ];

    const exampleRow = [
      'John',
      'Doe',
      '2010-05-15',
      'Male',
      'john.doe@example.com',
      '+1234567890',
      '123 Main Street, City, State, ZIP',
      '5',
      '2024-2025',
      'Jane',
      'Doe',
      'jane.doe@example.com',
      '+0987654321',
      'Mother',
      '35'
    ];

    const csvContent = [
      headers.join(','),
      exampleRow.join(','),
      // Add a few empty rows for user to fill
      Array(headers.length).fill('').join(','),
      Array(headers.length).fill('').join(','),
      Array(headers.length).fill('').join(',')
    ].join('\n');

    console.log('✅ CSVService: CSV template generated successfully');
    return csvContent;
  }

  /**
   * Parse CSV file buffer into array of objects
   */
  async parseCSV(fileContent: string): Promise<any[]> {
    try {
      console.log('📄 CSVService: Parsing CSV file');

      const records = parse(fileContent, {
        columns: true, // Use first row as headers
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true, // Allow inconsistent column count
        cast: true // Auto-cast values
      });

      console.log(`✅ CSVService: Parsed ${records.length} rows from CSV`);
      return records;
    } catch (error) {
      console.error('❌ CSVService: Failed to parse CSV file', error);
      throw new Error('Invalid CSV format. Please ensure the file is properly formatted.');
    }
  }

  /**
   * Validate and transform CSV data into BulkEnrollmentData format
   */
  async validateAndTransformCSV(records: any[]): Promise<{
    valid: BulkEnrollmentData[];
    errors: Array<{ row: number; errors: string[] }>;
  }> {
    console.log(`🔍 CSVService: Validating ${records.length} CSV records`);

    const valid: BulkEnrollmentData[] = [];
    const errors: Array<{ row: number; errors: string[] }> = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // Account for header row (1) + 0-indexed array

      // Skip completely empty rows
      const allFieldsEmpty = Object.values(record).every(
        val => val === '' || val === null || val === undefined
      );
      if (allFieldsEmpty) {
        console.log(`⏭️  CSVService: Skipping empty row ${rowNumber}`);
        continue;
      }

      try {
        // Transform CSV row to BulkEnrollmentData format
        const data: BulkEnrollmentData = {
          student: {
            firstName: record['Student First Name']?.trim() || '',
            lastName: record['Student Last Name']?.trim() || '',
            dateOfBirth: record['Student Date of Birth (YYYY-MM-DD)']?.trim() || '',
            gender: record['Student Gender (Male/Female/Other)']?.trim() || '',
            email: record['Student Email']?.trim() || '',
            phone: record['Student Phone']?.trim() || '',
            address: record['Student Address']?.trim() || ''
          },
          guardian: {
            firstName: record['Guardian First Name']?.trim() || '',
            lastName: record['Guardian Last Name']?.trim() || '',
            email: record['Guardian Email']?.trim() || '',
            phone: record['Guardian Phone']?.trim() || '',
            relation: record['Guardian Relation (Father/Mother/Guardian/Other)']?.trim() || '',
            age: record['Guardian Age'] ? parseInt(record['Guardian Age'], 10) : 0
          },
          enrollment: {
            gradeLevel: record['Grade Level']?.trim() || '',
            academicYear: record['Academic Year']?.trim() || ''
          }
        };

        // Validate the data
        const validation = CSVValidator.validateBulkEnrollment(data);

        if (validation.isValid) {
          valid.push(data);
          console.log(`✅ CSVService: Row ${rowNumber} validated successfully`);
        } else {
          errors.push({
            row: rowNumber,
            errors: validation.errors
          });
          console.warn(`⚠️  CSVService: Row ${rowNumber} has validation errors:`, validation.errors);
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          errors: [`Failed to process row: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
        console.error(`❌ CSVService: Error processing row ${rowNumber}`, error);
      }
    }

    console.log(`✅ CSVService: Validation complete - ${valid.length} valid, ${errors.length} with errors`);

    return { valid, errors };
  }

  /**
   * Process complete CSV file: parse + validate
   */
  async processCSVFile(fileContent: string): Promise<{
    valid: BulkEnrollmentData[];
    errors: Array<{ row: number; errors: string[] }>;
  }> {
    console.log('🔄 CSVService: Starting CSV file processing');

    try {
      // Step 1: Parse CSV
      const records = await this.parseCSV(fileContent);

      if (records.length === 0) {
        throw new Error('CSV file is empty or has no data rows');
      }

      // Step 2: Validate and transform
      const result = await this.validateAndTransformCSV(records);

      console.log('✅ CSVService: CSV file processing complete');
      return result;
    } catch (error) {
      console.error('❌ CSVService: Failed to process CSV file', error);
      throw error;
    }
  }

  /**
   * Generate CSV report from validation errors
   */
  async generateErrorReport(
    errors: Array<{ row: number; errors: string[] }>
  ): Promise<string> {
    console.log(`📄 CSVService: Generating error report for ${errors.length} errors`);

    const headers = ['Row Number', 'Error Details'];
    const rows = errors.map(error => [
      error.row.toString(),
      error.errors.join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    console.log('✅ CSVService: Error report generated');
    return csvContent;
  }

  /**
   * Validate CSV headers
   */
  validateHeaders(headers: string[]): boolean {
    const expectedHeaders = [
      'Student First Name',
      'Student Last Name',
      'Student Date of Birth (YYYY-MM-DD)',
      'Student Gender (Male/Female/Other)',
      'Student Email',
      'Student Phone',
      'Student Address',
      'Grade Level',
      'Academic Year',
      'Guardian First Name',
      'Guardian Last Name',
      'Guardian Email',
      'Guardian Phone',
      'Guardian Relation (Father/Mother/Guardian/Other)',
      'Guardian Age'
    ];

    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      console.error('❌ CSVService: Missing required headers:', missingHeaders);
      return false;
    }

    console.log('✅ CSVService: All required headers present');
    return true;
  }
}

export const csvService = new CSVService();
