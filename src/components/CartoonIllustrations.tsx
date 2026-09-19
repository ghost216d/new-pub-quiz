import React from 'react';

// Frothy smiling beer stein with cartoon bubbles and winking animation
export const CartoonBeerStein: React.FC<{ className?: string; size?: number; isHappy?: boolean }> = ({
  className = '',
  size = 64,
  isHappy = true,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-md select-none transition-transform hover:scale-110 active:scale-95 ${className}`}
  >
    {/* Handle */}
    <path
      d="M70 35 C90 35, 94 65, 70 75"
      stroke="#451A03"
      strokeWidth="10"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M70 35 C90 35, 94 65, 70 75"
      stroke="#F59E0B"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />

    {/* Mug Body */}
    <rect
      x="22"
      y="28"
      width="50"
      height="56"
      rx="12"
      fill="#F59E0B"
      stroke="#451A03"
      strokeWidth="5"
    />

    {/* Beer Liquid highlight */}
    <rect x="27" y="34" width="40" height="46" rx="8" fill="#FBBF24" />
    <path d="M32 38 L32 74" stroke="#FEF08A" strokeWidth="4" strokeLinecap="round" />
    <path d="M42 38 L42 74" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

    {/* Froth / Foam on top with glossy cloud puffs */}
    <path
      d="M18 30 C18 18, 30 16, 36 22 C42 14, 56 14, 62 22 C70 16, 82 20, 80 30 C80 34, 76 38, 70 38 L24 38 C20 38, 18 34, 18 30 Z"
      fill="#FFFBEB"
      stroke="#451A03"
      strokeWidth="4.5"
    />
    {/* Foam drip */}
    <path d="M28 38 Q30 46 33 38" fill="#FFFBEB" stroke="#451A03" strokeWidth="3" />
    <path d="M52 38 Q55 48 58 38" fill="#FFFBEB" stroke="#451A03" strokeWidth="3" />

    {/* Cute Cartoon Eyes & Cheerful Wink */}
    <circle cx="39" cy="52" r="4" fill="#451A03" />
    <circle cx="55" cy="52" r="4" fill="#451A03" />
    <circle cx="40.5" cy="50.5" r="1.5" fill="#FFFFFF" />
    <circle cx="56.5" cy="50.5" r="1.5" fill="#FFFFFF" />

    {/* Cheerful rosy cartoon blush cheeks */}
    <circle cx="33" cy="56" r="3.5" fill="#FB7185" />
    <circle cx="61" cy="56" r="3.5" fill="#FB7185" />

    {/* Big happy cartoon smile with tongue */}
    <path
      d="M41 58 Q47 66 53 58"
      stroke="#451A03"
      strokeWidth="3"
      strokeLinecap="round"
      fill="#E11D48"
    />

    {/* Floating sparkling Beer Bubbles */}
    <circle cx="30" cy="12" r="4.5" fill="#FEF3C7" stroke="#451A03" strokeWidth="2" className="animate-bounce" />
    <circle cx="68" cy="10" r="5" fill="#FEF3C7" stroke="#451A03" strokeWidth="2" className="animate-pulse" />
    <circle cx="52" cy="6" r="3" fill="#FEF3C7" stroke="#451A03" strokeWidth="1.5" />
    {/* Star sparkle */}
    <text x="74" y="24" fontSize="12" fill="#FBBF24">✨</text>
  </svg>
);

// Cartoon Quiz Master with microphone and jaunty hat
export const CartoonQuizMaster: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-md select-none ${className}`}
  >
    {/* Top Hat */}
    <ellipse cx="50" cy="30" rx="30" ry="7" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
    <path
      d="M32 29 L36 8 C36 6, 64 6, 64 8 L68 29 Z"
      fill="#1E293B"
      stroke="#0F172A"
      strokeWidth="4"
    />
    <rect x="34" y="22" width="32" height="6" fill="#F59E0B" />

    {/* Face */}
    <circle cx="50" cy="52" r="22" fill="#FED7AA" stroke="#78350F" strokeWidth="4" />

    {/* Big Round Glasses */}
    <circle cx="41" cy="50" r="9" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
    <circle cx="59" cy="50" r="9" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
    <path d="M49 50 L51 50" stroke="#0284C7" strokeWidth="3" />
    {/* Eyes */}
    <circle cx="42" cy="50" r="3" fill="#0F172A" />
    <circle cx="58" cy="50" r="3" fill="#0F172A" />
    <circle cx="43" cy="48.5" r="1" fill="#FFF" />
    <circle cx="59" cy="48.5" r="1" fill="#FFF" />

    {/* Moustache */}
    <path
      d="M38 60 C44 58, 48 64, 50 61 C52 64, 56 58, 62 60 C58 66, 42 66, 38 60 Z"
      fill="#78350F"
    />

    {/* Bowtie */}
    <polygon points="40,74 50,78 40,82" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
    <polygon points="60,74 50,78 60,82" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
    <circle cx="50" cy="78" r="3" fill="#FDE047" stroke="#78350F" strokeWidth="1.5" />

    {/* Microphone on right */}
    <rect x="74" y="52" width="7" height="15" rx="3.5" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
    <rect x="72" y="66" width="11" height="4" rx="2" fill="#0F172A" />
    <line x1="77.5" y1="70" x2="77.5" y2="85" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Colorful cartoon tavern party flags / bunting
export const CartoonBunting: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full flex items-start justify-between overflow-hidden select-none pointer-events-none ${className}`}>
    <svg className="w-full h-8 sm:h-10" viewBox="0 0 600 40" preserveAspectRatio="none" fill="none">
      {/* String */}
      <path d="M0 6 Q150 20 300 10 T600 8" stroke="#78350F" strokeWidth="2.5" strokeDasharray="6 2" />
      {/* Flags */}
      <polygon points="20,8 45,8 32,32" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
      <polygon points="65,11 90,11 77,35" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2" />
      <polygon points="110,13 135,13 122,37" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
      <polygon points="155,14 180,14 167,38" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
      <polygon points="200,14 225,14 212,38" fill="#EC4899" stroke="#831843" strokeWidth="2" />
      <polygon points="245,13 270,13 257,37" fill="#8B5CF6" stroke="#4C1D95" strokeWidth="2" />
      <polygon points="290,11 315,11 302,35" fill="#F97316" stroke="#7C2D12" strokeWidth="2" />
      <polygon points="335,10 360,10 347,34" fill="#06B6D4" stroke="#164E63" strokeWidth="2" />
      <polygon points="380,9 405,9 392,33" fill="#EAB308" stroke="#713F12" strokeWidth="2" />
      <polygon points="425,9 450,9 437,33" fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
      <polygon points="470,8 495,8 482,32" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
      <polygon points="515,8 540,8 527,32" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2" />
      <polygon points="560,8 585,8 572,32" fill="#EC4899" stroke="#831843" strokeWidth="2" />
    </svg>
  </div>
);

// Cartoon swinging tavern neon pub sign with glowing fairy bulbs
export const CartoonPubSign: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
    {/* Fairy lights string on top */}
    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-0.5">
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] animate-pulse" />
      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping duration-1000" />
      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse delay-150" />
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse delay-300" />
      <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-pulse delay-500" />
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
    </div>

    {/* Hanging Chains */}
    <div className="flex justify-between w-48 px-6 mb-1">
      <div className="w-2 h-7 bg-slate-700 rounded-full border-2 border-slate-950 flex flex-col justify-between py-0.5">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-slate-400" />
      </div>
      <div className="w-2 h-7 bg-slate-700 rounded-full border-2 border-slate-950 flex flex-col justify-between py-0.5">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-slate-400" />
      </div>
    </div>

    {/* Wooden Sign Board with rich woodgrain styling & cartoon borders */}
    <div className="relative px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-950 border-4 border-[#2c1305] shadow-[0_8px_0_#1c0b02] text-center transform hover:rotate-1 transition-transform duration-300">
      {/* Brass Corner Screws */}
      <div className="absolute top-1.5 left-2.5 w-2.5 h-2.5 rounded-full bg-amber-300 border-2 border-amber-950 shadow" />
      <div className="absolute top-1.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-300 border-2 border-amber-950 shadow" />
      <div className="absolute bottom-1.5 left-2.5 w-2.5 h-2.5 rounded-full bg-amber-300 border-2 border-amber-950 shadow" />
      <div className="absolute bottom-1.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-300 border-2 border-amber-950 shadow" />

      {/* Outer Glow Outline */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl animate-bounce">🍺</span>
        <span className="font-cartoon text-2xl sm:text-4xl text-yellow-300 tracking-wider drop-shadow-[0_4px_0_#451a03]">
          THE PUB QUIZ
        </span>
        <span className="text-2xl sm:text-3xl animate-bounce delay-150">🍻</span>
      </div>

      <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] sm:text-xs font-black uppercase text-amber-200 tracking-widest">
        <span>✨</span>
        <span>TRIVIA TAVERN EXTRAVAGANZA</span>
        <span>✨</span>
      </div>
    </div>
  </div>
);

// Smiling Cartoon Golden Trophy with Crown
export const CartoonTrophy: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-lg select-none ${className}`}
  >
    {/* Crown on Trophy */}
    <path
      d="M36 18 L43 26 L50 14 L57 26 L64 18 L62 30 L38 30 Z"
      fill="#F59E0B"
      stroke="#78350F"
      strokeWidth="3"
    />
    <circle cx="50" cy="14" r="2.5" fill="#EF4444" />
    <circle cx="36" cy="18" r="2" fill="#3B82F6" />
    <circle cx="64" cy="18" r="2" fill="#10B981" />

    {/* Trophy Cup Body */}
    <path
      d="M30 30 C30 55, 42 64, 50 64 C58 64, 70 55, 70 30 Z"
      fill="#FBBF24"
      stroke="#78350F"
      strokeWidth="4"
    />
    {/* Cup Gold Highlight */}
    <path
      d="M36 34 C36 50, 44 58, 50 58 C56 58, 64 50, 64 34 Z"
      fill="#FDE047"
    />
    {/* Handles */}
    <path
      d="M30 36 C18 36, 16 52, 32 54"
      stroke="#78350F"
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M70 36 C82 36, 84 52, 68 54"
      stroke="#78350F"
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Cute smiling face on trophy */}
    <circle cx="45" cy="44" r="2.5" fill="#78350F" />
    <circle cx="55" cy="44" r="2.5" fill="#78350F" />
    <circle cx="45.8" cy="43.2" r="0.8" fill="#FFFFFF" />
    <circle cx="55.8" cy="43.2" r="0.8" fill="#FFFFFF" />
    <circle cx="41" cy="47" r="2" fill="#FB7185" />
    <circle cx="59" cy="47" r="2" fill="#FB7185" />
    <path d="M46 48 Q50 53 54 48" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />

    {/* Stem and Base */}
    <path d="M46 64 L46 76 L54 76 L54 64 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="3" />
    <rect x="32" y="76" width="36" height="14" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="3" />
    <rect x="36" y="80" width="28" height="6" rx="2" fill="#FBBF24" />
    {/* Star sparkle */}
    <text x="68" y="24" fontSize="14" fill="#FDE047" className="animate-spin origin-center">✨</text>
  </svg>
);

