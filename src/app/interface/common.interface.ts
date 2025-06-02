// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface UploadedFiles {
  image?: Express.Multer.File[];
  banner?: Express.Multer.File[];
  images?: Express.Multer.File[];
  frontSide?: Express.Multer.File[];
  backSide?: Express.Multer.File[];
  videos?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}

export interface File {
  path: string;
  filename: string;
  [key: string]: any;
}

export interface FilesObject {
  images?: File[];
  [key: string]: File[] | undefined;
}
