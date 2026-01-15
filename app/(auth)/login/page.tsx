'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form from URL params (for testing)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const passwordParam = searchParams.get('password');
    if (emailParam) setEmail(emailParam);
    if (passwordParam) setPassword(passwordParam);
  }, [searchParams]);

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
      let role: string | undefined;

      // First, try to get role from users table
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userData && !profileError) {
        role = (userData as { role: string }).role;
      } else {
        // Fallback: get role from auth user metadata
        // This handles cases where user profile wasn't auto-created
        role = data.user.user_metadata?.role as string | undefined;
      }

      // Default to field_worker if no role found
      const finalRole = role || 'field_worker';
      const redirectPath = finalRole === 'admin' ? '/admin' : '/dashboard';
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
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
