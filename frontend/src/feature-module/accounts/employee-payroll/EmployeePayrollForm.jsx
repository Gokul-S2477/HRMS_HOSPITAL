import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../utils/axiosInstance";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EmployeePayrollForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If editing payroll

  const [employees, setEmployees] = useState([]);
  const [components, setComponents] = useState([]);

  const [form, setForm] = useState({
    employee: "",
    month: "",
    year: new Date().getFullYear(),
    components: [],
    total_salary: 0,
  });

  // Load employees + salary components from backend
  const loadData = async () => {
    try {
      const empRes = await axios.get("/employees/?limit=200");
      const compRes = await axios.get("/salary-components/");

      setEmployees(empRes.data.results || empRes.data);
      setComponents(compRes.data);
    } catch (error) {
      console.error("Load error:", error);
    }
  };

  // Load payroll data when editing
  const loadExistingPayroll = async () => {
    if (!id) return;

    try {
      const res = await axios.get(`/employee-payroll/${id}/`);
      setForm(res.data);
    } catch (error) {
      console.error("Failed to load payroll:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadExistingPayroll();
  }, []);

  // Handle Inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleComponentChange = (index, value) => {
    const updated = [...form.components];
    updated[index].amount = value;

    const total = updated.reduce(
      (sum, c) => sum + parseFloat(c.amount || 0),
      0
    );

    setForm({
      ...form,
      components: updated,
      total_salary: total,
    });
  };

  const addComponent = () => {
    setForm({
      ...form,
      components: [...form.components, { name: "", amount: 0 }]
    });
  };

  const savePayroll = async () => {
    try {
      if (id) {
        await axios.put(`/employee-payroll/${id}/`, form);
      } else {
        await axios.post("/employee-payroll/", form);
      }

      navigate("/accounts/employee-payroll");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save payroll");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        <div className="page-header">
          <h3 className="page-title">
            {id ? "Edit Payroll" : "Create Payroll"}
          </h3>
        </div>

        <div className="card">
          <div className="card-body">

            {/* Employee */}
            <div className="mb-3">
              <label className="form-label">Employee</label>
              <select
                className="form-control"
                name="employee"
                value={form.employee}
                onChange={handleChange}
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div className="mb-3">
              <label className="form-label">Month</label>
              <select
                className="form-control"
                name="month"
                value={form.month}
                onChange={handleChange}
              >
                <option value="">Select Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="mb-3">
              <label className="form-label">Year</label>
              <input
                type="number"
                name="year"
                className="form-control"
                value={form.year}
                onChange={handleChange}
              />
            </div>

            {/* Salary Components */}
            <h5 className="mt-4">Salary Components</h5>

            {form.components.map((c, index) => (
              <div key={index} className="row mb-3">
                <div className="col-md-6">
                  <select
                    className="form-control"
                    value={c.name}
                    onChange={(e) => {
                      const updated = [...form.components];
                      updated[index].name = e.target.value;
                      setForm({ ...form, components: updated });
                    }}
                  >
                    <option value="">Select Component</option>
                    {components.map((comp) => (
                      <option key={comp.id} value={comp.name}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    value={c.amount}
                    onChange={(e) =>
                      handleComponentChange(index, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <button
              className="btn btn-secondary mb-3"
              onClick={addComponent}
            >
              + Add Component
            </button>

            {/* Total */}
            <div className="mt-3">
              <h4>Total Salary: ₹ {form.total_salary}</h4>
            </div>

            {/* Save Button */}
            <button className="btn btn-primary mt-4" onClick={savePayroll}>
              {id ? "Update Payroll" : "Create Payroll"}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeePayrollForm;
