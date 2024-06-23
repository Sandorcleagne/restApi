export const getPublicIdFromUrl = (url: String) => {
  const urlParts = url.split("/");
  const publicIdWithFormat = urlParts[urlParts.length - 1];
  const publicId = publicIdWithFormat.substring(
    0,
    publicIdWithFormat.lastIndexOf(".")
  );
  return publicId;
};
