import React, { useState } from 'react';
import {
  X,
  Coins,
  Heart,
  Sparkles,
  ShoppingBag,
  Gift,
  Check,
  CreditCard,
  Zap,
  Crown,
  Smile,
} from 'lucide-react';
import { ShopBundle, SoloProgression } from '../types';
import { SHOP_BUNDLES } from '../data/cartoonMapsData';
import { audioSynth } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progression: SoloProgression;
  onUpdateProgression: (updated: SoloProgression) => void;
  initialTab?: 'lives' | 'bundles' | 'free';
}

export const TavernShopModal: React.FC<Props> = ({
  isOpen,
  onClose,
  progression,
  onUpdateProgression,
  initialTab = 'bundles',
}) => {
  const [activeTab, setActiveTab] = useState<'bundles' | 'lives' | 'free'>(initialTab);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  if (!isOpen) return null;

  const handleBuyBundle = (bundle: ShopBundle) => {
    setPurchasingId(bundle.id);

    // If costs coins (e.g. buying lives with coins)
    if (bundle.coinsCost) {
      if (progression.coins < bundle.coinsCost) {
        audioSynth.playWrongFx();
        setSuccessNotice('Not enough Pub Bucks! Grab a fake money bundle below first 🪙');
        setPurchasingId(null);
        return;
      }

      const updatedCoins = progression.coins - bundle.coinsCost;
      const updatedLives = Math.min(progression.maxLives, progression.lives + bundle.rewardLives);

      const updated: SoloProgression = {
        ...progression,
        coins: updatedCoins,
        lives: updatedLives,
      };

      setTimeout(() => {
        onUpdateProgression(updated);
        audioSynth.playPurchaseFx();
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        setSuccessNotice(`Restored +${bundle.rewardLives} Heart(s)! Full vitality! ❤️`);
        setPurchasingId(null);
      }, 250);
      return;
    }

    // Purchasing fake money packs / bundles (free simulated transaction)
    setTimeout(() => {
      const updatedCoins = progression.coins + bundle.rewardCoins;
      const updatedLives = bundle.rewardLives
        ? Math.min(progression.maxLives, progression.lives + bundle.rewardLives)
        : progression.lives;
      const updatedPurchased = progression.purchasedBundles.includes(bundle.id)
        ? progression.purchasedBundles
        : [...progression.purchasedBundles, bundle.id];

      const updated: SoloProgression = {
        ...progression,
        coins: updatedCoins,
        lives: updatedLives,
        purchasedBundles: updatedPurchased,
        lastDailyBonus: bundle.id === 'free_daily_keg' ? Date.now() : progression.lastDailyBonus,
      };

      onUpdateProgression(updated);
      audioSynth.playPurchaseFx();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      setSuccessNotice(`Cha-ching! Credited +${bundle.rewardCoins.toLocaleString()} Pub Bucks & Perks! 🪙`);
      setPurchasingId(null);
    }, 300);
  };

  // Free Lucky Spin / Bar Tap
  const handleLuckyBarTap = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    audioSynth.playCoinFx();

    const randomWin = Math.floor(Math.random() * 80) + 70; // 70 to 150 coins

    setTimeout(() => {
      setIsSpinning(false);
      const updated: SoloProgression = {
        ...progression,
        coins: progression.coins + randomWin,
      };
      onUpdateProgression(updated);
      audioSynth.playPurchaseFx();
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      setSuccessNotice(`Tavern Lucky Tap! You won +${randomWin} Pub Bucks! 🍺`);
    }, 600);
  };

  return (
    <div
      id="tavern-shop-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-amber-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="tavern-shop-modal-container"
        className="w-full max-w-lg bg-[#fffdf8] rounded-3xl border-4 border-amber-800 shadow-[0_12px_0_#451a03] overflow-hidden text-stone-900 flex flex-col max-h-[90vh] font-comic"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Cartoon Signboard */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-4 border-b-4 border-amber-950 text-slate-950 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center text-2xl shadow-md border-2 border-amber-800 animate-boing">
              🏪
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-cartoon tracking-wide leading-none text-slate-950 drop-shadow-sm">
                TAVERN GENERAL STORE
              </h2>
              <p className="text-[11px] font-black text-amber-950 opacity-90">
                Fake Money Mint & Heart Emporium 🪙
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-amber-950/20 hover:bg-amber-950 text-slate-950 hover:text-white flex items-center justify-center font-black transition cursor-pointer border-2 border-amber-950/40"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Currency & Vitality Status Bar */}
        <div className="bg-amber-100/90 px-4 py-2.5 border-b-2 border-amber-800/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Pub Bucks */}
            <div className="flex items-center gap-1.5 bg-amber-200/90 border-2 border-amber-800/60 px-3 py-1 rounded-2xl shadow-sm">
              <Coins className="w-4 h-4 text-amber-700 fill-amber-500" />
              <span className="font-cartoon text-amber-950 text-sm font-black">
                {progression.coins.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-900 font-cartoon uppercase font-bold">BUCKS</span>
            </div>

            {/* Lives / Hearts */}
            <div className="flex items-center gap-1.5 bg-rose-100 border-2 border-rose-400 px-3 py-1 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1">
                {Array.from({ length: progression.maxLives }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < progression.lives
                        ? 'text-rose-600 fill-rose-500 animate-pulse'
                        : 'text-stone-300 fill-stone-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-cartoon text-rose-900 text-xs font-bold">
                {progression.lives}/{progression.maxLives}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-cartoon text-emerald-800 font-black hidden sm:inline">
            100% FREE PLAY MONEY!
          </span>
        </div>

        {/* Success / Alert Banner */}
        {successNotice && (
          <div className="bg-emerald-100 border-b-2 border-emerald-400 px-4 py-2 flex items-center justify-between text-xs text-emerald-950 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-800 hover:text-emerald-950 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex p-2.5 bg-amber-50 gap-2 border-b border-amber-800/30">
          <button
            onClick={() => setActiveTab('bundles')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-cartoon tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bundles'
                ? 'cartoon-btn-amber text-slate-950 shadow-md'
                : 'bg-[#fffdf8] text-stone-700 hover:text-stone-950 border-2 border-amber-800/40'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>BUCKS PACKS</span>
          </button>

          <button
            onClick={() => setActiveTab('lives')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-cartoon tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'lives'
                ? 'cartoon-btn-pink text-white shadow-md'
                : 'bg-[#fffdf8] text-stone-700 hover:text-stone-950 border-2 border-amber-800/40'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>BUY HEARTS</span>
          </button>

          <button
            onClick={() => setActiveTab('free')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-cartoon tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'free'
                ? 'cartoon-btn-emerald text-white shadow-md'
                : 'bg-[#fffdf8] text-stone-700 hover:text-stone-950 border-2 border-amber-800/40'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>FREE SPINS</span>
          </button>
        </div>

        {/* Scrollable Shop Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-amber-50/40">
          {/* TAB 1: FAKE MONEY BUNDLES */}
          {activeTab === 'bundles' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-amber-100 border border-amber-800/40 rounded-2xl text-[11px] text-amber-950 flex items-center gap-2 font-bold">
                <Smile className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Tap any bundle to purchase instantly with simulated <strong>Play Money</strong>! No real credit cards required.
                </span>
              </div>

              {SHOP_BUNDLES.filter((b) => b.type === 'coins_pack' || b.type === 'mega_bundle').map((bundle) => {
                const isBuying = purchasingId === bundle.id;

                return (
                  <div
                    key={bundle.id}
                    className="p-3.5 bg-[#fffdf8] border-2 border-amber-800/30 hover:border-amber-800 rounded-2xl transition flex items-center justify-between gap-3 relative overflow-hidden group shadow-sm"
                  >
                    {bundle.badge && (
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-800/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {bundle.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-black text-amber-950 flex items-center gap-1.5 truncate">
                          <span>{bundle.title}</span>
                        </div>
                        <div className="text-xs font-black text-amber-700 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-600" />
                          <span>+{bundle.rewardCoins.toLocaleString()} Pub Bucks</span>
                          {bundle.rewardLives > 0 && (
                            <span className="text-rose-600 ml-1">
                              (+{bundle.rewardLives} ❤️)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-600 font-bold truncate">
                          {bundle.subtitle}
                        </div>
                      </div>
                    </div>

                    <button
                      id={`buy-bundle-${bundle.id}`}
                      disabled={isBuying}
                      onClick={() => handleBuyBundle(bundle)}
                      className={`shrink-0 px-3.5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer border shadow-sm flex items-center gap-1.5 min-h-[42px] ${
                        bundle.badge === 'DAILY GIFT'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-700 shadow-[0_3px_0_#065f46]'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 border-amber-900 shadow-[0_3px_0_#92400e]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isBuying ? 'Crediting...' : bundle.fakePriceLabel}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: BUY LIVES */}
          {activeTab === 'lives' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-[11px] text-rose-950 flex items-center gap-2 font-bold">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-500 shrink-0" />
                <span>
                  Use your earned <strong>Pub Bucks</strong> to refill your 3 Hearts! Answering wrong or running out of time costs 1 Life.
                </span>
              </div>

              {/* Current Hearts Status Card */}
              <div className="p-4 bg-[#fffdf8] rounded-2xl border-2 border-rose-300 text-center space-y-2 shadow-sm">
                <div className="text-xs font-bold text-stone-600">Current Vitality Level</div>
                <div className="flex justify-center items-center gap-3">
                  {Array.from({ length: progression.maxLives }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-transform ${
                        i < progression.lives
                          ? 'bg-rose-100 border-rose-400 text-rose-500 scale-105 shadow-sm'
                          : 'bg-stone-100 border-stone-300 text-stone-400 opacity-60'
                      }`}
                    >
                      ❤️
                    </div>
                  ))}
                </div>
                <div className="text-xs font-black text-rose-800">
                  {progression.lives === progression.maxLives
                    ? 'Hearts at Maximum (3/3) — Ready to play!'
                    : `You have ${progression.lives} Heart(s) remaining`}
                </div>
              </div>

              {SHOP_BUNDLES.filter((b) => b.type === 'lives_refill').map((bundle) => {
                const canAfford = progression.coins >= (bundle.coinsCost || 0);
                const isFull = progression.lives >= progression.maxLives;
                const isBuying = purchasingId === bundle.id;

                return (
                  <div
                    key={bundle.id}
                    className="p-3.5 bg-[#fffdf8] border-2 border-rose-200 hover:border-rose-400 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-400 flex items-center justify-center text-xl shrink-0">
                        {bundle.icon}
                      </div>
                      <div>
                        <div className="text-sm font-black text-stone-900">{bundle.title}</div>
                        <div className="text-xs font-black text-rose-700">
                          Restores +{bundle.rewardLives} Heart(s)
                        </div>
                        <div className="text-[10px] text-stone-500 font-bold">{bundle.subtitle}</div>
                      </div>
                    </div>

                    <button
                      id={`buy-lives-${bundle.id}`}
                      disabled={isFull || !canAfford || isBuying}
                      onClick={() => handleBuyBundle(bundle)}
                      className={`px-3.5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer border shadow-sm flex items-center gap-1.5 min-h-[40px] ${
                        isFull
                          ? 'bg-stone-200 text-stone-500 border-stone-300 cursor-not-allowed'
                          : canAfford
                          ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white border-rose-800 shadow-[0_3px_0_#9f1239]'
                          : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{isFull ? 'Full Hearts' : isBuying ? 'Restoring...' : `${bundle.coinsCost} Bucks`}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: FREE REWARDS & LUCKY BAR TAP */}
          {activeTab === 'free' && (
            <div className="space-y-3">
              {/* Daily Gift */}
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-200 text-emerald-800 flex items-center justify-center text-xl border border-emerald-400">
                      🎁
                    </div>
                    <div>
                      <div className="text-sm font-black text-stone-900">Daily Tavern Rations</div>
                      <div className="text-xs font-bold text-emerald-800">
                        +250 Pub Bucks & Full 3 Hearts
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const daily = SHOP_BUNDLES.find((b) => b.id === 'free_daily_keg');
                      if (daily) handleBuyBundle(daily);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md border border-emerald-800 transition cursor-pointer"
                  >
                    Claim Free Gift
                  </button>
                </div>
              </div>

              {/* Interactive Lucky Bar Tap mini-game */}
              <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-800/40 text-center space-y-3 shadow-sm">
                <div className="space-y-1">
                  <div className="text-sm font-black text-amber-950">Tavern Lucky Keg Tap</div>
                  <p className="text-xs text-stone-600 font-bold">
                    Pull the cartoon tap handle to pour free coins into your pocket!
                  </p>
                </div>

                <div className="py-2">
                  <button
                    id="lucky-tap-btn"
                    disabled={isSpinning}
                    onClick={handleLuckyBarTap}
                    className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-500 border-4 border-amber-950 shadow-[0_8px_0_#78350f] hover:brightness-110 active:translate-y-2 active:shadow-none transition flex flex-col items-center justify-center text-slate-950 cursor-pointer ${
                      isSpinning ? 'animate-bounce' : ''
                    }`}
                  >
                    <span className="text-3xl">🚰</span>
                    <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                      {isSpinning ? 'Pouring...' : 'Tap to Pour!'}
                    </span>
                  </button>
                </div>

                <p className="text-[10px] text-amber-800 font-bold">
                  Win between 70 – 150 Pub Bucks every time you tap!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-100/90 p-3 border-t-2 border-amber-800/30 flex items-center justify-between">
          <span className="text-[11px] text-stone-600 font-bold">
            Enjoying the Quiz? All currency is 100% simulated cartoon fun.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs transition cursor-pointer border border-amber-800/40"
          >
            Close Store
          </button>
        </div>
      </div>
    </div>
  );
};
