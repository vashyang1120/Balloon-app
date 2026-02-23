/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Clock, Users, Settings as SettingsIcon, CheckCircle2, ChevronLeft, Check, X, PartyPopper, Pencil, Plus, Trash2, Sparkles, Wand2, Loader2, Maximize, Minimize, Edit3, AlertCircle, Crown, Image as ImageIcon, Lock, Search, Info } from 'lucide-react';

// --- 預設 36 個氣球造型資料 ---
const DEFAULT_BALLOONS = [
  { id: 1, name: '貴賓狗', icon: '🐩', color: 'bg-pink-100 text-pink-600' },
  { id: 2, name: '寶劍', icon: '🗡️', color: 'bg-gray-100 text-gray-600' },
  { id: 3, name: '小花', icon: '🌸', color: 'bg-rose-100 text-rose-500' },
  { id: 4, name: '兔子', icon: '🐰', color: 'bg-white text-gray-800 border-2 border-gray-200' },
  { id: 5, name: '皇冠', icon: '👑', color: 'bg-yellow-100 text-yellow-600' },
  { id: 6, name: '蝴蝶', icon: '🦋', color: 'bg-blue-100 text-blue-500' },
  { id: 7, name: '恐龍', icon: '🦖', color: 'bg-green-100 text-green-600' },
  { id: 8, name: '烏龜', icon: '🐢', color: 'bg-emerald-100 text-emerald-600' },
  { id: 9, name: '雷射槍', icon: '🔫', color: 'bg-cyan-100 text-cyan-600' },
  { id: 10, name: '小熊', icon: '🐻', color: 'bg-amber-100 text-amber-700' },
  { id: 11, name: '愛心', icon: '❤️', color: 'bg-red-100 text-red-500' },
  { id: 12, name: '猴子', icon: '🐒', color: 'bg-orange-100 text-orange-600' },
  { id: 13, name: '天鵝', icon: '🦢', color: 'bg-slate-100 text-slate-600' },
  { id: 14, name: '蘋果', icon: '🍎', color: 'bg-red-50 text-red-600' },
  { id: 15, name: '葡萄', icon: '🍇', color: 'bg-purple-100 text-purple-600' },
  { id: 16, name: '星星', icon: '⭐', color: 'bg-yellow-50 text-yellow-500' },
  { id: 17, name: '蜜蜂', icon: '🐝', color: 'bg-yellow-100 text-yellow-700' },
  { id: 18, name: '長頸鹿', icon: '🦒', color: 'bg-orange-50 text-orange-500' },
  { id: 19, name: '企鵝', icon: '🐧', color: 'bg-blue-50 text-blue-800' },
  { id: 20, name: '青蛙', icon: '🐸', color: 'bg-green-50 text-green-500' },
  { id: 21, name: '貓咪', icon: '🐱', color: 'bg-yellow-50 text-yellow-600' },
  { id: 22, name: '老鼠', icon: '🐭', color: 'bg-gray-100 text-gray-500' },
  { id: 23, name: '獅子', icon: '🦁', color: 'bg-orange-100 text-orange-500' },
  { id: 24, name: '老虎', icon: '🐯', color: 'bg-orange-200 text-orange-700' },
  { id: 25, name: '飛機', icon: '✈️', color: 'bg-sky-100 text-sky-600' },
  { id: 26, name: '汽車', icon: '🚗', color: 'bg-red-100 text-red-600' },
  { id: 27, name: '魔法杖', icon: '🪄', color: 'bg-indigo-100 text-indigo-500' },
  { id: 28, name: '雪人', icon: '⛄', color: 'bg-sky-50 text-sky-400' },
  { id: 29, name: '章魚', icon: '🐙', color: 'bg-rose-100 text-rose-600' },
  { id: 30, name: '蜘蛛', icon: '🕷️', color: 'bg-gray-200 text-gray-800' },
  { id: 31, name: '吉他', icon: '🎸', color: 'bg-amber-100 text-amber-600' },
  { id: 32, name: '帽子', icon: '🎩', color: 'bg-slate-200 text-slate-800' },
  { id: 33, name: '雨傘', icon: '☂️', color: 'bg-purple-100 text-purple-500' },
  { id: 34, name: '火箭', icon: '🚀', color: 'bg-blue-100 text-blue-600' },
  { id: 35, name: '仙人掌', icon: '🌵', color: 'bg-green-100 text-green-700' },
  { id: 36, name: '獨角獸', icon: '🦄', color: 'bg-fuchsia-100 text-fuchsia-500' }
];

// --- 輔助：尺寸與網格計算 ---
const getSizeClasses = (size) => {
  switch(size) {
    case 'sm': return 'w-16 h-16 sm:w-20 sm:h-20 text-3xl sm:text-4xl';
    case 'lg': return 'w-28 h-28 sm:w-32 sm:h-32 text-5xl sm:text-6xl';
    case 'xl': return 'w-36 h-36 sm:w-40 sm:h-40 text-6xl sm:text-7xl';
    case 'md':
    default: return 'w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl';
  }
};

const getGridColsClasses = (size) => {
  switch(size) {
    case 'lg': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
    case 'xl': return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    case 'sm':
    case 'md':
    default: return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6';
  }
};

