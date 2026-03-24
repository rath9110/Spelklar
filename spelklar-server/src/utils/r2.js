const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize R2 client
// Use Cloudflare R2 endpoint instead of AWS S3
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned URL for uploading a photo
 * Client uploads directly to R2 without going through our server
 */
async function generatePresignedUploadUrl(photoId, contentType = 'image/jpeg') {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error('R2_BUCKET_NAME not configured');
  }

  const key = `photos/${photoId}.jpg`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return { signedUrl, storageKey: key };
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    throw err;
  }
}

/**
 * Generate a presigned URL for downloading/viewing a photo
 */
async function generatePresignedDownloadUrl(storageKey, expiresIn = 86400) {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error('R2_BUCKET_NAME not configured');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: storageKey,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (err) {
    console.error('Error generating download URL:', err);
    throw err;
  }
}

/**
 * Check if R2 is configured
 */
function isR2Configured() {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

/**
 * In development/demo mode, photos are stored locally
 * Returns a fake URL for testing
 */
function generateDemoPhotoUrl(storageKey) {
  return `/api/photos/demo/${storageKey}`;
}

module.exports = {
  s3Client,
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  isR2Configured,
  generateDemoPhotoUrl,
};
