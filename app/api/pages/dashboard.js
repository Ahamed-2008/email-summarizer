// pages/dashboard.js
import EmailDashboard from '../components/EmailDashboard';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Replace this with your actual user data from Google OAuth
    setUser({
      name: 'Ahamed',
      email: 'ahamed99946@gmail.com',
      accessToken: 'your-google-access-token' // This should come from your OAuth flow
    });
  }, []);

  return <EmailDashboard user={user} />;
}