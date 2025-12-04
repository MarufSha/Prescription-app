import {
  CalendarDays,
  FilePlusCorner,
  History,
  Home,
  Settings,
  UsersRound,
} from "lucide-react";

export const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Doctor Profile",
    url: "/doctor-profile",
    icon: UsersRound,
  },
  {
    title: "Create Prescription",
    url: "/create-prescription",
    icon: FilePlusCorner,
  },
  {
    title: "Previous Prescriptions",
    url: "/previous-prescription",
    icon: History,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];
