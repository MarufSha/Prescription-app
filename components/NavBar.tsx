"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getTitle } from "@/lib/utils";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { items } from "@/app/data/data";
import { useDoctorsStore } from "@/hooks/use-DoctorsStore";

const NavBar = () => {
  const pathname = usePathname();
  const pageHeader = getTitle(pathname);
  const { doctors, currentDoctorId } = useDoctorsStore();
  const currentDoctor = doctors.find((d) => d.id === currentDoctorId);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0">
            <SheetHeader className="px-4 pt-4 pb-2 border-b">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav className="py-2">
              {items.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="text-xl font-semibold">{pageHeader}</div>
      </div>
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
