import React from 'react'
import SetTimer from './SetTimer'

const NotificationTab = React.memo(function NotificationTab() {
  return (
    <div className="profile-card">
        <h3>Notification Preferences</h3>
        <p>Control how and when you receive notifications</p>
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {["Email alerts for overdue compliance", "SMS reminders for upcoming deadlines", "In-app notifications for new documents", "Weekly compliance summary report"].map(item => (
            <label key={item} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ width: "16px", height: "16px" }} />
                {item}
            </label>
            ))}
        </div>
        <button className="dark-btn" style={{ marginTop: "20px" }}>Save Preferences</button>
        <SetTimer />
    </div>
  )
})

export default NotificationTab