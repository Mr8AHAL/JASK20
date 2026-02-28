import React, { useState } from 'react';
import { Search, Bell, QrCode, Plus, Check, CheckCheck, Pin, Lock, Unlock, User, Bot, UserPlus, Phone, Video, MoreVertical, X, Users, ArrowRight, Send, MessageSquare, LogOut, Store, ShoppingBag, Edit2, Trash2, ChevronLeft, Image as ImageIcon, File, Download, Archive, Mic, Play, Pause, Square } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

const INITIAL_CHATS = [
  { id: 1, name: 'سوفیا', lastMessage: 'شما: سلام', date: '۴ اردیبهشت', isPinned: true, status: 'read', avatarType: 'icon', avatarColor: 'bg-orange-500' },
  { id: 2, name: 'هلوتیکا', lastMessage: 'شما: رسانه', date: '۲ خرداد', isLocked: true, status: 'read-orange', avatarType: 'image', avatar: 'https://picsum.photos/seed/temple/150/150' },
  { id: 3, name: 'اخفساز', lastMessage: 'شما: تماس', date: '۲۹ اردیبهشت', isLocked: true, status: 'read-orange', avatarType: 'color', avatarColor: 'bg-black' },
  { id: 4, name: 'ساریتا', lastMessage: 'شما: سلام', date: '۲۳ فروردین', status: 'sent', avatarType: 'icon', avatarColor: 'bg-orange-500' },
  { id: 5, name: 'سوجا', lastMessage: 'سلام، چطوری؟', date: 'دیروز', avatarType: 'image', avatar: 'https://picsum.photos/seed/person1/150/150' },
  { id: 6, name: 'جیمی', lastMessage: 'جیمی: اعلام برندگان ۲۴ آبان، ی...', date: '۲۰ آبان', avatarType: 'robot', avatarColor: 'bg-orange-100' },
  { id: 7, name: 'نیر', lastMessage: 'نیر: سلام', date: 'هفته پیش', avatarType: 'image', avatar: 'https://picsum.photos/seed/person2/150/150' },
];

const now = Date.now();
const INITIAL_CONTACTS = [
  { id: 101, name: 'آرش', username: 'arash_dev', status: 'در دسترس', isOnline: true, lastSeenTimestamp: now, avatarType: 'image', avatar: 'https://picsum.photos/seed/arash/150/150' },
  { id: 102, name: 'باران', username: 'baran_sky', status: 'مشغول', isOnline: false, lastSeen: '۲ ساعت پیش', lastSeenTimestamp: now - 2 * 3600000, avatarType: 'icon', avatarColor: 'bg-blue-500' },
  { id: 103, name: 'پدرام', username: 'pedram_p', status: 'در حال کار...', isOnline: true, lastSeenTimestamp: now, avatarType: 'image', avatar: 'https://picsum.photos/seed/pedram/150/150' },
];

