import React, { useState } from "react";
import { createSalaryComponent } from "./payrollApi";
import { useNavigate } from "react-router-dom";

const AddSalaryComponent = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        component_type: "",
        amount: "",
    });

    const updateForm = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createSalaryComponent(form);
            alert("Component added successfully!");
            navigate("/main/payroll/list");
        } catch (error) {
            console.error("Error creating component:", error);
            alert("Failed to add salary component.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <h4 className="fw-bold mb-3">Add Salary Component</h4>

            <div className="card">
                <div className="card-body">

                    <form onSubmit={handleSubmit}>

                        {/* Name */}
                        <div className="mb-3">
                            <label className="form-label">Component Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={form.name}
                                onChange={updateForm}
                                required
                            />
                        </div>

                        {/* Type */}
                        <div className="mb-3">
                            <label className="form-label">Component Type</label>
                            <select
                                className="form-control"
                                name="component_type"
                                value={form.component_type}
                                onChange={updateForm}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="earning">Earning</option>
                                <option value="deduction">Deduction</option>
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="mb-3">
                            <label className="form-label">Amount (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="amount"
                                value={form.amount}
                                onChange={updateForm}
                                required
                            />
                        </div>

                        <button className="btn btn-primary" type="submit">
                            Add Component
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default AddSalaryComponent;
