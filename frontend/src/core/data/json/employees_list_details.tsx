// REMOVE local JSON usage completely
// This file will now fetch employees from Django backend API

import axios from "axios";

const API_URL = "http://localhost:8000/api/employees/";

export const getEmployeesList = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};
