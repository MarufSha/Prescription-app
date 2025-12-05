"use client";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getTitle } from "@/lib/utils";
import Link from "next/link";
import { useDoctorsStore } from "@/hooks/use-DoctorsStore";

const NavBar = () => {
  const pathname = usePathname();
  const pageHeader = getTitle(pathname);
  const { doctors, currentDoctorId } = useDoctorsStore();
  const currentDoctor = doctors.find((d) => d.id === currentDoctorId);
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="text-xl font-semibold">{pageHeader}</div>
      <div className="flex items-center space-x-2">
        <Link href="/doctor-profile">
          <div className="text-right">
            <h1 className="font-semibold">
              {currentDoctor?.name || "No Doctor Selected"}
            </h1>
            <h1 className="text-sm text-muted-foreground">Doctor</h1>
          </div>
        </Link>
        <Avatar>
          <Link href="/doctor-profile">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>
              {currentDoctor?.name?.charAt(0) || "D"}
            </AvatarFallback>
          </Link>
        </Avatar>
      </div>
    </div>
  );
};
export default NavBar;
