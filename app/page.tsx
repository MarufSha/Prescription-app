import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold font-sans">
          Welcome to the Prescription Application
        </h1>
        <p className="text-muted-foreground font-semibold mt-2">
          Select one of these options or go to the page directly from the
          sidebar
        </p>
      </div>
      <div className="space-x-6">
        <Link href="/create-prescription">
          <Button variant={"outline"} className="cursor-pointer">
            Create A Prescription
          </Button>
        </Link>
        <Link href="/previous-prescriptoin">
          <Button variant={"outline"} className="cursor-pointer">
            View Past Prescriptions
          </Button>
        </Link>
      </div>
    </div>
  );
}
