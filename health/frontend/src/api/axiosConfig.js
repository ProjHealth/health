import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend server URL
  withCredentials: true, // allows sending cookies if you use JWT in cookies
});

export default api;
