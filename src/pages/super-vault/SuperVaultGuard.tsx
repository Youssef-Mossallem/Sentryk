import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperDashboard from './SuperDashboard';

export default function SuperVaultGuard() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sentryk_super_token');
    const key = sessionStorage.getItem('sentryk_vault_key');

    if (!token || !key) {
      navigate('/super-vault/verify', { replace: true });
      return;
    }

    setIsAuthorized(true);
  }, [navigate]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin text-4xl">🛡️</div>
      </div>
    );
  }

  return <SuperDashboard />;
}