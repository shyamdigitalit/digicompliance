import React from 'react'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axiosInstance from '../../../config/axiosInstance';

const SetTimer = React.memo(function SetTimer() {
    const [timerHH, setTimerHH] = React.useState("10");
    const [timerMM, setTimerMM] = React.useState("00");
    const [timerStatus, setTimerStatus] = React.useState(null);
    const [timerMsg, setTimerMsg] = React.useState("");

    React.useEffect(() => {
        const fetchTimer = async () => {
        setTimerStatus("loading");
        try {
            const res = await axiosInstance.get("/api/timer/fetch");
            const timerData = res.data?.data;
            if (timerData) {
                const totalMins = timerData.totalMinutes ?? (timerData.hours * 60 + timerData.minutes);
                setTimerHH(String(Math.floor(totalMins / 60)).padStart(2, "0"));
                setTimerMM(String(totalMins % 60).padStart(2, "0"));
            }
        } catch (error) {
            if (error?.response?.status !== 404) {
            console.warn("Timer fetch error:", error?.response?.status);
            }
        } finally {
            setTimerStatus(null);
        }
        };
        fetchTimer();
    }, []);

    const handleTimerSave = async () => {
        setTimerStatus("saving");
        setTimerMsg("");
        const hh = Math.max(0, Math.min(23, parseInt(timerHH, 10) || 0));
        const mm = Math.max(0, Math.min(59, parseInt(timerMM, 10) || 0));
        const totalMinutes = hh * 60 + mm;

        try {
            const res = await axiosInstance.post("/api/timer/set", { hours: hh, minutes: mm, totalMinutes });
            if (res.status === 200 || res.status === 201) {
                setTimerStatus("saved");
                setTimerMsg("✓ Timer saved successfully");
            } else {
                setTimerStatus("error");
                setTimerMsg("Failed to save. Please try again.");
            }
        }
        catch (error) {
            console.error("Timer save error:", error);
            setTimerStatus("error");
            setTimerMsg(error?.response?.data?.message || "Error saving timer.");
        }
        finally {
            setTimeout(() => { setTimerStatus(null); setTimerMsg(""); }, 3000);
        }
    };

    const handleHHChange = (e) => {
        const clamped = Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0));
        setTimerHH(String(clamped).padStart(2, "0"));
    };

    const handleMMChange = (e) => {
        const clamped = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
        setTimerMM(String(clamped).padStart(2, "0"));
    };
    
  return (
    <div className="set-timer-section">
        <h4>Set Timer</h4>
        <p>Set a timer for reminders, session limits, or scheduled actions.</p>
        <div className="timer-row">
            <label className="timer-label">Set Time</label>
            <div className="timer-input-wrap">
            <div className={`timer-input-box ${timerStatus === "loading" ? "timer-loading" : ""}`}>
                <div className="timer-hhmm">
                <input type="number" min="0" max="23" value={timerHH} onChange={handleHHChange} disabled={timerStatus === "loading"} />
                <span className="timer-colon">:</span>
                <input type="number" min="0" max="59" value={timerMM} onChange={handleMMChange} disabled={timerStatus === "loading"} />
                </div>
                <span className="timer-clock-icon"><AccessTimeIcon /></span>
            </div>
            <span className="timer-hint">Select time in HH : MM format</span>
            </div>
        </div>
        <div className="timer-footer">
            <button
            className="dark-btn"
            onClick={handleTimerSave}
            disabled={timerStatus === "saving" || timerStatus === "loading"}
            style={{ opacity: (timerStatus === "saving" || timerStatus === "loading") ? 0.7 : 1, cursor: (timerStatus === "saving" || timerStatus === "loading") ? "not-allowed" : "pointer" }}
            >
            {timerStatus === "saving" ? "Saving…" : timerStatus === "loading" ? "Loading…" : "Save"}
            </button>
            {timerMsg && (
            <span className={timerStatus === "error" ? "timer-error-msg" : "timer-saved-msg"}>{timerMsg}</span>
            )}
        </div>
    </div>
  )
})

export default SetTimer