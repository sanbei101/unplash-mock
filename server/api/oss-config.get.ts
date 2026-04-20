export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  return {
    ossConfigured: !!(
      config.ossAccessKeyId &&
      config.ossAccessKeySecret &&
      config.ossBucket &&
      config.ossRegion &&
      config.ossCdnBaseUrl
    ),
  };
});
