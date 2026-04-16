import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  shop: [
    { href: '/men', label: "Men's" },
    { href: '/women', label: "Women's" },
    { href: '/kids', label: "Kids'" },
    { href: '/new', label: 'New Arrivals' },
    { href: '/sale', label: 'Sale' },
  ],
  help: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns & Exchanges' },
    { href: '/faq', label: 'FAQ' },
  ],
  about: [
    { href: '/about', label: 'About Us' },
    { href: '/authenticity', label: 'Authenticity Guarantee' },
    { href: '/careers', label: 'Careers' },
  ],
};

const paymentMethods = [
  { name: 'Visa' },
  { name: 'Mastercard' },
  { name: 'Amex' },
  { name: 'eZCash' },
  { name: 'Genie' },
];

export function Footer() {
  return (
    <footer className="bg-(--color-primary) text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Shop */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4 text-white">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4 text-white">Help</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4 text-white">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4 text-white">Connect</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              Email: support@adidaslk.lk<br />
              Phone: +94 11 XXX XXXX
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">We accept:</span>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="h-6 px-2 bg-white/10 rounded flex items-center justify-center"
                    title={method.name}
                  >
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} adidaslk.lk. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
