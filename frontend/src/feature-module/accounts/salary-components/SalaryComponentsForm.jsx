import React, { useEffect, useState } from "react";
import axios from "../../../services/axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const SalaryComponentsForm = () => {
  const { id } = useParams(); // if id exists → edit mode
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "addition",
    amount: "",
    percentage: "",
  });

  // Load existing data for edit mode
  const loadData = async () => {
    try {
      const res = await axios.get(`/salary-components/${id}/`);
      setForm({
        name: res.data.name,
        type: res.data.type,
        amount: res.data.amount || "",
        percentage: res.data.percentage || "",
      });
    } catch (err) {
      toast.error("Failed to load component");
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // convert empty string to null
    const payload = {
      name: form.name,
      type: form.type,
      amount: form.amount || null,
      percentage: form.percentage || null,
    };

    try {
      if (id) {
        await axios.put(`/salary-components/${id}/`, payload);
        toast.success("Updated successfully!");
      } else {
        await axios.post("/salary-components/", payload);
        toast.success("Created successfully!");
      }

      navigate("/accounts/salary-components");
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        <div className="page-header">
          <h3 className="page-title">
            {id ? "Edit Salary Component" : "Add Salary Component"}
          </h3>
        </div>

        <div className="card">
          <div className="card-body">

            <form onSubmit={handleSubmit}>
              
              <div className="mb-3">
                <label className="form-label">Component Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  required
                >
                  <option value="addition">Addition</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Amount (optional)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Percentage (optional)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.percentage}
                  onChange={(e) =>
                    setForm({ ...form, percentage: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {id ? "Update" : "Create"}
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SalaryComponentsForm;
