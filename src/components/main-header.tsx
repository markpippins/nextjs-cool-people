'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import {
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  Rss,
  User,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';
import { logoutAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useChat } from './chat/chat-provider';

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <div className="rounded-lg bg-primary/10 p-2">
        <Zap className="h-5 w-5 text-primary" />
      </div>
      <span className="text-xl font-bold font-headline tracking-tight">
        CoolPeople
      </span>
    </Link>
  );
}

function NavLink({
  href,
  children,
  icon,
  className,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const content = (
    <Button
      variant="ghost"
      className={cn('flex items-center gap-2', className)}
      onClick={onClick}
    >
      {icon}
      {children}
    </Button>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function MainHeader() {
  const { user, checkAuth } = useAuth();
  const { toggleChat } = useChat();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logoutAction();
    await checkAuth();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        {user && (
          <nav className="ml-10 hidden items-center space-x-2 md:flex">
            <NavLink href="/feed" icon={<Rss size={16} />}>
              Feed
            </NavLink>
            <NavLink href="/forums" icon={<Users size={16} />}>
              Forums
            </NavLink>
          </nav>
        )}
        <div className="ml-auto flex items-center space-x-2">
          {user ? (
            <>
              <ThemeToggle />
              <Button variant="ghost" onClick={toggleChat}>
                <MessageSquare size={16} className="mr-2" />
                Chat
              </Button>
              <Link href={`/profile/${user.username}`}>
                <Button variant="ghost">
                  <User size={16} className="mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">
                  <LogIn size={16} className="mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button>
                  <UserPlus size={16} className="mr-2" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
