import React from 'react'
import { styled } from '@mui/material/styles';
import {
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
//   ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
} from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
});

const StyledToolbarButton = styled(ToolbarButton)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  width: 'min-content',
  height: 'min-content',
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));

const StyledTextField = styled(TextField)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  overflowX: 'clip',
  width: ownerState.expanded ? 260 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
}));

const getSelectedIdsArray = (selection) => {
    if (!selection) return [];

    // Case 1: DataGrid v6 array model
    if (Array.isArray(selection)) {
        return selection.map(String);
    }

    // Case 2: { type: 'include', ids: Set() }
    if (selection?.type === 'include' && selection?.ids instanceof Set) {
        return Array.from(selection.ids).map(String);
    }

    return [];
};

const exportRawCsv = (data, fileName) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);

    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(h => `"${row[h] ?? ''}"`).join(',')
        ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
};


const Customtoolbar = ({
    addBtn,
    onAddNew,
    edtBtn,
    onEdit,
    apprvBtn,
    onApprv,
    rmvBtn,
    onRemove,
    exportFileName='export',
    rawData=[],
    selectedRowIds=[]
}) => {
    const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
    const exportMenuTriggerRef = React.useRef(null);

    return (
        <Toolbar>
            {
                addBtn && (
                    <Tooltip title="Add New">
                        <ToolbarButton onClick={onAddNew}>
                            <AddCircleIcon fontSize="small" sx={{ color: '#00ccf0ff' }} />
                        </ToolbarButton>
                    </Tooltip>
                )
            }
            {
                edtBtn && (
                    <Tooltip title="Edit">
                        <ToolbarButton onClick={onEdit}>
                            <EditSquareIcon fontSize="small" sx={{ color: '#2b40ffff' }} />
                        </ToolbarButton>
                    </Tooltip>
                )
            }
            {
                apprvBtn && (
                    <Tooltip title="Approval">
                        <ToolbarButton onClick={onApprv}>
                            <CheckCircleIcon fontSize="small" sx={{ color: '#00c91bff' }} />
                        </ToolbarButton>
                    </Tooltip>
                )
            }
            {
                rmvBtn && (
                    <Tooltip title="Remove">
                        <ToolbarButton onClick={onRemove}>
                            <RemoveCircleIcon fontSize="small" sx={{ color: '#ff2222ff' }} />
                        </ToolbarButton>
                    </Tooltip>
                )
            }

            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5, border: '0.05rem solid #606060ff', borderRadius: '5rem' }} />

            <Tooltip title="Columns">
                <ColumnsPanelTrigger render={<ToolbarButton />}>
                <ViewColumnIcon fontSize="small" />
                </ColumnsPanelTrigger>
            </Tooltip>
            
            <Tooltip title="Export">
                <ToolbarButton
                    ref={exportMenuTriggerRef}
                    id="export-menu-trigger"
                    aria-controls="export-menu"
                    aria-haspopup="true"
                    aria-expanded={exportMenuOpen ? 'true' : undefined}
                    onClick={() => setExportMenuOpen(true)}
                    >
                    <FileDownloadIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>

            <Menu
                id="export-menu"
                anchorEl={exportMenuTriggerRef.current}
                open={exportMenuOpen}
                onClose={() => setExportMenuOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    list: {
                        'aria-labelledby': 'export-menu-trigger',
                    },
                }}
            >
                <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
                    Print
                </ExportPrint>

                {/* <MenuItem onClick={() => {
                    exportRawCsv(rawData, `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`);
                    setExportMenuOpen(false);
                }}>
                    Download as CSV
                </MenuItem> */}

                <MenuItem
                    onClick={() => {
                        const selectedIds = getSelectedIdsArray(selectedRowIds);

                        console.log('Selected IDs:', selectedIds);
                        console.log('Raw row IDs:', rawData.map(r => r.id));

                        // Step 1: filter selected rows from grid rows
                        const selectedRows =
                        selectedIds.length > 0
                            ? rawData.filter(row => selectedIds.includes(String(row.id)))
                            : rawData;

                        // Step 2: remove unwanted keys BEFORE CSV
                        const exportRows = selectedRows.map(row => {
                            const {
                                _id,
                                ...rest
                            } = row;

                            return rest;
                        });

                        exportRawCsv(
                        exportRows,
                        `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`
                        );

                        setExportMenuOpen(false);
                    }}
                >
                    Download as CSV
                </MenuItem>
            </Menu>

            <StyledQuickFilter>
                <QuickFilterTrigger
                render={(triggerProps, state) => (
                    <Tooltip title="Search" enterDelay={0}>
                    <StyledToolbarButton
                        {...triggerProps}
                        ownerState={{ expanded: state.expanded }}
                        color="default"
                        aria-disabled={state.expanded}
                    >
                        <SearchIcon fontSize="small" />
                    </StyledToolbarButton>
                    </Tooltip>
                )}
                />
                <QuickFilterControl
                render={({ ref, ...controlProps }, state) => (
                    <StyledTextField
                    {...controlProps}
                    ownerState={{ expanded: state.expanded }}
                    inputRef={ref}
                    aria-label="Search"
                    placeholder="Search..."
                    size="small"
                    slotProps={{
                        input: {
                        startAdornment: (
                            <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: state.value ? (
                            <InputAdornment position="end">
                            <QuickFilterClear
                                edge="end"
                                size="small"
                                aria-label="Clear search"
                                material={{ sx: { marginRight: -0.75 } }}
                            >
                                <CancelIcon fontSize="small" />
                            </QuickFilterClear>
                            </InputAdornment>
                        ) : null,
                        ...controlProps.slotProps?.input,
                        },
                        ...controlProps.slotProps,
                    }}
                    />
                )}
                />
            </StyledQuickFilter>
        </Toolbar>
    );
}

export default Customtoolbar