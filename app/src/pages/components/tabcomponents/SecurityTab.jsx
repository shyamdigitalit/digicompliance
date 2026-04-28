import React from 'react'

const SecurityTab = React.memo(function SecurityTab() {
  return (
    <div className="profile-card">
        <h3>Security Settings</h3>
        <p>Manage your password and account security</p>
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div><label>Current Password</label><input type="password" placeholder="••••••••" /></div>
            <div><label>New Password</label><input type="password" placeholder="••••••••" /></div>
            <div><label>Confirm New Password</label><input type="password" placeholder="••••••••" /></div>
        </div>
        <button className="dark-btn" style={{ marginTop: "20px" }}>Update Password</button>
    </div>
  )
})

export default SecurityTab