import React from 'react'
import { useDipatch, useSelector } from "react-redux"
import axiosInstance from "../../../config/axiosInstance"

const ChangePass = React.memo(function ChangePass() {
  const user = useSelector(state => state.auth.user)
  console.log(user);
  const [form, setForm] = React.useState({ currentPassword:"", newPassword:"", newRetypePassword:"" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value ?? "")
    })

    try {
      const response = await axiosInstance.patch(`/api/acc/changepass?id=${user._id}`)
      const data = response.data

      // if (response.status === 201) {}
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="profile-form">
      <div className="form-section" style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input type="password" name="currentPassword" placeholder="••••••••" value={form.currentPassword} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input type="password" name="newPassword" placeholder="••••••••" value={form.newPassword} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="newRetypePassword">Confirm New Password</label>
          <input type="password" name="newRetypePassword" placeholder="••••••••" value={form.newRetypePassword} onChange={handleChange} />
        </div>
      </div>
      <button className="dark-btn" style={{ marginTop: "20px" }} onClick={handleSubmit}>Update Password</button>
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