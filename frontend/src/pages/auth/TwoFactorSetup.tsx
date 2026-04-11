import React, { useState } from 'react';
import { authApi } from '../../api/client';
import { ShieldCheck, Copy, Check, QrCode } from 'lucide-react';

export const TwoFactorSetup: React.FC = () => {
  const [setupData, setSetupData] = useState<{ secret: string; qr_code_url: string; backup_codes?: string[] } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQrCode = async () => {
    try {
      const res = await authApi.post('/2fa/setup');
      setSetupData(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas pobierania konfiguracji 2FA.');
    }
  };

  const handleEnable2FA = async () => {
    try {
      await authApi.post('/2fa/enable', { code: verificationCode });
      setIsEnabled(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nieprawidłowy kod. Spróbuj ponownie.');
    }
  };

  const currentSetupData = setupData;

  const copyBackupCodes = () => {
    if (currentSetupData?.backup_codes) {
      navigator.clipboard.writeText(currentSetupData.backup_codes.join('\n'));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="text-blue-500" />
          Dwuskładnikowe Uwierzytelnianie (2FA)
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Zabezpiecz swoje konto w LifeOS przed nieautoryzowanym logowaniem. Po skonfigurowaniu,
          podczas logowania zostaniesz poproszony o kod generowany przez Twoją aplikację uwierzytelniającą (np. Google Authenticator lub Authy).
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {isEnabled ? (
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
          <Check className="mx-auto text-green-500 mb-2" size={48} />
          <h3 className="text-xl font-semibold text-green-800">2FA zostało aktywowane!</h3>
          <p className="text-green-700 mt-2">Dziękujemy. Twoje konto jest teraz bezpieczniejsze.</p>
        </div>
      ) : !currentSetupData ? (
        <button
          onClick={fetchQrCode}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <QrCode /> Skonfiguruj 2FA
        </button>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <h3 className="font-semibold text-gray-800">1. Zeskanuj ten kod QR</h3>
              <p className="text-sm text-gray-600">
                Użyj wybranej aplikacji uwierzytelniającej na telefonie, aby dodać swoje konto.
              </p>
              <div className="bg-gray-50 p-4 border rounded-lg inline-block">
                {/* Załóżmy, że qr_code_url przechowuje format data:image/png;base64,... albo bezpośredni generowany string URI z backendu */}
                <img src={currentSetupData.qr_code_url} alt="QR Code 2FA" className="w-48 h-48 mx-auto mix-blend-multiply" />
              </div>
              <p className="text-xs text-gray-500 break-words">
                Jeśli nie możesz zeskanować, wprowadź kod ręcznie: <br/>
                <strong className="font-mono text-gray-800">{currentSetupData.secret}</strong>
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="font-semibold text-gray-800">2. Wprowadź kod weryfikacyjny</h3>
              <p className="text-sm text-gray-600">
                Przepisz sześciocyfrowy kod wyświetlany na ekranie Twojego urządzenia.
              </p>
              <input
                type="text"
                placeholder="123 456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button
                onClick={handleEnable2FA}
                disabled={verificationCode.length !== 6}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
              >
                Aktywuj Ochronę
              </button>
            </div>
          </div>

          {currentSetupData.backup_codes && (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-red-600">Twoje kody zapasowe (Backup Codes)</h3>
                <button
                  onClick={copyBackupCodes}
                  className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-900"
                >
                  {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  {isCopied ? 'Skopiowano!' : 'Kopiuj listę'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Przechowaj je w bardzo bezpiecznym miejscu. Przydadzą się, gdy stracisz dostęp do aplikacji (jeden kod per jedno logowanie).
              </p>
              <div className="grid grid-cols-2 gap-3 bg-red-50 p-4 border border-red-100 rounded-lg font-mono text-center">
                {currentSetupData.backup_codes.map((code, idx) => (
                  <div key={idx} className="bg-white py-2 rounded shadow-sm text-gray-800 tracking-wider">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
