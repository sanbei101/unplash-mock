import { LiteOSS } from "oss-lite";
import { z } from "zod";

const bodySchema = z.object({
  url: z.string().url(),
  filename: z.string(),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const { url, filename } = bodySchema.parse(body);

  const oss = new LiteOSS({
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
