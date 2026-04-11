import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Unlock, User, ShieldAlert } from 'lucide-react';
import { authApi } from '../../api/client';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Dla /auth/token z reguły to "application/x-www-form-urlencoded" albo json
      // zależy od pod spodem OAuth2 configu
      const payload = {
        username: email,
        password: password,
        ...(requires2FA && totpCode ? { totp_code: totpCode } : {}),
      };

      const response = await authApi.post('/auth/token', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem('token', access_token);
        navigate('/');
      }
    } catch (err: any) {
      // Jeśli rzuci wyjątkiem o braku klucza lub wymogu 2FA:
      if (err.response?.status === 403 && err.response?.data?.detail?.includes('2FA')) {
        setRequires2FA(true);
        setError('Podaj kod 2FA lub kod zapasowy.');
      } else {
        setError(err.response?.data?.detail || 'Wystąpił błąd logowania. Sprawdź e-mail i hasło.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zaloguj się do LifeOS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Jesteś o krok od kontroli nad życiem
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 text-center">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <Mail className="absolute text-gray-400 left-3 top-3" size={20} />
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adres e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || requires2FA}
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute text-gray-400 left-3 top-3" size={20} />
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || requires2FA}
              />
            </div>

            {requires2FA && (
              <div className="relative mt-4">
                <ShieldAlert className="absolute text-blue-400 left-3 top-3" size={20} />
                <input
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-blue-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-blue-50"
                  placeholder="Kod z aplikacji lub backup kod"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Unlock className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? 'Logowanie...' : (requires2FA ? 'Potwierdź i wejdź' : 'Zaloguj')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
