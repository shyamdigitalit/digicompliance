import React from 'react'
import { Tabs, Tab, Box, Menu, Stack, Chip, IconButton, MenuItem, Button } from '@mui/material'
import { Add, Close } from '@mui/icons-material'
import axiosInstance from '../../../config/axiosInstance'
import { useDispatch, useSelector } from 'react-redux'
import { showSnackbar } from '../../../redux/slices/snackbar'

const ApprovalManagement = () => {
    const dispatch = useDispatch()
    // const { user } = useSelector(state => state.auth)
    // console.log(user);
    const [tabMenu, setTabMenu] = React.useState([])
    const [sideMenu, setSideMenu] = React.useState([])
    const [value, setValue] = React.useState(0);
    const [item, setItem] = React.useState(0);
    // const [apprvlFlow, setApprvlFlow] = React.useState([])
    const [apprvlArr, setApprvlArr] = React.useState([])
    const [allAccList, setAllAccList] = React.useState([])
    const [accList, setAccList] = React.useState([])
    const [selectedLvl, setSelectedLvl] = React.useState(1)
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const fetchData = React.useCallback(async () => {
        try {
            const [creatrBaseDetails, funcDetails, accDetails] = await Promise.allSettled([
                axiosInstance.get(`/api/plnt/fetch?status=active`).then(res => res.data),
                axiosInstance.get(`/api/dept/fetch?status=active`).then(res => res.data),
                axiosInstance.get(`/api/acc/fetch?typel=2&typeh=3`).then(res => res.data)
            ])

            if (creatrBaseDetails.status === 'fulfilled') {
                const sortedTabs = creatrBaseDetails.value.data
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                setTabMenu(sortedTabs)
            }
            if (funcDetails.status === 'fulfilled') {
                const sortedMenus = funcDetails.value.data
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                setSideMenu(sortedMenus)
            }

            if (accDetails.status === 'fulfilled') {
                setAllAccList(accDetails.value.data.Acc)
            }
        } catch (error) {
            console.error(error.message)
        }
    }, [])
    React.useEffect(() => {
        // getAccountList()
        fetchData();
    }, [fetchData]);

    React.useEffect(() => {
        if ((!tabMenu.length && !sideMenu.length) || !allAccList.length) return;

        const plntCode = tabMenu[value]?.plantCode;
        const deptCode = sideMenu[item]?.departmentCode;
        
        const eligibleAccounts = allAccList.filter(acc => (
            acc.acc_typ?.heirarchy === 3
                ? (acc.acc_plnt?.plantCode === plntCode && acc.acc_dept?.departmentCode === deptCode)
                : (acc.acc_plnt ? acc.acc_plnt.plantCode === plntCode : true)
        ));

        // ✅ Remove already-selected approvers (across all levels)
        const usedIds = new Set(
            apprvlArr.flatMap(level => level.approvers.map(acc => acc._id))
        );

        const finalAccList = eligibleAccounts.filter(
            acc => !usedIds.has(acc._id)
        );

        setAccList(finalAccList);
    }, [value, item, tabMenu, sideMenu, allAccList, apprvlArr]);

    const getApprvlDetails = React.useCallback(async () => {
        try {
            const query = `?cbase=${tabMenu[value]?._id}&fnid=${sideMenu[item]?._id}`
            const res = await axiosInstance.get(`/api/dynapprvl/fetch${query}`)
            const dta = res.data

            if (res.status === 200 && dta.data?.length) {
                // setApprvlFlow(dta.data[0])
                setApprvlArr(
                    dta.data[0].apprvr_dtl.map(item => ({
                        level: item.apprvl_lvl,
                        approvers: item.apprvr
                    }))
                )
            } else {
                setApprvlArr([{ level: 1, approvers: [] }])
            }
        } catch (error) {
            console.error(error.message)
        }
    }, [tabMenu, sideMenu, value, item])
    
    React.useEffect(() => {
        if(!tabMenu?.length) return;
        if(!sideMenu?.length) return;
        getApprvlDetails();
    }, [getApprvlDetails, tabMenu, sideMenu, value, item]);

    const handleChangeTabMenu = (event, newValue) => {
        setValue(newValue);
        setItem(0);
    };
    const handleChangeSideMenu = (event, newValue) => {
        setItem(newValue);
    };

    const checkAccExist = (listFilter, searchArray) => {
        const filteredAccList = listFilter.reduce((accumulator, acc) => searchArray.some(level => level.approvers.some(usr => usr._id === acc._id))
            ? accumulator
            : [...accumulator, acc],
        []);
        return filteredAccList
    }
    
    const handleClick = (event) => {
        const deptSafeList = checkAccExist(accList, apprvlArr);
        setAccList(deptSafeList);
        setSelectedLvl(event.currentTarget.tabIndex);
        setAnchorEl(event.currentTarget);
    };

    const handleNewArray = (event) => {
        const indx = event.currentTarget.tabIndex
        let newArr = []
        newArr = apprvlArr?.length > 0 && [...apprvlArr] || []
        newArr.push({ level: indx+1, approvers: [] })
        setApprvlArr(newArr)
    };
    const handleRemove = async (e) => {
        const indx = e.currentTarget.tabIndex
        apprvlArr.splice(indx, 1)
        const newArr = apprvlArr.map((elm, i) => ({
            level: i+1,
            approvers: elm?.approvers
        }))
        setApprvlArr(newArr)
    }

    const handleClose = (itm) => {
        if (itm?._id) {
            apprvlArr[selectedLvl]?.approvers?.push(itm);

            // 🔥 REMOVE selected account from accList
            setAccList(prev =>
                prev.filter(acc => acc._id !== itm._id)
            );
        }
        setAnchorEl(null);
    };

    const handleDelete = (indx, level) => {
        const removedAcc = apprvlArr[level]?.approvers[indx];

        apprvlArr[level]?.approvers?.splice(indx, 1);
        setApprvlArr(apprvlArr.map(elm => elm));

        // 🔥 ADD BACK removed account (dept-safe)
        if (removedAcc) {
            setAccList(prev =>
                [...prev, removedAcc].sort((a, b) =>
                    a.acc_fname.localeCompare(b.acc_fname)
                )
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        let apprvlDetails = {}
        
        try {
            Object.assign(apprvlDetails, {
                apprvl_code: `PLNT${tabMenu[value]?.plantCode}DEPT${sideMenu[item]?.departmentCode}`,
                apprvl_creator_base: tabMenu[value]?._id,
                apprvl_func: sideMenu[item]?._id,
                apprvr_dtl: apprvlArr?.map((elm, i) => ({ apprvl_lvl: i+1, apprvr: elm.approvers })) || [],
                status: 'Active'
            })
            console.log(apprvlDetails);
            const res = await axiosInstance.post(`/api/dynapprvl/create`, apprvlDetails)
            const dta = res.data
            // console.log(res);
            if (res.status === 201) {
                dispatch(showSnackbar({ message: dta.message, severity: 'success' }))
                fetchData()
            }
            else {
                dispatch(showSnackbar({ message: dta.message, severity: 'error' }))
            }
        } catch (error) {
            console.error(error)
            dispatch(showSnackbar({ message: error?.response?.data?.message, severity: 'error' }))
        }
    }

  return (
    <div className='main-body'>
        <div className="main-hdr">
            <span className='hds'>Dynamic Approval Flow Management</span>
        </div>

        <div className="main-dtl" style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', paddingBottom: '3.5rem' }}>
            <Button variant='contained' onClick={handleSubmit} className="form-btn" sx={(theme) => ({
                width: '5rem',
                margin: '1rem',
                '&:hover': {
                    backgroundColor: theme.palette.button.dark.secondary.bg,
                    color: theme.palette.button.dark.secondary.colr,
                },
                border: 'none',
                borderRadius: theme.palette.button.dark.borderRadius,
            })}>
                Save
            </Button>
            <Box sx={{ display: 'flex', width: '100%' }}>
                <Tabs
                    orientation='horizontal'
                    value={value}
                    onChange={handleChangeTabMenu}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                >
                    {tabMenu?.map((elm, i) => <Tab label={elm.plantName} value={i} key={i} onClick={getApprvlDetails} />)}
                </Tabs>
            </Box>
            <Box sx={{ display: 'flex', width: '100%' }}>
                <Tabs
                    orientation='horizontal'
                    value={item}
                    onChange={handleChangeSideMenu}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                >
                    {sideMenu?.map((elm, i) => <Tab label={elm.departmentName} value={i} key={i} onClick={getApprvlDetails} />)}
                </Tabs>
            </Box>

            <div className="itm-sec" style={{
                width: '100%',
                padding: '1rem',
                boxShadow: '0.1rem 0.1rem 1rem #e4e9e6ef inset',
                borderRadius: '0.8rem'
            }}>
                {
                    apprvlArr?.map((elm, i) => (
                        <div className="item-list" key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row',
                            width: '100%',
                            padding: '1.5rem',
                            boxShadow: '0.1rem 0.1rem 1rem #e4e9e6ef'
                        }}>
                            <IconButton title='Remove Level' tabIndex={i} onClick={handleRemove} sx={{
                                backgroundColor: '#c46262ff',
                                width: '1.5rem',
                                height: '1.5rem',
                                aspectRatio: 1/1,
                                color: '#eeeaeaff',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease-in-out',
                                '&:hover': {
                                    backgroundColor: '#ec1010ff',
                                }
                            }}>
                                <Close sx={{ fontSize: '1rem' }} />
                            </IconButton>
                            <div className='itm-level' style={{
                                padding: '0 1rem',
                                color: '#69973eff',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                fontStyle: 'italic'
                            }}>
                                {`L${elm.level} : `}
                            </div>
                            <div className="subitm-sec" tabIndex={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexFlow: 'row wrap',
                                gap: '1rem'
                            }}>
                                {
                                    elm?.approvers?.map((el, j) => (
                                        <Chip key={j}
                                            label={el?.acc_fname}
                                            onDelete={() => handleDelete(j, i)}
                                            variant='outlined'
                                            size='medium'
                                            sx={{
                                                fontSize: '0.85rem',
                                                borderRadius: '0.35rem'
                                            }}
                                        />
                                    ))
                                }
                                <IconButton title='Add New Approver' tabIndex={i} onClick={handleClick} sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#6ac462ff',
                                    width: '1.2rem',
                                    height: '1.2rem',
                                    aspectRatio: 1/1,
                                    color: '#ebeeeaff',
                                    textAlign: 'center',
                                    borderRadius: '5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: '#10ec52ff',
                                    }
                                }}>
                                    <Add sx={{ fontSize: '0.8rem' }} />
                                </IconButton>
                            </div>
                        </div>
                    ))
                }
                <div className='item-list'
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        padding: '1.5rem'
                    }}
                >
                    <IconButton title='Add New Level' tabIndex={apprvlArr?.length} onClick={handleNewArray} sx={{
                        backgroundColor: '#6ac462ff',
                        width: '1.5rem',
                        height: '1.5rem',
                        aspectRatio: 1/1,
                        color: '#ebeeeaff',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.1s ease-in-out',
                        '&:hover': {
                            backgroundColor: '#10ec52ff',
                        }
                    }}>
                        <Add sx={{ fontSize: '1rem' }} />
                    </IconButton>
                </div>
            </div>

            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'basic-button',
                    },
                }}
                sx={{
                    padding: 0,
                    '& .MuiList-root': { padding: 0 }
                }}
            >
            {
                accList.length > 0 ? (
                accList.map((elm, i) => (
                    <MenuItem key={i} onClick={() => handleClose(elm)}>
                    {elm.acc_fname}
                    </MenuItem>
                ))
                ) : (
                <MenuItem sx={{ backgroundColor: '#b82323ff' }}>
                    NO OTHER ACCOUNTS EXIST
                </MenuItem>
                )
            }
            </Menu>

            {/* <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'basic-button',
                    },
                }}
                sx={{
                    padding: 0,
                    '& .MuiList-root': { padding: 0 }
                }}
            >
                {
                    filteredAccList?.length > 0 ? filteredAccList.map((elm, i) => <MenuItem onClick={() => handleClose(elm)} tabIndex={value} key={i}>{elm.acc_fname}</MenuItem>)
                    : <MenuItem onClick={handleClose} tabIndex={value} sx={{ backgroundColor: '#b82323ff' }}>
                        NO OTHER ACCOUNTS EXIST
                    </MenuItem>
                }
            </Menu> */}
        </div>
    </div>
  )
}

export default ApprovalManagement