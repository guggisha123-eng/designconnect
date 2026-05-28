'use client'

import { Palette, Instagram, Twitter, Linkedin, Mail, Phone, Heart } from 'lucide-react'
import { useNavStore, type Page } from '@/store/nav-store'

const footerLinks = {
  Platform: [
    { label: 'Browse Designs', page: 'browse' as Page },
    { label: 'Categories', page: 'categories' as Page },
    { label: 'Pricing', page: 'pricing' as Page },
    { label: 'Upload Design', page: 'upload' as Page },
  ],
  Company: [
    { label: 'About Us', page: 'about' as Page },
    { label: 'Contact', page: 'contact' as Page },
    { label: 'FAQ', page: 'faq' as Page },
  ],
  Legal: [
    { label: 'Privacy Policy', page: 'about' as Page },
    { label: 'Terms of Service', page: 'about' as Page },
    { label: 'Cookie Policy', page: 'about' as Page },
  ],
}

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/designconnect_9389', label: 'Instagram' },
  { icon: Twitter, href: 'https://x.com/Designconnec', label: 'Twitter/X' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/anujsharma9675', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:guggisha123@gmail.com', label: 'Email' },
  { icon: Phone, href: 'tel:+917678279825', label: 'Phone' },
]

export default function Footer() {
  const navigateTo = useNavStore((s) => s.navigateTo)

  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Design Connect</span>
            </button>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
              Where creativity meets opportunity. Discover, share, and sell creative designs.
              Connect with talented designers worldwide and find the perfect design for your next project.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-[#fb8000] flex items-center justify-center transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-slate-300">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigateTo(link.page)}
                      className="text-sm text-slate-400 hover:text-[#fb8000] transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="mailto:guggisha123@gmail.com" className="hover:text-[#fb8000] transition-colors">
              guggisha123@gmail.com
            </a>
            <a href="tel:+917678279825" className="hover:text-[#fb8000] transition-colors">
              +91 7678279825
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Design Connect. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Design Connect Team
          </p>
        </div>
      </div>
    </footer>
  )
}
