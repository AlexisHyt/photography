import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getMinioConfig() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET || "photography";
  const region = process.env.MINIO_REGION || "us-east-1";
  const useSSL = process.env.MINIO_USE_SSL !== "false";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("MinIO configuration is incomplete.");
  }

  const hasProtocol =
    endpoint.startsWith("http://") || endpoint.startsWith("https://");
  const endpointUrl = hasProtocol
    ? endpoint
    : `${useSSL ? "https" : "http"}://${endpoint}`;
  const parsedEndpoint = new URL(endpointUrl);

  return {
    endpoint,
    endpointUrl: parsedEndpoint.origin,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
    useSSL,
  };
}

let minioClient: S3Client | null = null;

export function getMinioClient(): S3Client {
  if (minioClient) {
    return minioClient;
  }

  const config = getMinioConfig();

  minioClient = new S3Client({
    region: config.region,
    endpoint: config.endpointUrl,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });

  return minioClient;
}

export async function uploadToMinio(
  storageKey: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<string> {
  const config = getMinioConfig();
  const client = getMinioClient();

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
      Body: fileBuffer,
      ContentType: contentType,
    }),
  );

  return getSignedMinioUrl(storageKey);
}

export async function getSignedMinioUrl(
  storageKey: string,
  expiresInSeconds = 60 * 60,
): Promise<string> {
  const config = getMinioConfig();
  const client = getMinioClient();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
    }),
    { expiresIn: expiresInSeconds },
  );
}

export async function deleteFromMinio(storageKey: string): Promise<void> {
  const config = getMinioConfig();
  const client = getMinioClient();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
    }),
  );
}

export async function objectExists(storageKey: string): Promise<boolean> {
  const config = getMinioConfig();
  const client = getMinioClient();

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: config.bucket,
        Key: storageKey,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
