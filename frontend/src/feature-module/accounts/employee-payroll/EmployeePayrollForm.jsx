import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../api/axios";
import { toast } from "react-toastify";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
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
    basic_salary: "",
    hra: "",
    components: [], // list of component ids
  });

  useEffect(() => {
    loadMeta();
    if (id) loadData();
  }, [id]);

  const loadMeta = async () => {
    try {
      const [empRes, compRes] = await Promise.all([
        API.get("/employees/"), // assuming employees endpoint exists
        API.get("/salary-components/"),
      ]);
      setEmployees(empRes.data.results || empRes.data || []);
      setComponents(compRes.data);
    } catch (err) {
      console.error("Failed to load meta", err);
    }
  };

  const loadData = async () => {
    try {
      const res = await API.get(`/employee-payroll/${id}/`);
      const d = res.data;
      setForm({
        employee: d.employee,
        month: d.month,
        year: d.year,
        basic_salary: d.basic_salary || "",
        hra: d.hra || "",
        components: (d.components || []).map((c) => c.id),
      });
    } catch (err) {
      console.error("Failed to load payroll", err);
    }
  };

  const handleToggleComponent = (compId) => {
    setForm((prev) => {
      if (prev.components.includes(compId)) {
        return { ...prev, components: prev.components.filter((c) => c !== compId) };
      } else {
        return { ...prev, components: [...prev.components, compId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        components: form.components
      };
      if (id) {
        await API.put(`/employee-payroll/${id}/`, payload);
        toast.success("Payroll updated");
      } else {
        await API.post("/employee-payroll/", payload);
        toast.success("Payroll created");
      }
      navigate("/accounts/employee-payroll");
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Save failed");
    }
  };

  return (
    <div>
      <h3>{id ? "Edit" : "Create"} Employee Payroll</h3>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Employee</label>
          <select
            className="form-control"
            value={form.employee}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
            required
          >
            <option value="">-- select employee --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Month</label>
            <select
              className="form-control"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              required
            >
              <option value="">-- select month --</option>
              {months.map((m, idx) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Year</label>
            <input
              type="number"
              className="form-control"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Basic Salary</label>
            <input
              type="number"
              className="form-control"
              value={form.basic_salary}
              onChange={(e) => setForm({ ...form, basic_salary: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">HRA</label>
          <input
            type="number"
            className="form-control"
            value={form.hra}
            onChange={(e) => setForm({ ...form, hra: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Components (add/deduct)</label>
          <div>
            {components.map((c) => (
              <div key={c.id} className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`comp-${c.id}`}
                  checked={form.components.includes(c.id)}
                  onChange={() => handleToggleComponent(c.id)}
                />
                <label className="form-check-label" htmlFor={`comp-${c.id}`}>
                  {c.name} ({c.component_type}) - {c.amount}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" type="submit">
          {id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default EmployeePayrollForm;
