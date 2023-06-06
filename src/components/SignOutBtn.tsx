'use client';

import { ButtonHTMLAttributes, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignOutBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
}

export const SignOutBtn = ({ ...props }: SignOutBtnProps) => {

  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (e) {
      toast.error('There was a problem signing out!');
    } finally {
      setIsSigningOut(false);
    }
  };


  return <Button {...props} variant='ghost' onClick={handleSignOut}>
    {isSigningOut ? <Loader2 className='animate-spin h-4 w-4' /> : <LogOut className='w-4 h-4' />}
  </Button>;
};

