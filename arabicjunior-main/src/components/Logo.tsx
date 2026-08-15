import { cn } from "@/lib/utils";
import { Drama, SquareDashedMousePointer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Logo({
  fontSize,
  iconSize,
}: {
  fontSize?: string;
  iconSize?: number;
}) {
  return (
    <React.Fragment>
      <Link
        href="/"
        aria-label="juniors-logo-header"
        className="max-w-20 md:max-w-max"
      >
        <Image
          src={'/arabic-logo-new.png'}
          alt="arabic juniors logo"
          width={100}
          height={30}
          priority
        />
      </Link>
    </React.Fragment>
  );
}

export default Logo;
