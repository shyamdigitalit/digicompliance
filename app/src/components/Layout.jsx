import React from "react";
import { Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import Menubar from "./Menubar";
import Footer from "./Footer";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { motion as Motion, AnimatePresence } from "framer-motion";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: theme.mixins.toolbar.minHeight,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
    marginLeft: open ? `${drawerWidth}px` : 0,
    width: open ? `calc(100% - ${drawerWidth}px)` : "100%",
    overflowX: "auto",
  }),
);

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const Layout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  if (!isAuthenticated) return <Outlet />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column", backgroundColor: '#177455' }}>
      <Menubar open={open} setOpen={setOpen} />

      <Box sx={{ display: "flex", padding: "4.5rem", flexGrow: 1 }}>
        <Main open={open}>
          <AnimatePresence mode="wait" initial={false}>
            <Motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="" // 👈 no exit phase at all
              style={{ width: "100%", display: 'flex', justifyContent: 'center' }}
            >
              <Outlet />
            </Motion.div>
          </AnimatePresence>
        </Main>
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;
