import express, { Request, Response } from 'express';
import { LibraryService } from '../services/LibraryService';

const router = express.Router();
const libraryService = new LibraryService();

/**
 * @route GET /api/library/schools
 * @desc Get all school data
 * @access Public
 */
router.get('/schools', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching all school data...');
    const schools = await libraryService.getAllSchoolData();
    
    res.status(200).json({
      success: true,
      message: 'Schools retrieved successfully',
      data: schools,
      count: schools.length
    });
  } catch (error: any) {
    console.error('❌ Error fetching schools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve schools',
      error: error.message
    });
  }
});

/**
 * @route POST /api/library/schools
 * @desc Add new school data
 * @access Public (you might want to add authentication later)
 */
// router.post('/schools', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { 
//       REGION, 
//       DISTRICT, 
//       SCHOOL, 
//       CATEGORIES, 
//       LOCATION, 
//       GENDER, 
//       RESIDENCY, 
//       "EMAIL ADDRESS": emailAddress, 
//       Categories2, 
//       electives, 
//       core 
//     } = req.body;

//     // Validate required fields
//     if (!REGION || !DISTRICT || !SCHOOL || !CATEGORIES) {
//       res.status(400).json({
//         success: false,
//         message: 'REGION, DISTRICT, SCHOOL, and CATEGORIES are required fields'
//       });
//       return;
//     }

//     const schoolData = {
//       REGION,
//       DISTRICT,
//       SCHOOL,
//       CATEGORIES,
//       LOCATION: LOCATION || '',
//       GENDER: GENDER || '',
//       RESIDENCY: RESIDENCY || '',
//       "EMAIL ADDRESS": emailAddress || '',
//       Categories2: Categories2 || '',
//       electives: electives || '',
//       core: core || ''
//     };

//     console.log('➕ Adding new school:', schoolData);
//     const newSchool = await libraryService.addSchoolData(schoolData);
    
//     res.status(201).json({
//       success: true,
//       message: 'School added successfully',
//       data: newSchool
//     });
//   } catch (error: any) {
//     console.error('❌ Error adding school:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add school',
//       error: error.message
//     });
//   }
// });




/**
 * @route GET /api/library/schools/search
 * @desc Search schools by name, district, or region
 * @access Public
 */
router.get('/schools/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm || typeof searchTerm !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Search query parameter "searchTerm" is required'
      });
      return;
    }

    console.log('🔍 Searching schools with query:', searchTerm);
    const schools = await libraryService.searchSchools(searchTerm, 'school_data', ['SCHOOL', 'DISTRICT', 'REGION']);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: schools,
      count: schools.length,
      query: searchTerm
    });
  } catch (error: any) {
    console.error('❌ Error searching schools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search schools',
      error: error.message
    });
  }
});


export default router;
