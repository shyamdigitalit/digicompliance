import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ApprovalIcon from '@mui/icons-material/Approval';
import LogoutIcon from '@mui/icons-material/Logout';

export const menuItemsa = [
  { label: "Dashboard", icon: DashboardIcon, path: "/dashboard", heirarchy: 0 },
];

export const menuItemsb = [
  {
    label: "Account", icon: PeopleIcon, path: "/account", heirarchy: 0
  },
  {
    label: "Dynamic Approval", icon: ApprovalIcon, path: "/approvalflow", heirarchy: 0
  },
  {
    label: "Configuration",
    icon: SettingsIcon,
    heirarchy: 0,
    children: [
      {
        label: "Account Setup",
        icon: ManageAccountsIcon,
        heirarchy: 0,
        children: [
          { label: 'Account Type', path: "/accsetup/acctype", heirarchy: 1 },
          { label: 'Department Type', path: "/accsetup/depttype", heirarchy: 0 },
          { label: 'Designation Type', path: "/accsetup/designation", heirarchy: 0 },
        ]
      },
      {
        label: "Admin Configs",
        icon: DeveloperBoardIcon,
        heirarchy: 0,
        children: [
          { label: 'Function Master', path: "/admin/function", heirarchy: 1 },
          { label: 'Company Master', path: "/admin/company", heirarchy: 0 },
          { label: 'Plant Master', path: "/admin/plant", heirarchy: 0 },
        ]
      },
      {
        label: "Compliance Configs",
        icon: DeveloperBoardIcon,
        heirarchy: 0,
        children: [
          { label: 'Compliance Type Master', path: "/comp/complType", heirarchy: 0 },
          { label: 'Compliance Category', path: "/comp/complCategory", heirarchy: 0 },
          { label: 'Compliance Frequency', path: "/comp/complFreq", heirarchy: 0 },
          { label: 'Criticality', path: "/comp/criticality", heirarchy: 0 },
          { label: 'Penalty Type', path: "/comp/penaltyType", heirarchy: 0 },
        ]
      },
    ],
  },
  {
    label: "Profile",
    heirarchy: 0,
    children: [
      { label: "accFname", heirarchy: 0 },
      { label: "Settings", icon: SettingsIcon, path: "/profile/settings", heirarchy: 0 },
      { label: "Logout", icon: LogoutIcon, heirarchy: 0 },
    ],
  },
];
