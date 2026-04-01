import React from 'react'
import axiosInstance from '../../../config/axiosInstance';
import { useDispatch } from 'react-redux'
import { showSnackbar } from '../../../redux/slices/snackbar'

const Settings = () => {
  const dispatch = useDispatch();
  const [selectedTime, setSelectedTime] = React.useState('00:00');
  
  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get('/api/settings/fetch');
      console.log(res);
      if (res.status === 200) {
        setSelectedTime(res.data.data.notifTime || '00:00');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };
  React.useEffect(() => {
    fetchSettings();
  }, []);

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await axiosInstance.post('/api/settings/update', { notifTime: selectedTime });
      console.log(res);
      if (res.status === 201) {
        dispatch(showSnackbar({ message: 'Settings updated successfully', severity: 'success' }));
      }
    } catch (error) {
      console.error(error)
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Set Time:</label>
        <input
          type="time"
          id="appointment-time"
          name="appointment-time"
          value={selectedTime}
          onChange={handleTimeChange}
        />
        <br />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}

export default Settings