// Comic Speech Bubble with Tail
export const CartoonSpeechBubble: React.FC<{
  text: string;
  sender?: string;
  className?: string;
}> = ({ text, sender, className = '' }) => (
  <div className={`relative inline-block ${className}`}>
    <div className="bg-yellow-300 text-slate-950 font-bold px-3.5 py-2 rounded-2xl border-3 border-slate-950 shadow-[0_4px_0_#0f172a] text-xs">
      {sender && <span className="block text-[10px] font-black uppercase text-amber-900 leading-tight">{sender}:</span>}
      <span className="leading-tight">{text}</span>
    </div>
    {/* Tail */}
    <div className="absolute left-6 -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-950" />
    <div className="absolute left-[25px] -bottom-1.5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-yellow-300" />
  </div>
);

// Comic Action Pop Burst Sticker
export const CartoonPopBurst: React.FC<{
  text: string;
  color?: 'yellow' | 'pink' | 'cyan' | 'green';
  className?: string;
}> = ({ text, color = 'yellow', className = '' }) => {
  const bg =
    color === 'pink'
      ? 'bg-rose-500 text-white border-rose-950 shadow-[0_4px_0_#4c0519]'
      : color === 'cyan'
      ? 'bg-cyan-400 text-slate-950 border-cyan-950 shadow-[0_4px_0_#083344]'
      : color === 'green'
      ? 'bg-emerald-400 text-slate-950 border-emerald-950 shadow-[0_4px_0_#064e3b]'
      : 'bg-yellow-400 text-slate-950 border-amber-950 shadow-[0_4px_0_#451a03]';

  return (
    <span
      className={`inline-block font-cartoon uppercase text-[11px] sm:text-xs px-2.5 py-1 rounded-xl border-3 transform -rotate-3 hover:rotate-3 transition-transform ${bg} ${className}`}
    >
      {text}
    </span>
  );
};

