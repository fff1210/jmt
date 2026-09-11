import React, { useState } from 'react';
import { Utensils, Users, UserCheck, CalendarDays, ChevronDown, Check, LogIn, Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  isRealFirebaseUser: boolean;
  pendingRequestsCount?: number;
  onSwitchUser?: (user: User) => void;
  activeTab: 'pots' | 'friends' | 'profile';
  setActiveTab: (tab: 'pots' | 'friends' | 'profile') => void;
  onOpenGoogleAuth?: () => void;
  onLogout: () => void;
  onCreatePotClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  isRealFirebaseUser,
  pendingRequestsCount = 0,
  activeTab,
  setActiveTab,
  onLogout,
  onCreatePotClick,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              id="app-logo"
              onClick={() => setActiveTab('pots')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-200 group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-stone-900 flex items-center gap-1.5">
                  밥팟 <span className="text-orange-600 font-extrabold text-sm tracking-normal px-1.5 py-0.5 rounded-md bg-orange-50 border border-orange-200/80">BobPot</span>
                </span>
                <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                  친구 맞춤 맛집 필터링 & 실시간 투표
                </p>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center bg-stone-100/90 p-1 rounded-xl border border-stone-200/60">
            <button
              id="nav-pots-tab"
              onClick={() => setActiveTab('pots')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'pots'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-orange-500" />
              <span>식사 팟</span>
            </button>

            <button
              id="nav-friends-tab"
              onClick={() => setActiveTab('friends')}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'friends'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>친구 목록</span>
              {pendingRequestsCount > 0 && (
                <span className="ml-0.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-2xs">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              id="nav-profile-tab"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>내 취향/알레르기</span>
            </button>
          </nav>

          {/* Right Action: User switcher & New Pot */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-quick-new-pot"
              onClick={onCreatePotClick}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>새 팟 만들기</span>
            </button>

            {/* Google Login Status / Account Profile Dropdown */}
            <div className="relative">
              <button
                id="user-account-switcher-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-2xs"
                title="내 계정 정보"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-stone-200"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-stone-900 leading-tight flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      구글 계정
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 truncate max-w-[120px]">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 pb-3 border-b border-stone-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                          내 계정 정보
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Google 연동
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-stone-900 truncate">
                            {currentUser.name}
                          </div>
                          <div className="text-xs text-stone-500 truncate">
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>내 취향 & 알레르기 설정하기</span>
                      </button>

                      <button
                        id="btn-navbar-logout"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Google 계정 로그아웃</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
