import { Box, Button, ClickAwayListener, Divider, Fade, Paper, Popper, Typography } from '@mui/material';
import React from 'react'

const Custompopper = ({
    anchorData = null,
    currentState = false,
    handleClose,
    dataArray = [],
    fieldHeader = '',
    // fieldTree = [],
    fieldName = '',
    placement = '',
    transitionTimeout = 0
}) => {
    // console.log(dataArray);

  return (
    <Popper
        sx={{ zIndex: 1200 }}
        open={currentState}
        anchorEl={anchorData}
        placement={placement}
        transition
    >
        {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={handleClose}>
                <Fade {...TransitionProps} timeout={transitionTimeout}>
                    <Paper sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#f1faf7ff'
                    }}>
                        {
                            dataArray?.map((elm, indx) => (
                                <Box key={indx} sx={{ padding: '0.5rem 1rem' }}>
                                    <Typography sx={{
                                        color: '#14523aff',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        fontStyle: 'oblique'
                                    }}>
                                        {fieldHeader}{indx+1}:&nbsp;
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '0.8rem'
                                    }}>
                                        {/* {elm?.[fieldName]} */}
                                        {elm[fieldName]}
                                    </Typography>
                                    <Divider />
                                </Box>
                            ))
                        }
                    </Paper>
                </Fade>
            </ClickAwayListener>
        )}
    </Popper>
  )
}

export default Custompopper