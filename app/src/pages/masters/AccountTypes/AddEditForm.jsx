import React from 'react'
import { TextField, Button, Checkbox, FormControl, FormControlLabel, FormGroup } from '@mui/material'
import { useDispatch } from 'react-redux'
import { showSnackbar } from '../../../redux/slices/snackbar'

const AddEditForm = ({ onSubmit, initialData = {} }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = React.useState({
    typname: "",
    heirarchy: "",
    stacklvl: false,
    ...initialData,
  })

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = () => {
    if (formData.typname.trim() === '') {
      dispatch(showSnackbar({ message: 'Typename is required !', severity: 'error' }));
      return;
    } else if (formData.heirarchy.trim() === '') {
      dispatch(showSnackbar({ message: 'Heirarchy is required !', severity: 'error' }));
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
            gap: '2rem',
            '& .form-field': {
              width: '20rem',
              margin: 0
            },
            '& .MuiButton-contained': {
              width: '20rem'
            },
          }}
        >
          <TextField
            name="typname"
            type='text'
            label="Name"
            value={formData.typname}
            onChange={handleChange}
            className='form-field'
          />
          <TextField
            name="heirarchy"
            type='number'
            label="Heirarchy"
            value={formData.heirarchy}
            onChange={handleChange}
            className='form-field'
          />
          <FormControlLabel
            control={
              <Checkbox
                name='stacklvl'
                checked={formData.stacklvl}
                onChange={handleChange}
              />
            }
            label='Same Level'
            className='form-field'
          />
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
