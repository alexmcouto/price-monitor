'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types/database';
import { useState } from 'react';

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = user.role === 'admin';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fieldWorkerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '◈' },
    { href: '/audit/new', label: 'New Audit', icon: '✚' },
    { href: '/audit/history', label: 'History', icon: '◷' },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: '◈' },
    { href: '/admin/audits', label: 'All Audits', icon: '◷' },
    { href: '/admin/products', label: 'Products', icon: '▣' },
    { href: '/admin/clients', label: 'Clients', icon: '◉' },
    { href: '/admin/competitors', label: 'Competitors', icon: '◎' },
    { href: '/admin/export', label: 'Export', icon: '⤓' },
  ];

  const links = isAdmin ? adminLinks : fieldWorkerLinks;

  return (
    <>
      {/* Top Header - Desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-dark-surface/90 backdrop-blur-md border-b border-neon-cyan/30 z-40">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <span className="font-orbitron text-lg text-neon-cyan tracking-wider">
              PRICE MONITOR
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-lg font-vt323 text-lg transition-all
                  ${pathname === link.href 
                    ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan' 
                    : 'text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10'
                  }
                `}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-vt323 text-neon-pink">{user.full_name}</p>
              <p className="text-xs text-gray-500 font-orbitron uppercase">{user.sector} • {user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="retro-btn retro-btn-secondary text-sm px-4 py-2"
            >
              {isLoggingOut ? '...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-dark-surface/90 backdrop-blur-md border-b border-neon-cyan/30 z-40">
        <div className="px-4 h-full flex items-center justify-between">
          <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="font-orbitron text-sm text-neon-cyan">PRICE MONITOR</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-neon-pink font-vt323"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-surface/95 backdrop-blur-md border-t border-neon-cyan/30 z-40">
        <div className="h-full flex items-center justify-around">
          {links.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                ${pathname === link.href 
                  ? 'text-neon-cyan' 
                  : 'text-gray-500'
                }
              `}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs font-vt323">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacers for fixed navigation */}
      <div className="h-16 md:h-16" />
    </>
  );
}
