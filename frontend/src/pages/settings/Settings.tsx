import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/client';
import {  CheckCircle, AlertTriangle } from 'lucide-react';
import { ChangePassword } from './components/ChangePassword';
import { TwoFASecurity } from './components/TwoFASecurity';
import { InfoChange } from './components/InfoChange';


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

  const handleUpdateProfile = async (e: React.SyntheticEvent) => {
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

  const handleUpdatePassword = async (e: React.SyntheticEvent) => {
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
        <InfoChange
          handleUpdateProfile={handleUpdateProfile}
          setEmail={setEmail}
          email={email}
          loading={loading}
        />

        <ChangePassword
          handleUpdatePassword={handleUpdatePassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          loading={loading}
        />
      </div>

      <TwoFASecurity 
        handleDisable2FA={handleDisable2FA}
        loading={loading}
      />
      
    </div>
  );
};
