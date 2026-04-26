import React from 'react'
import {  Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props{
    handleDisable2FA: (e: React.SyntheticEvent) => Promise<void>;
    loading: boolean;
}

export const TwoFASecurity: React.FC<Props> = ({
    handleDisable2FA,
    loading
}) => {
    return (
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
    )
}