import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

const HeaderSearch = () => {
  return (
    <React.Fragment>
      <div aria-describedby="header-search" className="w-56 flex-shrink-0 flex-grow-0 basis-auto">
        <div aria-describedby="input-wrapper" className="relative">
          <Input placeholder="Search" className="w-full bg-neutral-100 h-10 pl-9 pr-4"/>
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-neutral-600"/>
        </div>
      </div>
    </React.Fragment>
  );
};

export default HeaderSearch;
