import React from 'react'
import { useNavigate } from 'react-router-dom'
import { masterListTabs } from './masterListTabs'

const MasterTab = React.memo(function MasterTab({ masterTabs = [] }) {
  const navigate = useNavigate()
  // console.log(masterList);

  return (
    <div className="profile-card">
      <h3>Master Data Management</h3>
      <p>Manage lookup data used across the compliance system</p>
      <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {masterListTabs.map(item => (
        <button key={item?.key} className="light-btn" style={{ textAlign: "left", padding: "12px 14px" }} onClick={() => navigate(`/masters/${item?.key}`)}>
        {item?.tabName} →
        </button>
      ))}
      </div>
    </div>
  )
})

export default MasterTab