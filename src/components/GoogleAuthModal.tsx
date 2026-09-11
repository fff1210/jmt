import React, { useState } from 'react';
import { X, LogIn, LogOut, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { loginWithGoogle, logout, auth } from '../lib/firebase';
import { syncUserProfile } from '../lib/firestoreService';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  isRealFirebaseUser: boolean;
  onUserAuthenticated: (user: User) => void;
  onSignOut: () => void;
  onSelectUser: (user: User) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  isRealFirebaseUser,
  onUserAuthenticated,
  onSignOut,
  onSelectUser,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Google Sign-in via Firebase Auth popup
  const handleRealGoogleLogin = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      const fbUser = await loginWithGoogle();
      const syncedUser = await syncUserProfile({
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
      });

      onUserAuthenticated(syncedUser);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('로그인 팝업이 닫혔습니다. 다시 시도해주세요.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('이전 로그인 요청이 취소되었습니다.');
      } else {
        setErrorMessage(
          err.message || '구글 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        );
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onSignOut();
      onClose();
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">구글 계정 로그인</h3>
              <p className="text-xs text-stone-500">
                실제 구글 계정으로 접속하여 클라우드에 취향을 저장합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status display */}
        {isRealFirebaseUser ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>구글 계정으로 연결됨</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-emerald-300"
              />
              <div className="min-w-0">
                <div className="font-bold text-stone-900 text-sm">{currentUser.name}</div>
                <div className="text-stone-500 text-xs truncate">{currentUser.email}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs space-y-1">
            <div className="font-bold text-orange-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>진짜 구글 계정으로 원클릭 로그인</span>
            </div>
            <p className="text-orange-900 leading-relaxed">
              본인 구글 계정으로 로그인하면 언제 어디서든 내 식사 팟, 알레르기, 친구 목록이 안전하게 실시간 동기화됩니다.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Real Google Sign-In Button */}
        <button
          id="btn-real-google-signin"
          type="button"
          onClick={handleRealGoogleLogin}
          disabled={isAuthenticating}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 hover:border-stone-400 font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-md active:scale-98 disabled:opacity-50"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              <span>구글 인증 진행 중...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {isRealFirebaseUser ? '다른 구글 계정으로 전환하기' : 'Google 계정으로 로그인하기'}
              </span>
            </>
          )}
        </button>

        {/* Existing / Test Users Quick Switching */}
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            또는 다른 참가자 계정으로 전환 (다자 테스트용):
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
            {allUsers.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {u.email}
                    </div>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
