import { instance } from "../axios";

const mypage = async (hostId) => {
  try {
    const { data } = await instance.get(`/page/${hostId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

const mypageInformationAxios = async ({ hostId, formData }) => {
  const config = {
    headers: {
      "Content-type": "multipart/form-data",
    },
  };
  console.log(hostId);
  console.log(formData);

  try {
    const response = await instance.put(`/page/${hostId}`, formData, config);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { mypage, mypageInformationAxios };