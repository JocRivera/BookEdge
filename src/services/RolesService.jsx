import axios from "axios";

const API_URL_ROL = "http://localhost:3000/roles";

export const getRoles = async () => {
    const response = await axios.get(API_URL_ROL);
    return response.data
  }

  export const postRoles = async () =>{
    const response = await axios.post(API_URL_ROL)
    return response.data
  }