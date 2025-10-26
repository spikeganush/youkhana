export const uploadFn = async (file: File) => {
  // TODO: Implement actual image upload to Vercel Blob or your storage
  // For now, just create a local URL
  const url = URL.createObjectURL(file);
  return url;
};
