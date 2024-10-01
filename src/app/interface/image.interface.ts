// This 2 image types will be used if we use multer-storage-cloudinary for uploading image into cloudinary
export type TImageFiles = { [fieldname: string]: Express.Multer.File[] };
export type TImageFile = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    path: string;
    size: number;
    filename: string;
};
