"use client";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getTitle } from "@/lib/utils";
import Link from "next/link";

const NavBar = () => {
  const pathname = usePathname();
  const pageHeader = getTitle(pathname);
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="text-xl font-semibold">{pageHeader}</div>
      <div className="flex items-center space-x-2">
        <Link href="/doctor-profile">
          <div>
            <h1 className="font-semibold">Nazmus Sakib</h1>
            <h1 className="text-sm text-muted-foreground text-right">Admin</h1>
          </div>
        </Link>
        <Avatar>
          <Link href="/doctor-profile">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>User</AvatarFallback>
          </Link>
        </Avatar>
      </div>
    </div>
  );
};
export default NavBar;
