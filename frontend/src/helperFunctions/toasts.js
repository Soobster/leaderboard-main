/*
Helper function for toasts
*/

import { toast } from "react-toastify";

export const successToast = (text, time) => {
  return toast.success(text, {
    position: "bottom-right",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "light",
  });
};

export const errorToast = (text, time) => {
  return toast.error(text, {
    position: "bottom-right",
    autoClose: time,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "light",
  });
};
