import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/layout';
import { ToastProvider } from '@/components/ui';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get full user profile
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !userData) {
    // User exists in auth but not in users table - sign them out
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark-bg">
        <Navigation user={userData} />
        <main className="pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
