import React from "react";
import { IconCalling, IconEmail, IconLocation, IconWhatsApp } from "./svgIcons";
import Link from "next/link";

const ContactInfo = () => {
  return (
    <React.Fragment>
      <div aria-label="contact-info-wrapper" className="lg:order-1 flex-shrink-0 flex-grow-0 basis-auto">
        <h3 className="text-2xl font-bold text-neutral-800 text-center mb-6 lg:text-3xl lg:mb-9">
          Contact Now
        </h3>

        <ul
          aria-label="contact-list"
          className="flex items-start gap-y-5 flex-col mb-6"
        >
          {CONTACT_LISTS.map((contact) => (
            <React.Fragment key={contact.key}>
              <li
                aria-label="contact-item"
                className="flex items-start gap-x-3 gap-y-1"
              >
                <span
                  aria-label="icon-wrapper"
                  className="flex items-center flex-shrink-0 flex-grow-0 basis-auto mt-1"
                >
                  {contact.icon}
                </span>
                <span className="text-lg font-semibold text-neutral-800 flex-1">
                  {contact.label}
                </span>
              </li>
            </React.Fragment>
          ))}
        </ul>

        <div aria-label="additional-info" className="space-y-6">
          {/* <p className="text-lg font-semibold text-neutral-800 flex gap-x-1">
            <span>Contact 👉</span>
            <Link href="#" className="text-[#0062FC]">
              Arabic Juniors
            </Link>
          </p> */}

          <Link href={'https://wa.me/971505344645?text=Hello!%20I%27m%20interested%20in%20enrolling%20in%20Arabic%20tuition%20classes.%20Please%20get%20in%20touch%20with%20me'} className="flex items-start gap-x-3 w-full">
            <span className="flex flex-grow-0 flex-shrink-0 basis-auto">
              <IconCalling className="text-4xl" />
            </span>
            <span className="text-2xl font-bold text-neutral-900">
              +971 50 992 1470
            </span>
          </Link>
          <Link href={'https://wa.me/971505344645?text=Hello!%20I%27m%20interested%20in%20enrolling%20in%20Arabic%20tuition%20classes.%20Please%20get%20in%20touch%20with%20me'} className="flex items-start gap-x-3 w-full">
            <span className="flex flex-grow-0 flex-shrink-0 basis-auto">
              <IconWhatsApp className="text-4xl" />
            </span>
            <span className="text-2xl font-bold text-neutral-900">
              +971 50 534 4645
            </span>
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ContactInfo;

const CONTACT_LISTS = [
  // {
  //   key: "phone",
  //   icon: <IconCalling className="text-2xl text-orange-500" />,
  //   label: "+971 50 992 1470",
  // },
  {
    key: "email",
    icon: <IconEmail className="text-2xl text-orange-500" />,
    label: "hello@ArabicJuniors.com",
  },
  {
    key: "location",
    icon: <IconLocation className="text-2xl text-orange-500" />,
    label: "United Arab Emirates",
  },
];
