// Menubar.jsx
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popper,
  Paper,
  ClickAwayListener,
  Toolbar,
  IconButton,
  Divider,
  ListItem,
  Tooltip,
  Avatar,
  Zoom,
  // colors,
} from "@mui/material";
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import * as MuiIcons from "@mui/icons-material";
import { menuItemsa, menuItemsb } from "../utilities/menuItems";
import filterTreeByHierarchy from "../utilities/filterTreeByHeirarchy";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { removeMasters } from "../redux/slices/masterSlice";
import { persistor } from "../redux/store";
import Logo from "/logo1.png";
import ShyamLogo from "/shyamlogo.png";
import axiosInstance from "../config/axiosInstance";
import { iconMap } from "../utilities/iconMap";
import { showSnackbar } from "../redux/slices/snackbar";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// AppBar that responds to "open"
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Drawer that responds to "open"
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open ? openedMixin(theme) : closedMixin(theme)),
  "& .MuiDrawer-paper": open ? openedMixin(theme) : closedMixin(theme),
}));

const Menubar = ({ open, setOpen }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // console.log(user);
  const navig = useNavigate();
  const location = useLocation();
  // let newMenuItemsa = []

  // menu filter as per privilege
  const [mainhdr, setMainhdr] = React.useState([]);
  const [admnhdr, setAdmnhdr] = React.useState([]);

  // submenu stack: [{ anchorEl, items, id }]
  const [submenuStack, setSubmenuStack] = React.useState([]);

  // refs for drawer and each submenu Popper
  const drawerRef = React.useRef(null);
  const submenuRefs = React.useRef({});

  // ⚡️ fetch + dynamically load icons
  const getFuncDta = React.useCallback(async () => {
    try {
      const level = user?.acc_typ?.heirarchy || 0;
      const res = await axiosInstance.get(`/api/func/fetch`);
      if (res.status === 200) {
        const promises = res.data.data
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map(async (elm) => {
            if (elm.status === "Inactive" || !elm.func_path) return null;

            // const IconComponent = await loadIcon(elm.func_icon); // ⚡️ dynamic load
            // console.log(IconComponent);
            const IconComponent = iconMap[elm.func_icon] || iconMap.Business;


            return {
              label: elm.func_name,
              icon: IconComponent, // ⚡️ now safe to render <item.icon />
              path: elm.func_path,
              heirarchy: elm.func_heirarchy || 0,
            };
          });

        const resolved = (await Promise.all(promises)).filter(Boolean);
        const funcLst = [...menuItemsa, ...resolved] // merge with static

        const mainhd = filterTreeByHierarchy(funcLst, level)
        const adminhd = filterTreeByHierarchy(menuItemsb, level)
        // console.log(mainhd);
        // console.log(adminhd);

        setMainhdr(mainhd);
        setAdmnhdr(adminhd)
      }
    } catch (error) {
      console.error(error);
    }
  }, [user?.acc_typ?.heirarchy]);

  React.useEffect(() => {
    getFuncDta()
  }, [getFuncDta])

  const handleOpenSubmenu = (event, subItems, level = 0, id = "") => {
    if (!subItems) return;

    setSubmenuStack((prev) => {
      const current = prev[level];
      if (current?.id === id) {
        // toggle close if same submenu clicked
        return prev.slice(0, level);
      }
      const newStack = prev.slice(0, level);
      newStack.push({
        anchorEl: event.currentTarget,
        items: subItems,
        id,
      });
      return newStack;
    });
  };

  const handleCloseLevel = (level) => {
    setSubmenuStack((prev) => prev.slice(0, level));
  };

  const handleLogout = async () => {
    try {
      if (confirm("Are you sure you want to logout?")) {
        const res = await dispatch(logout());
        if (res?.meta?.requestStatus === "fulfilled") {
          dispatch(removeMasters());
          dispatch(showSnackbar({ message: "Logout successful", severity: "success" }));
          await persistor.purge();
          navig("/login");
        }
        else {
          alert("Logout Failed");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isInsideAnyMenu = (target) => {
    if (drawerRef.current && drawerRef.current.contains(target)) return true;
    for (const ref of Object.values(submenuRefs.current)) {
      if (ref && ref.contains(target)) return true;
    }
    return false;
  };

  const isActiveOrParentActive = React.useCallback(
    (item) => {
      if (!item) return false;

      // 1️⃣ Direct match or startsWith for nested routes
      if (item.path && location.pathname.startsWith(item.path)) {
        return true;
      }

      // 2️⃣ Check all children recursively
      if (item.children && item.children.length > 0) {
        return item.children.some((child) => isActiveOrParentActive(child));
      }

      return false;
    },
    [location.pathname]
  );

  return (
    <>
      <AppBar position="fixed" open={open} sx={{ display: "flex", justifyContent: "space-between", flexFlow: "row wrap", backgroundColor: '#177455', boxShadow: "0rem 0rem 0rem #00000033" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "flex-start", backgroundColor: '#177455', width: "20rem" }}>
          <IconButton
            color="inherit"
            onClick={() => setOpen(true)}
            edge="start"
            sx={[{ marginRight: 5 }, open && { display: "none" }]}
          >
            <ApiRoundedIcon sx={{ color: 'primary.textLight' }} />
          </IconButton>

          {/* <img className="cmpny-logo" src={ShyamLogo} style={{ width: "25%" }} alt="" /> */}
        </Toolbar>

        <Toolbar sx={{ display: "flex", justifyContent: "center", width: "10rem" }}>
          <img src={Logo} style={{ width: "50%", height: "auto" }} alt="" />
        </Toolbar>
      </AppBar>

      <div ref={drawerRef}>
        <Drawer variant="permanent" open={open} sx={{ backgroundColor: '#0f221d', border: 'none' }}>
          <DrawerHeader sx={{ backgroundColor: 'var(--white)', border: 'none' }}>
            <IconButton onClick={() => setOpen(false)}>
              {theme.direction === "rtl" ? <ChevronRightIcon sx={{ color: 'primary.textDark' }} /> : <ChevronLeftIcon sx={{ color: 'primary.textDark' }} />}
            </IconButton>
          </DrawerHeader>

          <Divider sx={{ backgroundColor: 'var(--white)' }} />

          <div className="menu-body">
            <List sx={[{ backgroundColor: 'primary.main', p: 0, m: 1 }, open ? { borderRadius: 2 } : { borderRadius: 10 }]}>
              {mainhdr?.map((item) => {
                const activeOrParent = isActiveOrParentActive(item);
                return (
                  <ListItem
                    key={item.label}
                    disablePadding
                    sx={{
                      display: "block",
                      padding: '0.2rem',
                      backgroundColor: "var(--white)",
                      borderRadius: open ? 0 : "50%"
                    }}
                  >
                    {!open ? (
                      <Tooltip title={item.label} placement="right" arrow disableInteractive>
                        <ListItemButton
                          component={item.path ? NavLink : "div"}
                          to={item.path || "#"}
                          onClick={
                            item.children
                              ? (e) => handleOpenSubmenu(e, item.children, 0, item.label)
                              : undefined
                          }
                          sx={{
                            backgroundColor: activeOrParent ? "secondary.main" : "transparent",
                            color: activeOrParent ? "primary.textLight" : "primary.textDark",
                            "& .MuiListItemText-primary": {
                              fontWeight: activeOrParent ? "bold" : "normal",
                            },
                            minHeight: 40,
                            padding: '1rem',
                            justifyContent: "center",
                            borderRadius: "50%",
                            transition: "all 0.25s ease-in-out",
                            "&:hover": {
                              backgroundColor: "primary.textDark",
                              color: "primary.textLight",
                            },
                          }}
                        >
                          <ListItemIcon sx={{ justifyContent: "center", color: "inherit" }}>
                            {item.icon && <item.icon />}
                          </ListItemIcon>
                        </ListItemButton>
                      </Tooltip>
                    ) : (
                      <ListItemButton
                        component={item.path ? NavLink : "div"}
                        to={item.path || "#"}
                        onClick={
                          item.children
                            ? (e) => handleOpenSubmenu(e, item.children, 0, item.label)
                            : undefined
                        }
                        sx={{
                          backgroundColor: activeOrParent ? "secondary.main" : "transparent",
                          color: activeOrParent ? "primary.textLight" : "primary.textDark",
                          "& .MuiListItemText-primary": {
                            fontWeight: activeOrParent ? "bold" : "normal",
                          },
                          minHeight: 10,
                          justifyContent: "initial",
                          borderRadius: "12px",
                          transition: "all 0.25s ease-in-out",
                          "&:hover": {
                            backgroundColor: "primary.textDark",
                            color: "primary.textLight",
                            transform: "scale(1.04)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, mr: 3, color: "inherit" }}>
                          {item.icon && <item.icon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          sx={{ opacity: open ? 1 : 0 }}
                        />
                      </ListItemButton>
                    )}
                  </ListItem>
                );
              })}
            </List>

            {/* <Divider /> */}

            <List sx={[{ backgroundColor: 'var(--white)', p: 0, m: 1 }, open ? { borderRadius: 2 } : { borderRadius: 10 }]}>
              {admnhdr.map((item) => {
                const activeOrParent = isActiveOrParentActive(item);
                return (
                <ListItem
                  key={item.label}
                  disablePadding
                  sx={[{
                    display: "block",
                    // left: -10,
                    padding: '0.2rem',
                    backgroundColor: "var(--white)",
                  }, open ? { borderRadius: 0 } : { borderRadius: "50%" }
                ]}>
                  {/* 🧠 Tooltip wraps the entire ListItemButton */}
                  {!open ? (
                    <Tooltip
                      title={item.label}
                      placement="right"
                      arrow
                      disableInteractive
                      enterDelay={200}
                      leaveDelay={100}
                      TransitionComponent={Zoom}
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: "offset",
                              options: { offset: [0, -8] },
                            },
                          ],
                        },
                      }}
                    >
                      <ListItemButton
                        component={item.path ? NavLink : "div"}
                        to={item.path || "#"}
                        onClick={
                          item.children
                            ? (e) => handleOpenSubmenu(e, item.children, 0, item.label)
                            : undefined
                        }
                        sx={{
                          backgroundColor: activeOrParent ? "secondary.main" : "transparent",
                          color: activeOrParent ? "primary.textLight" : "primary.textDark",
                          "& .MuiListItemText-primary": {
                            fontWeight: activeOrParent ? "bold" : "normal",
                          },
                          minHeight: 40,
                          padding: '1rem',
                          minWidth: 25,
                          justifyContent: "center",
                          borderRadius: "50%",
                          // color: "primary.textDark",
                          transition: "all 0.25s ease-in-out",
                          "&:hover": {
                            backgroundColor: "primary.textDark",
                            color: "primary.textLight",
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            justifyContent: "center",
                            color: "inherit",
                            transition: "color 0.25s ease-in-out",
                          }}
                        >
                          {item.avatar ? (
                            <Avatar alt={item.avatar.alt} src={item.avatar.src} sx={{ width: 24, height: 24 }} />
                          ) : (
                            item.icon
                            ? <item.icon />
                            : <Avatar sx={{  width: 24, height: 24, fontSize: '0.75rem', fontWeight: 600 }}>
                              {user?.acc_fname[0]}
                            </Avatar>
                          )}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  ) : (
                    <ListItemButton
                      component={item.path ? NavLink : "div"}
                      to={item.path || "#"}
                      onClick={
                        item.children
                          ? (e) => handleOpenSubmenu(e, item.children, 0, item.label)
                          : undefined
                      }
                      sx={{
                        backgroundColor: activeOrParent ? "secondary.main" : "transparent",
                        color: activeOrParent ? "primary.textLight" : "primary.textDark",
                        "& .MuiListItemText-primary": {
                          fontWeight: activeOrParent ? "bold" : "normal",
                        },
                        minHeight: 10,
                        justifyContent: "initial",
                        borderRadius: "12px",
                        // color: "primary.textDark",
                        transition: "all 0.25s ease-in-out",
                        "&:hover": {
                          backgroundColor: "primary.textDark",
                          color: "primary.textLight",
                          transform: "scale(1.04)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          padding: '0.2rem',
                          justifyContent: "center",
                          mr: 3,
                          color: "inherit",
                          transition: "color 0.25s ease-in-out",
                        }}
                      >
                        {item.avatar ? (
                          <Avatar alt={item.avatar.alt} src={item.avatar.src} sx={{ width: 24, height: 24 }} />
                        ) : (
                          item.icon
                          ? <item.icon />
                          : <Avatar sx={{  width: 24, height: 24, fontSize: '0.75rem', fontWeight: 600 }}>
                            {user?.acc_fname[0]}
                          </Avatar>
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{
                          opacity: open ? 1 : 0,
                          transition: "opacity 0.25s ease-in-out",
                        }}
                      />
                    </ListItemButton>
                  )}
                </ListItem>
              )})}
            </List>
          </div>
        </Drawer>
      </div>

      {/* Submenu Poppers */}
      {submenuStack.map((submenu, level) => (
        <Popper key={level} open={submenu.items.length > 0} anchorEl={submenu.anchorEl} placement="right-start" style={{ zIndex: 1300 + level }}>
          <ClickAwayListener
            onClickAway={(event) => {
              if (isInsideAnyMenu(event.target)) return;
              handleCloseLevel(level);
            }}
          >
            <Paper
              elevation={4}
              ref={(el) => {
                submenuRefs.current[level] = el;
              }}
              sx={{
                borderRadius: '0.5rem',
                transition: 'opacity 10s ease-in-out',
              }}
            >
              <List>
                {submenu.items.map((subItem, index) => (
                  (() => {
                    const activeOrParent = isActiveOrParentActive(subItem);

                    return subItem.label === "accFname" ?
                    (
                      <ListItemButton key={index} disabled sx={{
                      backgroundColor: "#d1cfd4ff",
                      '&.active': {
                        backgroundColor: "secondary.main",
                        color: "primary.textLight",
                        "& .MuiListItemText-primary": {
                          fontWeight: "bold", // ✅ affects inner text
                        },
                      },
                    }}>
                      <span style={{ color: "#6600d2ff", fontSize: "1rem", fontWeight: "bold" }}>{user?.acc_fname}</span>
                    </ListItemButton>
                    ) : (
                      <ListItemButton
                        key={index}
                        component={subItem.path ? NavLink : "div"}
                        to={subItem.path || "#"}
                        onClick={
                          subItem.label === "Logout"
                            ? handleLogout
                            : subItem.children
                            ? (e) => handleOpenSubmenu(e, subItem.children, level + 1, subItem.label)
                            : () => handleCloseLevel(level)
                        }
                        sx={{
                          backgroundColor: activeOrParent ? "secondary.main" : "transparent",
                          color: activeOrParent ? "primary.textLight" : "inherit",
                          "& .MuiListItemText-primary": {
                            fontWeight: activeOrParent ? "bold" : "normal",
                          },
                          "&:hover": {
                            backgroundColor: "primary.textDark",
                            color: "primary.textLight",
                          },
                        }}
                      >
                        <ListItemText primary={subItem.label} />
                      </ListItemButton>
                    );
                  })()
                ))}
              </List>
            </Paper>
          </ClickAwayListener>
        </Popper>
      ))}
    </>
  );
};

export default Menubar;