// Cartoon turntable / record player for music rounds
export const CartoonRecordPlayer: React.FC<{ className?: string; isPlaying?: boolean; size?: number }> = ({
  className = '',
  isPlaying = false,
  size = 54,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-md select-none ${className}`}
  >
    {/* Body */}
    <rect
      x="10"
      y="18"
      width="80"
      height="68"
      rx="14"
      fill="#F43F5E"
      stroke="#881337"
      strokeWidth="5"
    />
    <rect x="15" y="23" width="70" height="58" rx="10" fill="#FB7185" />

    {/* Vinyl Record */}
    <g className={isPlaying ? 'animate-spin origin-[42px_52px]' : ''}>
      <circle cx="42" cy="52" r="26" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      <circle cx="42" cy="52" r="20" stroke="#1E293B" strokeWidth="2" fill="none" />
      <circle cx="42" cy="52" r="14" stroke="#334155" strokeWidth="1" fill="none" />
      <circle cx="42" cy="52" r="9" fill="#F59E0B" />
      <circle cx="42" cy="52" r="3" fill="#FFFFFF" />
    </g>

    {/* Turntable Arm */}
    <circle cx="76" cy="32" r="6" fill="#475569" stroke="#0F172A" strokeWidth="2" />
    <path
      d="M76 36 L70 54 L62 58"
      stroke="#CBD5E1"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="58" y="56" width="6" height="5" rx="1.5" fill="#EF4444" />

    {/* Musical Notes floating */}
    {isPlaying && (
      <>
        <text x="75" y="24" fontSize="16" fill="#FDE047" className="animate-bounce">
          ♪
        </text>
        <text x="82" y="44" fontSize="14" fill="#FDE047" className="animate-pulse">
          ♫
        </text>
      </>
    )}
  </svg>
);

// Traditional English Swinging Pub Sign with iron bracket and chains
export const CartoonSwingingPubSign: React.FC<{
  pubName?: string;
  subTitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({
  pubName = "THE RED LION",
  subTitle = "PROPER ENGLISH PUB QUIZ",
  className = '',
  size = 'md',
}) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Wrought Iron English Bracket */}
      <div className="relative w-48 sm:w-64 h-7 flex items-center justify-center">
        {/* Horizontal iron bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full border border-amber-600/40 shadow-sm" />
        {/* Iron scrolls */}
        <div className="absolute top-0 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-900 rounded-tl-full" />
        <div className="absolute top-0 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-900 rounded-tr-full" />
        {/* Hanging hooks */}
        <div className="absolute bottom-0 left-12 w-2 h-3 bg-amber-700 rounded-b" />
        <div className="absolute bottom-0 right-12 w-2 h-3 bg-amber-700 rounded-b" />
      </div>

      {/* Swinging Chains & Signboard */}
      <div className="animate-swing flex flex-col items-center">
        {/* Chains */}
        <div className="flex justify-between w-32 sm:w-44 px-2 h-4">
          <div className="w-1.5 h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-full border border-amber-950" />
          <div className="w-1.5 h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-full border border-amber-950" />
        </div>

        {/* English Tavern Wood Signboard */}
        <div className="relative px-5 py-3 rounded-2xl bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 border-4 border-amber-500 shadow-[0_8px_0_#451a03] text-center max-w-xs sm:max-w-sm">
          {/* Gold filigree corner accents */}
          <div className="absolute top-1 left-1.5 text-yellow-400 text-xs">✦</div>
          <div className="absolute top-1 right-1.5 text-yellow-400 text-xs">✦</div>
          <div className="absolute bottom-1 left-1.5 text-yellow-400 text-xs">✦</div>
          <div className="absolute bottom-1 right-1.5 text-yellow-400 text-xs">✦</div>

          <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-cartoon mb-0.5">
            <span>👑</span>
            <span className="tracking-widest text-[10px] uppercase text-yellow-300/90 font-black">EST. 1892 • FREE HOUSE</span>
            <span>👑</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-cartoon text-amber-100 tracking-wider leading-none drop-shadow-[0_2px_0_#000]">
            {pubName}
          </h2>

          <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-comic font-black text-amber-300">
            <span>🍺</span>
            <span>{subTitle}</span>
            <span>🎯</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Traditional English Pub Dartboard with Darts
export const CartoonDartboard: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none drop-shadow-md animate-float ${className}`}
  >
    {/* Outer Wire Board */}
    <circle cx="50" cy="50" r="46" fill="#0F172A" stroke="#451A03" strokeWidth="4" />
    <circle cx="50" cy="50" r="41" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />

    {/* Double Ring (Green & Red sectors simplified for cartoon style) */}
    <circle cx="50" cy="50" r="36" fill="#059669" stroke="#064E3B" strokeWidth="2" />
    <circle cx="50" cy="50" r="32" fill="#F8FAFC" />
    <circle cx="50" cy="50" r="23" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
    <circle cx="50" cy="50" r="19" fill="#F8FAFC" />

    {/* Wire radial lines */}
    <line x1="50" y1="14" x2="50" y2="86" stroke="#94A3B8" strokeWidth="1.5" />
    <line x1="14" y1="50" x2="86" y2="50" stroke="#94A3B8" strokeWidth="1.5" />
    <line x1="24" y1="24" x2="76" y2="76" stroke="#94A3B8" strokeWidth="1.5" />
    <line x1="76" y1="24" x2="24" y2="76" stroke="#94A3B8" strokeWidth="1.5" />

    {/* Outer Bull (Green) & Bullseye (Red) */}
    <circle cx="50" cy="50" r="10" fill="#059669" stroke="#064E3B" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="5" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />

    {/* Dart sticking into Bullseye! */}
    <g transform="rotate(-30 50 50)">
      <line x1="50" y1="50" x2="80" y2="20" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <polygon points="76,24 84,16 88,20 80,28" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
      {/* Flight */}
      <polygon points="84,16 94,6 88,20" fill="#EF4444" />
      <polygon points="84,16 76,24 88,20" fill="#EF4444" />
    </g>
  </svg>
);


