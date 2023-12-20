import axios from "axios";
const BASE_URL = "http://34.132.242.170:3001";
//baseurl changed???
export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
