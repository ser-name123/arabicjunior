"use client";

import React, { useState, useEffect } from "react";
import { IconCalling, IconEmail, IconLocation, IconWhatsApp } from "./svgIcons";
import Link from "next/link";

const ContactInfo = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/settings`);
        const result = await res.json();
        if (res.ok && result.data) {
          setSettings(result.data);
        }
      } catch (err) {
        console.error("Error loading contact info settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const email = settings?.contactEmail || "hello@ArabicJuniors.com";
  const location = settings?.contactLocation || "United Arab Emirates";
  const phone = settings?.contactPhone || "+971 50 992 1470";
  const whatsApp = settings?.contactWhatsApp || "+971 50 534 4645";
  const whatsAppLink = settings?.contactWhatsAppLink || "https://wa.me/971505344645?text=Hello!%20I%27m%20interested%20in%20enrolling%20in%20Arabic%20tuition%20classes.%20Please%20get%20in%20touch%20with%20me";

  const CONTACT_LISTS = [
    {
      key: "email",
      icon: <IconEmail className="text-2xl text-orange-500" />,
      label: email,
    },
    {
      key: "location",
      icon: <IconLocation className="text-2xl text-orange-500" />,
      label: location,
    },
  ];

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
                <span className="text-lg font-semibold text-black flex-1 select-all">
                  {contact.label}
                </span>
              </li>
            </React.Fragment>
          ))}
        </ul>

        <div aria-label="additional-info" className="space-y-6">
          <Link href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-x-3 w-full group">
            <span className="flex flex-grow-0 flex-shrink-0 basis-auto text-orange-500 group-hover:scale-105 transition-transform">
              <IconCalling className="text-4xl text-orange-500" />
            </span>
            <span className="text-2xl font-bold text-neutral-900 group-hover:text-orange-500 transition-colors select-all">
              {phone}
            </span>
          </Link>
          
          <Link href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-x-3 w-full group">
            <span className="flex flex-grow-0 flex-shrink-0 basis-auto text-green-500 group-hover:scale-105 transition-transform">
              <IconWhatsApp className="text-4xl text-[#25D366]" />
            </span>
            <span className="text-2xl font-bold text-neutral-900 group-hover:text-green-600 transition-colors select-all">
              {whatsApp}
            </span>
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ContactInfo;
