"use client";
import React from "react";
import HeaderLogo from "./HeaderLogo";
import { Menu, X } from "lucide-react";
import MobileHeader from "./MobileHeader";
import LgScreenHeader from "./LgScreenHeader";

const Header = () => {
  const [isMenuOpen, setIsMenu] = React.useState(false);

  const handleHeaderNav = () => {
    setIsMenu((prev) => (prev ? false : true));
  };

  const [headerHeight, setHeaderHeight] = React.useState("0px");
  const headerRef = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  // Use a ref for the last scroll position to avoid re-renders
  const lastScrollY = React.useRef<number>(0);

  React.useEffect(() => {
    const handleHeaderHeight = () => {
      if (headerRef.current) {
        const getHeaderHeight = `${headerRef.current?.offsetHeight}px`;
        setHeaderHeight(getHeaderHeight);
        // set to body
        document.body.style.setProperty(
          "--juniors-header-height",
          `${headerHeight}`
        );
      }
    };

    // create the element observer
    const resizeObserver = new ResizeObserver(() => {
      handleHeaderHeight();
    });

    // observe the header element
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    // cleanup on unmount
    return () => resizeObserver.disconnect();
  }, [headerHeight]);



  const handleScroll = React.useCallback((): void => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsVisible(false); // Hide on scroll down
    } else {
      setIsVisible(true); // Show on scroll up
    }

    lastScrollY.current = currentScrollY; // Update the last scroll position
  }, []);

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // cleanup on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <React.Fragment>
      <style aria-label="react-style-component">
        {isMenuOpen ? `body {overflow: hidden}` : `body {overflow: auto}`}
      </style>

      <header
        ref={headerRef}
        style={
          { "--juniors-header-height": headerHeight } as React.CSSProperties
        }
        className={`sticky top-0 left-0 w-full bg-white shadow-md transition-transform ease-in-out duration-300 z-50 ${isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="container">
          <nav
            aria-label="header-nav-wrapper"
            className="flex items-center gap-x-8 justify-between h-16 md:h-24 py-2 relative"
          >
            <HeaderLogo />
            {isMenuOpen ? (
              <X
                aria-label="icon-close"
                onClick={handleHeaderNav}
                className="cursor-pointer lg:hidden"
              />
            ) : (
              <Menu
                aria-label="icon-humberger-menu"
                onClick={handleHeaderNav}
                className="cursor-pointer lg:hidden"
              />
            )}

            <MobileHeader
              className={
                isMenuOpen
                  ? "h-screen opacity-100 visible"
                  : "invisible h-0 opacity-0"
              }
              onItemClick={handleHeaderNav}
            />

            <LgScreenHeader className="hidden lg:flex" />
          </nav>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Header;
