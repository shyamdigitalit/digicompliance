import React from 'react'

const ChangePass = React.memo(function ChangePass() {
  return (
    <div className="profile-form">
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div><label>Current Password</label><input type="password" placeholder="••••••••" /></div>
        <div><label>New Password</label><input type="password" placeholder="••••••••" /></div>
        <div><label>Confirm New Password</label><input type="password" placeholder="••••••••" /></div>
      </div>
      <button className="dark-btn" style={{ marginTop: "20px" }}>Update Password</button>
    </div>
  )
})

const SecurityTab = () => {
  const [form, setForm] = React.useState(false)
  // const handleForm = () => {}

  return (
    <div className="profile-card">
      <h3>Security Settings</h3>
      <p>Manage your password and account security</p>
      <div className="profile-section">
        <button onClick={() => setForm(!form)} className="dark-btn">Change Password</button>
      </div>

      {form && <ChangePass />}
    </div>
  )
}

export default React.memo(SecurityTab)