import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/client';
import { User, Lock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Pobranie aktualnych danych profilu
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.get('/users/me'); // Standardowy endpoint dla zalogowanego usera
        if (response.data?.email) setEmail(response.data.email);
      } catch (err) {
        console.error('Nie udało się pobrać danych użytkownika', err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      await authApi.patch('/users/me', { email });
      setMessage({ type: 'success', text: 'Profil został zaktualizowany.' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Wystąpił błąd podczas aktualizacji profilu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!newPassword) return;
    
    setLoading(true);
    try {
      // Standardowy update modelu usera zakłada możliwość zmiany hasła
      await authApi.patch('/users/me', { password: newPassword });
      setMessage({ type: 'success', text: 'Hasło zostało pomyślnie zmienione.' });
      setNewPassword('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Wystąpił błąd podczas zmiany hasła.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Czy na pewno chcesz wyłączyć 2FA? To obniży bezpieczeństwo Twojego konta.')) return;
    
    setMessage(null);
    setLoading(true);
    try {
      await authApi.post('/2fa/disable');
      setMessage({ type: 'success', text: 'Zabezpieczenie 2FA zostało wyłączone.' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Wystąpił błąd podczas wyłączania 2FA.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ustawienia Konta</h1>
        <p className="mt-2 text-sm text-gray-600">Zarządzaj swoimi danymi personalnymi i ustawieniami bezpieczeństwa.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Dane profilu */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
            <User className="text-blue-500" /> Twoje Dane
          </h2>
          <form className="space-y-4" onSubmit={handleUpdateProfile}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres E-mail</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            {/* Tutaj możesz dodać imię/nazwisko, jeśli posiadasz w modelu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Zapisz zmiany
            </button>
          </form>
        </div>

        {/* Zmiana hasła */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
            <Lock className="text-gray-500" /> Zmiana Hasła
          </h2>
          <form className="space-y-4" onSubmit={handleUpdatePassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Hasło musi mieć co najmniej 8 znaków.</p>
            </div>
            <button
              type="submit"
              disabled={loading || !newPassword}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
            >
              Zaktualizuj hasło
            </button>
          </form>
        </div>
      </div>

      {/* 2FA Security */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Shield className="text-green-500" /> Bezpieczeństwo i 2FA
        </h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <h3 className="font-medium text-gray-900">Dwuskładnikowe Uwierzytelnianie (2FA)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Dodatkowa warstwa ochrony z użyciem aplikacji Authenticator i kodów zapasowych.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/2fa-setup"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition text-center"
            >
              Skonfiguruj 2FA
            </Link>
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
            >
              Wyłącz
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};
