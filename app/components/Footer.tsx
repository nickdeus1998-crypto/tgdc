'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ContactInfoProps {
  address: string;
  phoneNumbers: string[];
  email: string;
}

interface LinkItem {
  name: string;
  href: string;
}

interface LinksSectionProps {
  title: string;
  links: LinkItem[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface FooterBottomProps {
  navLinks: LinkItem[];
  socialLinks: SocialLink[];
  copyrightText: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ address, phoneNumbers, email }) => (
  <div className="lg:col-span-1">
    <h3 className="text-xl font-bold mb-6 text-white">Contact Us</h3>
    <div className="space-y-4">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-emerald-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{address}</p>
        </div>
      </div>
      <div className="flex items-center">
        <svg className="w-5 h-5 text-emerald-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
        <div>
          {phoneNumbers.map((phone, index) => (
            <p key={index} className="text-gray-300 text-sm">{phone}</p>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <svg className="w-5 h-5 text-emerald-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        <Link href={`mailto:${email}`} className="text-emerald-500 hover:text-white transition-colors text-sm">
          {email}
        </Link>
      </div>
    </div>
  </div>
);

const LinksSection: React.FC<LinksSectionProps> = ({ title, links }) => (
  <div>
    <h3 className="text-xl font-bold mb-6 text-white">{title}</h3>
    <ul className="space-y-3">
      {links.map((link, index) => (
        <li key={index}>
          <Link href={link.href} className="text-gray-300 hover:text-emerald-500 transition-colors text-sm flex items-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0" />
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const FooterBottom: React.FC<FooterBottomProps> = ({ navLinks, socialLinks, copyrightText }) => (
  <div className="border-t border-gray-700 mt-12 pt-8">
    <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
      <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
        {navLinks.map((link, index) => (
          <React.Fragment key={index}>
            <Link href={link.href} className="text-gray-300 hover:text-emerald-500 transition-colors">
              {link.name}
            </Link>
            {index < navLinks.length - 1 && <span className="text-gray-600">|</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="flex space-x-4">
        {socialLinks.map((social, index) => (
          <Link
            key={index}
            href={social.href}
            className="social-icon w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300"
            onClick={() => console.log(`Social media icon clicked: ${social.name}`)}
          >
            {social.icon}
          </Link>
        ))}
      </div>
    </div>
    <div className="text-center mt-8 pt-6 border-t border-gray-700">
      <p className="text-gray-400 text-sm mb-2">{copyrightText}</p>
      <p className="text-gray-500 text-xs leading-relaxed">
        The website is Designed, Developed And Maintained by TGDC. Content Maintained by TGDC.
      </p>
    </div>
  </div>
);

const Footer: React.FC = () => {
  const defaultContactInfo: ContactInfoProps = {
    address: `Nyumba Na. 25 Ursino
Barabara ya Mwai Kibaki
14801 Dar es Salaam`,
    phoneNumbers: ['+255 736 014801', '+255 736 014801'],
    email: 'info@tgdc.go.tz',
  };

  const relatedLinks: LinkItem[] = [
    { name: 'TANESCO', href: '#' },
    { name: 'EWURA', href: '#' },
    { name: 'DIT', href: '#' },
    { name: 'UDOM', href: '#' },
    { name: 'GST', href: '#' },
  ];

  const defaultQuickLinks: LinkItem[] = [
    { name: 'News', href: '#' },
    { name: 'Video Gallery', href: '#' },
    { name: 'Photo Gallery', href: '#' },
    { name: 'Social Media', href: '#' },
  ];

  const defaultSocialLinks: SocialLink[] = [
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
        </svg>
      ),
    },
  ];

  const footerNavLinks: LinkItem[] = [
    { name: 'Sitemap', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms and Conditions', href: '#' },
    { name: 'Copyright Statement', href: '#' },
  ];

  const companyLinks: LinkItem[] = [
    { name: 'About', href: '/about-us' },
    { name: 'Projects', href: '/projects' },
    { name: 'Contact', href: '/contact' },
  ];

  const [contactInfo, setContactInfo] = useState<ContactInfoProps>(defaultContactInfo);
  const [quickLinks, setQuickLinks] = useState<LinkItem[]>(defaultQuickLinks);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(defaultSocialLinks);
  const [copyrightText, setCopyrightText] = useState<string>('Copyright (c) 2019-2025 TGDC. All Rights Reserved.');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/footer');
        if (!res.ok) return;
        const data = await res.json();

        const address = data.address || defaultContactInfo.address;
        const email = data.email || defaultContactInfo.email;
        const phone = data.phone || defaultContactInfo.phoneNumbers[0];
        setContactInfo({ address, email, phoneNumbers: phone ? [phone] : defaultContactInfo.phoneNumbers });

        const ql = Array.isArray(data.quickLinks) ? data.quickLinks : [];
        setQuickLinks(
          ql.length ? ql.map((l: any) => ({ name: l.label ?? l.name ?? 'Link', href: l.url ?? l.href ?? '#' })) : defaultQuickLinks
        );

        const sl = Array.isArray(data.socialLinks) ? data.socialLinks : [];
        setSocialLinks(
          sl.length
            ? sl.map((s: any) => ({
                name: s.name ?? 'Social',
                href: s.url ?? '#',
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <g dangerouslySetInnerHTML={{ __html: s.icon || '' }} />
                  </svg>
                ),
              }))
            : defaultSocialLinks
        );

        setCopyrightText(
          data.copyright || `\u00A9 ${new Date().getFullYear()} TGDC. All rights reserved.`
        );
      } catch (e) {
        console.error('Footer load error', e);
      }
    };
    load();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          <ContactInfo {...contactInfo} />
          <LinksSection title="Related Links" links={relatedLinks} />
          <LinksSection title="Quick Links" links={quickLinks} />
          <LinksSection title="Company" links={companyLinks} />
        </div>
        <FooterBottom navLinks={footerNavLinks} socialLinks={socialLinks} copyrightText={copyrightText} />
      </div>
    </footer>
  );
};

export default Footer;
