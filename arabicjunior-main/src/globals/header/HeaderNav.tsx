"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface HeaderNavProps extends React.HTMLAttributes<HTMLUListElement> {
  onItemClick?: () => void; // 🔹 parent can pass a callback
  isMobile?: boolean;       // 🔹 prop to differentiate web vs mobile
}

const HeaderNav: React.FC<HeaderNavProps> = ({
  className,
  onItemClick,
  isMobile = false,
  ...props
}) => {
  const pathname = usePathname();

  const handleItemClick = () => {
    if (onItemClick) onItemClick();
  };

  return (
    <ul
      aria-label="header-nav"
      className={cn("flex items-start flex-col gap-y-2", className)}
      {...props}
    >
      {HEADER_NAV_ITEMS?.map((item, index) => (
        <React.Fragment key={index}>
          <li aria-describedby="header-nav-item" className={`relative flex group/nav-item ${!isMobile ? 'before:absolute before:w-[1px] before:h-full before:z-10 before:bg-neutral-200 before:-right-4 before:top-1/2 before:-translate-y-1/2 before:last:w-0' : ''}`}>
            {item.subMenu ? (
              <React.Fragment>
                <button 
                  suppressHydrationWarning
                  aria-describedby="submenu-trigger" 
                  className="flex items-center gap-x-1 text-neutral-600 text-base font-semibold relative transition-all ease-in-out duration-300  group-hover/nav-item:text-orange-500"
                >
                  {item.label} <ChevronDown className="flex flex-shrink-0 flex-grow-0 basis-auto transition-all ease-in-out duration-300 group-hover/nav-item:-rotate-180 group-hover/nav-item:text-orange-500" />
                </button>

                <ul
                  aria-describedby="submenu-wrapper"
                  className="absolute top-full left-1/2 -translate-x-1/2 min-w-28 opacity-0 border border-neutral-100 invisible select-none -z-50 bg-white shadow-lg py-1.5 px-2.5 rounded-lg flex items-start flex-col gap-y-2 transition-all ease-in-out duration-500 group-hover/nav-item:translate-y-2  group-hover/nav-item:opacity-100  group-hover/nav-item:visible  group-hover/nav-item:z-50"
                >
                  {item.subMenu.map((sub, index) => (
                    <li aria-describedby="sub-item" key={index} className="flex items-start w-full" onClick={handleItemClick}>
                      <Link href={sub.url} className="text-sm flex items-center font-normal text-neutral-600 w-full transition-colors ease-in-out duration-300 hover:text-orange-500">{sub.label}</Link>
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            ) : (
              <Link
                aria-label="header-nav-item"
                href={item?.url || "#"}
                onClick={handleItemClick}
                className={cn(
                  //"text-neutral-600 text-base font-semibold relative transition-all ease-in-out duration-300 hover:text-orange-500",
                  "text-neutral-600 text-sm md:text-base font-semibold relative transition-all ease-in-out duration-300 hover:text-orange-500 whitespace-nowrap",
                )}
              >
                {item.label}
              </Link>
            )}
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
};

export default HeaderNav;


// "use client";
// import React from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { ChevronDown } from "lucide-react";

// interface HeaderNavProps extends React.HTMLAttributes<HTMLUListElement> {
//   onItemClick?: () => void; // 🔹 parent can pass a callback
//   isMobile?: boolean;       // 🔹 prop to differentiate web vs mobile
// }

// const HeaderNav: React.FC<HeaderNavProps> = ({
//   className,
//   onItemClick,
//   isMobile = false,
//   ...props
// }) => {
//   const pathname = usePathname();
//   const [openIndex, setOpenIndex] = React.useState<number | null>(null);
//   const handleItemClick = () => {
//     if (onItemClick) onItemClick();
//   };

//   return (
//     <React.Fragment>
//       <ul
//         aria-label="header-nav"
//         className={cn("flex items-start flex-col gap-y-2", className)}
//         {...props}
//       >
//         {HEADER_NAV_ITEMS?.map((item, index) => (
//           <React.Fragment key={index}>
//             <li aria-describedby="header-nav-item" className="relative flex group/nav-item before:absolute before:w-[1px] before:h-full before:z-10 before:bg-neutral-200 before:-right-4 before:top-1/2 before:-translate-y-1/2 before:last:w-0">
//               {item.subMenu ? (
//                 <React.Fragment>
//                   <button aria-describedby="submenu-trigger" className="flex items-center gap-x-1 text-neutral-600 text-base font-semibold relative transition-all ease-in-out duration-300  group-hover/nav-item:text-orange-500">
//                     {item.label} <ChevronDown className="flex flex-shrink-0 flex-grow-0 basis-auto transition-all ease-in-out duration-300 group-hover/nav-item:-rotate-180 group-hover/nav-item:text-orange-500" />
//                   </button>

//                   <ul
//                     aria-describedby="submenu-wrapper"
//                     className="absolute top-full left-1/2 -translate-x-1/2 min-w-28 opacity-0 border border-neutral-100 invisible select-none -z-50 bg-white shadow-lg py-1.5 px-2.5 rounded-lg flex items-start flex-col gap-y-2 transition-all ease-in-out duration-500 group-hover/nav-item:translate-y-2  group-hover/nav-item:opacity-100  group-hover/nav-item:visible  group-hover/nav-item:z-50"
//                   >
//                     {item.subMenu.map((sub, index) => (
//                       <li aria-describedby="sub-item" key={index} className="flex items-start w-full">
//                         <Link href={sub.url} className="text-sm flex items-center font-normal text-neutral-600 w-full transition-colors ease-in-out duration-300 hover:text-orange-500">{sub.label}</Link>
//                       </li>
//                     ))}
//                   </ul>
//                 </React.Fragment>
//               ) : (
//                 <Link
//                   aria-label="header-nav-item"
//                   href={item?.url || "#"}
//                   className={cn(
//                     "text-neutral-600 text-base font-semibold relative transition-all ease-in-out duration-300 hover:text-orange-500",

//                     pathname === item.url && "text-orange-500"
//                   )}
//                 >
//                   {item.label}
//                 </Link>
//               )}
//             </li>
//           </React.Fragment>
//         ))}
//       </ul>
//     </React.Fragment>
//   );
// };

// export default HeaderNav;

interface SubMenuType {
  url: string;
  label: string;
}
interface NavItemsProps {
  url?: string;
  label: string;
  subMenu?: SubMenuType[];
}

export const HEADER_NAV_ITEMS: NavItemsProps[] = [
  {
    url: "/pricing",
    label: "Pricing",
  },
  {
    label: "Explore",
    subMenu: [
      {
        label: "About us",
        url: "/about-us",
      },
      {
        label: "Our Teachers",
        url: "/our-teachers",
      },
      {
        label: "Blog",
        url: "/blogs",
      },
      // {
      //   label: "Testimonials",
      //   url: "#",
      // },
      {
        label: "Careers",
        url: "/careers",
      },
    ],
  },
  {
    url: "/contact-us",
    label: "Contact us",
  },
];
