import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Download, RotateCcw, Sparkles, AlertCircle, Heart } from 'lucide-react';
import { QUESTIONS, PLEDGES } from './constants';
import { Step } from './types';

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [name, setName] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedPledges, setSelectedPledges] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Character image from the user's request
  const CHAR_URL = `/char.png`;
  const LOGO_URL = `/input_file_1.png?t=${Date.now()}`;

  const [charImgError, setCharImgError] = useState(false);

  const CharacterImage = ({ className, size = "large" }: { className?: string, size?: "small" | "medium" | "large" }) => {
    const dimensions = size === "large" ? "w-56 h-56" : size === "medium" ? "w-40 h-40" : "w-28 h-28";
    return (
      <div className={`${dimensions} mx-auto flex items-center justify-center ${className || ""}`}>
        {!charImgError ? (
          <img 
            src={CHAR_URL} 
            alt="" 
            className="max-w-full max-h-full object-contain drop-shadow-md"
            onError={() => setCharImgError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pink-50 rounded-full border-2 border-pink-100">
            <Sparkles className="w-1/2 h-1/2 text-pink-300 animate-pulse" />
          </div>
        )}
      </div>
    );
  };
  const handleStart = () => {
    if (!name.trim()) {
      alert("이름을 입력해 주세요! 🐣");
      return;
    }
    setStep('survey');
  };

  const handleAnswer = (value: number) => {
    const newScore = score + value;
    setScore(newScore);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep('result');
    }
  };

  const togglePledge = (pledge: string) => {
    if (selectedPledges.includes(pledge)) {
      setSelectedPledges(selectedPledges.filter(p => p !== pledge));
    } else {
      if (selectedPledges.length >= 5) {
        alert("5개만 골라주세요! 🖐️");
        return;
      }
      setSelectedPledges([...selectedPledges, pledge]);
    }
  };

  const downloadImage = async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const loadImg = (url: string): Promise<HTMLImageElement | null> => 
      new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = url;
      });

    const [logo, char] = await Promise.all([loadImg(LOGO_URL), loadImg(CHAR_URL)]);

    // 1. Background
    ctx.fillStyle = "#fcebd5";
    ctx.fillRect(0, 0, w, h);

    // 2. Card
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.roundRect(40, 40, w - 80, h - 80, 60);
    ctx.fill();

    // 3. (Logo removed as requested)

    // 4. Character
    if (char) {
      const destWidth = w * 0.6;
      const destHeight = (char.height / char.width) * destWidth;
      
      ctx.globalAlpha = 1.0;
      // Positioned more consistently with the preview
      ctx.drawImage(char, w - destWidth - 40, h - destHeight - 120, destWidth, destHeight);
    }

    // 5. Title
    ctx.textAlign = "center";
    ctx.fillStyle = "#222";
    ctx.font = "900 85px sans-serif";
    ctx.fillText("서약서", w / 2, 210);

    // 6. Name
    ctx.font = "bold 44px sans-serif";
    ctx.fillStyle = "#444";
    ctx.fillText(`성명: `, w / 2 - 60, 310);
    ctx.fillStyle = "#ff6bad";
    ctx.fillText(name, w / 2 + 60, 310);
    ctx.strokeStyle = "#ff6bad";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 20, 325);
    ctx.lineTo(w / 2 + 180, 325);
    ctx.stroke();

    // 7. Pledges
    ctx.textAlign = "left";
    selectedPledges.forEach((p, i) => {
      const py = 410 + (i * 85);
      ctx.fillStyle = "#ff6bad";
      ctx.beginPath();
      ctx.arc(140, py - 12, 22, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "white";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((i + 1).toString(), 140, py - 4);
      
      ctx.textAlign = "left";
      ctx.fillStyle = "#333";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(p, 185, py);
    });

    // 8. Date & Footer
    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#999";
    ctx.font = "20px sans-serif";
    ctx.fillText("본인은 위 내용을 성실히 지킬 것을 다짐합니다.", w / 2, h - 180);
    ctx.fillStyle = "#666";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(dateStr, w / 2, h - 140);

    if (logo) {
      const lw = 180; // Smaller logo at the bottom
      const lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, w / 2 - lw / 2, h - lh - 60, lw, lh);
    }

    const link = document.createElement('a');
    link.download = `디지털서약서_${name}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    setIsGenerating(false);
  };

  const getResultStatus = () => {
    if (score <= 40) return { label: "건강한 디지털 리더 ✨", color: "text-green-500", desc: "매우 건강한 디지털 습관을 갖고 계시네요!" };
    if (score <= 60) return { label: "주의가 필요한 단계 🤔", color: "text-yellow-500", desc: "조금 더 주의가 필요한 단계입니다." };
    return { label: "디톡스가 필요해요 🚨", color: "text-red-500", desc: "디지털 디톡스가 시급한 상태입니다!" };
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h1 className="text-2xl font-black text-main-pink mb-4 flex items-center justify-center gap-2">
              디지털 리터러시 챌린지 <Sparkles className="w-6 h-6" />
            </h1>
            <div className="flex justify-center mb-6">
              <img 
                src={CHAR_URL} 
                alt="Digital Literacy Character" 
                className="w-[200px] h-auto object-contain drop-shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">
              나의 디지털 습관을 점검하고<br />멋진 실천 서약서를 만들어봐요!
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요"
              maxLength={10}
              className="w-full p-4 border-2 border-pink-100 rounded-2xl text-center mb-6 focus:outline-none focus:border-main-pink transition-all text-lg"
            />
            <button
              onClick={handleStart}
              className="w-full bg-pink-400 text-white p-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-pink-500 active:scale-95 transition-all cursor-pointer"
            >
              시작하기! 🪄
            </button>
          </motion.div>
        )}

        {step === 'survey' && (
          <motion.div
            key="survey"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-main-pink mb-2">
                <span>문항 {currentQ + 1} / {QUESTIONS.length}</span>
                <span>{Math.round(((currentQ + 1) / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-main-pink h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-pink-50 rounded-3xl p-8 text-center mb-8 min-h-[140px] flex items-center justify-center border-2 border-pink-100">
              <h3 className="text-lg font-bold text-gray-700 leading-snug">
                {QUESTIONS[currentQ]}
              </h3>
            </div>
            <div className="space-y-1">
              <button onClick={() => handleAnswer(4)} className="q-btn">매우 그렇다! 👍</button>
              <button onClick={() => handleAnswer(3)} className="q-btn">그런 편이야 🙂</button>
              <button onClick={() => handleAnswer(2)} className="q-btn">보통이야 🤔</button>
              <button onClick={() => handleAnswer(1)} className="q-btn">절대 아니야 🙅</button>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CharacterImage size="medium" className="mb-6" />
            <h2 className="text-xl font-black mb-6">점검 결과</h2>
            <div className="w-28 h-28 bg-pink-50 border-4 border-pink-200 rounded-full flex items-center justify-center text-4xl font-black text-main-pink mx-auto mb-8 shadow-inner">
              {score}
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 text-sm text-left border border-gray-100">
              <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-main-pink" />
                {name}님은 현재 {getResultStatus().desc}
              </p>
              <p className="text-blue-500 font-medium italic">
                함께 약속을 정하고 실천하는 디지털 리더가 되어보아요.
              </p>
            </div>
            <button
              onClick={() => setStep('pledge')}
              className="w-full bg-blue-500 text-white p-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-600 transition-all active:scale-95 cursor-pointer"
            >
              서약서 작성하기 ✍️
            </button>
          </motion.div>
        )}

        {step === 'pledge' && (
          <motion.div
            key="pledge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-black text-gray-800 mb-2 text-center text-lg">중요한 약속 5개를 골라줘! 💎</h3>
            <p className="text-center text-xs text-gray-400 mb-6">클릭하는 순서대로 번호가 매겨집니다.</p>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
              {PLEDGES.map((p, i) => {
                const selectedIndex = selectedPledges.indexOf(p);
                return (
                  <div
                    key={i}
                    onClick={() => togglePledge(p)}
                    className={`flex items-center gap-3 p-4 border-2 border-gray-100 rounded-2xl cursor-pointer hover:bg-pink-50 transition-all bg-white ${selectedIndex > -1 ? 'selected-item' : ''}`}
                  >
                    <div className={`badge ${selectedIndex === -1 ? 'opacity-0' : 'opacity-100'}`}>
                      {selectedIndex + 1}
                    </div>
                    <span className="text-sm font-bold text-gray-600 flex-1">{p}</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setStep('final')}
              disabled={selectedPledges.length !== 5}
              className={`w-full p-5 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                selectedPledges.length === 5
                  ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              서약서 완성 ({selectedPledges.length}/5)
            </button>
          </motion.div>
        )}

        {step === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-bg-custom p-4 rounded-[30px] mb-6">
              <div className="bg-white aspect-[1/1.414] rounded-2xl relative overflow-hidden shadow-sm border border-pink-100">
                {/* Visual elements */}
                <div className="absolute right-4 bottom-20 w-[60%] z-10 pointer-events-none flex items-center justify-center min-h-[100px]">
                  {!charImgError ? (
                    <img 
                      src={CHAR_URL} 
                      alt="" 
                      className="w-full h-auto object-contain drop-shadow-2xl"
                      onError={() => setCharImgError(true)}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Sparkles className="w-24 h-24 text-pink-200 opacity-50" />
                  )}
                </div>
                <div className="absolute bottom-8 left-0 w-full px-10 flex flex-col items-center gap-1 z-20">
                  <div className="w-full h-[1px] bg-pink-100 mb-4 opacity-50"></div>
                  <img 
                    src={LOGO_URL} 
                    alt="대구시청자미디어센터" 
                    className="h-8 object-contain mb-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">대구시청자미디어센터</span>
                </div>

                <div className="relative z-30 p-10 h-full flex flex-col text-center">
                  <h2 className="text-3xl font-black text-gray-800 mb-8 mt-4 font-serif">서약서</h2>
                  <p className="font-black text-lg text-gray-700 mb-8">
                    성명: <span className="text-main-pink border-b-2 border-pink-200 px-4">{name}</span>
                  </p>
                  <div className="space-y-2">
                    {selectedPledges.map((p, i) => (
                      <div key={i} className="pledge-row">
                        <span className="text-main-pink mr-2">#{i + 1}</span> {p}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto mb-12 text-center">
                    <p className="text-[10px] text-gray-400 mb-1">본인은 위 내용을 성실히 지킬 것을 다짐합니다.</p>
                    <p className="text-xs font-bold text-gray-500">
                      {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={downloadImage}
                disabled={isGenerating}
                className="w-full bg-main-pink text-white p-5 rounded-2xl font-black text-lg shadow-lg hover:bg-pink-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isGenerating ? (
                  <>⏳ 이미지 생성 중...</>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> 이미지로 저장하기
                  </>
                )}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full text-gray-400 text-sm font-bold py-2 flex items-center justify-center gap-2 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> 다시 만들기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas
        ref={canvasRef}
        width={800}
        height={1131}
        className="hidden"
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ff6bad;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
