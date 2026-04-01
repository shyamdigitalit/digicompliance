import { DataGrid } from '@mui/x-data-grid';
import Customtoolbar from './Customtoolbar';
import { showSnackbar } from '../redux/slices/snackbar';
import { useDispatch } from 'react-redux';
import { DataGridStyle } from './datagridStyle';

const Datatable = ({
  rows = [],
  columns = [],
  handleEditCellChange,
  addBtn=true,
  onAddNew,
  edtBtn=true,
  onEdit,
  apprvBtn=false,
  onApprv,
  rmvBtn=false,
  onRemove,
  onSelectionChange,
  selectedRowIds = [],
  // exportData=[],
  exportFileName='export'
}) => {
  const dispatch = useDispatch()
  return (
    <div className='data-table'>
        <DataGrid
          rows={rows}
          getRowId={(row) => row.id || null}
          columns={columns}
          showToolbar
          slots={{
            toolbar: () => <Customtoolbar
              addBtn={addBtn}
              onAddNew={onAddNew}
              edtBtn={edtBtn}
              onEdit={onEdit}
              apprvBtn={apprvBtn}
              onApprv={onApprv}
              rmvBtn={rmvBtn}
              onRemove={onRemove}
              rawData={rows}
              exportFileName={exportFileName}
              selectedRowIds={selectedRowIds}
            />
          }}
          slotProps={{
            toolbar: {
              exportFileName: 'users_list',
            },
          }}
          checkboxSelection
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          processRowUpdate={(newRow, oldRow) => handleEditCellChange(newRow, oldRow)}
          onProcessRowUpdateError={(error) => {
            console.error("Row update failed:", error.message);
            dispatch(showSnackbar({ message: error?.message || "Row update failed", severity: 'error' }))
          }}
          onRowSelectionModelChange={(newSelection) => onSelectionChange(newSelection)}
          sx={DataGridStyle}
        />
    </div>
  )
}

export default Datatable