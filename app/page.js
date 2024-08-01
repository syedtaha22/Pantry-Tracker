'use client';

import LandingPage from './landing/page';
import SignInPage from './signin/page';
import PantryPage from './pantry/page';
import SignUpPage from './signup/page';
import { usePathname } from 'next/navigation';

const Page = () => {
  const pathname = usePathname();

  if (pathname === '/signin') {
    return <SignInPage />;
  }

  if (pathname === '/signup') {
    return <SignUpPage />;
  }

  if (pathname === '/pantry') {
    return <PantryPage />;
  }

  return <LandingPage />;
};

export default Page;
