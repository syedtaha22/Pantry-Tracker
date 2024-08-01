// app/protectedRoute.js
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const withAuth = (Component) => {
  return (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/signin'); // Redirect to sign-in page if not authenticated
        } else {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>; // Show a loading state while checking authentication
    }

    return <Component {...props} />;
  };
};

export default withAuth;
