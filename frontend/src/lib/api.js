import axios from "axios";

const api = axios.create({
  baseURL: "https://play-station-tournament-app.vercel.app",
});

export default api;
