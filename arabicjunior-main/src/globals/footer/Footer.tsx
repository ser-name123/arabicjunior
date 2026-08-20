"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  CallingIcon,
  EmailIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  LocationIcon,
  YouTubeIcon,
} from "./SvgIcons";

const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/footer-settings`);
        const result = await res.json();
        if (res.ok && result.data) {
          setSettings(result.data);
        }
      } catch (err) {
        console.error("Error loading footer settings:", err);
      }
    };
    fetchFooterSettings();
  }, []);

  const description = settings?.description || "Learn Arabic online with expert UAE syllabus tutors, offering affordable one-to-one and group classes in conversational and Modern Standard Arabic.";
  const facebook = settings?.facebook || "https://www.facebook.com/arabicjuniors";
  const linkedin = settings?.linkedin || "https://www.linkedin.com/company/arabicjuniors";
  const youtube = settings?.youtube || "https://www.youtube.com/@ArabicJuniors";
  const instagram = settings?.instagram || "https://www.instagram.com/arabicjunior/";
  
  const phone = settings?.phone || "+971 50 534 4645";
  const phoneLink = settings?.phoneLink || "https://wa.me/971505344645?text=Hello!%20I'm%20interested%20in%20enrolling%20in%20Arabic%20tuition%20classes.%20Please%20get%20in%20touch%20with%20me.";
  const email = settings?.email || "hello@arabicjuniors.com";
  const location = settings?.location || "Dubai - United Arab Emirates";
  
  const copyright = settings?.copyright || "©2026 www.arabicjuniors.com | All Rights Reserved by The Learning Hub FZE LLC";
  const seoKeywords: string[] = settings?.seoKeywords?.length
    ? settings.seoKeywords
    : [];

  const SOCIAL_DATA = [
    {
      key: "facebook",
      icon: <FacebookIcon className="text-[#1877F2]" />,
      link: facebook,
    },
    {
      key: "linkedin",
      icon: <LinkedinIcon className="text-[#2867B2]" />,
      link: linkedin,
    },
    {
      key: "youtube",
      icon: <YouTubeIcon className="text-[#FF0000]" />,
      link: youtube,
    },
    {
      key: "instagram",
      icon: <InstagramIcon className="text-[#F00073]" />,
      link: instagram,
    },
  ];

  return (
    <React.Fragment>
      <footer aria-label="main-footer" className="pt-12 bg-[#F5F5F5] font-sans">
        <div className="container">
          <div
            aria-label="footer-wrapper"
            className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-7 gap-y-5"
          >
            <div aria-label="site-details-column">
              <Link href="/" className="mb-3 flex">
                <Image
                  src={"/arabic-logo-new.png"}
                  width={138}
                  height={56}
                  alt="arabic juniors logo"
                  priority
                />
              </Link>
              <p className="text-neutral-700 font-normal text-base lg:mb-16">
                {description}
              </p>

              <div
                aria-label="social-connect-wrapper"
                className="hidden lg:block mt-6"
              >
                <h4 className="text-lg font-bold text-neutral-800 mb-4">
                  Connect with us
                </h4>

                <ul
                  aria-label="social-lists"
                  className="flex items-center gap-x-2"
                >
                  {SOCIAL_DATA.map((social) => (
                    <li
                      key={social.key}
                      aria-label="social-item"
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      <Link href={social.link} target="_blank">{social.icon}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              aria-label="important-links-column"
              className="flex items-center justify-start flex-col"
            >
              <div
                aria-label="footer-links-wrapper"
                className="w-full lg:max-w-max"
              >
                <h4 className="text-neutral-800 text-3xl font-bold mb-6">
                  DISCOVER
                </h4>

                <ul
                  aria-label="footer-nav-list"
                  className="flex items-start flex-col gap-y-3"
                >
                  <li aria-label="footer-nav-item">
                    <Link
                      href="/about-us"
                      className="text-neutral-800 text-lg font-normal transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      About
                    </Link>
                  </li>

                  <li aria-label="footer-nav-item">
                    <Link
                      href="/pricing"
                      className="text-neutral-800 text-lg font-normal transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      Pricing
                    </Link>
                  </li>

                  <li aria-label="footer-nav-item">
                    <Link
                      href="/blogs"
                      className="text-neutral-800 text-lg font-normal transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      Blog
                    </Link>
                  </li>

                  <li aria-label="footer-nav-item">
                    <Link
                      href="#"
                      className="text-neutral-800 text-lg font-normal transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      Testimonial
                    </Link>
                  </li>

                  <li aria-label="footer-nav-item">
                    <Link
                      href="/careers"
                      className="text-neutral-800 text-lg font-normal transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      Careers
                    </Link>
                  </li>

                  <li aria-label="footer-nav-item">
                    <Link
                      href="/faq"
                      className="text-neutral-800 text-lg font-normal transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div aria-label="help-center-column">
              <div
                aria-label="help-center-wrapper"
                className="bg-white rounded-2xl py-5 px-7 border border-[#F1F5F9] shadow-[0px_4px_20px_rgba(0,0,0,0.02)]"
              >
                <h5 className="text-3xl text-neutral-800 font-bold mb-7">
                  HELP CENTER
                </h5>

                <ul
                  aria-label="contact-lists"
                  className="flex flex-col gap-y-4"
                >
                  <li aria-label="contact-item">
                    <Link
                      href={phoneLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-x-3 text-lg font-normal text-neutral-800 max-w-max transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      <CallingIcon className="text-orange-500 text-2xl" />
                      {phone}
                    </Link>
                  </li>

                  <li aria-label="contact-item">
                    <Link
                      href={`mailto:${email}`}
                      className="flex items-center gap-x-3 text-lg font-normal text-neutral-800 max-w-max transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      <EmailIcon className="text-orange-500 text-2xl" />
                      {email}
                    </Link>
                  </li>

                  <li aria-label="contact-item">
                    <Link
                      href="https://maps.app.goo.gl/hAwg2jjYZ3guPmau9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-x-3 text-lg font-normal text-neutral-800 max-w-max transition-all ease-in-out duration-300 hover:text-orange-500"
                    >
                      <LocationIcon className="text-orange-500 text-2xl" />
                      {location}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* social link for mobile */}
          <div aria-label="social-connect-wrapper" className="lg:hidden mb-6">
            <h4 className="text-lg font-bold text-neutral-800 mb-4">
              Connect with us
            </h4>

            <ul aria-label="social-lists" className="flex items-center gap-x-2">
              {SOCIAL_DATA.map((social) => (
                <li
                  key={social.key}
                  aria-label="social-item"
                  className="text-2xl"
                >
                  <Link href={social.link} target="_blank">
                    {social.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {seoKeywords.length > 0 && (
            <ul
              aria-label="footer-seo-keywords"
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-t-neutral-200 pt-4 pb-1 text-center"
            >
              {seoKeywords.map((keyword, index) => (
                <li
                  key={keyword}
                  className="flex items-center gap-x-3 text-xs sm:text-sm font-normal text-neutral-600"
                >
                  <span>{keyword}</span>
                  {index < seoKeywords.length - 1 && (
                    <span aria-hidden="true" className="text-neutral-300">
                      |
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div
            aria-label="footer-copyright"
            className="pt-4 pb-5 border-t border-t-neutral-200 flex flex-col sm:flex-row items-center gap-y-3 justify-between text-center sm:text-left"
          >
            <p className="text-neutral-700 text-xs sm:text-sm font-normal">
              {copyright}
            </p>

            <ul
              aria-label="agreement-links"
              className="flex items-center gap-x-4 sm:gap-x-10"
            >
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-neutral-700 text-xs sm:text-sm font-normal transition-colors ease-in-out duration-300 hover:text-orange-500"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className="text-neutral-700 text-xs sm:text-sm font-normal transition-colors ease-in-out duration-300 hover:text-orange-500"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
