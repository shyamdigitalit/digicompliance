import React from 'react'
import { useNavigate } from 'react-router-dom'
import { masterListTabs } from './masterListTabs'
import { useSelector } from "react-redux";


const MasterTab = React.memo(function MasterTab() {
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)

  const filteredMasterListTabs = masterListTabs?.filter(m => {
    if (m.level===0) return m
    if (m.level!==0 && m.level>=user?.acc_typ?.heirarchy) return m
  })

  return (
    <div className="profile-card">
      <h3>Master Data Management</h3>
      <p>Manage lookup data used across the compliance system</p>
      <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {filteredMasterListTabs.map(item => (
        <button key={item?.key} className="light-btn" style={{ textAlign: "left", padding: "12px 14px" }} onClick={() => navigate(`/masters/${item?.key}`)}>
        {item?.tabName} →
        </button>
      ))}
      </div>
    </div>
  )
})

export default MasterTab