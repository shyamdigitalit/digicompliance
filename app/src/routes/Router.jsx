import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/protected-routes";
import Loader from "../components/loader";

// Lazy loaded components
const Layout = lazy(() => import("../pages/components/Layout"));
const Dashboard = lazy(() => import("../pages/components/Dashboard"));
const Login = lazy(() => import("../pages/components/Login"));
const Compliance = lazy(() => import("../pages/components/Compliance"));
const Document = lazy(() => import("../pages/components/Document"));
const User = lazy(() => import("../pages/components/User"));
const Setting = lazy(() => import("../pages/components/Setting"));
const MasterListPage = lazy(() => import("../pages/components/tabcomponents/MasterList"));
const MasterForm = lazy(() => import("../pages/components/tabcomponents/MasterForm"));

const router = createBrowserRouter([
  {
    // path: "/", element: <Layout />,
    path: "/", element: ( <ProtectedRoute> <Layout /> </ProtectedRoute> ),
    errorElement: <div>404! Page not found</div>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace />, },
      { path: "/dashboard", element: <ProtectedRoute> <Dashboard /> </ProtectedRoute>, },
      { path: "/compliance", element: <ProtectedRoute> <Compliance /> </ProtectedRoute>, },
      { path: "/document", element: <ProtectedRoute> <Document /> </ProtectedRoute>, },
      { path: "/user", element: <ProtectedRoute> <User /> </ProtectedRoute>, },
      { path: "/setting", element: <ProtectedRoute> <Setting /> </ProtectedRoute>, },
      { path: "/masters/:type", element: <ProtectedRoute> <MasterListPage /> </ProtectedRoute>, },
      { path: "/masters/:type/add", element: <ProtectedRoute> <MasterForm /> </ProtectedRoute>, },
    ],
  },
  { path: "/login", element: <Login />, },
]);

const Router = () => {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default Router;
