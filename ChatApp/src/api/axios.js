import axios from "axios";
const BASE_URL = process.env.REACT_APP_CHAT_SERVER_URL;

export default axios.create({
  baseURL: BASE_URL,
});
