/**
 * CSV Validator Utility
 * Validates CSV data for bulk student enrollment
 */

// Types for bulk enrollment data
export interface BulkEnrollmentData {
  student: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    address: string;
  };
  guardian: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relation: string;
    age: number;
  };
  enrollment: {
    gradeLevel: string;
    academicYear: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class CSVValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }

  /**
   * Validate phone format
   */
  static isValidPhone(phone: string): boolean {
    if (!phone) return true; // Phone is optional
    const regex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return regex.test(phone.trim());
  }

  /**
   * Validate education level
   */
  static isValidEducationLevel(level: string): boolean {
    if (!level) return false;
    const validLevels = ['PRIMARY', 'SECONDARY', 'TERTIARY', 'VOCATIONAL', 'OTHER'];
    return validLevels.includes(level.toUpperCase().trim());
  }

  /**
   * Validate required field
   */
  static isRequired(value: any): boolean {
    return value !== undefined && value !== null && value !== '' && String(value).trim() !== '';
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(value: string): string {
    if (!value) return '';
    return value.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate age
   */
  static isValidAge(age: any): boolean {
    if (!age) return true; // Age is optional
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum > 0 && ageNum < 150;
  }

  /**
   * Validate academic year format (e.g., 2025-2026)
   */
  static isValidAcademicYear(year: string): boolean {
    if (!year) return false;
    const regex = /^\d{4}-\d{4}$/;
    return regex.test(year.trim());
  }

  /**
   * Validate guardian relation
   */
  static isValidRelation(relation: string): boolean {
    if (!relation) return false;
    const validRelations = ['Parent', 'Mother', 'Father', 'Guardian', 'Aunt', 'Uncle', 'Grandparent', 'Sibling', 'Other'];
    return validRelations.some(valid => valid.toLowerCase() === relation.toLowerCase().trim());
  }

  /**
   * Validate date of birth format (YYYY-MM-DD)
   */
  static isValidDateOfBirth(dob: string): boolean {
    if (!dob) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dob.trim())) return false;
    
    // Check if date is valid
    const date = new Date(dob);
    return !isNaN(date.getTime());
  }

  /**
   * Validate gender
   */
  static isValidGender(gender: string): boolean {
    if (!gender) return false;
    const validGenders = ['Male', 'Female', 'Other'];
    return validGenders.some(valid => valid.toLowerCase() === gender.toLowerCase().trim());
  }

  /**
   * Validate bulk enrollment data
   */
  static validateBulkEnrollment(data: BulkEnrollmentData): ValidationResult {
    const errors: string[] = [];

    // Student validations
    if (!this.isRequired(data.student.firstName)) {
      errors.push('Student first name is required');
    }
    if (!this.isRequired(data.student.lastName)) {
      errors.push('Student last name is required');
    }
    if (!this.isValidDateOfBirth(data.student.dateOfBirth)) {
      errors.push('Student date of birth must be in YYYY-MM-DD format');
    }
    if (!this.isValidGender(data.student.gender)) {
      errors.push('Student gender must be Male, Female, or Other');
    }
    if (data.student.email && !this.isValidEmail(data.student.email)) {
      errors.push('Student email format is invalid');
    }
    if (data.student.phone && !this.isValidPhone(data.student.phone)) {
      errors.push('Student phone format is invalid');
    }

    // Guardian validations
    if (!this.isRequired(data.guardian.firstName)) {
      errors.push('Guardian first name is required');
    }
    if (!this.isRequired(data.guardian.lastName)) {
      errors.push('Guardian last name is required');
    }
    if (!this.isValidEmail(data.guardian.email)) {
      errors.push('Guardian email is required and must be valid');
    }
    if (!this.isValidPhone(data.guardian.phone)) {
      errors.push('Guardian phone format is invalid');
    }
    if (!this.isValidRelation(data.guardian.relation)) {
      errors.push('Guardian relation is required and must be valid (Father/Mother/Guardian/Other)');
    }
    if (!this.isValidAge(data.guardian.age)) {
      errors.push('Guardian age must be a valid number');
    }

    // Enrollment validations
    if (!this.isRequired(data.enrollment.gradeLevel)) {
      errors.push('Grade level is required');
    }
    if (!this.isValidAcademicYear(data.enrollment.academicYear)) {
      errors.push('Academic year must be in YYYY-YYYY format (e.g., 2024-2025)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

