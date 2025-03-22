import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/", // Asegúrate de que este es el backend correcto
  withCredentials: true, // Esto permite enviar y recibir cookies (authToken y refreshToken)
});

export default API;
