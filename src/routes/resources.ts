import express, { Request, Response } from 'express';
import { ResourcesService } from '../services/ResourcesService';

const router = express.Router();
const resourcesService = new ResourcesService();

/**
 * @route GET /api/resources
 * @desc Get all resources
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching all resources...');
    const resources = await resourcesService.getAllResources();
    
    res.status(200).json({
      success: true,
      message: 'Resources retrieved successfully',
      data: resources,
      count: resources.length
    });
  } catch (error: any) {
    console.error('❌ Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resources',
      error: error.message
    });
  }
});

/**
 * @route GET /api/resources/type/:type
 * @desc Get resources by type (students, parents, counselors)
 * @access Public
 */
router.get('/type/:type', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    
    // Validate resource type
    if (!['students', 'parents', 'counselors'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid resource type. Must be one of: students, parents, counselors'
      });
      return;
    }

    console.log(`📋 Fetching ${type} resources...`);
    const resources = await resourcesService.getResourcesByType(type as 'students' | 'parents' | 'counselors');
    
    res.status(200).json({
      success: true,
      message: `${type} resources retrieved successfully`,
      data: resources,
      count: resources.length,
      type: type
    });
  } catch (error: any) {
    console.error('❌ Error fetching resources by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resources by type',
      error: error.message
    });
  }
});

/**
 * @route POST /api/resources
 * @desc Add new resource
 * @access Public (you might want to add authentication later)
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      description, 
      full_description,
      category, 
      type,
      resource_type, 
      rating,
      link, 
      featured,
      image,
      features,
      duration,
      difficulty,
      tags,
      free,
      created_by 
    } = req.body;

    // Validate required fields
    if (!title || !description || !full_description || !category || !type || !resource_type || !features) {
      res.status(400).json({
        success: false,
        message: 'title, description, full_description, category, type, resource_type, and features are required fields'
      });
      return;
    }

    // Validate resource type
    if (!['students', 'parents', 'counselors'].includes(resource_type)) {
      res.status(400).json({
        success: false,
        message: 'resource_type must be one of: students, parents, counselors'
      });
      return;
    }

    const resourceData = {
      title,
      description,
      full_description,
      category,
      type,
      resource_type: resource_type as 'students' | 'parents' | 'counselors',
      rating: rating || 0,
      link: link || null,
      featured: featured || false,
      image: image || null,
      features: features || [],
      duration: duration || null,
      difficulty: difficulty || null,
      tags: tags || null,
      free: free !== undefined ? free : true,
      created_by: created_by || null
    };

    console.log('➕ Adding new resource:', resourceData);
    const newResource = await resourcesService.createResource(resourceData);
    
    res.status(201).json({
      success: true,
      message: 'Resource added successfully',
      data: newResource
    });
  } catch (error: any) {
    console.error('❌ Error adding resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add resource',
      error: error.message
    });
  }
});

/**
 * @route GET /api/resources/search
 * @desc Search resources by title, description, category, or tags
 * @access Public
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm || typeof searchTerm !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Search query parameter "searchTerm" is required'
      });
      return;
    }

    console.log('🔍 Searching resources with query:', searchTerm);
    const resources = await resourcesService.searchResources(searchTerm);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: resources,
      count: resources.length,
      query: searchTerm
    });
  } catch (error: any) {
    console.error('❌ Error searching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search resources',
      error: error.message
    });
  }
});

export default router;
