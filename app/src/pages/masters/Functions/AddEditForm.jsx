import React from 'react'
import { TextField, Button, FormControl, FormGroup } from '@mui/material'
import { useDispatch } from 'react-redux'
import { showSnackbar } from '../../../redux/slices/snackbar'

const AddEditForm = ({ onSubmit, initialData = {} }) => {
  const dispatch = useDispatch
  const [formData, setFormData] = React.useState({
    func_code: "",
    func_name: "",
    func_heirarchy: 0,
    func_path: "",
    func_icon: "",
    func_query: "",
    ...initialData,
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (e) => {
    const { name, value } = e.target;

    // Clear only if value is exactly 0
    if (name === 'func_heirarchy' && value === '0') {
      setFormData((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  const handleBlur = (e) => {
  const { name, value } = e.target;

  if (name === 'func_heirarchy' && value === '') {
    setFormData((prev) => ({
      ...prev,
      [name]: '0',
    }));
  }
};


  const handleSubmit = () => {
    if (formData.func_code.trim() === '') {
      dispatch(showSnackbar({ message: 'Code is required !', severity: 'error' }));
      return;
    } else if (formData.func_name.trim() === '') {
      dispatch(showSnackbar({ message: 'Name is required !', severity: 'error' }));
      return;
    } else if (formData.func_path.trim() === '') {
      dispatch(showSnackbar({ message: 'Path is required !', severity: 'error' }));
      return;
    } else if (formData.func_heirarchy === '') {
      dispatch(showSnackbar({ message: 'Hierarchy is required !', severity: 'error' }));
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
            { name: 'func_code', label: 'Code', type: 'text' },
            { name: 'func_name', label: 'Name', type: 'text' },
            { name: 'func_heirarchy', label: 'Hierarchy', type: 'number' },
            { name: 'func_path', label: 'Path', type: 'text' },
            { name: 'func_query', label: 'Query', type: 'text' },
            { name: 'func_icon', label: 'Icon', type: 'text' },
          ].map((name) => (
            <TextField
              key={name.name}
              name={name.name}
              type="text"
              label={name.label}
              value={formData[name.name] ?? ''}
              onChange={(e) => {
                if (name.type !== 'number') {
                  handleChange(e);
                  return;
                }

                if (/^\d*$/.test(e.target.value)) {
                  handleChange(e);
                }
              }}
              onFocus={name.type === 'number' ? handleFocus : undefined}
              onBlur={name.type === 'number' ? handleBlur : undefined}
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