// --- Firebase 初始化 ---
const firebaseConfig = {
  apiKey: "AIzaSyBOxQq-YoKosDjHTFIr9P0j-4-rS5wC_2Q",
  authDomain: "balloon-order-app.firebaseapp.com",
  projectId: "balloon-order-app",
  storageBucket: "balloon-order-app.firebasestorage.app",
  messagingSenderId: "236485690578",
  appId: "1:236485690578:web:46fd84d4999fd906ee990b",
  measurementId: "G-LF5QRLJDL5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.projectId || 'my-balloon-app';

export default function App() {
  const [user, setUser] = useState(null);
  
  // 解析網址，判斷是否為「獨立查詢模式」
  const urlParams = new URLSearchParams(window.location.search);
  const isTrackerMode = urlParams.get('view') === 'tracker';
  const [view, setView] = useState(isTrackerMode ? 'tracker' : 'guest'); 
  
  // 系統設定狀態
  const [config, setConfig] = useState({ 
    gridSize: 24, 
    timePerItem: 3, 
    balloons: DEFAULT_BALLOONS, 
    title: '歡樂氣球工坊', 
    thumbnailSize: 'md',
    loadingMessage: '✨ 氣球魔法師正在為您的專屬氣球注入魔法語...',
    maxWaitCount: 20,
    fullOrderMessage: '很抱歉，因為活動時間有限，目前的氣球訂單已經滿載囉！期待下次再為您服務！🎈',
    showVipSection: false,
    vipBalloons: [],
    vipGridSize: 12,
    vipThumbnailSize: 'md',
    bgStyle: '',
    qrCodeUrl: '',
    vipModeActive: false,
    adminPin: '8888' 
  });
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBalloon, setSelectedBalloon] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  // Gemini AI 狀態
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReason, setAiReason] = useState('');

  // 更改造型狀態
  const [isChangeOrderModalOpen, setIsChangeOrderModalOpen] = useState(false);
  const [changeOrderNumber, setChangeOrderNumber] = useState('');
  const [changeOriginalBalloonId, setChangeOriginalBalloonId] = useState('');
  const [changeError, setChangeError] = useState('');
  const [verifiedOrderForChange, setVerifiedOrderForChange] = useState(null);
  const [newSelectedBalloon, setNewSelectedBalloon] = useState(null);

  // 清空訂單狀態
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // 查詢進度狀態
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);

  // 🌟 全域系統提示與對話框狀態 (取代 alert 與 confirm)
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { message: string, onConfirm: function }
  const [adminPinModalOpen, setAdminPinModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (err) {
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

  useEffect(() => {
    if (!user) return;

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        setConfig(prev => ({ ...prev, ...docSnap.data() }));
      } else {
        setDoc(configRef, config);
      }
    }, (error) => console.error("Config fetch error:", error));

    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      fetchedOrders.sort((a, b) => {
        if (a.isVip && !b.isVip) return -1;
        if (!a.isVip && b.isVip) return 1;
        return a.timestamp - b.timestamp;
      });
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (error) => console.error("Orders fetch error:", error));

    return () => {
      unsubConfig();
      unsubOrders();
    };
  }, [user]);

  // --- 計算衍生狀態 ---
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const waitingCount = pendingOrders.length;
  const estimatedWaitTime = pendingOrders.reduce((totalTime, order) => totalTime + config.timePerItem, 0);
  const isOrderFull = waitingCount >= config.maxWaitCount && !config.vipModeActive;

  const displayBalloons = useMemo(() => {
    return (config.balloons || DEFAULT_BALLOONS).slice(0, config.gridSize);
  }, [config.gridSize, config.balloons]);

  const displayVipBalloons = useMemo(() => {
    return (config.vipBalloons || []).slice(0, config.vipGridSize);
  }, [config.vipGridSize, config.vipBalloons]);

  const allAvailableBalloons = useMemo(() => {
    const combined = [...displayBalloons];
    if (config.showVipSection) {
        displayVipBalloons.forEach(vb => {
            if (!combined.find(b => b.id === vb.id)) combined.push(vb);
        });
    }
    return combined;
  }, [displayBalloons, displayVipBalloons, config.showVipSection]);

  const isImageUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('data:'));

  const getDisplayImageUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
    }
    return url;
  };

  const bgStyles = useMemo(() => {
    if (!config.bgStyle) return { backgroundColor: '#fdf2f8' };
    if (isImageUrl(config.bgStyle)) {
        return {
            backgroundImage: `url(${getDisplayImageUrl(config.bgStyle)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        };
    }
    return { background: config.bgStyle };
  }, [config.bgStyle]);

  // --- API 與事件處理 ---
  const callGeminiAPI = async (prompt, isJson = false) => {
    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    if (isJson) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { id: { type: "NUMBER" }, reason: { type: "STRING" } } }
      };
    }
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return isJson ? JSON.parse(text) : text;
      } catch (err) {
        if (i === 4) return null;
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  };

  const handleAiRecommend = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    const catalogInfo = displayBalloons.map(b => ({ id: b.id, name: b.name }));
    const prompt = `你是一個熱情可愛的氣球魔法師。顧客說：「${aiQuery}」。請從以下氣球目錄中，挑選「一個」最適合的氣球推薦給他：\n${JSON.stringify(catalogInfo)}\n\n請以 JSON 格式回傳，包含 "id" (推薦的氣球ID數字) 與 "reason" (推薦理由，約20-30字內，語氣要非常活潑可愛，結尾加上emoji)。`;
    
    const result = await callGeminiAPI(prompt, true);
    setIsAiLoading(false);
    
    if (result && result.id) {
      const recommendedBalloon = displayBalloons.find(b => b.id === result.id);
      if (recommendedBalloon) {
        setIsAiModalOpen(false);
        setAiReason(result.reason);
        setSelectedBalloon(recommendedBalloon);
        setAiQuery('');
      } else {
        setAiReason('哎呀！魔法師找不太到適合的，您可以自己挑選看看喔！✨');
      }
    }
  };

  const handleBalloonClick = (balloon, isVipCategory = false) => {
    if (isVipCategory && !config.vipModeActive) {
      setAlertMessage("👑 這是 VIP 專屬造型！請先請氣球小V為您開啟 VIP 模式才能點選喔！");
      return;
    }
    if (!config.vipModeActive && isOrderFull) {
      setAlertMessage(config.fullOrderMessage);
      return;
    }
    setSelectedBalloon(balloon);
  };

  const handlePlaceOrder = async (balloon) => {
    if (!user) return;
    
    if (!config.vipModeActive && pendingOrders.length >= config.maxWaitCount) {
        setAlertMessage(config.fullOrderMessage);
        setSelectedBalloon(null);
        return;
    }

    const maxOrderNum = orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber || 0)) : 0;
    const newOrderNumber = maxOrderNum + 1;
    const isVipOrder = config.vipModeActive === true;
    
    let currentWaitCount = 0;
    if (isVipOrder) {
        currentWaitCount = pendingOrders.filter(o => o.isVip).length;
    } else {
        currentWaitCount = pendingOrders.length;
    }
    const currentEstTime = currentWaitCount * config.timePerItem;

    const newOrder = {
      orderNumber: newOrderNumber,
      balloonId: balloon.id,
      balloonName: balloon.name,
      status: 'pending',
      timestamp: Date.now(),
      userId: user.uid,
      estimatedWaitTime: currentEstTime,
      waitingAhead: currentWaitCount,
      isVip: isVipOrder
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), newOrder);
      
      if (isVipOrder) {
          const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
          await updateDoc(configRef, { vipModeActive: false });
      }

      setSelectedBalloon(null);
      setAiReason('');
      
      const initialSuccessOrder = { ...newOrder, icon: balloon.icon, story: config.loadingMessage };
      setSuccessOrder(initialSuccessOrder);

      const storyPrompt = `顧客剛點了一個名為「${balloon.name}」的造型氣球。請以「氣球魔法師」的口吻，用繁體中文寫一段簡短（約2-3句話）的可愛魔法物語或保養小叮嚀給這位顧客。例如：「你的狗狗氣球被施了快樂魔法！請記得多給它愛的抱抱，並且遠離尖銳的仙人掌喔！✨」`;
      callGeminiAPI(storyPrompt).then(story => {
        if (story) setSuccessOrder(prev => prev ? { ...prev, story } : null);
      });

    } catch (error) {
      console.error("Error placing order:", error);
      setAlertMessage("點單失敗，請稍後再試。");
    }
  };

  const handleMarkCompleted = async (orderId) => {
    if (!user) return;
    try {
      const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
      await updateDoc(orderRef, { status: 'completed', completedAt: Date.now() });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleCancelOrder = (orderId) => {
    if (!user) return;
    setConfirmAction({
      message: '確定要刪除這筆訂單嗎？',
      onConfirm: async () => {
        try {
          const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
          await deleteDoc(orderRef);
        } catch (error) {
          console.error("Error deleting order:", error);
        }
      }
    });
  };

  const handleClearAllOrders = async () => {
    if (!user) return;
    try {
      const promises = orders.map(order => 
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id))
      );
      await Promise.all(promises);
      setIsClearConfirmOpen(false); 
    } catch (error) {
      console.error("Error clearing all orders:", error);
      setAlertMessage("清空失敗，請稍後再試。");
    }
  };

  const handleVerifyOrderForChange = () => {
    setChangeError('');
    const targetOrderNum = parseInt(changeOrderNumber);
    const targetBalloonId = parseInt(changeOriginalBalloonId);

    if (isNaN(targetOrderNum) || isNaN(targetBalloonId)) {
      setChangeError('請點選您的編號並選擇原造型。');
      return;
    }

    const targetOrder = pendingOrders.find(o => o.orderNumber === targetOrderNum);

    if (!targetOrder) {
      setChangeError('找不到這筆未完成的訂單編號喔。');
      return;
    }

    if (targetOrder.balloonId !== targetBalloonId) {
      setChangeError('原本選擇的造型不正確，請確認是不是您的編號喔！');
      return;
    }

    if (pendingOrders[0] && pendingOrders[0].id === targetOrder.id) {
      setChangeError('氣球小V已經開始製作您的氣球了，來不及更改囉！✨');
      return;
    }

    setVerifiedOrderForChange(targetOrder);
  };

  const handleConfirmChangeOrder = async () => {
    if (!user || !verifiedOrderForChange || !newSelectedBalloon) return;

    try {
      const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', verifiedOrderForChange.id);
      await updateDoc(orderRef, { 
        balloonId: newSelectedBalloon.id,
        balloonName: newSelectedBalloon.name,
      });

      setIsChangeOrderModalOpen(false);
      setVerifiedOrderForChange(null);
      setNewSelectedBalloon(null);
      setChangeOrderNumber('');
      setChangeOriginalBalloonId('');
      setAlertMessage('造型已成功為您更換為：' + newSelectedBalloon.name + '！🎈');

    } catch (error) {
      console.error("Error changing order:", error);
      setAlertMessage("更換失敗，請稍後再試。");
    }
  };

  const handleSaveConfig = async (newConfigData) => {
    if (!user) return;
    try {
      const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
      await setDoc(configRef, newConfigData);
      setView('admin');
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleAdminLogin = () => {
    if (adminPinInput === (config.adminPin || '8888')) {
        setView('admin');
        setAdminPinModalOpen(false);
        setAdminPinInput('');
        setAdminPinError('');
    } else {
        setAdminPinError('密碼錯誤，請再試一次！');
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

  // 1. 🌟 獨立查詢進度畫面 (提供給 LINE 連結用)
  const TrackerView = () => {
    const [selectedNum, setSelectedNum] = useState(null);

    const selectableOrders = useMemo(() => {
        const pendings = pendingOrders;
        const completeds = orders.filter(o => o.status === 'completed').slice(-15);
        return [...pendings, ...completeds].sort((a,b) => a.orderNumber - b.orderNumber);
    }, [pendingOrders, orders]);

    if (!selectedNum) {
        return (
            <div className="min-h-screen flex flex-col items-center p-4 pt-12 animate-in fade-in">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-100 w-full max-w-md">
                    <div className="flex items-center justify-center gap-3 mb-6 text-indigo-600">
                        <Search size={32} className="shrink-0" />
                        <h2 className="text-2xl font-black tracking-wider">即時進度查詢</h2>
                    </div>
                    <p className="text-center font-bold text-gray-500 mb-6 text-sm">請點選您的專屬號碼：</p>
                    
                    <div className="flex flex-wrap justify-center gap-3 max-h-[60vh] overflow-y-auto p-2">
                        {selectableOrders.length > 0 ? selectableOrders.map(o => (
                            <button
                                key={o.id}
                                onClick={() => setSelectedNum(o.orderNumber)}
                                className={`w-16 h-16 rounded-2xl font-black text-2xl border-2 transition-all shadow-sm active:scale-95 ${
                                    o.status === 'completed' 
                                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                                    : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300'
                                }`}
                            >
                                {o.orderNumber}
                            </button>
                        )) : (
                            <p className="text-gray-400 font-medium py-8">目前沒有進行中的訂單</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const trackedOrder = orders.find(o => o.orderNumber === selectedNum);
    const trackedIndex = trackedOrder ? pendingOrders.findIndex(o => o.id === trackedOrder.id) : -1;

    return (
        <div className="min-h-screen flex flex-col items-center p-4 pt-12 animate-in fade-in slide-in-from-right-4">
            <div className="w-full max-w-md mb-4">
                <button onClick={() => setSelectedNum(null)} className="text-indigo-600 font-bold flex items-center gap-1 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-md hover:bg-white active:scale-95 transition-all">
                    <ChevronLeft size={20}/> 返回號碼列表
                </button>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-100 w-full max-w-md">
                {!trackedOrder && (
                    <div className="text-center text-gray-500 font-medium py-8">
                        找不到這個號碼的訂單喔，請確認是否輸入正確。
                    </div>
                )}

                {trackedOrder && trackedOrder.status === 'completed' && (
                    <div className="text-center animate-in zoom-in duration-500 py-6">
                        <PartyPopper size={64} className="mx-auto mb-4 text-green-500 animate-bounce" />
                        <h4 className="font-black text-2xl mb-2 text-gray-800">您的氣球已完成！</h4>
                        <p className="font-bold text-green-600 text-lg">請前往攤位領取您的</p>
                        <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl mt-3 border border-green-200 shadow-sm">
                            {isImageUrl(trackedOrder.icon) ? (
                                <img src={getDisplayImageUrl(trackedOrder.icon)} alt={trackedOrder.balloonName} className="w-8 h-8 object-cover rounded-md" />
                            ) : (
                                <span className="text-3xl">{trackedOrder.icon}</span>
                            )}
                            <span className="font-black text-xl text-green-700">{trackedOrder.balloonName}</span>
                        </div>
                    </div>
                )}

                {trackedOrder && trackedOrder.status === 'pending' && (
                    <div>
                        <h4 className="font-black text-indigo-800 mb-6 flex items-center justify-between border-b-2 border-indigo-100 pb-4 text-xl">
                            <span>您的號碼：#{trackedOrder.orderNumber}</span>
                            {trackedOrder.isVip && <span className="bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-lg flex items-center gap-1 font-black shadow-sm"><Crown size={16}/> VIP 優先</span>}
                        </h4>
                        
                        <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                                {isImageUrl(trackedOrder.icon) ? <img src={getDisplayImageUrl(trackedOrder.icon)} alt="icon" className="w-full h-full object-cover"/> : trackedOrder.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-1">您預訂的造型</p>
                                <p className="font-black text-xl text-gray-800">{trackedOrder.balloonName}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {trackedIndex === 0 ? (
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-2xl text-center shadow-lg animate-pulse">
                                    <Sparkles size={32} className="mx-auto mb-2 text-yellow-300" />
                                    <p className="font-black text-xl mb-1">氣球小V正在製作您的氣球！</p>
                                    <p className="font-medium text-indigo-100">請準備前往攤位領取喔</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                                        <span className="text-indigo-600 font-bold">您的前方還有</span>
                                        <span className="text-4xl font-black text-indigo-700">{trackedIndex} <span className="text-lg font-medium">人</span></span>
                                    </div>
                                    <div className="flex justify-between items-center bg-pink-50 p-5 rounded-2xl border border-pink-100">
                                        <span className="text-pink-600 font-bold">預估還需等待</span>
                                        <span className="text-4xl font-black text-pink-500">{trackedIndex * config.timePerItem} <span className="text-lg font-medium">分鐘</span></span>
                                    </div>
                                </>
                            )}
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-6 font-medium">畫面會即時自動更新，無需重新整理</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  // 2. 賓客現場點單畫面 (主頁)
  const GuestView = () => (
    <div className="pb-8 relative">
      
      {/* 👑 VIP 模式橫幅 */}
      {config.vipModeActive && (
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold py-3 px-4 rounded-2xl mb-4 shadow-lg flex items-center justify-center gap-2 animate-pulse">
              <Crown size={24} />
              <span>VIP 點單模式已開啟：您現在點選的造型將享有最優先製作權！</span>
              <Crown size={24} />
          </div>
      )}

      {/* 🌟 狀態列與現正製作 */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm p-4 mb-4 border border-pink-100 flex flex-col gap-4">
        
        {/* 現正製作 Bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-md">
            <div className="flex items-center gap-2 sm:gap-3">
                <Sparkles size={24} className="animate-pulse text-yellow-300" />
                <span className="font-bold text-base sm:text-lg tracking-wider">現正製作</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tighter">
                #{pendingOrders[0] ? pendingOrders[0].orderNumber : '--'}
            </div>
        </div>

        {/* 數據與按鈕 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-around">
                <div className="flex items-center gap-2 text-pink-600">
                    <div className="bg-pink-100 p-2 rounded-full"><Users size={20} /></div>
                    <div>
                    <p className="text-xs sm:text-sm text-pink-500 font-medium leading-none mb-1">目前等待</p>
                    <p className="text-lg sm:text-xl font-bold leading-none">
                        {waitingCount} <span className="text-xs sm:text-sm font-normal text-pink-400">/ {config.maxWaitCount}人</span>
                    </p>
                    </div>
                </div>
                <div className="w-px h-10 bg-pink-100 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-indigo-600">
                    <div className="bg-indigo-100 p-2 rounded-full"><Clock size={20} /></div>
                    <div>
                    <p className="text-xs sm:text-sm text-indigo-500 font-medium leading-none mb-1">預估時間</p>
                    <p className="text-lg sm:text-xl font-bold leading-none">{estimatedWaitTime} <span className="text-xs sm:text-sm font-normal">分鐘</span></p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button 
                    onClick={() => setIsChangeOrderModalOpen(true)}
                    className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 text-sm px-4 py-2 rounded-full font-bold shadow-sm active:scale-95 w-full sm:w-auto"
                >
                    <Edit3 size={16} /> 更改造型
                </button>
            </div>
        </div>
      </div>

      {isOrderFull && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">
                  {config.fullOrderMessage}
              </div>
          </div>
      )}

      {/* 🌟 魔法顧問按鈕 */}
      <div className="mb-6">
        <button 
          onClick={() => {
              if(isOrderFull) { setAlertMessage(config.fullOrderMessage); return; }
              setIsAiModalOpen(true);
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white px-6 py-3 rounded-2xl shadow-lg transition-all font-bold ${
              isOrderFull 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-fuchsia-500/30 active:scale-95'
          }`}
        >
          <Sparkles size={20} />
          不知道選什麼？問問 AI 魔法顧問！
        </button>
      </div>

      {/* 👑 VIP 專區 */}
      {config.showVipSection && displayVipBalloons.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 sm:p-6 rounded-3xl border border-yellow-200 shadow-sm relative">
              <h2 className="text-xl font-black text-amber-700 mb-4 flex items-center gap-2 drop-shadow-sm">
                  <Crown size={26} className="text-yellow-500 fill-yellow-500" />
                  VIP 專屬尊榮造型
              </h2>
              <div className={`grid gap-3 sm:gap-4 ${getGridColsClasses(config.vipThumbnailSize)}`}>
                  {displayVipBalloons.map(balloon => (
                      <button
                          key={`vip-${balloon.id}`}
                          onClick={() => handleBalloonClick(balloon, true)}
                          className={`group flex flex-col items-center rounded-2xl shadow-sm transition-all p-3 sm:p-4 border-2 border-transparent relative overflow-hidden ${
                              config.vipModeActive 
                                  ? 'bg-white/90 backdrop-blur-sm hover:shadow-md hover:border-yellow-400 hover:bg-white active:scale-95' 
                                  : 'bg-gray-100/60 opacity-75 cursor-not-allowed'
                          }`}
                      >
                          {!config.vipModeActive && (
                              <div className="absolute inset-0 bg-gray-500/10 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                  <div className="bg-gray-800/70 text-white p-2 rounded-full shadow-lg mb-1">
                                      <Lock size={24} />
                                  </div>
                              </div>
                          )}
                          <div className={`${getSizeClasses(config.vipThumbnailSize)} rounded-xl flex items-center justify-center mb-2 transition-transform overflow-hidden ${config.vipModeActive && 'group-hover:scale-110'} ${!isImageUrl(balloon.icon) ? (balloon.color || 'bg-gray-100') : ''}`}>
                              {isImageUrl(balloon.icon) ? (
                                  <img src={getDisplayImageUrl(balloon.icon)} alt={balloon.name} className="w-full h-full object-cover" />
                              ) : (balloon.icon)}
                          </div>
                          <span className="font-bold text-amber-900 text-sm sm:text-base">{balloon.name}</span>
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* 氣球網格 (一般造型) */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 bg-white/60 inline-block px-4 py-2 rounded-xl backdrop-blur-sm border border-white/50 shadow-sm">
        ✨ 選擇您想要的氣球造型
      </h2>
      
      <div className={`grid gap-3 sm:gap-4 ${getGridColsClasses(config.thumbnailSize)} ${isOrderFull ? 'opacity-60 grayscale-[50%]' : ''}`}>
        {displayBalloons.map(balloon => (
          <button
            key={balloon.id}
            onClick={() => handleBalloonClick(balloon, false)}
            className={`group flex flex-col items-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm transition-all p-3 sm:p-4 border-2 border-transparent ${
                isOrderFull ? 'cursor-not-allowed' : 'hover:shadow-md hover:border-pink-300 hover:bg-white active:scale-95'
            }`}
          >
            <div className={`${getSizeClasses(config.thumbnailSize)} rounded-xl flex items-center justify-center mb-2 transition-transform overflow-hidden ${!isOrderFull && 'group-hover:scale-110'} ${!isImageUrl(balloon.icon) ? (balloon.color || 'bg-gray-100') : ''}`}>
              {isImageUrl(balloon.icon) ? (
                <img src={getDisplayImageUrl(balloon.icon)} alt={balloon.name} className="w-full h-full object-cover" />
              ) : (
                balloon.icon
              )}
            </div>
            <span className="font-medium text-gray-700 text-sm sm:text-base">{balloon.name}</span>
          </button>
        ))}
      </div>

      {/* 📌 QR Code 浮動區塊 */}
      {config.qrCodeUrl && (
          <div className="fixed bottom-6 right-6 z-40 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.15)] border-4 border-white bg-white hover:scale-110 transition-transform origin-bottom-right">
              <img src={getDisplayImageUrl(config.qrCodeUrl)} alt="QR Code" className="w-full h-full object-cover" />
          </div>
      )}

      {/* --- Modals --- */}
      
      {/* 🌟 更改造型 Modal */}
      {isChangeOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl scale-in-center overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit3 className="text-indigo-500" /> 更改預訂造型
                </h3>
                <button onClick={() => {setIsChangeOrderModalOpen(false); setVerifiedOrderForChange(null); setNewSelectedBalloon(null); setChangeError(''); setChangeOrderNumber(''); setChangeOriginalBalloonId('');}} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {!verifiedOrderForChange ? (
                <div className="space-y-6">
                    <p className="text-sm text-gray-500">為了保護您的權益，請點選您的專屬號碼，並選擇您原本預訂的造型以進行驗證。</p>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">1. 點選您的專屬號碼 (#)</label>
                        {pendingOrders.length > 1 ? (
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                                {pendingOrders.slice(1).map(o => (
                                    <button 
                                        key={o.id}
                                        onClick={() => setChangeOrderNumber(o.orderNumber)}
                                        className={`w-14 h-14 rounded-xl font-black text-xl border-2 transition-all shadow-sm ${
                                            parseInt(changeOrderNumber) === o.orderNumber 
                                            ? 'bg-indigo-500 text-white border-indigo-500 scale-105' 
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                        }`}
                                    >
                                        {o.orderNumber}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                <p className="text-gray-500 font-medium">目前沒有可以更改的訂單喔！</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">2. 選擇原本預訂的造型</label>
                        <select 
                            value={changeOriginalBalloonId}
                            onChange={(e) => setChangeOriginalBalloonId(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-lg font-medium text-gray-700 bg-white"
                        >
                            <option value="">請選擇原本的造型...</option>
                            {allAvailableBalloons.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {changeError && (
                        <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                            <AlertCircle size={18} /> {changeError}
                        </div>
                    )}

                    <button 
                        onClick={handleVerifyOrderForChange}
                        disabled={!changeOrderNumber || !changeOriginalBalloonId}
                        className="w-full py-4 mt-2 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg"
                    >
                        驗證並開始更換
                    </button>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex justify-between items-center shadow-inner">
                        <div>
                            <p className="text-xs text-indigo-500 font-bold mb-1 uppercase tracking-wider">更換訂單</p>
                            <p className="font-black text-3xl text-indigo-700">#{verifiedOrderForChange.orderNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-indigo-500 font-bold mb-1">原造型</p>
                            <p className="font-bold text-indigo-400 line-through text-lg">{verifiedOrderForChange.balloonName}</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">👇 請選擇新的造型</h4>
                    <div className="grid grid-cols-3 gap-3 mb-6 max-h-60 overflow-y-auto p-1">
                        {allAvailableBalloons.map(balloon => (
                            <button
                                key={balloon.id}
                                onClick={() => setNewSelectedBalloon(balloon)}
                                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                                    newSelectedBalloon?.id === balloon.id 
                                        ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105' 
                                        : 'border-gray-100 bg-white hover:border-indigo-300 shadow-sm'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-1 overflow-hidden ${!isImageUrl(balloon.icon) ? (balloon.color || 'bg-gray-100') : ''}`}>
                                    {isImageUrl(balloon.icon) ? (
                                        <img src={getDisplayImageUrl(balloon.icon)} alt={balloon.name} className="w-full h-full object-cover" />
                                    ) : (balloon.icon)}
                                </div>
                                <span className="text-xs font-bold text-gray-700 text-center leading-tight">{balloon.name}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleConfirmChangeOrder}
                        disabled={!newSelectedBalloon}
                        className="w-full py-4 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg flex justify-center items-center gap-2"
                    >
                        <CheckCircle2 size={20} />
                        確定更換為 {newSelectedBalloon?.name || '...'}
                    </button>
                </div>
            )}
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
            
            <h3 className="text-2xl font-bold text-gray-800 mb-1">點單成功！</h3>
            <p className="text-gray-500 mb-6 font-medium text-sm">若您已加入官方 LINE<br/>可以點擊選單查詢即時製作進度喔！</p>
            
            <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-6 mb-6 relative">
              {successOrder.isVip && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Crown size={12} /> VIP 優先
                  </div>
              )}
              <p className="text-sm text-pink-600 font-medium mb-1">您的專屬號碼</p>
              <p className="text-6xl font-black text-pink-500 mb-4">#{successOrder.orderNumber}</p>
              
              <div className="flex items-center justify-center gap-2 text-gray-600 font-medium bg-white py-2 px-4 rounded-lg inline-flex shadow-sm">
                {isImageUrl(successOrder.icon) ? (
                  <img src={getDisplayImageUrl(successOrder.icon)} alt={successOrder.balloonName} className="w-6 h-6 object-cover rounded-md" />
                ) : (
                  <span className="text-2xl">{successOrder.icon}</span>
                )}
                <span>{successOrder.balloonName}</span>
              </div>
            </div>

            {successOrder.story && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 text-left relative overflow-hidden">
                <Sparkles size={80} className="absolute -top-4 -right-4 text-indigo-100 opacity-50" />
                <p className="text-sm text-indigo-800 font-medium leading-relaxed relative z-10">
                  {successOrder.story}
                </p>
              </div>
            )}

            <button 
              onClick={() => setSuccessOrder(null)}
              className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-black shadow-lg transition-colors text-lg"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 3. 管理員後台
  const AdminView = () => (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setView('guest')}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-600 font-medium bg-white px-4 py-2 rounded-xl shadow-sm"
        >
          <ChevronLeft size={20} /> 返回前台
        </button>
        <button 
          onClick={() => setView('settings')}
          className="flex items-center gap-2 text-white bg-gray-800 hover:bg-black px-4 py-2 rounded-xl shadow-sm transition-colors font-medium"
        >
          <SettingsIcon size={18} /> 系統設定
        </button>
      </div>

      {/* 👑 VIP 控制面板 */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl shadow-md p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white">
              <h3 className="font-black text-xl flex items-center gap-2 drop-shadow-sm"><Crown size={24}/> VIP 優先預訂模式</h3>
              <p className="text-yellow-50 font-medium text-sm mt-1">
                  {config.vipModeActive 
                    ? '🟢 模式已開啟：下一位點單的客人將直接成為第一順位！' 
                    : '⚫ 模式關閉中：點擊右方按鈕可開放一位 VIP 點單。'}
              </p>
          </div>
          <button 
              onClick={async () => {
                  const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'main');
                  await updateDoc(configRef, { vipModeActive: !config.vipModeActive });
              }}
              className={`px-6 py-3 rounded-xl font-black transition-all shadow-lg w-full sm:w-auto active:scale-95 ${
                  config.vipModeActive 
                  ? 'bg-white text-yellow-600 hover:bg-gray-50' 
                  : 'bg-yellow-700 text-white hover:bg-yellow-800'
              }`}
          >
              {config.vipModeActive ? '取消 VIP 模式' : '開啟 VIP 模式'}
          </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
        <div className="p-4 bg-pink-50 border-b border-pink-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            📋 待製作訂單 <span className="bg-pink-500 text-white px-2 py-0.5 rounded-full text-xs">{pendingOrders.length} / {config.maxWaitCount}</span>
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
              <div key={order.id} className={`p-4 flex items-center justify-between transition-colors ${order.isVip ? 'bg-yellow-50/50 hover:bg-yellow-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner ${order.isVip ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white' : 'bg-pink-100 text-pink-600'}`}>
                    #{order.orderNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      {order.balloonName} 
                      {index === 0 && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-bold shadow-sm">正在製作中</span>}
                      {order.isVip && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-bold"><Crown size={12}/> VIP</span>}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                      <span>{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 點單</span>
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
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-sm transition-colors font-bold active:scale-95"
                  >
                    <Check size={18} /> 完成
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 已完成訂單預覽 (🌟 顯示全部並加上卷軸) */}
      <div className="mt-8 opacity-80">
        <h3 className="text-sm font-bold text-gray-600 mb-3 px-2 flex items-center justify-between">
          已完成的訂單 ({orders.filter(o => o.status === 'completed').length} 筆)
        </h3>
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden max-h-60 overflow-y-auto shadow-inner">
          {orders.filter(o => o.status === 'completed').reverse().map(order => (
            <div key={order.id} className="p-3 border-b border-gray-200 last:border-0 flex items-center justify-between text-sm hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-bold">#{order.orderNumber}</span>
                <span className="text-gray-700 font-medium">{order.balloonName}</span>
                {order.isVip && <Crown size={12} className="text-amber-400" />}
              </div>
              <span className="text-gray-400 text-xs font-medium">
                {order.completedAt ? new Date(order.completedAt).toLocaleTimeString() : ''}
              </span>
            </div>
          ))}
          {orders.filter(o => o.status === 'completed').length === 0 && (
            <div className="p-4 text-center text-gray-400 text-xs font-medium">目前還沒有已完成的訂單喔</div>
          )}
        </div>
      </div>

      {/* 🌟 清空所有資料按鈕 */}
      <div className="mt-12 pt-6 border-t border-gray-200 flex justify-center pb-4">
        <button 
          onClick={() => setIsClearConfirmOpen(true)}
          className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95 border border-red-100 hover:border-red-500"
        >
          <Trash2 size={20} /> 清空本次活動所有訂單資料
        </button>
      </div>

      {/* 🌟 清空所有訂單確認 Modal (防呆機制) */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-inner">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-center text-gray-800 mb-2">確定要清空所有訂單嗎？</h3>
            <p className="text-center text-red-600 font-bold mb-6 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
              ⚠️ 警告：這個操作將會刪除「所有待製作」與「已完成」的訂單資料，且無法復原！
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleClearAllOrders}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
              >
                確認清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 4. 設定畫面
  const SettingsView = () => {
    const [formData, setFormData] = useState({
      gridSize: config.gridSize,
      timePerItem: config.timePerItem,
      balloons: config.balloons || DEFAULT_BALLOONS,
      title: config.title || '歡樂氣球工坊',
      thumbnailSize: config.thumbnailSize || 'md',
      loadingMessage: config.loadingMessage || '✨ 氣球魔法師正在為您的專屬氣球注入魔法語...',
      maxWaitCount: config.maxWaitCount || 20,
      fullOrderMessage: config.fullOrderMessage || '很抱歉，因為活動時間有限，目前的氣球訂單已經滿載囉！期待下次再為您服務！🎈',
      showVipSection: config.showVipSection || false,
      vipGridSize: config.vipGridSize || 12,
      vipThumbnailSize: config.vipThumbnailSize || 'md',
      vipBalloons: config.vipBalloons || [],
      bgStyle: config.bgStyle || '',
      qrCodeUrl: config.qrCodeUrl || '',
      adminPin: config.adminPin || '8888' // 🌟 密碼鎖設定
    });

    const [editingBalloon, setEditingBalloon] = useState(null);

    const handleAddBalloon = (isVipList = false) => {
      const list = isVipList ? formData.vipBalloons : formData.balloons;
      const newId = list.length > 0 ? Math.max(...list.map(b => b.id)) + 1 : 1;
      const newBalloon = { id: newId, name: '新造型', icon: '🎈', color: 'bg-gray-100 text-gray-600' };
      
      setFormData(prev => ({
          ...prev,
          [isVipList ? 'vipBalloons' : 'balloons']: [...list, newBalloon]
      }));
      setEditingBalloon({ ...newBalloon, isVipList });
    };

    const handleUpdateBalloon = (updatedBalloon) => {
      const listKey = updatedBalloon.isVipList ? 'vipBalloons' : 'balloons';
      setFormData(prev => ({
        ...prev,
        [listKey]: prev[listKey].map(b => b.id === updatedBalloon.id ? updatedBalloon : b)
      }));
      setEditingBalloon(null);
    };

    const handleDeleteBalloon = (id, isVipList) => {
      setConfirmAction({
        message: '確定要刪除這個造型嗎？',
        onConfirm: () => {
          const listKey = isVipList ? 'vipBalloons' : 'balloons';
          setFormData(prev => ({
            ...prev,
            [listKey]: prev[listKey].filter(b => b.id !== id)
          }));
          setEditingBalloon(null);
        }
      });
    };

    return (
      <div className="max-w-3xl mx-auto pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setView('admin')}
            className="p-2 bg-white text-gray-600 rounded-full shadow-sm hover:text-indigo-600"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black text-gray-800">系統設定</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-8 mb-6">
          
          {/* 基本顯示設定區塊 */}
          <div className="space-y-6">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-lg">外觀與基本設定</h3>
              
              {/* 🌟 密碼鎖設定 */}
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                <label className="block text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><Lock size={16}/> 管理員後台密碼 (PIN碼)</label>
                <input 
                  type="text" 
                  value={formData.adminPin}
                  onChange={(e) => setFormData({...formData, adminPin: e.target.value})}
                  className="w-full max-w-xs border-2 border-red-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-black text-red-900 tracking-widest text-lg"
                  placeholder="例如：8888"
                />
                <p className="text-xs text-red-500 mt-2 font-medium">為保護您的後台不被客人亂點，進入後台需輸入此密碼。（請務必記住喔！）</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">APP 標題名稱</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">前台背景 (圖片網址 或 色碼)</label>
                <input 
                  type="text" 
                  value={formData.bgStyle}
                  onChange={(e) => setFormData({...formData, bgStyle: e.target.value})}
                  placeholder="例如：貼上雲端照片網址，或輸入 #fdf2f8"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-gray-800"
                />
                <p className="text-xs text-gray-400 mt-1">留空將使用預設的粉色背景。支援 Google Drive 圖片連結。</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">置頂 QR Code (圖片網址)</label>
                <input 
                  type="text" 
                  value={formData.qrCodeUrl}
                  onChange={(e) => setFormData({...formData, qrCodeUrl: e.target.value})}
                  placeholder="請貼上您的 QR Code 圖片網址"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-gray-800"
                />
                <p className="text-xs text-gray-400 mt-1">設定後，QR Code 會永遠顯示在客人畫面的右下角。</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">點單成功時的載入訊息</label>
                <input 
                  type="text" 
                  value={formData.loadingMessage}
                  onChange={(e) => setFormData({...formData, loadingMessage: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-gray-800"
                />
              </div>
          </div>

          {/* 接單流程控管區塊 */}
          <div className="space-y-6 pt-6 border-t">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-lg">接單流程控管設定</h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">訂單等待人數上限</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
                      <button onClick={() => setFormData({...formData, maxWaitCount: Math.max(1, formData.maxWaitCount - 1)})} className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-indigo-500 text-xl">-</button>
                      <input 
                        type="number" 
                        value={formData.maxWaitCount}
                        onChange={(e) => setFormData({...formData, maxWaitCount: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="flex-1 text-center font-black text-3xl text-gray-800 bg-transparent outline-none w-full"
                      />
                      <button onClick={() => setFormData({...formData, maxWaitCount: formData.maxWaitCount + 1})} className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-indigo-500 text-xl">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">每個造型平均製作時間</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
                      <button onClick={() => setFormData({...formData, timePerItem: Math.max(1, formData.timePerItem - 1)})} className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-indigo-500 text-xl">-</button>
                      <div className="flex-1 text-center font-black text-3xl text-gray-800">{formData.timePerItem} <span className="text-sm font-normal text-gray-500">分</span></div>
                      <button onClick={() => setFormData({...formData, timePerItem: formData.timePerItem + 1})} className="w-12 h-12 bg-white rounded-lg shadow-sm font-bold text-indigo-500 text-xl">+</button>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">滿單(暫停接單)時的提示文字</label>
                <textarea 
                  value={formData.fullOrderMessage}
                  onChange={(e) => setFormData({...formData, fullOrderMessage: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-medium text-gray-700 resize-none h-24"
                />
              </div>
          </div>

          {/* 一般造型區塊設定 */}
          <div className="space-y-6 pt-6 border-t">
              <h3 className="font-bold text-gray-800 border-b pb-2 text-lg">一般造型區塊設定</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">前台顯示造型格數</label>
                    <input 
                      type="number" 
                      value={formData.gridSize}
                      onChange={(e) => setFormData({...formData, gridSize: Math.max(1, parseInt(e.target.value) || 1)})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">照片顯示大小</label>
                    <select 
                        value={formData.thumbnailSize}
                        onChange={(e) => setFormData({...formData, thumbnailSize: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-lg"
                    >
                        <option value="sm">小 (Small)</option>
                        <option value="md">中 (Medium)</option>
                        <option value="lg">大 (Large)</option>
                        <option value="xl">特大 (Extra Large)</option>
                    </select>
                  </div>
              </div>
          </div>

          {/* VIP 造型區塊設定 */}
          <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-amber-600 text-lg flex items-center gap-2"><Crown size={20}/> VIP 造型區塊設定</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.showVipSection} onChange={(e) => setFormData({...formData, showVipSection: e.target.checked})} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-400"></div>
                      <span className="ml-3 text-sm font-bold text-gray-700">{formData.showVipSection ? '在前台顯示' : '隱藏'}</span>
                  </label>
              </div>
              
              {formData.showVipSection && (
                  <div className="grid sm:grid-cols-2 gap-6 animate-in fade-in">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">前台顯示 VIP 格數</label>
                        <input 
                          type="number" 
                          value={formData.vipGridSize}
                          onChange={(e) => setFormData({...formData, vipGridSize: Math.max(1, parseInt(e.target.value) || 1)})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 font-bold text-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">VIP 照片顯示大小</label>
                        <select 
                            value={formData.vipThumbnailSize}
                            onChange={(e) => setFormData({...formData, vipThumbnailSize: e.target.value})}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 font-bold text-lg"
                        >
                            <option value="sm">小 (Small)</option>
                            <option value="md">中 (Medium)</option>
                            <option value="lg">大 (Large)</option>
                            <option value="xl">特大 (Extra Large)</option>
                        </select>
                      </div>
                  </div>
              )}
          </div>
        </div>

        {/* 氣球造型目錄管理 */}
        <div className="space-y-6">
            {/* 一般造型管理 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-lg font-black text-gray-800">🎈 一般造型目錄</label>
                    <button onClick={() => handleAddBalloon(false)} className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-100 font-bold transition-colors">
                    <Plus size={16} /> 新增造型
                    </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {formData.balloons.map(balloon => (
                    <button
                        key={balloon.id}
                        onClick={() => setEditingBalloon({...balloon, isVipList: false})}
                        className="relative group flex flex-col items-center bg-gray-50 rounded-xl p-2 border-2 border-transparent hover:border-indigo-300 transition-all shadow-sm"
                    >
                        <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 text-indigo-500"><Pencil size={12} /></div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-1 overflow-hidden ${!isImageUrl(balloon.icon) ? (balloon.color || 'bg-gray-200') : ''}`}>
                            {isImageUrl(balloon.icon) ? <img src={getDisplayImageUrl(balloon.icon)} alt={balloon.name} className="w-full h-full object-cover" /> : balloon.icon}
                        </div>
                        <span className="font-medium text-gray-600 text-xs truncate w-full text-center">{balloon.name}</span>
                    </button>
                    ))}
                </div>
            </div>

            {/* VIP 造型管理 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl shadow-sm border border-yellow-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-lg font-black text-amber-800 flex items-center gap-2"><Crown size={24}/> VIP 專屬造型目錄</label>
                    <button onClick={() => handleAddBalloon(true)} className="flex items-center gap-1 text-sm bg-white text-amber-600 px-4 py-2 rounded-xl hover:bg-yellow-100 font-bold transition-colors shadow-sm">
                    <Plus size={16} /> 新增 VIP 造型
                    </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {formData.vipBalloons.map(balloon => (
                    <button
                        key={balloon.id}
                        onClick={() => setEditingBalloon({...balloon, isVipList: true})}
                        className="relative group flex flex-col items-center bg-white/60 backdrop-blur-sm rounded-xl p-2 border-2 border-transparent hover:border-yellow-400 transition-all shadow-sm"
                    >
                        <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 text-yellow-600"><Pencil size={12} /></div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-1 overflow-hidden ${!isImageUrl(balloon.icon) ? (balloon.color || 'bg-gray-100') : ''}`}>
                            {isImageUrl(balloon.icon) ? <img src={getDisplayImageUrl(balloon.icon)} alt={balloon.name} className="w-full h-full object-cover" /> : balloon.icon}
                        </div>
                        <span className="font-bold text-amber-900 text-xs truncate w-full text-center">{balloon.name}</span>
                    </button>
                    ))}
                    {formData.vipBalloons.length === 0 && <p className="col-span-full text-center text-amber-600/50 py-4 font-medium">目前沒有 VIP 專屬造型，請點擊上方按鈕新增。</p>}
                </div>
            </div>
        </div>

        {/* 編輯氣球 Modal */}
        {editingBalloon && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center">
              <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${editingBalloon.isVipList ? 'text-amber-600' : 'text-gray-800'}`}>
                  {editingBalloon.isVipList ? <Crown size={24}/> : <ImageIcon size={24}/>} 
                  編輯{editingBalloon.isVipList ? ' VIP ' : ' '}氣球造型
              </h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">造型名稱</label>
                  <input 
                    type="text" 
                    value={editingBalloon.name}
                    onChange={e => setEditingBalloon({...editingBalloon, name: e.target.value})}
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none font-bold ${editingBalloon.isVipList ? 'focus:border-yellow-500 border-yellow-100 bg-yellow-50/30' : 'focus:border-indigo-500 border-gray-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">照片網址 或 Emoji</label>
                  <input 
                    type="text" 
                    value={editingBalloon.icon}
                    onChange={e => setEditingBalloon({...editingBalloon, icon: e.target.value})}
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none font-medium ${editingBalloon.isVipList ? 'focus:border-yellow-500 border-yellow-100 bg-yellow-50/30' : 'focus:border-indigo-500 border-gray-200'}`}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">支援貼上 Google Drive 分享連結。</p>
                </div>

                <div className="pt-2 flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-400 mb-2">預覽畫面</span>
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl overflow-hidden shadow-inner ${!isImageUrl(editingBalloon.icon) ? (editingBalloon.color || 'bg-gray-100') : ''}`}>
                    {isImageUrl(editingBalloon.icon) ? (
                      <img src={getDisplayImageUrl(editingBalloon.icon)} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      editingBalloon.icon
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleDeleteBalloon(editingBalloon.id, editingBalloon.isVipList)} className="p-4 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors" title="刪除">
                  <Trash2 size={24} />
                </button>
                <button onClick={() => setEditingBalloon(null)} className="flex-1 py-4 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-lg">
                  取消
                </button>
                <button onClick={() => handleUpdateBalloon(editingBalloon)} className={`flex-1 py-4 px-4 rounded-xl font-bold text-white shadow-lg transition-colors text-lg ${editingBalloon.isVipList ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30'}`}>
                  確定儲存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 底部固定儲存列 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => handleSaveConfig(formData)}
              className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-xl shadow-2xl shadow-gray-900/20 transition-all active:scale-[0.98] text-lg flex justify-center items-center gap-2"
            >
              <CheckCircle2 size={24} /> 儲存所有設定並返回
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans selection:bg-pink-200 selection:text-pink-900 transition-all duration-500" style={bgStyles}>
      {/* Header - 獨立查詢模式不顯示 */}
      {view !== 'tracker' && (
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-pink-100 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg flex items-center justify-center text-white shadow-sm">
                  🎈
                </div>
                <h1 className="font-black text-gray-800 text-lg sm:text-xl tracking-tight">{config.title || '歡樂氣球工坊'}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex"
                  title="切換全螢幕"
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
                {view === 'guest' && (
                    <button 
                        onClick={() => setAdminPinModalOpen(true)}
                        className="text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition-all active:scale-95"
                    >
                        <Lock size={14}/> 後台
                    </button>
                )}
                {view === 'admin' && <div className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">管理員後台</div>}
                {view === 'settings' && <div className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">系統設定</div>}
              </div>
            </div>
          </header>
      )}

      {/* Main Content */}
      <main className={`max-w-5xl mx-auto ${view === 'tracker' ? 'p-0' : 'px-4 py-6'}`}>
        {view === 'guest' && <GuestView />}
        {view === 'admin' && <AdminView />}
        {view === 'settings' && <SettingsView />}
        {view === 'tracker' && <TrackerView />}
      </main>
      
      {/* 🌟 全域客製化提示對話框 (Alert Modal) */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center text-center">
                <Info size={48} className="mx-auto text-indigo-500 mb-4" />
                <p className="text-gray-800 font-bold mb-6 text-lg leading-relaxed">{alertMessage}</p>
                <button onClick={() => setAlertMessage('')} className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-md">
                    我知道了
                </button>
            </div>
        </div>
      )}

      {/* 🌟 全域客製化確認對話框 (Confirm Modal) */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <p className="text-gray-800 font-bold mb-6 text-lg">{confirmAction.message}</p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmAction(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">取消</button>
                    <button onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition-colors">確定</button>
                </div>
            </div>
        </div>
      )}

      {/* 🌟 密碼鎖對話框 (PIN Modal) */}
      {adminPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-in-center text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-4">
                    <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-4">請輸入管理員密碼</h3>
                <input
                    type="password"
                    autoFocus
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-black text-center text-3xl tracking-widest mb-2"
                />
                {adminPinError && <p className="text-red-500 text-sm font-bold mb-4 animate-bounce">{adminPinError}</p>}
                <div className="flex gap-3 mt-6">
                    <button onClick={() => {setAdminPinModalOpen(false); setAdminPinError(''); setAdminPinInput('');}} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">取消</button>
                    <button onClick={handleAdminLogin} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md transition-colors">進入</button>
                </div>
            </div>
        </div>
      )}

      {/* CSS 動畫與自定義樣式 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in-center { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
        .scale-in-center { animation-name: scale-in-center; }
        .zoom-in { animation-name: zoom-in; }
      `}} />
    </div>
  );
}
