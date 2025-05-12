import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Listing } from '../entities/Listing';
import { validate } from 'class-validator';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload image to S3
async function uploadToS3(file: Express.Multer.File): Promise<string> {
  const key = `listings/${uuidv4()}-${file.originalname}`;
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Create new listing
router.post('/api/listings', upload.array('images', 5), async (req: Request, res: Response) => {
  try {
    const listingRepository = getRepository(Listing);
    
    // Upload images to S3
    const imageUrls = await Promise.all(
      (req.files as Express.Multer.File[]).map(file => uploadToS3(file))
    );

    // Create listing with uploaded image URLs
    const listing = listingRepository.create({
      ...req.body,
      imageUrls,
      agent: { id: req.body.agentId }, // Assuming agentId is passed in the request
    });

    // Validate the listing data
    const errors = await validate(listing);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Save the listing
    const savedListing = await listingRepository.save(listing);
    return res.status(201).json(savedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all listings
router.get('/api/listings', async (req: Request, res: Response) => {
  try {
    const listingRepository = getRepository(Listing);
    const listings = await listingRepository.find({
      where: { isActive: true },
      relations: ['agent'],
    });
    return res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get listing by ID
router.get('/api/listings/:id', async (req: Request, res: Response) => {
  try {
    const listingRepository = getRepository(Listing);
    const listing = await listingRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['agent'],
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    return res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update listing
router.put('/api/listings/:id', upload.array('images', 5), async (req: Request, res: Response) => {
  try {
    const listingRepository = getRepository(Listing);
    const listing = await listingRepository.findOne(parseInt(req.params.id));

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Handle new image uploads if any
    let imageUrls = listing.imageUrls;
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const newImageUrls = await Promise.all(
        (req.files as Express.Multer.File[]).map(file => uploadToS3(file))
      );
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Update listing
    const updatedListing = listingRepository.merge(listing, {
      ...req.body,
      imageUrls,
    });

    // Validate the updated listing
    const errors = await validate(updatedListing);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const savedListing = await listingRepository.save(updatedListing);
    return res.json(savedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 