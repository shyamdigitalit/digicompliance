import React from 'react'
import { TextField, Button, FormControl, FormGroup } from '@mui/material'
import { useDispatch } from 'react-redux'
import { showSnackbar } from '../../../redux/slices/snackbar'

const AddEditForm = ({ onSubmit, initialData = {} }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = React.useState({
    unitCode: "",
    unitName: "",
    ...initialData,
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (formData.unitCode.trim() === '') {
      dispatch(showSnackbar({ message: 'Code is required !', severity: 'error' }));
      return;
    } else if (formData.unitName.trim() === '') {
      dispatch(showSnackbar({ message: 'Name is required !', severity: 'error' }));
      return;
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        fd.append(key, value ?? '');
      }
    });

    fd.set('status', 'Active'); // retain existing status or default to 'Active'
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
          p: '0 2rem'
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
              width: '20rem'
            },
            '& .MuiButton-contained': {
              width: '20rem'
            },
          }}
        >
          {[
            { name: 'unitCode', label: 'Code' },
            { name: 'unitName', label: 'Name' }
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
              borderRadius: theme.palette.button.dark.borderRadius
            },
          })}
        >
          <Button variant="contained" onClick={handleSubmit} className='form-btn'>Save</Button>
        </FormGroup>
      </FormControl>
    </>
  )
}


export default AddEditForm
