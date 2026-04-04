import React from "react";
import AddCompliance from "./AddCompliance";
import "../styles/Compliance.css";

const Compliance = () => {
    const [showAddForm, setShowAddForm] = React.useState(false);

    const [data, setData] = React.useState([
        {
            id: "CMP-001",
            plant: "Mumbai Plant A",
            dept: "Operations",
            type: "Safety Inspection",
            category: "Health & Safety",
            freq: "Monthly",
            criticality: "High",
            status: "Completed"
        },
        {
            id: "CMP-002",
            plant: "Delhi Plant B",
            dept: "Quality",
            type: "ISO Audit",
            category: "Quality Management",
            freq: "Quarterly",
            criticality: "Critical",
            status: "Pending"
        },
        {
            id: "CMP-003",
            plant: "Mumbai Plant A",
            dept: "HR",
            type: "Labour Law",
            category: "Statutory",
            freq: "Annual",
            criticality: "Medium",
            status: "In Progress"
        },
        {
            id: "CMP-004",
            plant: "Bangalore Plant C",
            dept: "Environment",
            type: "Pollution Control",
            category: "Environmental",
            freq: "Monthly",
            criticality: "Critical",
            status: "Overdue"
        },
        {
            id: "CMP-005",
            plant: "Delhi Plant B",
            dept: "Operations",
            type: "Fire Safety",
            category: "Health & Safety",
            freq: "Weekly",
            criticality: "High",
            status: "Completed"
        },
        {
            id: "CMP-006",
            plant: "Bangalore Plant C",
            dept: "Quality",
            type: "Product Testing",
            category: "Quality Management",
            freq: "Daily",
            criticality: "Medium",
            status: "In Progress"
        },
        {
            id: "CMP-007",
            plant: "Mumbai Plant A",
            dept: "HR",
            type: "Employee Training",
            category: "Statutory",
            freq: "Quarterly",
            criticality: "Low",
            status: "Pending"
        },
        {
            id: "CMP-008",
            plant: "Delhi Plant B",
            dept: "Environment",
            type: "Waste Management",
            category: "Environmental",
            freq: "Monthly",
            criticality: "High",
            status: "Completed"
        }
    ]);

    const getTag = (val) => {
        return val.toLowerCase();
    };

    const handleAddSubmit = (formData) => {
        console.log("New Compliance:", formData);

        setData(prev => [...prev, {
            id: `CMP-00${prev.length + 1}`,
            plant: formData.plant,
            dept: formData.department,
            type: formData.type,
            category: formData.category,
            freq: formData.frequency,
            criticality: formData.criticality,
            status: formData.status || "Pending"
        }]);

        setShowAddForm(false);
    };

    const handleCancel = () => {
        setShowAddForm(false);
    };

    return (
        <div className="compliance-page">

            {showAddForm ? (
                <AddCompliance
                    onCancel={handleCancel}
                    onSubmit={handleAddSubmit}
                />
            ) : (
                <>
                    {/* HEADER */}
                    <div className="header">
                        <div>
                            <h2>Compliance Management</h2>
                            <p>Manage and track statutory compliance across all plants</p>
                        </div>
                    </div>

                    {/* FILTER BAR */}
                    <div className="filter-box">
                        <div className="filter-row">
                            <input placeholder="Search by ID, type, category..." />

                            <select><option>All Plants</option></select>
                            <select><option>All Departments</option></select>
                            <select><option>All Status</option></select>
                        </div>

                        <div className="filter-row second">
                            <button className="light-btn">📅 Date Range</button>
                            <button className="light-btn">⚙ More filters</button>

                            <button
                                className="add-btn"
                                onClick={() => setShowAddForm(true)}
                            >
                                + Add Compliance
                            </button>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="table-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Compliance ID</th>
                                    <th>Plant</th>
                                    <th>Department</th>
                                    <th>Compliance Type</th>
                                    <th>Category</th>
                                    <th>Frequency</th>
                                    <th>Criticality</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((item, i) => (
                                    <tr key={i}>
                                        <td className="link">{item.id}</td>
                                        <td>{item.plant}</td>
                                        <td>{item.dept}</td>
                                        <td>{item.type}</td>
                                        <td>{item.category}</td>
                                        <td>{item.freq}</td>

                                        <td>
                                            <span className={`tag ${getTag(item.criticality)}`}>
                                                {item.criticality}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`status ${getTag(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* FOOTER */}
                        <div className="table-footer">
                            <span>Showing 1 to 8 of 8 results</span>

                            <div>
                                <button className="light-btn">Previous</button>
                                <button className="dark-btn">Next</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Compliance;