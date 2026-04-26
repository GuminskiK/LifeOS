import React from 'react'
import { Lock } from 'lucide-react';
interface Props{
    handleUpdatePassword: (e: React.SyntheticEvent) => Promise<void>;
    newPassword: string;
    setNewPassword: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
}

export const ChangePassword: React.FC<Props> = ({
    handleUpdatePassword,
    newPassword,
    setNewPassword,
    loading
}) => {
    return (
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
);};