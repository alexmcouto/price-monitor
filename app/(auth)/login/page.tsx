'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();

    const { error: signInError, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    // Get user role to redirect appropriately
    if (data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = (userData as { role: string } | null)?.role;
      const redirectPath = role === 'admin' ? '/admin' : '/dashboard';
      router.push(redirectPath);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sunset-gradient">
      {/* Retro sun decoration */}
      <div className="absolute top-1/4 w-64 h-64 rounded-full bg-gradient-to-b from-neon-yellow via-neon-orange to-neon-pink opacity-30 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-press-start text-2xl md:text-3xl gradient-text mb-4 leading-relaxed">
            PRICE
            <br />
            MONITOR
          </h1>
          <p className="font-orbitron text-sm text-neon-cyan tracking-widest">
            TIMOR-LESTE MARKET INTEL
          </p>
        </div>

        {/* Login Card */}
        <Card className="neon-border-cyan">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-orbitron text-xl text-neon-pink uppercase tracking-wider">
                System Access
              </h2>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
            </div>

            <Input
              type="email"
              label="Email"
              placeholder="agent@central.tl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {error && (
              <div className="p-3 rounded-lg bg-neon-pink/20 border border-neon-pink">
                <p className="text-neon-pink font-vt323 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center mt-8 text-gray-500 font-vt323 text-sm">
          © 2026 PRICE MONITOR v1.0
        </p>
      </div>

      {/* Grid lines decoration */}
      <div className="absolute inset-0 retro-grid opacity-20 pointer-events-none" />
    </div>
  );
}
