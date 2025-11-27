import api from "../../../api/axios";  
// this is the correct axios instance based on your project structure

// ===============================
// SALARY COMPONENTS API
// ===============================

// Get all salary components
export const getSalaryComponents = () => api.get("/salary-components/");

// Create a new salary component
export const createSalaryComponent = (data) => api.post("/salary-components/", data);


// ===============================
// PAYROLL API
// ===============================

// Get all payrolls (with optional filters)
export const getPayrolls = (filters = {}) => {
    return api.get("/payroll/", { params: filters });
};

// Create payroll
export const createPayroll = (data) => {
    return api.post("/payroll/", data);
};

// Get payroll by ID
export const getPayrollById = (id) => {
    return api.get(`/payroll/${id}/`);
};

// Recalculate payroll
export const recalculatePayroll = (id) => {
    return api.post(`/payroll/${id}/recalculate/`);
};
