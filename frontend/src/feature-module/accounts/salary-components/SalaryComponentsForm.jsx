import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const SalaryComponentsForm = () => {
  const { id } = useParams(); // if id exists → edit mode
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    component_type: "earning",
    amount: "",
  });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await API.get(`/salary-components/${id}/`);
      setForm({
        name: res.data.name || "",
        component_type: res.data.component_type || "earning",
        amount: res.data.amount || "",
      });
    } catch (err) {
      console.error("Failed to load component", err);
      toast.error("Failed to load component");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await API.put(`/salary-components/${id}/`, form);
        toast.success("Updated successfully");
      } else {
        await API.post("/salary-components/", form);
        toast.success("Created successfully");
      }
      navigate("/accounts/salary-components");
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Save failed");
    }
  };

  return (
    <div>
      <h3>{id ? "Edit" : "Add"} Salary Component</h3>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Type</label>
          <select
            className="form-control"
            value={form.component_type}
            onChange={(e) => setForm({ ...form, component_type: e.target.value })}
          >
            <option value="earning">Earning</option>
            <option value="deduction">Deduction</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Amount</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default SalaryComponentsForm;