export default function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authStep, setAuthStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [currentUser, setCurrentUser] = useState({ id: '', name: '', username: '', phone: '', avatar: '' });

  // App State
  const [activeTab, setActiveTab] = useState('چت‌ها');
  const [searchQuery, setSearchQuery] = useState('');
  const [direction, setDirection] = useState(0);
  const tabsList = ['چت‌ها', 'مخاطبین', 'اتاق‌ها', 'دیوار'];

  const handleTabChange = (newTab: string) => {
    const newIndex = tabsList.indexOf(newTab);
    const currentIndex = tabsList.indexOf(activeTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const markChatAsRead = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, status: 'read' } : chat
    ));
  };

  const handleOpenChat = (chat: any) => {
    setActiveChat(chat);
    if (!chat.isRoom) {
      markChatAsRead(chat.id);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabsList.indexOf(activeTab);
      if (currentIndex > 0) {
        handleTabChange(tabsList[currentIndex - 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = tabsList.indexOf(activeTab);
      if (currentIndex < tabsList.length - 1) {
        handleTabChange(tabsList[currentIndex + 1]);
      }
    },
    trackMouse: true,
  });
  const [activeChat, setActiveChat] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);

  const startLongPress = (chatId: number) => {
    const timer = setTimeout(() => {
      setIsSelectionMode(true);
      toggleChatSelection(chatId);
    }, 600);
    setLongPressTimer(timer);
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Update chat messages when active chat changes
  React.useEffect(() => {
    if (activeChat) {
      setChatMessages([
        { id: 1, text: 'سلام! خوبی؟', sender: 'them', time: '10:42', type: 'text' },
        { id: 2, text: 'سلام، ممنون. چه خبر؟', sender: 'me', time: '10:45', status: 'read', type: 'text' },
      ]);
    }
  }, [activeChat]);

  const handleSendMessage = (e: React.FormEvent, mediaData?: { type: 'image' | 'video' | 'file' | 'voice', url: string, name?: string, duration?: string }) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !mediaData) return;

    const newMessage = {
      id: Date.now(),
      text: messageInput,
      sender: 'me',
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: mediaData ? mediaData.type : 'text',
      mediaUrl: mediaData?.url,
      fileName: mediaData?.name,
      duration: mediaData?.duration
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    // Simulate read receipt
    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
    }, 3000);

    // Simulate typing and response
    setTimeout(() => {
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        const response = {
          id: Date.now() + 1,
          text: mediaData ? 'فایل دریافت شد، ممنون!' : 'بسیار عالی! خوشحالم که می‌شنوم.',
          sender: 'them',
          time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
        setChatMessages(prev => [...prev, response]);
      }, 2000);
    }, 500);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      let type: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      handleSendMessage(null as any, {
        type,
        url: reader.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setRecordingInterval(interval);
  };

  const stopRecording = (send: boolean = true) => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    setIsRecording(false);
    
    if (send && recordingTime > 0) {
      const minutes = Math.floor(recordingTime / 60);
      const seconds = recordingTime % 60;
      const duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      handleSendMessage(null as any, {
        type: 'voice',
        url: '#', // Mock URL
        duration
      });
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Data State
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [rooms, setRooms] = useState<any[]>([
    {
      id: 1,
      name: 'JASK20',
      description: 'اتاق عمومی JASK20 - خوش آمدید!',
      members: 1250,
      memberList: [
        { id: 101, name: 'آرش', username: 'arash_dev', avatarType: 'image', avatar: 'https://picsum.photos/seed/arash/150/150' },
        { id: 102, name: 'باران', username: 'baran_sky', avatarType: 'icon', avatarColor: 'bg-blue-500' },
        { id: 103, name: 'پدرام', username: 'pedram_p', avatarType: 'image', avatar: 'https://picsum.photos/seed/pedram/150/150' },
      ],
      avatarColor: 'bg-orange-500',
      isLocked: false,
      password: ''
    },
    {
      id: 2,
      name: 'برنامه‌نویسان',
      description: 'بحث و تبادل نظر درباره تکنولوژی',
      members: 450,
      memberList: [
        { id: 101, name: 'آرش', username: 'arash_dev', avatarType: 'image', avatar: 'https://picsum.photos/seed/arash/150/150' },
      ],
      avatarColor: 'bg-blue-500',
      isLocked: false,
      password: ''
    },
    {
      id: 3,
      name: 'بازارچه',
      description: 'خرید و فروش لوازم دست دوم',
      members: 890,
      memberList: [
        { id: 102, name: 'باران', username: 'baran_sky', avatarType: 'icon', avatarColor: 'bg-blue-500' },
      ],
      avatarColor: 'bg-green-500',
      isLocked: false,
      password: ''
    }
  ]);
  
  // Modals State
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomIsLocked, setNewRoomIsLocked] = useState(false);
  const [newRoomPassword, setNewRoomPassword] = useState('');
  
  const [passwordModal, setPasswordModal] = useState<{isOpen: boolean, roomId: number | null, mode: 'set' | 'enter'}>({ isOpen: false, roomId: null, mode: 'set' });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editUsernameInput, setEditUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isRoomMembersModalOpen, setIsRoomMembersModalOpen] = useState(false);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(false);
  const [activeAd, setActiveAd] = useState<any>(null);
  const [newAd, setNewAd] = useState<{ title: string, price: string, category: string, description: string, images: string[] }>({ title: '', price: '', category: 'کالای دیجیتال', description: '', images: [] });
  const [divarItems, setDivarItems] = useState([
    { id: 1, title: 'لپ‌تاپ گیمینگ ایسوس', price: '45000000', category: 'کالای دیجیتال', description: 'لپ‌تاپ کاملاً سالم و در حد نو. مناسب برای بازی و کارهای گرافیکی.', images: ['https://picsum.photos/seed/laptop/300/200'] },
    { id: 2, title: 'دوچرخه کوهستان', price: '8500000', category: 'ورزش و فراغت', description: 'دوچرخه کوهستان دنده‌ای، سایز ۲۶. بسیار تمیز.', images: ['https://picsum.photos/seed/bike/300/200'] },
    { id: 3, title: 'مبل راحتی ۷ نفره', price: '15000000', category: 'خانه و آشپزخانه', description: 'مبل راحتی ۷ نفره با پارچه نانو ضد لک. بدون پارگی.', images: ['https://picsum.photos/seed/sofa/300/200'] },
    { id: 4, title: 'گوشی سامسونگ S23', price: '38000000', category: 'کالای دیجیتال', description: 'گوشی سامسونگ S23 حافظه ۲۵۶ گیگ. بدون خط و خش.', images: ['https://picsum.photos/seed/phone/300/200'] },
  ]);

  const toEnglishDigits = (str: string) => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let result = str;
    for (let i = 0; i < 10; i++) {
      result = result.split(persianNumbers[i]).join(i.toString());
      result = result.split(arabicNumbers[i]).join(i.toString());
    }
    return result;
  };

  const formatPrice = (value: string | number) => {
    if (value === undefined || value === null) return '';
    const strValue = String(value);
    const digits = toEnglishDigits(strValue).replace(/\D/g, '');
    if (!digits) return '';
    const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return withCommas.replace(/\d/g, x => persianDigits[parseInt(x)]);
  };

  const [activeAdImageIndex, setActiveAdImageIndex] = useState(0);

  // SMS API State
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // --- Auth Handlers ---
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setIsLoading(true);
      setOtpError('');
      setFailedAttempts(0);
      setLockoutTimer(0);
      
      // Generate a random 5-digit OTP (based on the image example "12345")
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      setGeneratedOtp(code);

      try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Accept", "text/plain");
        myHeaders.append("x-api-key", "kgKG0Mm1wFoTMQY2ZmyP4Rs7TkqTYborFaLXduZQEAHuU6Xu");

        var raw = JSON.stringify({
          "mobile": phoneNumber,
          "templateId": 517780,
          "parameters": [
            {
              "name": "Code",
              "value": code
            }
          ]
        });

        var requestOptions: RequestInit = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        const response = await fetch("https://api.sms.ir/v1/send/verify", requestOptions);

        // Even if the API fails (e.g. invalid templateId), we proceed to OTP step for testing purposes
        // In a real app, you would check response.ok
        console.log('SMS API Response:', await response.text());
        setAuthStep('otp');
        
      } catch (error) {
        console.error('SMS API Error:', error);
        alert('خطا در ارتباط با سرور پیامک.');
        // Proceeding anyway for demo purposes
        setAuthStep('otp');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    if (otp === generatedOtp || otp === '12345') { // 12345 as fallback for testing
      setOtpError('');
      setFailedAttempts(0);
      setAuthStep('name');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setOtpError('تعداد دفعات مجاز به پایان رسید. لطفاً ۱ دقیقه صبر کنید.');
        setLockoutTimer(60);
        
        // Start countdown
        const interval = setInterval(() => {
          setLockoutTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setFailedAttempts(0);
              setOtpError('');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setOtpError('کد وارد شده اشتباه است.');
      }
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.name.trim().length >= 2) {
      // Generate a random 6-digit numeric ID for the user
      const newId = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentUser(prev => ({ ...prev, id: newId }));
      setIsLoggedIn(true);
    }
  };

  const handleGuestLogin = () => {
    const guestId = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentUser({
      id: guestId,
      name: 'کاربر مهمان',
      username: `guest_${guestId}`,
      phone: '0000000000',
      avatar: ''
    });
    setIsLoggedIn(true);
  };

  // --- Room Handlers ---
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    if (newRoomIsLocked && !newRoomPassword.trim()) {
      alert('لطفاً رمز عبور را وارد کنید.');
      return;
    }
    
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newRoom = {
      id: Date.now(),
      name: newRoomName,
      description: newRoomDescription,
      members: 1,
      avatarColor: randomColor,
      isLocked: newRoomIsLocked,
      password: newRoomPassword
    };

    setRooms([newRoom, ...rooms]);
    setIsCreateRoomModalOpen(false);
    setNewRoomName('');
    setNewRoomDescription('');
    setNewRoomIsLocked(false);
    setNewRoomPassword('');
  };

  const toggleRoomLock = (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const room = rooms.find(r => r.id === roomId);
    if (room?.isLocked) {
      setRooms(rooms.map(r => r.id === roomId ? { ...r, isLocked: false, password: '' } : r));
    } else {
      setPasswordModal({ isOpen: true, roomId, mode: 'set' });
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handleRoomClick = (room: any) => {
    if (room.isLocked) {
      setPasswordModal({ isOpen: true, roomId: room.id, mode: 'enter' });
      setPasswordInput('');
      setPasswordError('');
    } else {
      handleOpenChat({ ...room, isRoom: true });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    if (passwordModal.mode === 'set') {
      setRooms(rooms.map(r => r.id === passwordModal.roomId ? { ...r, isLocked: true, password: passwordInput } : r));
      setPasswordModal({ isOpen: false, roomId: null, mode: 'set' });
      setPasswordError('');
    } else if (passwordModal.mode === 'enter') {
      const room = rooms.find(r => r.id === passwordModal.roomId);
      if (room?.password === passwordInput) {
        handleOpenChat({ ...room, isRoom: true });
        setPasswordModal({ isOpen: false, roomId: null, mode: 'set' });
        setPasswordError('');
      } else {
        setPasswordError('رمز عبور اشتباه است!');
      }
    }
  };

  // --- Contact Handlers ---
  const handleAddContact = (e?: React.FormEvent, usernameToAdd?: string) => {
    if (e) e.preventDefault();
    const targetUsername = usernameToAdd || newContactUsername;
    
    if (!targetUsername.trim()) return;
    
    // Check if already in contacts
    if (contacts.some(c => c.name === targetUsername)) {
      alert('این کاربر از قبل در مخاطبین شما وجود دارد.');
      return;
    }

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newContact = {
      id: Date.now(),
      name: targetUsername,
      username: targetUsername.toLowerCase().replace(/\s/g, '_'),
      status: 'در دسترس',
      isOnline: true,
      lastSeenTimestamp: Date.now(),
      avatarType: 'color',
      avatarColor: randomColor
    };

    setContacts([newContact, ...contacts]);
    setIsAddContactModalOpen(false);
    setNewContactUsername('');
    
    if (!usernameToAdd) {
      alert(`کاربر ${targetUsername} با موفقیت به مخاطبین اضافه شد.`);
    }
  };

  const handleAddMemberToRoom = (room: any, contact: any) => {
    if (room.memberList.some((m: any) => m.id === contact.id)) {
      alert('این کاربر قبلاً در اتاق عضو شده است.');
      return;
    }
    const updatedRooms = rooms.map(r => {
      if (r.id === room.id) {
        return {
          ...r,
          members: r.members + 1,
          memberList: [...r.memberList, contact]
        };
      }
      return r;
    });
    setRooms(updatedRooms);
    // Update active chat if it's the current room
    if (activeChat && activeChat.id === room.id && activeChat.isRoom) {
      setActiveChat(updatedRooms.find(r => r.id === room.id));
    }
  };

  const handleDeleteChat = (chatId: number) => {
    if (window.confirm('آیا از حذف این گفتگو اطمینان دارید؟')) {
      setChats(prev => prev.filter(c => c.id !== chatId));
    }
  };

  const handlePinChat = (chatId: number) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isPinned: !c.isPinned } : c));
  };

  const handleArchiveChat = (chatId: number) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isArchived: !c.isArchived } : c));
  };

  const toggleChatSelection = (chatId: number) => {
    setSelectedChatIds(prev => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
        if (next.size === 0) setIsSelectionMode(false);
      } else {
        next.add(chatId);
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`آیا از حذف ${selectedChatIds.size} گفتگو اطمینان دارید؟`)) {
      setChats(prev => prev.filter(c => !selectedChatIds.has(c.id)));
      setIsSelectionMode(false);
      setSelectedChatIds(new Set());
    }
  };

  const handleBulkPin = () => {
    setChats(prev => prev.map(c => selectedChatIds.has(c.id) ? { ...c, isPinned: true } : c));
    setIsSelectionMode(false);
    setSelectedChatIds(new Set());
  };

  const handleBulkArchive = () => {
    setChats(prev => prev.map(c => selectedChatIds.has(c.id) ? { ...c, isArchived: true } : c));
    setIsSelectionMode(false);
    setSelectedChatIds(new Set());
  };

  const handleFabClick = () => {
    if (activeTab === 'اتاق‌ها') {
      setIsCreateRoomModalOpen(true);
    } else if (activeTab === 'مخاطبین') {
      setIsAddContactModalOpen(true);
    } else if (activeTab === 'چت‌ها') {
      setIsNewChatModalOpen(true);
    } else if (activeTab === 'دیوار') {
      setIsCreateAdModalOpen(true);
    }
  };

  // --- Render Helpers ---
  const renderAvatar = (item: any) => {
    if (item.avatarType === 'image') {
      return <img src={item.avatar} alt={item.name} className="w-full h-full rounded-full object-cover" />;
    }
    if (item.avatarType === 'icon') {
      return (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white ${item.avatarColor}`}>
          <User className="w-1/2 h-1/2" fill="currentColor" />
        </div>
      );
    }
    if (item.avatarType === 'robot') {
      return (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-orange-600 ${item.avatarColor}`}>
          <Bot className="w-1/2 h-1/2" fill="currentColor" />
        </div>
      );
    }
    if (item.avatarType === 'color') {
      return (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg ${item.avatarColor}`}>
          {item.name.charAt(0)}
        </div>
      );
    }
    return null;
  };

  // --- Views ---
  if (!isLoggedIn) {
    return (
      <div dir="rtl" className="flex justify-center items-center min-h-screen bg-gray-100 font-sans">
        <div className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden flex flex-col relative sm:border-[8px] sm:border-gray-800 p-8">
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange-500/30 mx-auto">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">به JASK20 خوش آمدید</h1>
            <p className="text-center text-gray-500 mb-8 text-sm">ارتباط امن، سریع و ناشناس</p>

            {authStep === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل خود را وارد کنید</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0912 345 6789"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-left focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all mb-4 text-lg tracking-wider"
                />
                <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mb-4">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'دریافت کد تایید'
                  )}
                </button>

                <div className="relative flex items-center justify-center mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <span className="relative px-3 bg-white text-xs text-gray-400">یا</span>
                </div>

                <button 
                  type="button" 
                  onClick={handleGuestLogin}
                  className="w-full py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  ورود به عنوان مهمان
                </button>
              </form>
            )}

            {authStep === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">کد تایید ارسال شده را وارد کنید</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  maxLength={5}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (otpError && failedAttempts < 3) setOtpError('');
                  }}
                  disabled={lockoutTimer > 0}
                  placeholder="-----"
                  className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-center focus:outline-none focus:ring-2 transition-all mb-2 text-2xl tracking-[1em] ${
                    otpError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-orange-500/50 focus:border-orange-500'
                  } ${lockoutTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                
                {/* Error Message */}
                <div className="min-h-[24px] mb-4">
                  {otpError && (
                    <p className="text-red-500 text-sm text-center animate-in fade-in zoom-in duration-200">
                      {otpError}
                      {lockoutTimer > 0 && <span className="block font-bold mt-1">{lockoutTimer} ثانیه</span>}
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={lockoutTimer > 0}
                  className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تایید کد
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setAuthStep('phone');
                    setOtpError('');
                    setFailedAttempts(0);
                    setLockoutTimer(0);
                  }} 
                  className="w-full py-3 text-gray-500 text-sm mt-2 hover:text-gray-800"
                >
                  ویرایش شماره موبایل
                </button>
              </form>
            )}

            {authStep === 'name' && (
              <form onSubmit={handleNameSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-sm leading-relaxed">
                  شماره موبایل شما کاملاً مخفی می‌ماند. سایر کاربران شما را فقط با <strong>نام کاربری</strong> پیدا می‌کنند.
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نام خود را وارد کنید</label>
                <input
                  type="text"
                  required
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  placeholder="مثال: علی رضایی"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all mb-4"
                />
                <button type="submit" className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                  ورود به برنامه
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeChat) {
    const isContact = contacts.some(c => c.name === activeChat.name);

    return (
      <div dir="rtl" className="flex justify-center items-center min-h-screen bg-gray-100 font-sans">
        <div className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden flex flex-col relative sm:border-[8px] sm:border-gray-800">
          {/* Chat Header */}
          <header className="px-4 py-3 bg-white/95 backdrop-blur-md flex items-center justify-between shadow-sm z-30 sticky top-0 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <button onClick={() => setActiveChat(null)} className="p-2 -ms-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowRight className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => activeChat.isRoom && setIsRoomMembersModalOpen(true)}>
                <div className="w-10 h-10 shrink-0 relative rounded-full overflow-hidden border border-gray-100 shadow-sm">
                  {renderAvatar(activeChat)}
                  {!activeChat.isRoom && <div className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="font-bold text-gray-900 text-[15px] leading-tight">{activeChat.name}</h2>
                  <p className="text-[11px] text-gray-500">
                    {activeChat.isRoom ? `${activeChat.members} عضو` : 'آخرین بازدید اخیراً'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5">
              {activeChat.isRoom && (
                <button 
                  onClick={() => setIsRoomMembersModalOpen(true)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  title="لیست اعضا"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
              {!activeChat.isRoom && !isContact && (
                <button 
                  onClick={() => handleAddContact(undefined, activeChat.name)}
                  className="p-2 text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                  title="افزودن به مخاطبین"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              )}
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative bg-[#f0f2f5]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
            
            <div className="text-center my-2 relative z-10">
              <span className="bg-white/80 backdrop-blur-sm text-gray-500 text-[11px] px-3 py-1 rounded-full shadow-sm border border-gray-100">{activeChat.date || '۴ اردیبهشت'}</span>
            </div>
            
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex items-end gap-2 max-w-[85%] relative z-10 ${msg.sender === 'me' ? 'self-start' : 'flex-row-reverse self-end'}`}
                >
                  <div className="w-9 h-9 shrink-0 mb-1 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    {msg.sender === 'them' ? (
                      renderAvatar(activeChat)
                    ) : (
                      currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                          {currentUser.name ? currentUser.name.charAt(0) : '?'}
                        </div>
                      )
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl shadow-sm relative ${
                    msg.sender === 'me' 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  }`}>
                    {msg.type === 'image' && (
                      <img src={msg.mediaUrl} alt="Media" className="rounded-lg mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.mediaUrl)} />
                    )}
                    {msg.type === 'video' && (
                      <video src={msg.mediaUrl} controls className="rounded-lg mb-2 max-w-full h-auto" />
                    )}
                    {msg.type === 'file' && (
                      <div className="flex items-center gap-3 bg-black/5 p-2 rounded-xl mb-2 border border-black/5">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <File className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{msg.fileName || 'فایل ارسالی'}</p>
                          <p className="text-[10px] opacity-60">فایل</p>
                        </div>
                        <button onClick={() => window.open(msg.mediaUrl)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {msg.type === 'voice' && (
                      <div className="flex items-center gap-3 min-w-[200px] py-1">
                        <button 
                          onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            msg.sender === 'me' ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
                          }`}
                        >
                          {playingVoiceId === msg.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ms-0.5" />}
                        </button>
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="flex items-end gap-[2px] h-6">
                            {[...Array(15)].map((_, i) => (
                              <motion.div
                                key={i}
                                animate={playingVoiceId === msg.id ? {
                                  height: [8, 16, 12, 20, 10][i % 5],
                                } : { height: 8 }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                className={`w-[3px] rounded-full ${
                                  msg.sender === 'me' ? 'bg-white/40' : 'bg-orange-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-[10px] opacity-70">
                            <span>{msg.duration || '00:00'}</span>
                            <span>{playingVoiceId === msg.id ? 'در حال پخش...' : 'پیام صوتی'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {msg.text && <p className="text-[15px] leading-relaxed">{msg.text}</p>}
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] ${msg.sender === 'me' ? 'text-orange-100' : 'text-gray-400'}`}>{msg.time}</span>
                      {msg.sender === 'me' && (
                        msg.status === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-white" /> : <Check className="w-3.5 h-3.5 text-orange-200" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-row-reverse items-center gap-2 self-end z-10"
                >
                  <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    {renderAvatar(activeChat)}
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[11px] text-gray-400">در حال نوشتن...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2 z-20 relative">
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-0 bottom-full bg-white border-t border-gray-100 p-4 flex items-center justify-between z-30 shadow-2xl rounded-t-3xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                        <Mic className="w-6 h-6" />
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-red-500 rounded-full -z-10"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-red-500 font-bold text-lg tabular-nums">{formatTime(recordingTime)}</span>
                      <span className="text-xs text-gray-400">در حال ضبط...</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => stopRecording(false)}
                      className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      لغو
                    </button>
                    <button 
                      onClick={() => stopRecording(true)}
                      className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      توقف و ارسال
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isMediaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full right-4 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[160px]"
                >
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">تصویر</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleMediaUpload(e); setIsMediaMenuOpen(false); }} />
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">ویدیو</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => { handleMediaUpload(e); setIsMediaMenuOpen(false); }} />
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                      <File className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">فایل</span>
                    <input type="file" className="hidden" onChange={(e) => { handleMediaUpload(e); setIsMediaMenuOpen(false); }} />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
                className={`p-2 rounded-full transition-all shrink-0 ${isMediaMenuOpen ? 'bg-orange-500 text-white rotate-45' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Plus className="w-6 h-6" />
              </button>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="پیام خود را بنویسید..." 
                  className="w-full bg-gray-100 rounded-2xl py-2.5 px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              {messageInput.trim() ? (
                <button 
                  type="submit"
                  className="w-11 h-11 bg-orange-500 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                >
                  <Send className="w-5 h-5 -ms-0.5" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={startRecording}
                  className="w-11 h-11 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center shrink-0 hover:bg-gray-200 transition-all active:scale-95"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  const filteredChats = chats
    .filter(chat => chat.name.includes(searchQuery))
    .filter(chat => showArchived ? chat.isArchived : !chat.isArchived)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const archivedCount = chats.filter(c => c.isArchived).length;
  const sortedContacts = contacts
    .filter(contact => contact.name.includes(searchQuery))
    .sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return (b.lastSeenTimestamp || 0) - (a.lastSeenTimestamp || 0);
    });
  const filteredRooms = rooms
    .filter(room => room.name.includes(searchQuery))
    .sort((a, b) => b.members - a.members);

  return (
    <div dir="rtl" className="flex justify-center items-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden flex flex-col relative sm:border-[8px] sm:border-gray-800">
        
        {/* Status Bar Placeholder (Desktop only) */}
        <div className="hidden sm:flex justify-between items-center px-6 pt-4 pb-2 text-xs font-medium">
          <span>8:46</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-3 bg-black rounded-sm"></div>
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div className="w-5 h-3 border border-black rounded-sm relative">
              <div className="absolute inset-0.5 bg-black rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Dynamic Island Placeholder */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-50"></div>

        {/* Header */}
        <header className="px-5 pt-8 sm:pt-4 pb-4 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg border border-orange-200 overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                (currentUser.name || currentUser.username || '?').charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-800 hidden">JASK20</h1>
          </div>
          <div className="flex items-center gap-5 text-gray-700">
            <button onClick={() => setIsQrModalOpen(true)} className="hover:text-orange-500 transition-colors">
              <QrCode className="w-6 h-6 text-orange-500" strokeWidth={2} />
            </button>
            <button onClick={() => setIsNotificationsModalOpen(true)} className="hover:text-orange-500 transition-colors relative">
              <Bell className="w-6 h-6" strokeWidth={2} />
              <span className="absolute top-0 end-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex px-2">
          {tabsList.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                handleTabChange(tab);
                setSearchQuery('');
              }}
              className={`flex-1 py-3 text-center font-medium text-[15px] transition-colors relative ${
                activeTab === tab ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 inset-x-4 h-0.5 bg-orange-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 pt-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100/80 rounded-xl py-2.5 ps-10 pe-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div {...swipeHandlers} className="flex-1 overflow-x-hidden relative">
          {/* Selection Toolbar */}
          <AnimatePresence>
            {isSelectionMode && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-0 inset-x-0 h-16 bg-white z-[60] flex items-center justify-between px-4 border-b border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => { setIsSelectionMode(false); setSelectedChatIds(new Set()); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                  <span className="font-bold text-lg text-gray-900">{selectedChatIds.size} انتخاب شده</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleBulkPin} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="سنجاق">
                    <Pin className="w-5 h-5" />
                  </button>
                  <button onClick={handleBulkArchive} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="آرشیو">
                    <Archive className="w-5 h-5" />
                  </button>
                  <button onClick={handleBulkDelete} className="p-2 hover:bg-gray-100 rounded-full text-red-500 transition-colors" title="حذف">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? '-100%' : '100%',
                  opacity: 0,
                }),
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  zIndex: 0,
                  x: dir < 0 ? '-100%' : '100%',
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 overflow-y-auto pb-24"
            >
              
              {/* Chats Tab Content */}
              {activeTab === 'چت‌ها' && (
                <>
                  {/* Archived Chats Row */}
                  {!showArchived && archivedCount > 0 && (
                    <div 
                      onClick={() => setShowArchived(true)}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 group"
                    >
                      <div className="me-4 shrink-0 w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <Archive className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[16px] text-gray-900">گفتگوهای آرشیو شده</h3>
                        <p className="text-[13px] text-gray-500">{archivedCount} گفتگو</p>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                    </div>
                  )}

                  {/* Back to Main Chats (when in archived view) */}
                  {showArchived && (
                    <div 
                      onClick={() => setShowArchived(false)}
                      className="flex items-center px-4 py-3 bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500 rotate-180 me-3" />
                      <h3 className="font-bold text-[16px] text-gray-900">بازگشت به چت‌ها</h3>
                    </div>
                  )}

                  {filteredChats.map((chat) => (
                    <div key={chat.id} className="relative overflow-hidden group border-b border-gray-50">
                      {/* Swipe Actions Background */}
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        {/* Right side (revealed on swipe left) - Delete & Archive */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleArchiveChat(chat.id); }}
                            className="bg-blue-500 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                          >
                            <Archive className="w-5 h-5" />
                            <span className="text-[10px] font-bold">آرشیو</span>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                            className="bg-red-500 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="text-[10px] font-bold">حذف</span>
                          </button>
                        </div>

                        {/* Left side (revealed on swipe right) - Pin */}
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePinChat(chat.id); }}
                            className="bg-orange-500 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                          >
                            <Pin className="w-5 h-5" />
                            <span className="text-[10px] font-bold">{chat.isPinned ? 'برداشتن' : 'سنجاق'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Chat Item Foreground */}
                      <motion.div 
                        drag="x"
                        dragConstraints={{ left: -140, right: 80 }}
                        dragElastic={0.1}
                        onPointerDown={() => !isSelectionMode && startLongPress(chat.id)}
                        onPointerUp={cancelLongPress}
                        onPointerLeave={cancelLongPress}
                        onClick={() => {
                          if (isSelectionMode) {
                            toggleChatSelection(chat.id);
                          } else {
                            handleOpenChat(chat);
                          }
                        }} 
                        className={`relative flex items-center px-4 py-3 cursor-pointer transition-all z-10 ${
                          selectedChatIds.has(chat.id) ? 'bg-orange-50' : 'bg-white'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                          <div className="me-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedChatIds.has(chat.id) ? 'bg-orange-500 border-orange-500 scale-110' : 'border-gray-300 scale-100'
                            }`}>
                              {selectedChatIds.has(chat.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        )}
                        <div className="me-4 shrink-0 relative w-14 h-14 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                          {renderAvatar(chat)}
                          {chat.status === 'read' && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                              <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                          )}
                        </div>
                    
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <h3 className="font-medium text-[16px] text-gray-900 truncate flex items-center gap-1.5">
                              {chat.name}
                              {chat.isLocked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                            </h3>
                            <span className="text-xs text-gray-400 whitespace-nowrap ms-2 font-medium">{chat.date}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <p className="text-[14px] text-gray-500 truncate me-2">{chat.lastMessage}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {chat.isPinned && <Pin className="w-3.5 h-3.5 text-orange-500 fill-orange-500 -rotate-45" />}
                              {chat.status === 'read' && <CheckCheck className="w-4 h-4 text-gray-300" />}
                              {chat.status === 'read-orange' && <CheckCheck className="w-4 h-4 text-orange-500" />}
                              {chat.status === 'sent' && <Check className="w-4 h-4 text-gray-300" />}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
              {filteredChats.length === 0 && (
                <div className="text-center text-gray-500 mt-10">چتی یافت نشد.</div>
              )}
            </>
          )}

          {/* Contacts Tab Content */}
          {activeTab === 'مخاطبین' && (
            <>
              {/* Add New Contact Button */}
              <div onClick={() => setIsAddContactModalOpen(true)} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100">
                <div className="me-4 shrink-0 w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[16px] text-orange-500">افزودن مخاطب جدید</h3>
                </div>
              </div>

              {/* Contacts List */}
              <div className="mt-2">
                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  مخاطبین من ({sortedContacts.length})
                </div>
                {sortedContacts.map((contact) => (
                  <div key={contact.id} onClick={() => handleOpenChat(contact)} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div className="me-4 shrink-0 relative w-14 h-14 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                      {renderAvatar(contact)}
                      {/* Online Status Indicator */}
                      {contact.isOnline && (
                        <div className="absolute bottom-0 end-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-medium text-[16px] text-gray-900 truncate">
                          {contact.name}
                        </h3>
                        {!contact.isOnline && contact.lastSeen && (
                          <span className="text-xs text-gray-400 whitespace-nowrap ms-2">{contact.lastSeen}</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] text-gray-500 truncate me-2">{contact.status}</p>
                      </div>
                    </div>

                    {/* Quick Actions (Visible on hover or always on mobile) */}
                    <div className="flex items-center gap-3 ms-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                      <button className="hover:text-orange-500 transition-colors p-1">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="hover:text-orange-500 transition-colors p-1">
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {sortedContacts.length === 0 && (
                  <div className="text-center text-gray-500 mt-10">مخاطبی یافت نشد.</div>
                )}
              </div>
            </>
          )}

          {/* Rooms Tab Content */}
          {activeTab === 'اتاق‌ها' && (
            <>
              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Bot className="w-16 h-16 text-gray-300 mb-4" />
                  <p>اتاق‌های گفتگو به زودی اضافه می‌شوند.</p>
                  <p className="text-sm mt-2">برای ساخت اولین اتاق روی دکمه + کلیک کنید.</p>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    اتاق‌های من ({filteredRooms.length})
                  </div>
                  {filteredRooms.map((room) => (
                    <div key={room.id} onClick={() => handleRoomClick(room)} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group">
                      <div className="me-4 shrink-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${room.avatarColor}`}>
                          <Users className="w-7 h-7" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="font-medium text-[16px] text-gray-900 truncate flex items-center gap-1.5">
                            {room.name}
                            {room.isLocked && <Lock className="w-3.5 h-3.5 text-orange-500" />}
                          </h3>
                          <span className="text-xs text-gray-400 whitespace-nowrap ms-2 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {room.members}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-[13px] text-gray-500 truncate me-2">{room.description || 'بدون توضیحات'}</p>
                        </div>
                      </div>

                      {/* Lock/Unlock Toggle Button */}
                      <div className="ms-2">
                        <button 
                          onClick={(e) => toggleRoomLock(room.id, e)}
                          className={`p-2 rounded-full transition-colors ${room.isLocked ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                          title={room.isLocked ? "باز کردن قفل اتاق" : "قفل کردن اتاق"}
                        >
                          {room.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredRooms.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">اتاقی یافت نشد.</div>
                  )}
                </div>
              )}
            </>
          )}

              {/* Divar Tab Content */}
              {activeTab === 'دیوار' && (
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {divarItems.filter(item => item.title.includes(searchQuery)).map(item => (
                      <div key={item.id} onClick={() => { setActiveAd(item); setActiveAdImageIndex(0); }} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                        <div className="relative aspect-square bg-gray-100">
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                          {item.images.length > 1 && (
                            <div className="absolute top-2 end-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                              <ImageIcon className="w-3 h-3" />
                              {item.images.length}
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{item.title}</h3>
                          <div className="mt-auto">
                            <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                            <p className="font-bold text-orange-600 text-sm">{formatPrice(item.price)} تومان</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {divarItems.filter(item => item.title.includes(searchQuery)).length === 0 && (
                    <div className="text-center text-gray-500 mt-10">آگهی یافت نشد.</div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FAB */}
        <button 
          onClick={handleFabClick}
          className="absolute bottom-6 end-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 transition-all active:scale-95 z-10"
        >
          {activeTab === 'مخاطبین' ? <UserPlus className="w-6 h-6" /> : activeTab === 'چت‌ها' ? <MessageSquare className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>

        {/* Create Ad Modal */}
        {isCreateAdModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:rounded-[2.5rem]">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                <h2 className="text-lg font-bold text-gray-800">ثبت آگهی جدید</h2>
                <button 
                  onClick={() => setIsCreateAdModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const ad = {
                  id: Date.now(),
                  title: newAd.title,
                  price: newAd.price.replace(/\D/g, ''),
                  category: newAd.category,
                  description: newAd.description,
                  images: newAd.images.length > 0 ? newAd.images : [`https://picsum.photos/seed/${Date.now()}/300/200`]
                };
                setDivarItems([ad, ...divarItems]);
                setIsCreateAdModalOpen(false);
                setNewAd({ title: '', price: '', category: 'کالای دیجیتال', description: '', images: [] });
              }} className="p-4 overflow-y-auto flex-1">
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عکس‌های آگهی</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {newAd.images.map((img, index) => (
                        <div key={index} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200">
                          <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                              const newImages = [...newAd.images];
                              newImages.splice(index, 1);
                              setNewAd({...newAd, images: newImages});
                            }}
                            className="absolute top-1 end-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <div className="relative w-24 h-24 shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer">
                        <Plus className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">افزودن</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []) as File[];
                            files.forEach(file => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewAd(prev => ({...prev, images: [...prev.images, reader.result as string]}));
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان آگهی</label>
                    <input
                      type="text"
                      required
                      value={newAd.title}
                      onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                      placeholder="مثال: دوچرخه کوهستان"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان)</label>
                    <input
                      type="text"
                      required
                      value={formatPrice(newAd.price)}
                      onChange={(e) => setNewAd({...newAd, price: toEnglishDigits(e.target.value).replace(/\D/g, '')})}
                      placeholder="مثال: ۸,۵۰۰,۰۰۰"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                    <select
                      value={newAd.category}
                      onChange={(e) => setNewAd({...newAd, category: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    >
                      <option value="کالای دیجیتال">کالای دیجیتال</option>
                      <option value="ورزش و فراغت">ورزش و فراغت</option>
                      <option value="خانه و آشپزخانه">خانه و آشپزخانه</option>
                      <option value="وسایل نقلیه">وسایل نقلیه</option>
                      <option value="املاک">املاک</option>
                      <option value="سایر">سایر</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                    <textarea
                      value={newAd.description}
                      onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                      placeholder="توضیحات آگهی خود را بنویسید..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateAdModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={!newAd.title.trim() || !newAd.price.trim()}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ثبت آگهی
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ad Details Modal */}
        {activeAd && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300 sm:rounded-[2.5rem] overflow-hidden">
            <header className="px-4 py-3 flex items-center gap-4 border-b border-gray-100 shrink-0 bg-white z-10">
              <button onClick={() => setActiveAd(null)} className="p-2 -ms-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowRight className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-gray-900 text-lg">جزئیات آگهی</h2>
            </header>
            
            <div className="flex-1 overflow-y-auto pb-24">
              <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.img 
                    key={activeAdImageIndex}
                    src={activeAd.images[activeAdImageIndex]} 
                    alt={`${activeAd.title} - ${activeAdImageIndex + 1}`} 
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe < -10000 && activeAdImageIndex < activeAd.images.length - 1) {
                        setActiveAdImageIndex(prev => prev + 1);
                      } else if (swipe > 10000 && activeAdImageIndex > 0) {
                        setActiveAdImageIndex(prev => prev - 1);
                      }
                    }}
                  />
                </AnimatePresence>
                
                {activeAd.images.length > 1 && (
                  <>
                    <div className="absolute bottom-4 end-4 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm z-10">
                      <ImageIcon className="w-4 h-4" />
                      {formatPrice(activeAdImageIndex + 1)} از {formatPrice(activeAd.images.length)}
                    </div>
                    
                    {/* Navigation Dots */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
                      {activeAd.images.map((_: any, idx: number) => (
                        <button 
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setActiveAdImageIndex(idx); }}
                          className={`w-2 h-2 rounded-full transition-all ${idx === activeAdImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                    
                    {/* Navigation Arrows (Desktop) */}
                    <div className="hidden sm:flex absolute inset-y-0 inset-x-4 items-center justify-between z-10 pointer-events-none">
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(activeAdImageIndex > 0) setActiveAdImageIndex(prev => prev - 1); }}
                        className={`pointer-events-auto w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-800 shadow-sm hover:bg-white transition-all ${activeAdImageIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                      >
                        <ChevronLeft className="w-5 h-5 rotate-180" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(activeAdImageIndex < activeAd.images.length - 1) setActiveAdImageIndex(prev => prev + 1); }}
                        className={`pointer-events-auto w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-800 shadow-sm hover:bg-white transition-all ${activeAdImageIndex === activeAd.images.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{activeAd.title}</h1>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <span className="bg-gray-100 px-2.5 py-1 rounded-md">{activeAd.category}</span>
                  <span>•</span>
                  <span>دقایقی پیش</span>
                </div>
                
                <div className="flex justify-between items-center py-4 border-y border-gray-100 mb-6">
                  <span className="text-gray-600 font-medium">قیمت</span>
                  <span className="text-xl font-bold text-orange-600">{formatPrice(activeAd.price)} تومان</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">توضیحات</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                    {activeAd.description || 'توضیحاتی برای این آگهی ثبت نشده است.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100 sm:rounded-b-[2.5rem]">
              <button 
                onClick={() => {
                  setActiveAd(null);
                  handleTabChange('چت‌ها');
                  // In a real app, this would create a new chat with the ad owner
                  alert('درخواست چت برای آگهی دهنده ارسال شد.');
                }}
                className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <MessageSquare className="w-5 h-5" />
                چت با آگهی دهنده
              </button>
            </div>
          </div>
        )}

        {/* Add Contact Modal */}
        {isAddContactModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:rounded-[2.5rem]">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">افزودن مخاطب جدید</h2>
                <button 
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddContact} className="p-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-xl mb-4 text-xs leading-relaxed">
                  برای حفظ حریم خصوصی، جستجو و افزودن مخاطبین فقط از طریق <strong>نام کاربری</strong> یا <strong>آیدی عددی</strong> امکان‌پذیر است.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری یا آیدی عددی</label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={newContactUsername}
                      onChange={(e) => setNewContactUsername(e.target.value)}
                      placeholder="مثال: 123456 یا username"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 ps-10 pe-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={!newContactUsername.trim()}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    جستجو و افزودن
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {passwordModal.isOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:rounded-[2.5rem]">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">
                  {passwordModal.mode === 'set' ? 'تنظیم رمز عبور' : 'ورود به اتاق خصوصی'}
                </h2>
                <button 
                  onClick={() => setPasswordModal({ isOpen: false, roomId: null, mode: 'set' })}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="رمز عبور را وارد کنید"
                    className={`w-full bg-gray-50 border rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 transition-all ${
                      passwordError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-orange-500/50 focus:border-orange-500'
                    }`}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1.5 animate-in fade-in zoom-in duration-200">
                      {passwordError}
                    </p>
                  )}
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordModal({ isOpen: false, roomId: null, mode: 'set' });
                      setPasswordError('');
                    }}
                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={!passwordInput.trim()}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    تایید
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Room Members Modal */}
      <AnimatePresence>
        {isRoomMembersModalOpen && activeChat && activeChat.isRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoomMembersModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">اعضای اتاق</h3>
                  <p className="text-sm text-gray-500">{activeChat.name}</p>
                </div>
                <button onClick={() => setIsRoomMembersModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">اعضای فعلی ({activeChat.memberList?.length || 0})</div>
                {activeChat.memberList?.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="w-10 h-10 shrink-0">
                      {renderAvatar(member)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{member.username}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">افزودن عضو جدید</div>
                {contacts
                  .filter(contact => !activeChat.memberList?.some((m: any) => m.id === contact.id))
                  .map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                      <div className="w-10 h-10 shrink-0">
                        {renderAvatar(contact)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{contact.name}</p>
                        <p className="text-xs text-gray-500 truncate">@{contact.username}</p>
                      </div>
                      <button 
                        onClick={() => handleAddMemberToRoom(activeChat, contact)}
                        className="p-2 bg-orange-100 text-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500 hover:text-white"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                {contacts.filter(contact => !activeChat.memberList?.some((m: any) => m.id === contact.id)).length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-400">مخاطب جدیدی برای اضافه کردن وجود ندارد.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
        {isCreateRoomModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:rounded-[2.5rem]">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">ساخت اتاق جدید</h2>
                <button 
                  onClick={() => setIsCreateRoomModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateRoom} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام اتاق</label>
                    <input
                      type="text"
                      required
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="مثال: برنامه‌نویسان"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات (اختیاری)</label>
                    <textarea
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="در مورد این اتاق بنویسید..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isLocked"
                      checked={newRoomIsLocked}
                      onChange={(e) => setNewRoomIsLocked(e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isLocked" className="text-sm text-gray-700 cursor-pointer select-none">
                      اتاق خصوصی (نیاز به رمز عبور)
                    </label>
                  </div>

                  {newRoomIsLocked && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-3">
                      <input
                        type="password"
                        required
                        value={newRoomPassword}
                        onChange={(e) => setNewRoomPassword(e.target.value)}
                        placeholder="رمز عبور اتاق را وارد کنید"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateRoomModalOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={!newRoomName.trim()}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ساخت اتاق
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile View */}
        {isProfileOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right-full duration-300 sm:rounded-[2.5rem]">
            {/* Profile Header */}
            <header className="px-4 py-3 flex items-center gap-4 border-b border-gray-100">
              <button onClick={() => setIsProfileOpen(false)} className="p-2 -ms-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowRight className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-gray-900 text-lg">پروفایل من</h2>
            </header>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-4xl border-4 border-white shadow-lg mb-4 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    (currentUser.name || currentUser.username || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <label className="absolute bottom-4 end-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center border-4 border-white cursor-pointer hover:bg-orange-600 transition-colors shadow-md">
                  <Plus className="w-5 h-5" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0] as File | undefined;
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCurrentUser({...currentUser, avatar: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{currentUser.name || currentUser.username}</h3>
              <p className="text-gray-500 mb-8" dir="ltr">{phoneNumber}</p>

              <div className="w-full space-y-2">
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">آیدی عددی شما</p>
                      <p className="font-medium text-gray-900 font-mono tracking-widest text-lg" dir="ltr">
                        {currentUser.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">نام کاربری</p>
                      <p className="font-medium text-gray-900" dir="ltr">
                        {currentUser.username ? `@${currentUser.username}` : 'تنظیم نشده'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => {
                    setEditUsernameInput(currentUser.username);
                    setIsEditProfileModalOpen(true);
                  }} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">شماره موبایل</p>
                      <p className="font-medium text-gray-900" dir="ltr">{phoneNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">اعلان‌ها</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-orange-500 rounded-full relative cursor-pointer">
                    <div className="absolute end-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-auto w-full space-y-2 mb-6">
                <button 
                  onClick={() => {
                    setIsLoggedIn(false);
                    setAuthStep('phone');
                    setIsProfileOpen(false);
                    setPhoneNumber('');
                    setOtp('');
                    setCurrentUser({ id: '', name: '', username: '', phone: '', avatar: '' });
                  }}
                  className="w-full py-3.5 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  خروج از حساب کاربری
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm('آیا از حذف حساب کاربری خود اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
                      setIsLoggedIn(false);
                      setAuthStep('phone');
                      setIsProfileOpen(false);
                      setPhoneNumber('');
                      setOtp('');
                      setCurrentUser({ id: '', name: '', username: '', phone: '', avatar: '' });
                      setChats([]);
                      setContacts([]);
                      setRooms([]);
                    }
                  }}
                  className="w-full py-3.5 bg-red-50 text-red-500 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  حذف حساب کاربری
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditProfileModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:rounded-[2.5rem]">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">ویرایش نام کاربری</h2>
                <button 
                  onClick={() => {
                    setIsEditProfileModalOpen(false);
                    setUsernameError('');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const usernameRegex = /^[a-zA-Z0-9_.]+$/;
                if (!usernameRegex.test(editUsernameInput)) {
                  setUsernameError('نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد، نقطه و خط تیره پایین (_) باشد.');
                  return;
                }
                if (editUsernameInput.length < 3) {
                  setUsernameError('نام کاربری باید حداقل ۳ کاراکتر باشد.');
                  return;
                }
                // Mock taken usernames
                const takenUsernames = ['admin', 'jask20', 'test'];
                if (takenUsernames.includes(editUsernameInput.toLowerCase())) {
                  setUsernameError('این نام کاربری قبلاً توسط شخص دیگری انتخاب شده است.');
                  return;
                }
                
                setCurrentUser({...currentUser, username: editUsernameInput});
                setIsEditProfileModalOpen(false);
                setUsernameError('');
              }} className="p-4">
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={editUsernameInput}
                  onChange={(e) => {
                    setEditUsernameInput(e.target.value);
                    if (usernameError) setUsernameError('');
                  }}
                  placeholder="username"
                  className={`w-full bg-gray-50 border rounded-xl py-2.5 px-3 text-[15px] focus:outline-none focus:ring-2 transition-all ${
                    usernameError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-orange-500/50 focus:border-orange-500'
                  }`}
                />
                {usernameError && (
                  <p className="text-red-500 text-xs mt-2 leading-relaxed animate-in fade-in zoom-in duration-200">
                    {usernameError}
                  </p>
                )}
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => {
                    setIsEditProfileModalOpen(false);
                    setUsernameError('');
                  }} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">انصراف</button>
                  <button type="submit" disabled={!editUsernameInput.trim()} className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">ذخیره</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {isQrModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:rounded-[2.5rem]" onClick={() => setIsQrModalOpen(false)}>
            <div className="bg-white rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 p-8 flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-800 mb-2">کد QR شما</h2>
              <p className="text-sm text-gray-500 mb-6 text-center">دوستانتان می‌توانند با اسکن این کد شما را پیدا کنند.</p>
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 mb-6 p-4">
                <QRCodeSVG 
                  value={`jask20://user/${currentUser.id}`} 
                  size={160}
                  level="H"
                  fgColor="#1f2937"
                  bgColor="#ffffff"
                />
              </div>
              <button onClick={() => setIsQrModalOpen(false)} className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">بستن</button>
            </div>
          </div>
        )}

        {/* Notifications Modal */}
        {isNotificationsModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:rounded-[2.5rem]" onClick={() => setIsNotificationsModalOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">اعلان‌ها</h2>
                <button onClick={() => setIsNotificationsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0"><Bot className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">به JASK20 خوش آمدید!</p>
                    <p className="text-xs text-gray-500 mt-1">حساب کاربری شما با موفقیت ایجاد شد.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Chat Modal */}
        {isNewChatModalOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300 sm:rounded-[2.5rem]">
            <header className="px-4 py-3 flex items-center gap-4 border-b border-gray-100">
              <button onClick={() => setIsNewChatModalOpen(false)} className="p-2 -ms-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowRight className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-gray-900 text-lg">شروع چت جدید</h2>
            </header>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="جستجوی مخاطب..." className="w-full bg-gray-100 rounded-xl py-2.5 ps-10 pe-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">مخاطبین شما</div>
                {contacts.map(contact => (
                  <div key={contact.id} onClick={() => {
                    setActiveChat(contact);
                    setIsNewChatModalOpen(false);
                  }} className="flex items-center px-2 py-3 hover:bg-gray-50 cursor-pointer rounded-xl transition-colors">
                    <div className="me-3 shrink-0 w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">{renderAvatar(contact)}</div>
                    <div className="flex-1"><h3 className="font-medium text-[16px] text-gray-900">{contact.name}</h3><p className="text-[13px] text-gray-500">{contact.status}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
