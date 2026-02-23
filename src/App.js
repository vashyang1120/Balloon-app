import React, { useState, useEffect, useMemo } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Clock,
  Users,
  Settings as SettingsIcon,
  CheckCircle2,
  ChevronLeft,
  Image as ImageIcon,
  Check,
  X,
  PartyPopper,
  Pencil,
  Plus,
  Trash2,
  Sparkles,
  Wand2,
  Loader2,
  Maximize,
  Minimize,
} from "lucide-react";

// --- 預設 36 個氣球造型資料 ---
const DEFAULT_BALLOONS = [
  { id: 1, name: "貴賓狗", icon: "🐩", color: "bg-pink-100 text-pink-600" },
  { id: 2, name: "寶劍", icon: "🗡️", color: "bg-gray-100 text-gray-600" },
  { id: 3, name: "小花", icon: "🌸", color: "bg-rose-100 text-rose-500" },
  {
    id: 4,
    name: "兔子",
    icon: "🐰",
    color: "bg-white text-gray-800 border-2 border-gray-200",
  },
  { id: 5, name: "皇冠", icon: "👑", color: "bg-yellow-100 text-yellow-600" },
  { id: 6, name: "蝴蝶", icon: "🦋", color: "bg-blue-100 text-blue-500" },
  { id: 7, name: "恐龍", icon: "🦖", color: "bg-green-100 text-green-600" },
  { id: 8, name: "烏龜", icon: "🐢", color: "bg-emerald-100 text-emerald-600" },
  { id: 9, name: "雷射槍", icon: "🔫", color: "bg-cyan-100 text-cyan-600" },
  { id: 10, name: "小熊", icon: "🐻", color: "bg-amber-100 text-amber-700" },
  { id: 11, name: "愛心", icon: "❤️", color: "bg-red-100 text-red-500" },
  { id: 12, name: "猴子", icon: "🐒", color: "bg-orange-100 text-orange-600" },
  { id: 13, name: "天鵝", icon: "🦢", color: "bg-slate-100 text-slate-600" },
  { id: 14, name: "蘋果", icon: "🍎", color: "bg-red-50 text-red-600" },
  { id: 15, name: "葡萄", icon: "🍇", color: "bg-purple-100 text-purple-600" },
  { id: 16, name: "星星", icon: "⭐", color: "bg-yellow-50 text-yellow-500" },
  { id: 17, name: "蜜蜂", icon: "🐝", color: "bg-yellow-100 text-yellow-700" },
  { id: 18, name: "長頸鹿", icon: "🦒", color: "bg-orange-50 text-orange-500" },
  { id: 19, name: "企鵝", icon: "🐧", color: "bg-blue-50 text-blue-800" },
  { id: 20, name: "青蛙", icon: "🐸", color: "bg-green-50 text-green-500" },
  { id: 21, name: "貓咪", icon: "🐱", color: "bg-yellow-50 text-yellow-600" },
  { id: 22, name: "老鼠", icon: "🐭", color: "bg-gray-100 text-gray-500" },
  { id: 23, name: "獅子", icon: "🦁", color: "bg-orange-100 text-orange-500" },
  { id: 24, name: "老虎", icon: "🐯", color: "bg-orange-200 text-orange-700" },
  { id: 25, name: "飛機", icon: "✈️", color: "bg-sky-100 text-sky-600" },
  { id: 26, name: "汽車", icon: "🚗", color: "bg-red-100 text-red-600" },
  {
    id: 27,
    name: "魔法杖",
    icon: "🪄",
    color: "bg-indigo-100 text-indigo-500",
  },
  { id: 28, name: "雪人", icon: "⛄", color: "bg-sky-50 text-sky-400" },
  { id: 29, name: "章魚", icon: "🐙", color: "bg-rose-100 text-rose-600" },
  { id: 30, name: "蜘蛛", icon: "🕷️", color: "bg-gray-200 text-gray-800" },
  { id: 31, name: "吉他", icon: "🎸", color: "bg-amber-100 text-amber-600" },
  { id: 32, name: "帽子", icon: "🎩", color: "bg-slate-200 text-slate-800" },
  { id: 33, name: "雨傘", icon: "☂️", color: "bg-purple-100 text-purple-500" },
  { id: 34, name: "火箭", icon: "🚀", color: "bg-blue-100 text-blue-600" },
  { id: 35, name: "仙人掌", icon: "🌵", color: "bg-green-100 text-green-700" },
  {
    id: 36,
    name: "獨角獸",
    icon: "🦄",
    color: "bg-fuchsia-100 text-fuchsia-500",
  },
];

