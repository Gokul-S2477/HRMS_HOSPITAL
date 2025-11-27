import React, { useEffect, useState } from "react";
import { createPayroll, getSalaryComponents } from "./payrollApi";
import api from "../../../api/axios";  // For employee list
import { useNavigate } from "react-router-dom";

const AddPayroll = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [components, setComponents] = useState([]);

    const [form, setForm] = useState({
        employee: "",
        month: "",
        year: "",
        basic_salary: "",
        hra: "",
        components: [],
    });

    // Load employees
    const loadEmployees = async () => {
        try {
            const res = await api.get("/employees/"); // check your employee API path
            setEmployees(res.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // Load salary components
    const loadComponents = async () => {
        try {
            const res = await getSalaryComponents();
            setComponents(res.data);
        } catch (error) {
            console.error("Error loading components:", error);
        }
    };

    useEffect(() => {
        loadEmployees();
        loadComponents();
    }, []);

    // Handle form inputs
    const updateForm = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Handle component selection (checkbox)
    const toggleComponent = (id) => {
        let updated = [...form.components];

        if (updated.includes(id)) {
            updated = updated.filter((item) => item !== id);
        } else {
            updated.push(id);
        }

        setForm({ ...form, components: updated });
    };

    // Submit payroll
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createPayroll(form);
            alert("Payroll created successfully!");
            navigate("/main/payroll/list");
        } catch (error) {
            console.error("Error creating payroll:", error);
            alert("Failed to create payroll.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <h4 className="fw-bold mb-3">Add Payroll</h4>

            <div className="card">
                <div className="card-body">

                    <form onSubmit={handleSubmit}>

                        {/* Employee */}
                        <div className="mb-3">
                            <label className="form-label">Employee</label>
                            <select
                                className="form-control"
                                name="employee"
                                value={form.employee}
                                onChange={updateForm}
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Month & Year */}
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Month</label>
                                <select
                                    className="form-control"
                                    name="month"
                                    value={form.month}
                                    onChange={updateForm}
                                    required
                                >
                                    <option value="">Select Month</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Year</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="year"
                                    value={form.year}
                                    onChange={updateForm}
                                    required
                                />
                            </div>
                        </div>

                        {/* Basic Salary */}
                        <div className="mb-3">
                            <label className="form-label">Basic Salary</label>
                            <input
                                type="number"
                                className="form-control"
                                name="basic_salary"
                                value={form.basic_salary}
                                onChange={updateForm}
                                required
                            />
                        </div>

                        {/* HRA */}
                        <div className="mb-3">
                            <label className="form-label">HRA</label>
                            <input
                                type="number"
                                className="form-control"
                                name="hra"
                                value={form.hra}
                                onChange={updateForm}
                                required
                            />
                        </div>

                        {/* Salary Components */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Salary Components</label>

                            <div className="row">
                                {components.map((c) => (
                                    <div key={c.id} className="col-md-4 mb-2">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                onChange={() => toggleComponent(c.id)}
                                                checked={form.components.includes(c.id)}
                                            />
                                            <label className="form-check-label">
                                                {c.name} ({c.component_type}) — ₹{c.amount}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-primary" type="submit">
                            Create Payroll
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default AddPayroll;
