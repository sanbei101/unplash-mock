import { LiteOSS } from "oss-lite";
import { z } from "zod";

const bodySchema = z.object({
  url: z.url(),
  filename: z.string(),
});

let ossClient: LiteOSS | null = null;

function getOSSClient(config: {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
}) {
  if (!ossClient) {
    ossClient = new LiteOSS({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      region: config.region,
    });
  }
  return ossClient;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const { url, filename } = bodySchema.parse(body);

  const oss = getOSSClient({
    accessKeyId: config.ossAccessKeyId,
    accessKeySecret: config.ossAccessKeySecret,
    bucket: config.ossBucket,
    region: config.ossRegion,
  });

  const response = await fetch(url);
  const blob = await response.blob();

  const result = await oss.uploadFile(
    filename,
    blob,
    `image/${filename.split(".").pop() || "jpg"}`,
  );

  if (!result.success) {
    throw createError({
      statusCode: 500,
      statusMessage: `Upload failed: ${url}`,
    });
  }

  return {
    cdnUrl: `${config.ossCdnBaseUrl}/${filename}`,
  };
});
