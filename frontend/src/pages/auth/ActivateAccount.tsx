import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/client';

export const ActivateAccount: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      try {
        await authApi.patch(`/auth/activate/${token}`);
        setStatus('success');
        setMessage('Konto zostało pomyślnie aktywowane! Możesz się teraz zalogować.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Nieprawidłowy lub wygasły token aktywacyjny.');
      }
    };

    if (token) {
      activateAccount();
    } else {
      setStatus('error');
      setMessage('Brak tokena aktywacyjnego w URL.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800">Aktywowanie konta...</h2>
            <p className="text-gray-500 mt-2">Proszę czekać.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="text-green-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800">Sukces!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link to="/login" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Zaloguj się
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800">Wystąpił błąd</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link to="/login" className="mt-6 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Powrót do logowania
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
