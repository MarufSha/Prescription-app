import {
  CalendarDays,
  FilePlusCorner,
  History,
  Home,
  Settings,
} from "lucide-react";

export const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Create Prescription",
    url: "/create-prescription",
    icon: FilePlusCorner,
  },
  {
    title: "Previous Prescriptions",
    url: "/previous-prescriptoin",
    icon: History,
  },
  {
    title: "Calendar",
    url: "#",
    icon: CalendarDays,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];
