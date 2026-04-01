import React from 'react';
import { TextField, Button, FormControl, FormGroup, Select, MenuItem, InputLabel } from '@mui/material';
import axiosInstance from '../../../config/axiosInstance';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../redux/slices/snackbar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { InputAdornment, IconButton } from '@mui/material';

const AddEditForm = ({ onSubmit, initialData = {} }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = React.useState(() => ({
    acc_uname: '',
    acc_pass: '',
    acc_eml: '',
    acc_phn: '',
    acc_fname: '',
    acc_secphn: '',
    acc_comp: '',
    acc_emp_code: '',
    acc_addrss: '',
    acc_pan: '',
    acc_gst: '',
    acc_dob: '',
    acc_anniversary: '',
    acc_status: '',
    ...initialData, // spread first ✅
    acc_typ: initialData?.acc_typ?._id || initialData?.acc_typ || '',
    acc_plnt: initialData?.acc_plnt?._id || initialData?.acc_plnt || '',
    acc_dept: initialData?.acc_dept?._id || initialData?.acc_dept || '',
    acc_desig: initialData?.acc_desig?._id || initialData?.acc_desig || '',
  }));
  const [acctyp, setAcctyp] = React.useState([]);
  const [plnt, setPlnt] = React.useState([]);
  const [dept, setDept] = React.useState([]);
  const [desig, setDesig] = React.useState([]);
  const [showPassword, setShowPassword] = React.useState(false);

  const fetchMasters = React.useCallback(async () => {
    try {
      const [acctypRes, plntRes, deptRes, desigRes] = await Promise.allSettled([
        axiosInstance.get(`/api/acctyp/fetchuppr`),
        axiosInstance.get(`/api/plnt/fetch`),
        axiosInstance.get(`/api/dept/fetch`),
        axiosInstance.get(`/api/desig/fetch`)
      ]);
      setAcctyp(acctypRes.status === 'fulfilled' ? acctypRes.value.data.data : []);
      setPlnt(plntRes.status === 'fulfilled' ? plntRes.value.data.data : []);
      setDept(deptRes.status === 'fulfilled' ? deptRes.value.data.data : []);
      setDesig(desigRes.status === 'fulfilled' ? desigRes.value.data.data : []);
    } catch (error) {
      console.error(error.message);
    }
  }, []);

  React.useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);

  React.useEffect(() => {
    if (!initialData) return;

    setFormData(prev => ({
      ...prev,
      ...initialData,
      acc_typ: initialData?.acc_typ?._id || initialData?.acc_typ || '',
      acc_plnt: initialData?.acc_plnt?._id || initialData?.acc_plnt || '',
      acc_dept: initialData?.acc_dept?._id || initialData?.acc_dept || '',
      acc_desig: initialData?.acc_desig?._id || initialData?.acc_desig || '',
    }));
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (formData.acc_uname.trim() === '') {
      dispatch(showSnackbar({ message: 'Username is required !', severity: 'error' }));
      return;
    } else if (formData.acc_typ.trim() === '') {
      dispatch(showSnackbar({ message: 'Account Type is required !', severity: 'error' }));
      return;
    } else if (formData.acc_typ.heirarchy === 3) {
      if (formData.acc_dept.trim() === '') {
        dispatch(showSnackbar({ message: 'Account Department is required for this Account Type !', severity: 'error' }));
        return;
      }
    } else if (formData.acc_fname.trim() === '') {
      dispatch(showSnackbar({ message: 'Full Name is required !', severity: 'error' }));
      return;
    }

    // console.log(formData);
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        fd.append(key, value ?? '');
      }
    });

    // for (let [key, value] of Object.entries(formData)) {
    //   console.log(`${key}: ${value}`);
    // }

    fd.set('acc_status', 'Active'); // retain existing status or default to 'Active'
    onSubmit(fd);
  };

  return (
    <>
      <FormControl
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          p: '0 2rem',
        }}
      >
        <FormGroup
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexFlow: 'row wrap',
            width: '100%',
            p: '0 1rem',
            gap: '1rem',
            '& .form-field': {
              width: '20rem',
            },
            '& .MuiButton-contained': {
              width: '20rem',
            },
          }}
        >
          <TextField
            name="acc_uname"
            type="text"
            label="Username"
            value={formData.acc_uname || ''}
            onChange={handleChange}
            className="form-field"
            required
            disabled={!!initialData.acc_uname}
            sx={ !!initialData.acc_uname && { bgcolor: '#ffffffff', color: 'primary.textLight', fontWeight: 'bold' } }
          />
          
          {
            !initialData.acc_pass && (
              <TextField
                name="acc_pass"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.acc_pass || ''}
                onChange={handleChange}
                className="form-field"
                required
                sx={{ bgcolor: '#ffffffff', color: 'primary.textLight', fontWeight: 'bold' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )
          }
          
          <FormControl className="form-field">
            <InputLabel id="acc_typ-label">Account Type</InputLabel>
            <Select
              labelId="acc_typ-label"
              id="acc_typ"
              name="acc_typ"
              value={formData.acc_typ}
              label="Account Type"
              onChange={handleChange}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {acctyp.map((typ) => (
                <MenuItem key={typ._id} value={typ._id}>
                  {typ?.typname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl className="form-field">
            <InputLabel id="acc_plnt-label">Account Plant</InputLabel>
            <Select
              labelId="acc_plnt-label"
              id="acc_plnt"
              name="acc_plnt"
              value={formData.acc_plnt}
              label="Account Plant"
              onChange={handleChange}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {plnt.map((typ) => (
                <MenuItem key={typ._id} value={typ._id}>
                  {typ?.plantName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl className="form-field">
            <InputLabel id="acc_dept-label">Account Department</InputLabel>
            <Select
              labelId="acc_dept-label"
              id="acc_dept"
              name="acc_dept"
              value={formData.acc_dept}
              label="Account Department"
              onChange={handleChange}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {dept.map((typ) => (
                <MenuItem key={typ._id} value={typ._id}>
                  {typ?.departmentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl className="form-field">
            <InputLabel id="acc_desig-label">Account Designation</InputLabel>
            <Select
              labelId="acc_desig-label"
              id="acc_desig"
              name="acc_desig"
              value={formData.acc_desig}
              label="Account Designation"
              onChange={handleChange}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {desig.map((typ) => (
                <MenuItem key={typ._id} value={typ._id}>
                  {typ?.designationCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            name="acc_fname"
            type="text"
            label="Full Name"
            value={formData.acc_fname || ''}
            onChange={handleChange}
            className="form-field"
            required
            // disabled={!!initialData.acc_fname}
            sx={ !!initialData.acc_fname && { bgcolor: '#ffffffff', color: 'primary.textLight', fontWeight: 'bold' } }
          />

          {[
            { name: 'acc_eml', label: 'Email' },
            { name: 'acc_phn', label: 'Phone' },
            { name: 'acc_secphn', label: 'Alternate Phone' },
            { name: 'acc_comp', label: 'Company' },
            { name: 'acc_emp_code', label: 'Employee Code' },
            { name: 'acc_addrss', label: 'Address' },
            { name: 'acc_pan', label: 'PAN' },
            { name: 'acc_gst', label: 'GSTIN' }
          ].map((name) => (
            <TextField
              key={name.name}
              name={name.name}
              type="text"
              label={name.label}
              value={formData[name.name] || ''}
              onChange={handleChange}
              className="form-field"
            />
          ))}

          <LocalizationProvider dateAdapter={AdapterMoment}>
            {[
              { name: 'acc_dob', label: 'DOB' },
              { name: 'acc_anniversary', label: 'Anniversary' }
            ].map((name) => (
              <DatePicker
                key={name.name}
                name={name.name}
                label={name.label}
                value={formData[name.name] ? moment(formData[name.name]) : null}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    [name.name]: newValue ? newValue.toISOString() : '',
                  }));
                }}
                slotProps={{
                  textField: {
                    className: 'form-field',
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
                format='DD-MM-YYYY'
              />
            ))}
          </LocalizationProvider>
        </FormGroup>

        <FormGroup
          sx={(theme) => ({
            display: 'flex',
            justifyContent: 'flex-end',
            flexFlow: 'row wrap',
            width: '100%',
            p: '1rem',
            gap: '1rem',
            '& .form-btn': {
              width: '5rem',
              '&:hover': {
                backgroundColor: theme.palette.button.dark.secondary.bg,
                color: theme.palette.button.dark.secondary.colr,
              },
              border: 'none',
              borderRadius: theme.palette.button.dark.borderRadius,
            },
          })}
        >
          <Button variant="contained" onClick={handleSubmit} className="form-btn">
            Save
          </Button>
        </FormGroup>
      </FormControl>
    </>
  );
};

export default AddEditForm;
