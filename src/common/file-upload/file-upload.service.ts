import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "src/config/spaces.config";
import { v4 as uuid } from "uuid";

export class FileUploadService {
  
  // ✅ Upload Public File (Products)
  async uploadPublic(file: Express.Multer.File, folder: string) {
    const fileName = `${folder}/${uuid()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.cdn.digitaloceanspaces.com/${fileName}`;
  }

  // 🔐 Upload Private File
  async uploadPrivate(file: Express.Multer.File, folder: string) {
    const fileName = `${folder}/${uuid()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return fileName; // store only key in DB
  }

  // 🔐 Generate Signed URL (Private Access)
  async getSignedUrl(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: fileKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
  }

  // 🗑 Delete File
  async deleteFile(fileKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: fileKey,
    });

    await s3Client.send(command);
  }
}