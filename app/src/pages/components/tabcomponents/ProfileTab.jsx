import React from 'react'
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from '../../../redux/slices/auth';
import axiosInstance from '../../../config/axiosInstance';
import Loader from '../../../components/loader';


const ProfileTab = React.memo(function ProfileTab() {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = React.useState("Profile");
    const [showMasters, setShowMasters] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [plants, setPlants] = React.useState([]);
    const [departments, setDepartments] = React.useState([]);
    const [saved, setSaved] = React.useState(false);
    const [loading, setLoading] = React.useState(false)

    const storedUser = useSelector(state => state.auth.user) || {};
    const nameParts = storedUser.acc_fname ? storedUser.acc_fname.split(" ") : ["", ""];
    const [profile, setProfile] = React.useState({
        acc_fname: storedUser.acc_fname || "",
        acc_eml: storedUser.acc_eml || "",
        acc_phn: storedUser.acc_phn || "",
        acc_comp: storedUser.acc_comp || "",
        acc_plnt: storedUser.acc_plnt?._id || null,
        acc_dept: storedUser.acc_dept?._id || null,
    });
    const initials = `${nameParts.join(" ")?.[0] || "U"}`.toUpperCase();

    const fetchMasters = React.useCallback(async () => {
        try {
            const [plantsRes, deptsRes] = await Promise.all([
                axiosInstance.get("/api/plnt/fetch"),
                axiosInstance.get("/api/dept/fetch")
            ]);
            setPlants(plantsRes.data.data || []);
            setDepartments(deptsRes.data.data || []);
        }
        catch (error) { console.error(error); }
    }, []);
    React.useEffect(() => { fetchMasters(); }, [fetchMasters]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name === "acc_phn") {
            const cleanedValue = value.replace(/\D/g, "").slice(0, 10);
            setProfile(prev => ({ ...prev, [name]: cleanedValue }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await axiosInstance.patch(`/api/acc/update?id=${storedUser._id}`, profile);
            if (response.status === 201) {
                dispatch(updateProfile({ data: response.data.data }));
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        }
        catch (error) { console.error(error); }
    };

    return (
        <div className="profile-card">
            <h3>Profile Information</h3>
            <p>Update your personal information and profile details</p>
            <div className="profile-top">
                <div className="avatar">{initials || "JD"}</div>
                <div>
                <div style={{ fontWeight: 600 }}>{profile.acc_fname}</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>{storedUser?.acc_typ?.typname}</div>
                </div>
            </div>
            <hr />
            <div className="form-grid">
                <div><label>Full Name</label><input name="acc_fname" value={profile.acc_fname} onChange={handleProfileChange} /></div>
                <div><label>Email Address</label><input name="acc_eml" value={profile.acc_eml} onChange={handleProfileChange} /></div>
                <div><label>Phone Number</label><input name="acc_phn" value={profile.acc_phn} onChange={handleProfileChange} /></div>
                <div><label>Company Name</label><input name="acc_comp" value={profile.acc_comp} onChange={handleProfileChange} /></div>
                <div>
                <label>Default Plant</label>
                <select name="acc_plnt" value={profile.acc_plnt} onChange={handleProfileChange}>
                    <option value="">Choose</option>
                    {plants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                </div>
                <div>
                <label>Department</label>
                <select name="acc_dept" value={profile.acc_dept} onChange={handleProfileChange}>
                    <option value="">Choose</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                </div>
            </div>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <button className="dark-btn" onClick={handleSaveProfile}>Save Changes</button>
                {saved && <span style={{ color: "#16a34a", fontSize: "13px" }}>✓ Updated successfully</span>}
            </div>
        </div>
    )
})

export default ProfileTab