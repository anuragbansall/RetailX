import imagekit from "../config/imagekit.js";

export const uploadImages = async (files) => {
  const uploadPromises = files.map((file) =>
    imagekit
      .upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`, // Unique file name with preserved extension
        folder: "products",
      })
      .then((result) => ({
        url: result.url,
        fileId: result.fileId,
        thumbnail: result.thumbnailUrl,
      })),
  );

  const uploadedImages = await Promise.all(uploadPromises);

  return uploadedImages;
};