// --- 輔助：尺寸與網格計算 ---
const getSizeClasses = (size) => {
  switch (size) {
    case "sm":
      return "w-16 h-16 sm:w-20 sm:h-20 text-3xl sm:text-4xl";
    case "lg":
      return "w-28 h-28 sm:w-32 sm:h-32 text-5xl sm:text-6xl";
    case "xl":
      return "w-36 h-36 sm:w-40 sm:h-40 text-6xl sm:text-7xl";
    case "md":
    default:
      return "w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl";
  }
};

const getGridColsClasses = (size) => {
  switch (size) {
    case "lg":
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    case "xl":
      return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    case "sm":
    case "md":
    default:
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6";
  }
};

// --- Firebase 初始化 ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOxQq-YoKosDjHTFIr9P0j-4-rS5wC_2Q",
  authDomain: "balloon-order-app.firebaseapp.com",
  projectId: "balloon-order-app",
  storageBucket: "balloon-order-app.firebasestorage.app",
  messagingSenderId: "236485690578",
  appId: "1:236485690578:web:46fd84d4999fd906ee990b",
  measurementId: "G-LF5QRLJDL5",
};

// 🌟 修復重複初始化的問題 (避免 CodeSandbox 熱重載時崩潰)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.projectId || "my-balloon-app";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("guest"); // 'guest', 'admin', 'settings'

  // 系統設定狀態 (加入 balloons 陣列、title 與 thumbnailSize)
  const [config, setConfig] = useState({
    gridSize: 24,
    timePerItem: 3,
    balloons: DEFAULT_BALLOONS,
    title: "歡樂氣球工坊",
    thumbnailSize: "md",
  });

  // 訂單狀態
  const [orders, setOrders] = useState([]);

  // UI 狀態
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBalloon, setSelectedBalloon] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  // --- 🌟 Gemini AI 狀態 ---
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReason, setAiReason] = useState(""); // 儲存 AI 的推薦理由

  // 全螢幕狀態
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  // 1. 驗證與登入 (Rule 3)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          try {
            // 嘗試使用預設的自訂 token
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (err) {
            // 如果換成自己的 firebaseConfig，會產生 token 不符錯誤，此時改用匿名登入
            console.warn(
              "Custom token mismatch (likely using own Firebase), falling back to anonymous auth.",
              err.message
            );
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. 監聽 Firebase 資料 (Rule 1 & 2)
  useEffect(() => {
    if (!user) return;

    // 監聽設定檔 (Public Data)
    const configRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "settings",
      "main"
    );
    const unsubConfig = onSnapshot(
      configRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig({
            gridSize: data.gridSize || 24,
            timePerItem: data.timePerItem || 3,
            balloons: data.balloons || DEFAULT_BALLOONS,
            title: data.title || "歡樂氣球工坊",
            thumbnailSize: data.thumbnailSize || "md",
          });
        } else {
          // 如果沒有設定檔，初始化一個
          setDoc(configRef, {
            gridSize: 24,
            timePerItem: 3,
            balloons: DEFAULT_BALLOONS,
            title: "歡樂氣球工坊",
            thumbnailSize: "md",
          });
        }
      },
      (error) => console.error("Config fetch error:", error)
    );

    // 監聽所有訂單 (Public Data)
    const ordersRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "orders"
    );
    const unsubOrders = onSnapshot(
      ordersRef,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // 在本地端進行排序 (Rule 2: No complex queries)
        fetchedOrders.sort((a, b) => a.timestamp - b.timestamp);
        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (error) => console.error("Orders fetch error:", error)
    );

    return () => {
      unsubConfig();
      unsubOrders();
    };
  }, [user]);

  // --- 計算衍生狀態 ---
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders]
  );
  const waitingCount = pendingOrders.length;
  const estimatedWaitTime = waitingCount * config.timePerItem;

  const displayBalloons = useMemo(() => {
    const sourceBalloons = config.balloons || DEFAULT_BALLOONS;
    return sourceBalloons.slice(0, config.gridSize);
  }, [config.gridSize, config.balloons]);

  // --- 判斷是否為圖片網址的輔助函式 ---
  const isImageUrl = (str) => {
    return (
      str &&
      typeof str === "string" &&
      (str.startsWith("http") || str.startsWith("data:"))
    );
  };

  // --- 🌟 自動轉換 Google Drive 連結為圖片直連網址 ---
  const getDisplayImageUrl = (url) => {
    if (!url || typeof url !== "string") return url;
    // 檢查是否為 Google Drive 的分享連結 (支援 /file/d/ 格式 或 ?id= 格式)
    const driveMatch =
      url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (driveMatch && driveMatch[1]) {
      // 改用 thumbnail API，這能避開 Google Drive 的防盜鏈與病毒掃描畫面限制
      // sz=w1000 代表最大寬度 1000px，能確保畫質清晰又不會太大
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
    }
    return url;
  };

  // --- 🌟 Gemini API 呼叫函式 ---
  const callGeminiAPI = async (prompt, isJson = false) => {
    const apiKey = ""; // API Key 會由執行環境自動注入
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (isJson) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            id: { type: "NUMBER" },
            reason: { type: "STRING" },
          },
        },
      };
    }

    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return isJson ? JSON.parse(text) : text;
      } catch (err) {
        if (i === 4) {
          console.error("Gemini API failed after retries", err);
          return null;
        }
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  };

  const handleAiRecommend = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);

    const catalogInfo = displayBalloons.map((b) => ({
      id: b.id,
      name: b.name,
    }));
    const prompt = `你是一個熱情可愛的氣球魔法師。顧客說：「${aiQuery}」。請從以下氣球目錄中，挑選「一個」最適合的氣球推薦給他：\n${JSON.stringify(
      catalogInfo
    )}\n\n請以 JSON 格式回傳，包含 "id" (推薦的氣球ID數字) 與 "reason" (推薦理由，約20-30字內，語氣要非常活潑可愛，結尾加上emoji)。`;

    const result = await callGeminiAPI(prompt, true);
    setIsAiLoading(false);

    if (result && result.id) {
      const recommendedBalloon = displayBalloons.find(
        (b) => b.id === result.id
      );
      if (recommendedBalloon) {
        setIsAiModalOpen(false);
        setAiReason(result.reason);
        setSelectedBalloon(recommendedBalloon);
        setAiQuery("");
      } else {
        setAiReason("哎呀！魔法師找不太到適合的，您可以自己挑選看看喔！✨");
      }
    }
  };

  // --- 處理函式 ---
  const handlePlaceOrder = async (balloon) => {
    if (!user) return;

    // 計算新號碼 (找當天最大號碼 + 1)
    // 實務上可能會依日期重置，這裡簡化為所有訂單中最大號碼 + 1
    const maxOrderNum =
      orders.length > 0
        ? Math.max(...orders.map((o) => o.orderNumber || 0))
        : 0;
    const newOrderNumber = maxOrderNum + 1;

    // 當下的等待人數與時間 (即前面的 pending 數量)
    const currentWaitCount = pendingOrders.length;
    const currentEstTime = currentWaitCount * config.timePerItem;

    const newOrder = {
      orderNumber: newOrderNumber,
      balloonId: balloon.id,
      balloonName: balloon.name,
      status: "pending",
      timestamp: Date.now(),
      userId: user.uid,
      // 記錄當下預估的時間，供顧客參考
      estimatedWaitTime: currentEstTime,
      waitingAhead: currentWaitCount,
    };

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "orders"),
        newOrder
      );
      setSelectedBalloon(null);
      setAiReason(""); // 清除 AI 理由

      // 設定成功的狀態，同時先顯示載入中的魔法物語
      const initialSuccessOrder = {
        ...newOrder,
        icon: balloon.icon,
        story: "✨ 氣球魔法師正在為您的專屬氣球注入魔法語...",
      };
      setSuccessOrder(initialSuccessOrder);

      // 🌟 異步呼叫 Gemini API 產生專屬魔法物語
      const storyPrompt = `顧客剛點了一個名為「${balloon.name}」的造型氣球。請以「氣球魔法師」的口吻，用繁體中文寫一段簡短（約2-3句話）的可愛魔法物語或保養小叮嚀給這位顧客。例如：「你的狗狗氣球被施了快樂魔法！請記得多給它愛的抱抱，並且遠離尖銳的仙人掌喔！✨」`;

      callGeminiAPI(storyPrompt).then((story) => {
        if (story) {
          setSuccessOrder((prev) => (prev ? { ...prev, story } : null));
        }
      });
    } catch (error) {
      console.error("Error placing order:", error);
      alert("點單失敗，請稍後再試。");
    }
  };

  const handleMarkCompleted = async (orderId) => {
    if (!user) return;
    try {
      const orderRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "orders",
        orderId
      );
      await updateDoc(orderRef, {
        status: "completed",
        completedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!user) return;
    if (window.confirm("確定要刪除這筆訂單嗎？")) {
      try {
        const orderRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "orders",
          orderId
        );
        await deleteDoc(orderRef);
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const handleSaveConfig = async (
    newGridSize,
    newTime,
    newBalloons,
    newTitle,
    newThumbnailSize
  ) => {
    if (!user) return;
    try {
      const configRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "settings",
        "main"
      );
      await setDoc(configRef, {
        gridSize: newGridSize,
        timePerItem: newTime,
        balloons: newBalloons,
        title: newTitle,
        thumbnailSize: newThumbnailSize,
      });
      setView("admin");
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-pink-600 font-medium">載入中...</p>
        </div>
      </div>
    );
  }

  // --- 畫面元件 ---

  // 1. 賓客點單畫面 (首頁)
  const GuestView = () => (
    <div className="pb-8">
      {/* 狀態列 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-pink-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-pink-600">
            <div className="bg-pink-100 p-2 rounded-full">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm text-pink-500 font-medium leading-none mb-1">
                目前等待
              </p>
              <p className="text-xl font-bold leading-none">
                {waitingCount} <span className="text-sm font-normal">人</span>
              </p>
            </div>
          </div>
          <div className="w-px h-10 bg-pink-100 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-indigo-500 font-medium leading-none mb-1">
                預估時間
              </p>
              <p className="text-xl font-bold leading-none">
                {estimatedWaitTime}{" "}
                <span className="text-sm font-normal">分鐘</span>
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setView("admin")}
          className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-1 text-sm bg-gray-50 px-3 py-1.5 rounded-full"
        >
          <SettingsIcon size={16} /> 後台管理
        </button>
      </div>

      {/* 🌟 魔法顧問按鈕 */}
      <div className="mb-6">
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-fuchsia-500/30 transition-all active:scale-95 font-bold"
        >
          <Sparkles size={20} />
          不知道選什麼？問問 AI 魔法顧問！
        </button>
      </div>

      {/* 氣球網格 */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>✨ 選擇您想要的氣球造型</span>
      </h2>

      <div
        className={`grid gap-3 sm:gap-4 ${getGridColsClasses(
          config.thumbnailSize
        )}`}
      >
        {displayBalloons.map((balloon) => (
          <button
            key={balloon.id}
            onClick={() => setSelectedBalloon(balloon)}
            className="group flex flex-col items-center bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-3 sm:p-4 border-2 border-transparent hover:border-pink-300 active:scale-95"
          >
            {/* 圖片或 Emoji 預覽區 */}
            <div
              className={`${getSizeClasses(
                config.thumbnailSize
              )} rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 overflow-hidden ${
                !isImageUrl(balloon.icon) ? balloon.color || "bg-gray-100" : ""
              }`}
            >
              {isImageUrl(balloon.icon) ? (
                <img
                  src={getDisplayImageUrl(balloon.icon)}
                  alt={balloon.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                balloon.icon
              )}
            </div>
            <span className="font-medium text-gray-700 text-sm sm:text-base">
              {balloon.name}
            </span>
          </button>
        ))}
      </div>

      {/* 🌟 AI 魔法顧問 Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center">
            <div className="w-16 h-16 mx-auto bg-fuchsia-100 text-fuchsia-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Wand2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
              魔法顧問
            </h3>
            <p className="text-center text-gray-500 mb-6 text-sm">
              請告訴我您今天的心情，或是喜歡什麼動物、顏色？我來為您挑選最棒的造型！
            </p>

            <textarea
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="例如：我想要一個在天上飛的、或是粉紅色的可愛動物..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none h-24"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={isAiLoading}
              >
                取消
              </button>
              <button
                onClick={handleAiRecommend}
                disabled={isAiLoading || !aiQuery.trim()}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-fuchsia-500 hover:bg-fuchsia-600 shadow-lg shadow-fuchsia-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isAiLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Sparkles size={20} />
                )}
                {isAiLoading ? "施法中..." : "為我推薦"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 確認點單 Modal */}
      {selectedBalloon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
              確認造型
            </h3>

            {/* 🌟 顯示 AI 推薦理由 */}
            {aiReason ? (
              <div className="bg-fuchsia-50 text-fuchsia-700 p-3 rounded-xl text-sm font-medium mb-4 text-center border border-fuchsia-100 flex flex-col items-center gap-1">
                <Sparkles size={16} className="text-fuchsia-500 shrink-0" />
                <span>{aiReason}</span>
              </div>
            ) : (
              <p className="text-center text-gray-500 mb-6">
                您選擇的是{" "}
                <span className="text-pink-500 font-bold">
                  {selectedBalloon.name}
                </span>
                ，確定要送出嗎？
              </p>
            )}

            <div
              className={`w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl mb-8 shadow-inner overflow-hidden ${
                !isImageUrl(selectedBalloon.icon)
                  ? selectedBalloon.color || "bg-gray-100"
                  : ""
              }`}
            >
              {isImageUrl(selectedBalloon.icon) ? (
                <img
                  src={getDisplayImageUrl(selectedBalloon.icon)}
                  alt={selectedBalloon.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                selectedBalloon.icon
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedBalloon(null);
                  setAiReason("");
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                重新選擇
              </button>
              <button
                onClick={() => handlePlaceOrder(selectedBalloon)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/30 transition-colors"
              >
                確定送出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 點單成功 Modal */}
      {successOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-indigo-500"></div>

            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-inner">
              <PartyPopper size={32} />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              點單成功！
            </h3>
            <p className="text-gray-500 mb-6">請記住您的專屬號碼</p>

            <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-6 mb-6">
              <p className="text-sm text-pink-600 font-medium mb-1">您的號碼</p>
              <p className="text-6xl font-black text-pink-500 mb-4">
                #{successOrder.orderNumber}
              </p>

              <div className="flex items-center justify-center gap-2 text-gray-600 font-medium bg-white py-2 px-4 rounded-lg inline-flex shadow-sm">
                {isImageUrl(successOrder.icon) ? (
                  <img
                    src={getDisplayImageUrl(successOrder.icon)}
                    alt={successOrder.balloonName}
                    className="w-6 h-6 object-cover rounded-md"
                  />
                ) : (
                  <span className="text-2xl">{successOrder.icon}</span>
                )}
                <span>{successOrder.balloonName}</span>
              </div>
            </div>

            {/* 🌟 AI 魔法物語 */}
            {successOrder.story && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 text-left relative overflow-hidden">
                <Sparkles
                  size={80}
                  className="absolute -top-4 -right-4 text-indigo-100 opacity-50"
                />
                <p className="text-sm text-indigo-800 font-medium leading-relaxed relative z-10">
                  {successOrder.story}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Users size={12} /> 前方等待
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {successOrder.waitingAhead}{" "}
                  <span className="text-sm font-normal text-gray-500">人</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Clock size={12} /> 預估時間
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {successOrder.estimatedWaitTime}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    分鐘
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-900 shadow-lg transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 2. 管理員後台
  const AdminView = () => (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView("guest")}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-600 font-medium bg-white px-4 py-2 rounded-xl shadow-sm"
        >
          <ChevronLeft size={20} /> 返回前台
        </button>
        <button
          onClick={() => setView("settings")}
          className="flex items-center gap-2 text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl shadow-sm transition-colors font-medium"
        >
          <SettingsIcon size={18} /> 系統設定
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
        <div className="p-4 bg-pink-50 border-b border-pink-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📋 待製作訂單{" "}
            <span className="bg-pink-500 text-white px-2 py-0.5 rounded-full text-xs">
              {pendingOrders.length}
            </span>
          </h2>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
            <p>目前沒有等待中的訂單！太棒了！</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingOrders.map((order, index) => (
              <div
                key={order.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center font-bold text-xl">
                    #{order.orderNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      {order.balloonName}
                      {index === 0 && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          下一個
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                      <span>
                        {new Date(order.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        點單
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="取消/刪除訂單"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={() => handleMarkCompleted(order.id)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-sm transition-colors font-medium"
                  >
                    <Check size={18} /> 完成
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 已完成訂單預覽 (顯示最近5筆) */}
      <div className="mt-8 opacity-60">
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">
          最近完成的訂單
        </h3>
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          {orders
            .filter((o) => o.status === "completed")
            .slice(-5)
            .reverse()
            .map((order) => (
              <div
                key={order.id}
                className="p-3 border-b border-gray-200 last:border-0 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">#{order.orderNumber}</span>
                  <span className="text-gray-600 line-through">
                    {order.balloonName}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">
                  {order.completedAt
                    ? new Date(order.completedAt).toLocaleTimeString()
                    : ""}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  // 3. 設定畫面
  const SettingsView = () => {
    const [tempGridSize, setTempGridSize] = useState(config.gridSize);
    const [tempTime, setTempTime] = useState(config.timePerItem);
    const [tempBalloons, setTempBalloons] = useState(
      config.balloons || DEFAULT_BALLOONS
    );
    const [tempTitle, setTempTitle] = useState(config.title || "歡樂氣球工坊");
    const [tempThumbnailSize, setTempThumbnailSize] = useState(
      config.thumbnailSize || "md"
    );
    const [editingBalloon, setEditingBalloon] = useState(null);

    const handleAddBalloon = () => {
      const newId =
        tempBalloons.length > 0
          ? Math.max(...tempBalloons.map((b) => b.id)) + 1
          : 1;
      const newBalloon = {
        id: newId,
        name: "新造型",
        icon: "🎈",
        color: "bg-gray-100 text-gray-600",
      };
      setTempBalloons([...tempBalloons, newBalloon]);
      setEditingBalloon(newBalloon);
    };

    const handleUpdateBalloon = (updatedBalloon) => {
      setTempBalloons(
        tempBalloons.map((b) =>
          b.id === updatedBalloon.id ? updatedBalloon : b
        )
      );
      setEditingBalloon(null);
    };

    const handleDeleteBalloon = (id) => {
      if (window.confirm("確定要刪除這個造型嗎？")) {
        setTempBalloons(tempBalloons.filter((b) => b.id !== id));
        setEditingBalloon(null);
      }
    };

    return (
      <div className="max-w-3xl mx-auto pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setView("admin")}
            className="p-2 bg-white text-gray-600 rounded-full shadow-sm hover:text-indigo-600"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">系統設定</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8 mb-6">
          {/* 標題設定 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              APP 標題名稱
            </label>
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-gray-800"
              placeholder="例如：歡樂氣球工坊"
            />
            <p className="text-xs text-gray-400 mt-2">
              設定顯示在畫面上方導覽列的名稱。
            </p>
          </div>

          {/* 照片顯示大小設定 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              前台氣球照片顯示大小
            </label>
            <div className="grid grid-cols-4 gap-3 max-w-md">
              {["sm", "md", "lg", "xl"].map((size) => (
                <button
                  key={size}
                  onClick={() => setTempThumbnailSize(size)}
                  className={`py-3 px-2 rounded-xl border-2 font-bold transition-all text-center ${
                    tempThumbnailSize === size
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-500 hover:border-indigo-200"
                  }`}
                >
                  {size === "sm"
                    ? "小"
                    : size === "md"
                    ? "中"
                    : size === "lg"
                    ? "大"
                    : "特大"}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              設定賓客點單畫面中，氣球照片的縮圖尺寸。
            </p>
          </div>

          {/* 格數設定 (改為任意數字輸入) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              前台顯示格數 (可自訂任意格數)
            </label>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200 max-w-xs">
              <button
                onClick={() => setTempGridSize(Math.max(1, tempGridSize - 1))}
                className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-xl text-indigo-500 hover:bg-indigo-50"
              >
                -
              </button>
              <input
                type="number"
                value={tempGridSize}
                onChange={(e) =>
                  setTempGridSize(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="flex-1 text-center font-black text-3xl text-gray-800 bg-transparent outline-none w-full"
              />
              <button
                onClick={() => setTempGridSize(tempGridSize + 1)}
                className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-xl text-indigo-500 hover:bg-indigo-50"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              設定前台要顯示多少個氣球造型（請確保下方的氣球目錄有足夠數量的造型）。
            </p>
          </div>

          {/* 時間設定 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              每個造型平均製作時間 (分鐘)
            </label>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200 max-w-xs">
              <button
                onClick={() => setTempTime(Math.max(1, tempTime - 1))}
                className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-xl text-indigo-500 hover:bg-indigo-50"
              >
                -
              </button>
              <div className="flex-1 text-center font-black text-3xl text-gray-800">
                {tempTime}{" "}
                <span className="text-sm font-normal text-gray-500">分鐘</span>
              </div>
              <button
                onClick={() => setTempTime(tempTime + 1)}
                className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-xl text-indigo-500 hover:bg-indigo-50"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              此時間將用來計算顧客的預估等待時間。
            </p>
          </div>
        </div>

        {/* 氣球造型管理 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-bold text-gray-700">
              氣球造型目錄管理
            </label>
            <button
              onClick={handleAddBalloon}
              className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
            >
              <Plus size={16} /> 新增造型
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            點擊下方造型可編輯名稱與照片 (可填入照片網址或 Emoji)。
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {tempBalloons.map((balloon) => (
              <button
                key={balloon.id}
                onClick={() => setEditingBalloon(balloon)}
                className="relative group flex flex-col items-center bg-gray-50 rounded-xl p-2 border-2 border-transparent hover:border-indigo-300 transition-all shadow-sm"
              >
                <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity">
                  <Pencil size={12} />
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-1 overflow-hidden ${
                    !isImageUrl(balloon.icon)
                      ? balloon.color || "bg-gray-200"
                      : ""
                  }`}
                >
                  {isImageUrl(balloon.icon) ? (
                    <img
                      src={getDisplayImageUrl(balloon.icon)}
                      alt={balloon.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    balloon.icon
                  )}
                </div>
                <span className="font-medium text-gray-600 text-xs truncate w-full text-center">
                  {balloon.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 編輯氣球 Modal */}
        {editingBalloon && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                編輯氣球造型
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    造型名稱
                  </label>
                  <input
                    type="text"
                    value={editingBalloon.name}
                    onChange={(e) =>
                      setEditingBalloon({
                        ...editingBalloon,
                        name: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="例如：貴賓狗"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    照片網址 或 Emoji
                  </label>
                  <input
                    type="text"
                    value={editingBalloon.icon}
                    onChange={(e) =>
                      setEditingBalloon({
                        ...editingBalloon,
                        icon: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    placeholder="請貼上照片網址 (支援 Google Drive 連結) 或輸入 Emoji"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    支援直接貼上 Google Drive 的分享連結
                    (須設為知道連結者均可查看)。
                  </p>
                </div>

                <div className="pt-2 flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-500 mb-2">
                    預覽
                  </span>
                  <div
                    className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl overflow-hidden shadow-inner ${
                      !isImageUrl(editingBalloon.icon)
                        ? editingBalloon.color || "bg-gray-100"
                        : ""
                    }`}
                  >
                    {isImageUrl(editingBalloon.icon) ? (
                      <img
                        src={getDisplayImageUrl(editingBalloon.icon)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      editingBalloon.icon
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteBalloon(editingBalloon.id)}
                  className="p-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                  title="刪除"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setEditingBalloon(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleUpdateBalloon(editingBalloon)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-colors"
                >
                  確定變更
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() =>
                handleSaveConfig(
                  tempGridSize,
                  tempTime,
                  tempBalloons,
                  tempTitle,
                  tempThumbnailSize
                )
              }
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-colors text-lg"
            >
              儲存所有設定並返回
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-pink-50/50 font-sans selection:bg-pink-200 selection:text-pink-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-pink-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg flex items-center justify-center text-white shadow-sm">
              🎈
            </div>
            <h1 className="font-black text-gray-800 text-lg sm:text-xl tracking-tight">
              {config.title || "歡樂氣球工坊"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex"
              title="切換全螢幕"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {view === "guest"
                ? "點單區"
                : view === "admin"
                ? "管理後台"
                : "設定"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === "guest" && <GuestView />}
        {view === "admin" && <AdminView />}
        {view === "settings" && <SettingsView />}
      </main>

      {/* CSS 動畫與自定義樣式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in-center { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
        .scale-in-center { animation-name: scale-in-center; }
        .zoom-in { animation-name: zoom-in; }
      `,
        }}
      />
    </div>
  );
}
