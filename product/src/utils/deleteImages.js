import imagekit from "../config/imagekit.js";

export const deleteImages = async (images = []) => {
  const deletes = images.map((img) => imagekit.deleteFile(img.fileId));

  await Promise.all(deletes);
};
