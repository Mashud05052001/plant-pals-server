// This image validation only works if use multer-storage-cloudinary to upload image in cloudinary
import { z } from 'zod';

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'png',
  'jpeg',
  'jpg',
] as const;

const ImageSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.enum(ACCEPTED_FILE_TYPES),
  path: z.string(),
  size: z
    .number()
    .refine(
      (size) => size <= MAX_UPLOAD_SIZE,
      'File size must be less than 3MB',
    ),
  filename: z.string(),
});

export const ImageFilesArrayZodSchema = z.object({
  files: z.record(z.string(), z.array(ImageSchema)).refine((files) => {
    return Object.keys(files).length > 0;
  }, 'Image is required'),
});

export const ImageFileZodSchema = z.object({
  file: ImageSchema.refine((file) => file !== undefined, 'Image is required'),
});
