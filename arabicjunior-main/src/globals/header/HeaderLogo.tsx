import Image from "next/image";
import Link from "next/link";
import React from "react";

const HeaderLogo = () => {
  return (
    <React.Fragment>
      <Link
        href="/"
        aria-label="juniors-logo-header"
        //className="max-w-20 md:max-w-max"
        className="flex-shrink-0 max-w-16 sm:max-w-20 md:max-w-24 lg:max-w-32"
      >
        <Image
          src={'/arabic-logo-new.png'}
          alt="arabic juniors logo"
          width={137}
          height={53}
          priority
          className="w-full h-auto"
        />
      </Link>
    </React.Fragment>
  );
};

export default HeaderLogo;
