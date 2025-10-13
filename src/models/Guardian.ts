/**
 * Guardian Model
 * Represents guardian/parent information for org ward students
 */

export interface Guardian {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  relation: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGuardianDTO {
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  relation: string;
  age?: number;
}

export interface UpdateGuardianDTO {
  name?: string;
  email?: string;
  phone?: string;
  relation?: string;
  age?: number;
}

/**
 * Validation helpers
 */
export const GuardianValidation = {
  isValidEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  isValidPhone: (phone: string): boolean => {
    const regex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return regex.test(phone);
  },

  isValidRelation: (relation: string): boolean => {
    const validRelations = ['Parent', 'Mother', 'Father', 'Guardian', 'Aunt', 'Uncle', 'Grandparent', 'Sibling', 'Other'];
    return validRelations.includes(relation);
  }
};
