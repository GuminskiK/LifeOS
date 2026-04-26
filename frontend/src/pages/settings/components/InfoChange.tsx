import React from 'react'
import { User } from 'lucide-react';

interface Props{
    handleUpdateProfile: (e: React.SyntheticEvent) => Promise<void>;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    loading: boolean;
}

export const InfoChange: React.FC<Props> = ({
    handleUpdateProfile,
    setEmail,
    email,
    loading
}) => {
    return(
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
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Zapisz zmiany
            </button>
          </form>
        </div>
    );
};