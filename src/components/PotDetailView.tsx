import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  AlertTriangle,
  Heart,
  Ban,
  ThumbsUp,
  CheckCircle,
  ExternalLink,
  Crown,
  Share2,
  RefreshCw,
  Check,
  Flame,
  Star,
  Trash2,
} from 'lucide-react';
import { MealPot, User, MealSlot, RestaurantRecommendation } from '../types';
import { fetchOrGenerateRecommendations } from '../lib/recommendationGenerator';

interface PotDetailViewProps {
  pot: MealPot;
  allUsers: User[];
  currentUser: User;
  onBack: () => void;
  onUpdatePot: (updated: MealPot) => void;
  onDeletePot?: (potId: string) => void;
  onSwitchUser?: (user: User) => void;
}

export const PotDetailView: React.FC<PotDetailViewProps> = ({
  pot,
  allUsers,
  currentUser,
  onBack,
  onUpdatePot,
  onDeletePot,
}) => {
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isHost = pot.hostId === currentUser.id;

  // Resolved member objects (ensuring current user is safely included)
  const members = pot.memberIds
    .map((id) => (id === currentUser.id ? currentUser : allUsers.find((u) => u.id === id)))
    .filter((u): u is User => Boolean(u));

  const host = allUsers.find((u) => u.id === pot.hostId) || members[0] || currentUser;

  const slotLabels: Record<MealSlot, { name: string; icon: string }> = {
    BREAKFAST: { name: '아침', icon: '🌅' },
    LUNCH: { name: '점심', icon: '☀️' },
    DINNER: { name: '저녁', icon: '🌙' },
  };

  // Run AI Recommendation and Filtering (Never fails with error alert)
  const handleGenerateRecommendations = async () => {
    setIsLoadingRecs(true);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 800);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1600);

    try {
      const { filterAnalysis, recommendations } = await fetchOrGenerateRecommendations(
        pot.locationName,
        pot.slot,
        pot.date,
        members
      );

      const updatedPot: MealPot = {
        ...pot,
        status: 'VOTING',
        filterAnalysis,
        recommendations,
        confirmedWinnerId: undefined, // Reset winner on new recommendation
      };

      onUpdatePot(updatedPot);
    } catch (err) {
      console.error('Failed to get recommendations:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoadingRecs(false);
      setLoadingStep(0);
    }
  };

  // Auto-generate recommendations if the pot was loaded with 0 recommendations
  useEffect(() => {
    if ((!pot.recommendations || pot.recommendations.length === 0) && !isLoadingRecs) {
      handleGenerateRecommendations();
    }
  }, [pot.id]);

  // Vote for a candidate
  const handleVote = (recId: string) => {
    if (pot.status === 'CONFIRMED') return;

    const updatedRecs = pot.recommendations.map((rec) => {
      // Remove current user vote from all options
      const filteredVotes = rec.votes.filter((v) => v !== currentUser.id);
      // Add current user vote to the selected option
      if (rec.id === recId) {
        return { ...rec, votes: [...filteredVotes, currentUser.id] };
      }
      return { ...rec, votes: filteredVotes };
    });

    const updatedPot: MealPot = {
      ...pot,
      recommendations: updatedRecs,
    };

    onUpdatePot(updatedPot);
  };

  // Confirm final winning location
  const handleConfirmWinner = (recId: string) => {
    const updatedPot: MealPot = {
      ...pot,
      status: 'CONFIRMED',
      confirmedWinnerId: recId,
    };
    onUpdatePot(updatedPot);
  };

  // Winner calculation
  const getLeader = () => {
    if (pot.recommendations.length === 0) return null;
    let maxVotes = -1;
    let leader: RestaurantRecommendation | null = null;
    pot.recommendations.forEach((r) => {
      if (r.votes.length > maxVotes) {
        maxVotes = r.votes.length;
        leader = r;
      }
    });
    return maxVotes > 0 ? leader : null;
  };

  const leader = getLeader();
  const confirmedWinner = pot.recommendations.find((r) => r.id === pot.confirmedWinnerId);

  // Copy plan for sharing
  const handleSharePlan = () => {
    const text = `[밥팟] ${pot.title}\n📅 일시: ${pot.date} ${slotLabels[pot.slot].name}\n📍 위치: ${pot.locationName}\n👥 멤버: ${members.map((m) => m.name).join(', ')}\n${
      confirmedWinner
        ? `🏆 확정 식당: ${confirmedWinner.name} (${confirmedWinner.recommendedDish})`
        : '투표가 진행 중입니다!'
    }`;
    navigator.clipboard.writeText(text);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* Top bar with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>식사 팟 목록으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2">
          {copyNotice && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              클립보드에 복사되었습니다!
            </span>
          )}
          <button
            onClick={handleSharePlan}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>계획 공유하기</span>
          </button>
          {isHost && onDeletePot && (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors shadow-2xs"
              title="내가 만든 식사 팟 취소하기"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>식사 팟 취소</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Card for Pot Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <span>{slotLabels[pot.slot].icon}</span>
                <span>{slotLabels[pot.slot].name}</span>
              </span>
              <span className="text-xs font-semibold text-stone-400">
                호스트: {host.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {pot.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {pot.status === 'CONFIRMED' ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>장소 확정됨</span>
              </span>
            ) : pot.status === 'VOTING' ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                <span>투표 진행 중</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs border border-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>팟 결성 완료</span>
              </span>
            )}
          </div>
        </div>

        {/* Metadata badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-stone-400 font-semibold">약속 날짜</div>
              <div className="text-xs font-bold text-stone-800">{pot.date}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-stone-400 font-semibold">시간대</div>
              <div className="text-xs font-bold text-stone-800">
                {slotLabels[pot.slot].icon} {slotLabels[pot.slot].name} 식사
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 font-semibold">만날 위치</div>
              <div className="text-xs font-bold text-stone-800 truncate">
                {pot.locationName}
              </div>
            </div>
          </div>
        </div>

        {/* Members Roster Accordion */}
        <div className="pt-2 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-400" />
              <span className="text-xs font-bold text-stone-700">
                참여 멤버 ({members.length}명):
              </span>
              <div className="flex -space-x-1.5 overflow-hidden ml-1">
                {members.map((m) => (
                  <img
                    key={m.id}
                    src={m.avatar}
                    alt={m.name}
                    title={`${m.name} (${m.email})`}
                    className="w-6 h-6 rounded-full object-cover border-2 border-white"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowMemberDetails(!showMemberDetails)}
              className="text-xs text-orange-600 font-bold hover:text-orange-700"
            >
              {showMemberDetails ? '멤버 취향 접기 ▲' : '멤버 취향/알레르기 펼치기 ▼'}
            </button>
          </div>

          {showMemberDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 animate-in fade-in duration-150">
              {members.map((m) => {
                const isMe = m.id === currentUser.id;
                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                      isMe ? 'bg-orange-50/50 border-orange-200' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-stone-900">
                          {m.name} {isMe && '(나)'}
                        </span>
                      </div>
                      {isMe ? (
                        <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded">
                          나
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-medium">
                          멤버
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px]">
                      {m.allergies.length > 0 ? (
                        <div className="text-red-700 font-bold">
                          ⚠️ 알레르기: {m.allergies.join(', ')}
                        </div>
                      ) : (
                        <div className="text-stone-400">알레르기 없음</div>
                      )}

                      <div className="text-stone-600 truncate">
                        ❤️ 선호: {m.favoriteFoods.join(', ') || '없음'}
                      </div>

                      {m.dislikedFoods.length > 0 && (
                        <div className="text-stone-500 truncate">
                          🚫 비선호: {m.dislikedFoods.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmed Winner Announcement Card (if confirmed) */}
      {confirmedWinner && (
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <Crown className="w-7 h-7 text-amber-200 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
              최종 장소 확정
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">{confirmedWinner.name}</h2>
            <p className="text-sm text-orange-100 font-medium leading-relaxed">
              대표 메뉴: <strong>{confirmedWinner.recommendedDish}</strong> • {confirmedWinner.category}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-1.5">
            <div className="font-semibold text-amber-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>선정 사유 & 팟 맞춤 검증</span>
            </div>
            <p className="text-white leading-relaxed">{confirmedWinner.reason}</p>
            <div className="text-orange-200 text-[11px] pt-1 border-t border-white/10 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{confirmedWinner.address}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={confirmedWinner.mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>지도에서 위치 & 길찾기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleSharePlan}
              className="px-4 py-2.5 rounded-xl bg-orange-700/60 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>카톡/메신저로 공유하기</span>
            </button>
          </div>
        </div>
      )}

      {/* Action to Request Recommendations / Re-run */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 text-white p-6 sm:p-7 rounded-3xl shadow-md">
        <div className="space-y-1">
          <h3 className="text-base font-black flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <span>AI 맞춤 필터링 및 2~3곳 추천</span>
          </h3>
          <p className="text-xs text-stone-300">
            멤버 {members.length}명의 알레르기·비선호·3일식사(선호구제)를 종합 분석하여 {pot.locationName} 근처 평점 4.5+ 식당을 선별합니다.
          </p>
        </div>

        <button
          id="btn-run-recommendations"
          onClick={handleGenerateRecommendations}
          disabled={isLoadingRecs}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
            isLoadingRecs
              ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-98'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingRecs ? 'animate-spin' : ''}`} />
          <span>
            {isLoadingRecs
              ? loadingStep === 1
                ? '알레르기·비선호 식재료 검사 중...'
                : loadingStep === 2
                ? '3일 식사 이력 & 선호 구제 판정 중...'
                : '근처 평점 좋은 식당 2~3곳 탐색 중...'
              : pot.recommendations.length > 0
              ? '다른 식당 다시 추천받기'
              : '정보 취합 및 2~3곳 추천받기'}
          </span>
        </button>
      </div>

      {/* Filter Analysis Breakdown Box (투명한 필터링 과정 공개) */}
      {pot.filterAnalysis && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">식사 팟 데이터 정밀 취합 결과</h4>
              <p className="text-[11px] text-stone-500">{pot.filterAnalysis.summaryMessage}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* 1. Allergies */}
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/70 space-y-2">
              <div className="font-bold text-red-950 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>1. 알레르기 배제 (100% 차단)</span>
              </div>
              {pot.filterAnalysis.allergenExclusions.length === 0 ? (
                <p className="text-stone-500 text-[11px]">배제된 알레르기 항목 없음</p>
              ) : (
                pot.filterAnalysis.allergenExclusions.map((a, idx) => (
                  <div key={idx} className="text-[11px] text-red-900 space-y-0.5">
                    <div className="font-bold">
                      • {a.allergen} ({a.memberNames.join(', ')})
                    </div>
                    <div className="text-red-700 pl-3">
                      배제: {a.excludedDishes.slice(0, 3).join(', ')} 등
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. Dislikes */}
            <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 space-y-2">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-stone-500" />
                <span>2. 비선호 메뉴 제외</span>
              </div>
              {pot.filterAnalysis.dislikeExclusions.length === 0 ? (
                <p className="text-stone-500 text-[11px]">배제된 비선호 메뉴 없음</p>
              ) : (
                <div className="flex flex-wrap gap-1 pt-1">
                  {pot.filterAnalysis.dislikeExclusions.map((d, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white text-stone-700 border border-stone-200 text-[11px]"
                    >
                      {d.dish} ({d.memberNames.join(',')})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Recent Meals with Rescue Exception */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-2">
              <div className="font-bold text-blue-950 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>3. 최근 3일 식사 & 선호 구제</span>
              </div>
              {pot.filterAnalysis.recentMealsEvaluated.length === 0 ? (
                <p className="text-stone-500 text-[11px]">최근 3일 섭취 기록 없음</p>
              ) : (
                <div className="space-y-1.5 text-[11px]">
                  {pot.filterAnalysis.recentMealsEvaluated.map((r, idx) => (
                    <div key={idx} className="leading-snug">
                      {r.rescuedByFavorite ? (
                        <span className="text-emerald-800 font-bold">
                          ✨ {r.dish} ({r.memberName}): {r.favoriteUserNames.join(',')} 선호메뉴로 구제 통과!
                        </span>
                      ) : (
                        <span className="text-stone-600">
                          🚫 {r.dish} ({r.memberName}): 3일내 섭취로 제외
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Candidate Recommendations & Voting Section (2~3개 추천 식당) */}
      {pot.recommendations.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <span>{pot.locationName} 추천 맛집 후보 (2~3곳)</span>
                <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-md">
                  실시간 투표 가능
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                각 친구들이 원하는 식당에 투표할 수 있으며, 투표 결과에 따라 최종 장소를 확정할 수 있습니다.
              </p>
            </div>

            {/* Voting quick switch helper */}
            <div className="text-[11px] text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200/60 self-start sm:self-auto flex items-center gap-1.5">
              <span>현재 투표자:</span>
              <strong className="text-stone-900 font-bold">{currentUser.name}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pot.recommendations.map((rec, index) => {
              const hasVoted = rec.votes.includes(currentUser.id);
              const isLeader = leader && leader.id === rec.id;
              const isConfirmed = pot.confirmedWinnerId === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all relative ${
                    isConfirmed
                      ? 'ring-3 ring-orange-500 border-orange-300 shadow-lg'
                      : isLeader
                      ? 'border-orange-300 shadow-md ring-1 ring-orange-200'
                      : 'border-stone-200/80 shadow-xs hover:border-stone-300'
                  }`}
                >
                  {/* Card badges */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isConfirmed ? (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            최종 확정
                          </span>
                        ) : isLeader ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-600" />
                            현재 1위 ({rec.votes.length}표)
                          </span>
                        ) : null}

                        <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {rec.category}
                        </span>
                      </div>
                    </div>

                    {/* Restaurant Title & Rating */}
                    <div>
                      <h4 className="text-lg font-black text-stone-900 leading-snug">
                        {rec.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{rec.rating.toFixed(1)}</span>
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500 font-medium">
                          {rec.priceRange}
                        </span>
                      </div>
                    </div>

                    {/* Recommended Dish */}
                    <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/70">
                      <div className="text-[10px] font-bold text-orange-900 uppercase tracking-wider">
                        추천 대표 메뉴
                      </div>
                      <div className="text-sm font-black text-orange-950 mt-0.5">
                        {rec.recommendedDish}
                      </div>
                    </div>

                    {/* Review summary */}
                    <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      "{rec.reviewSummary}"
                    </p>

                    {/* Reason why it fits */}
                    <div className="text-xs text-stone-700 leading-relaxed space-y-1">
                      <div className="font-bold text-stone-900 text-[11px] flex items-center gap-1 text-emerald-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>맞춤 선별 사유:</span>
                      </div>
                      <p className="text-[11px] text-stone-600">{rec.reason}</p>
                    </div>

                    {/* Address & External Map Search */}
                    <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                      <span className="truncate pr-2">{rec.address}</span>
                      <a
                        href={rec.mapSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 flex-shrink-0"
                      >
                        <span>지도보기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Voting Area */}
                  <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
                    {/* Voters Avatars */}
                    <div className="flex items-center justify-between min-h-[28px]">
                      <span className="text-xs font-bold text-stone-700">
                        득표수: <strong className="text-orange-600">{rec.votes.length}</strong>표
                      </span>

                      <div className="flex -space-x-1.5 overflow-hidden">
                        {rec.votes.map((voterId) => {
                          const voter = allUsers.find((u) => u.id === voterId);
                          if (!voter) return null;
                          return (
                            <img
                              key={voter.id}
                              src={voter.avatar}
                              alt={voter.name}
                              title={`${voter.name} 투표함`}
                              className="w-6 h-6 rounded-full object-cover border-2 border-white"
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Vote Button */}
                    <button
                      onClick={() => handleVote(rec.id)}
                      disabled={pot.status === 'CONFIRMED'}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        hasVoted
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      } ${pot.status === 'CONFIRMED' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white' : ''}`} />
                      <span>{hasVoted ? '내가 투표함 (취소하려면 재클릭)' : '이곳에 투표하기'}</span>
                    </button>

                    {/* Confirm as final winner button */}
                    {pot.status !== 'CONFIRMED' && (
                      <button
                        onClick={() => handleConfirmWinner(rec.id)}
                        className="w-full py-1.5 px-3 rounded-lg text-[11px] font-bold text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 border border-stone-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>이곳으로 장소 확정하기</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cancel / Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">식사 팟 취소하기</h3>
                <p className="text-xs text-stone-500">개설한 식사 팟을 취소하고 삭제합니다.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="font-bold">'{pot.title}' 팟을 정말 취소하시겠습니까?</div>
              <div className="text-red-700 leading-relaxed">
                취소하면 참여 중인 모든 친구들의 팟 목록에서도 즉시 삭제되며, 진행 중인 투표와 추천 목록도 모두 사라집니다.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                돌아가기
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  if (onDeletePot) {
                    onDeletePot(pot.id);
                  }
                  onBack();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>네, 팟 취소합니다</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
