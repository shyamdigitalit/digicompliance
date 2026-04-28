import React from 'react'
import { useNavigate } from 'react-router-dom'

const MasterTab = React.memo(function MasterTab({ masterList = [] }) {
  const navigate = useNavigate()

  return (
    <div className="profile-card">
        <h3>Master Data Management</h3>
        <p>Manage lookup data used across the compliance system</p>
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {masterList.map(item => (
            <button key={item?.key} className="light-btn" style={{ textAlign: "left", padding: "12px 14px" }} onClick={() => navigate(`/masters/${item?.key}`)}>
            {item?.tabName.charAt(0).toUpperCase() + item?.tabName.slice(1)} →
            </button>
        ))}
        </div>
    </div>
  )
})

export default MasterTab