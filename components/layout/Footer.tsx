import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  shop: [
    { href: '/collections/men', label: "Men's" },
    { href: '/collections/women', label: "Women's" },
    { href: '/collections/kids', label: "Kids'" },
    { href: '/collections/accessories', label: 'Accessories' },
    { href: '/collections/new-arrivals', label: 'New Arrivals' },
  ],
  help: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/about', label: 'About Us' },
    { href: '/account/orders', label: 'Track Order' },
    { href: '/returns', label: 'Returns & Exchanges' },
    { href: '/faq', label: 'FAQ' },
  ],
  account: [
    { href: '/account', label: 'My Account' },
    { href: '/account/orders', label: 'Order History' },
    { href: '/wishlist', label: 'Wishlist' },
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
            <h3 className="font-display text-lg font-bold uppercase mb-4 text-white">Account</h3>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
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
              <Link href="https://facebook.com/adidaslk" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com/adidaslk" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com/adidaslk" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://youtube.com/adidaslk" className="text-gray-300 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </Link>
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
