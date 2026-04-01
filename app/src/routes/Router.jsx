// export default Router
import { Suspense, lazy } from "react";
import "../styles/Main.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import ProtectedRoute from "../auth/AuthGuard";
import Loader from "../components/Loader";
import ComplianceCategoryPage from "../pages/masters/ComplianceCategory/ComplianceCategoryPage";

/* Lazy Imports */
const Layout = lazy(() => import("../components/Layout"));
const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
// const ViewCompliance = lazy(() => import("../pages/compliance_modules/ViewCompliance"));
const Account = lazy(() => import("../pages/main_modules/Accounts"));
const AccountType = lazy(() => import("../pages/masters/AccountTypes"));
const Function = lazy(() => import("../pages/masters/Functions"));
const Company = lazy(() => import("../pages/masters/Companies"));
const Unit = lazy(() => import("../pages/masters/Units"));
const DepartmentPage = lazy(() => import("../pages/masters/Department/DepartmentPage"));
const DesignationPage = lazy(() => import("../pages/masters/Designation/DesignationPage"));
const PlantPage = lazy(() => import("../pages/masters/Plants/PlantPage"));
const ComplianceTypePage = lazy(() => import("../pages/masters/ComplianceTypeMaster/ComplianceTypePage"));
const ComplianceCategory = lazy(() => import("../pages/masters/ComplianceCategory/ComplianceCategoryPage"));
const ComplianceFrequencyPage = lazy(() => import("../pages/masters/ComplianceFrequency/ComplianceFrequencyPage"));
const CriticalityPage = lazy(() => import("../pages/masters/Criticality/CriticalityPage"));
const PenaltyTypePage = lazy(() => import("../pages/masters/PenaltyType/PenaltyTypePage"));
const ApprovalManagement = lazy(() =>
  import("../pages/main_modules/ApprovalManagement")
);

const Settings = lazy(() => import("../pages/main_modules/Settings"));

/* Router */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <div>404! Page not found</div>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/login', element: <Login /> },
      { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "account", element: <Account /> },
      {
        path: "accsetup",
        children: [
          { index: true, element: <Navigate to="acctype" replace /> },
          { path: "acctype", element: <AccountType /> },
            { path: "/accsetup/depttype", element: <DepartmentPage /> },
            { path: "/accsetup/designation", element: <DesignationPage /> },


        ],
      },
      { path: "approvalflow", element: <ApprovalManagement /> },
      {
        path: "admin",
        children: [
          { index: true, element: <Navigate to="company" replace /> },
          { path: "company", element: <Company /> },
          { path: "plant", element: <PlantPage /> },
        ],
      },
      {
        path: "comp",
        children: [
          { index: true, element: <Navigate to="comp" replace /> },
          { path: "complType", element: <ComplianceTypePage /> },
          { path: "complCategory", element: <ComplianceCategoryPage /> },
          { path: "complFreq", element: <ComplianceFrequencyPage /> },
          { path: "criticality", element: <CriticalityPage /> },
          { path: "penaltyType", element: <PenaltyTypePage /> },
        ],
      },
      { path: "profile", children: [
          { path: "settings", element: <Settings /> },
      ] },
      // { path: "*", element: <div>404! Page not found</div> },
    ],
  },
]);

const protectedRoutes = [""];
router.routes.forEach(route => {
  if (protectedRoutes.includes(route.path)) {
    route.element = <ProtectedRoute element={route.element} />;
  }
});

const Router = () => (
  <Suspense fallback={<Loader />}>
    <RouterProvider router={router} />
  </Suspense>
);

export default Router;