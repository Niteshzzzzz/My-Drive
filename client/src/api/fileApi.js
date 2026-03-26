import { axiosWithCreds } from "./axiosInstances";

export const deleteFile = async (id) => {
  const { data } = await axiosWithCreds.delete(`/file/${id}`);
  return data;
};

export const renameFile = async (id, newFilename) => {
  const { data } = await axiosWithCreds.patch(`/file/${id}`, {
    newFilename,
  });
  return data;
};

export const uploadInitiate = async (fileData) => {
  const { data } = await axiosWithCreds.post(`/file/uploads/initiate`, fileData);
  return data;
};

export const uploadComplete = async (fileId) => {
  const { data } = await axiosWithCreds.post(`/file/uploads/complete`, {fileId});
  return data;
};

export const uploadFileWithProgress = async (
  dirId,
  file,
  filename,
  onUploadProgress
) => {
  const { data } = await axiosWithCreds.post(`/file/${dirId || ""}`, file, {
    headers: {
      "Content-Type": file.type,
      filename,
    },
    onUploadProgress,
  });
  return data;
};
