import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  CheckCircle,
  ThumbsUp,
  Sparkles,
  Utensils,
  Filter,
  Trash2,
} from 'lucide-react';
import { MealPot, User, MealSlot } from '../types';

interface PotListTabProps {
  pots: MealPot[];
  allUsers: User[];
  currentUser: User;
  onSelectPot: (pot: MealPot) => void;
  onCreatePotClick: () => void;
  onDeletePot?: (potId: string) => void;
}

export const PotListTab: React.FC<PotListTabProps> = ({
  pots,
  allUsers,
  currentUser,
  onSelectPot,
  onCreatePotClick,
  onDeletePot,
}) => {
  const [slotFilter, setSlotFilter] = useState<'ALL' | MealSlot>('ALL');
  const [potToDelete, setPotToDelete] = useState<MealPot | null>(null);

  const filteredPots = pots.filter((p) => {
    if (slotFilter === 'ALL') return true;
    return p.slot === slotFilter;
  });

  const slotLabels: Record<MealSlot, { name: string; icon: string }> = {
    BREAKFAST: { name: '아침', icon: '🌅' },
    LUNCH: { name: '점심', icon: '☀️' },
    DINNER: { name: '저녁', icon: '🌙' },
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-orange-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>스마트 식사 약속 해결사</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
            친구들과 뭐 먹을지 고민 끝!<br />
            알레르기·비선호 빼고 진짜 맛집만 추천받으세요.
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
            모든 친구의 알레르기 식재료 100% 차단, 최근 3일 식사 이력(선호 메뉴 구제 룰 적용)을 스마트하게 분석하여 주변 최고 평점 식당 2~3곳을 추천하고 투표로 결정합니다.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="btn-hero-new-pot"
              onClick={onCreatePotClick}
              className="px-5 py-2.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>새 식사 팟 만들기</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <span>식사 팟 일정</span>
            <span className="text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
              총 {pots.length}개
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            아침, 점심, 저녁 시간대별로 중복 없는 식사 약속을 관리합니다.
          </p>
        </div>

        {/* Slot Filter Chips */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200/80 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setSlotFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              slotFilter === 'ALL'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            전체
          </button>
          {(['BREAKFAST', 'LUNCH', 'DINNER'] as MealSlot[]).map((s) => (
            <button
              key={s}
              onClick={() => setSlotFilter(s)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                slotFilter === s
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>{slotLabels[s].icon}</span>
              <span>{slotLabels[s].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pots Grid */}
      {filteredPots.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 space-y-4">
          <Utensils className="w-12 h-12 mx-auto text-stone-300" />
          <div>
            <p className="text-base font-bold text-stone-700">생성된 식사 팟이 없습니다.</p>
            <p className="text-xs text-stone-400 mt-1">
              새로운 식사 팟을 만들어 친구들과 투표를 시작해보세요!
            </p>
          </div>
          <button
            onClick={onCreatePotClick}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>첫 팟 만들기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPots.map((pot) => {
            const members = pot.memberIds
              .map((id) => allUsers.find((u) => u.id === id))
              .filter((u): u is User => Boolean(u));

            const confirmedWinner = pot.recommendations.find(
              (r) => r.id === pot.confirmedWinnerId
            );

            return (
              <div
                key={pot.id}
                onClick={() => onSelectPot(pot)}
                className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Date, Slot & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>{pot.date}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 flex items-center gap-1 border border-orange-200/60">
                        <span>{slotLabels[pot.slot].icon}</span>
                        <span>{slotLabels[pot.slot].name}</span>
                      </span>
                    </div>

                      <div className="flex items-center gap-1.5">
                        {pot.status === 'CONFIRMED' ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>장소 확정</span>
                          </span>
                        ) : pot.status === 'VOTING' ? (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-blue-600" />
                            <span>투표 중</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                            결성 완료
                          </span>
                        )}

                        {onDeletePot && (pot.hostId === currentUser.id || pot.memberIds?.[0] === currentUser.id || pot.memberIds?.includes(currentUser.id)) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPotToDelete(pot);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="식사 팟 취소하기"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-lg font-black text-stone-900 group-hover:text-orange-600 transition-colors">
                      {pot.title}
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{pot.locationName}</span>
                    </p>
                  </div>

                  {/* Result preview if recommendations or winner exist */}
                  {confirmedWinner ? (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        확정된 식사 장소
                      </span>
                      <strong className="text-emerald-950 font-black text-sm block mt-0.5">
                        {confirmedWinner.name}
                      </strong>
                      <span className="text-emerald-700 text-[11px]">
                        추천 메뉴: {confirmedWinner.recommendedDish}
                      </span>
                    </div>
                  ) : pot.recommendations.length > 0 ? (
                    <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/70 text-xs">
                      <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                        추천 맛집 후보 {pot.recommendations.length}곳 선정됨
                      </span>
                      <div className="text-stone-700 text-[11px] mt-0.5 truncate">
                        {pot.recommendations.map((r) => r.name).join(' • ')}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Bottom Members & Arrow */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {members.map((m) => (
                        <img
                          key={m.id}
                          src={m.avatar}
                          alt={m.name}
                          title={m.name}
                          className="w-6 h-6 rounded-full object-cover border-2 border-white"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      {members.map((m) => m.name).slice(0, 3).join(', ')}
                      {members.length > 3 && ` 외 ${members.length - 3}명`}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-orange-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>자세히 보기</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete / Cancel Confirmation Modal */}
      {potToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setPotToDelete(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">식사 팟 취소하기</h3>
                <p className="text-xs text-stone-500">개설된 식사 팟을 취소하고 완전히 삭제합니다.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="font-bold">'{potToDelete.title}' 팟을 정말 취소하시겠습니까?</div>
              <div className="text-red-700 leading-relaxed">
                취소하면 나와 참여 중인 친구들의 팟 목록에서 즉시 삭제되며, 추천 결과와 투표도 함께 삭제됩니다.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPotToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                돌아가기
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = potToDelete.id;
                  setPotToDelete(null);
                  if (onDeletePot) {
                    onDeletePot(id);
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
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
