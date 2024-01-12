import * as UploadApi from "../api/UploadRequest";

import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCHtgBDBvhQUWmCdQuH1mZiHzvBtohODoM",
  authDomain: "storage-190f0.firebaseapp.com",
  projectId: "storage-190f0",
  storageBucket: "storage-190f0.appspot.com",
  messagingSenderId: "353306535159",
  appId: "1:353306535159:web:4e98bf63efc04c1d739ff2",
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export { storage, firebase as default };

export const uploadImage = (data) => async (dispatch) => {
  try {
    console.log("Image upload Action start ho gya hy")
    await UploadApi.uploadImage(data);
  } catch (error) {
    console.log(error);
  }
};

export const uploadPost = (data) => async (dispatch) => {
  dispatch({ type: "UPLOAD_START" });
  try {
    const newPost =await UploadApi.uploadPost(data);
    dispatch({ type: "UPLOAD_SUCCESS", data: newPost.data });
  } catch (error) {
    console.log(error);
    dispatch({ type: "UPLOAD_FAIL" });
  }
};


export const convertToFormData = (data) => {
  const formData = new FormData();

  for (const [name, value] of Object.entries(data)) {
    if (value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${name}[]`, item));
    } else if (typeof value === 'object' && value instanceof File) {
      formData.append(name, value);
    } else if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        formData.append(`${name}[${k}]`, v);
      }
    } else {
      formData.append(name, value);
    }
  }

  return formData;
}