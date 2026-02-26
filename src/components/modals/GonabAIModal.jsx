const GonabAIModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Saya Gonab AI, asisten pintar kamu. Ada yang bisa saya bantu hari ini di Nabire?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchGeminiResponse = async (userText, chatHistory) => {
    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const formattedHistory = chatHistory.slice(1).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
    formattedHistory.push({ role: 'user', parts: [{ text: userText }] });

    const payload = {
      contents: formattedHistory,
      systemInstruction: {
        parts: [{ text: "Kamu adalah Gonab AI, asisten virtual aplikasi Gonab di Kabupaten Nabire, Papua Tengah. Gunakan bahasa Indonesia santai (kamu/aku). Rekomendasikan GonabRide, GonabCar, GonabFood, GonabSend, atau GonabPay. Berikan jawaban singkat dan memikat." }]
      }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i <= 5; i++) {
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku bingung mau jawab apa.";
      } catch (error) {
        if (i === 5) return "Maaf ya, server Gonab AI lagi sibuk banget nih. Coba sapa aku lagi nanti!";
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    const currentInput = inputText;
    const currentMessages = [...messages];

    setMessages([...currentMessages, { role: 'user', text: currentInput }]);
    setInputText('');
    setIsTyping(true);

    const aiReply = await fetchGeminiResponse(currentInput, currentMessages);
    setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl relative animate-in slide-in-from-bottom duration-300 flex flex-col h-[85vh]">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-t-3xl flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full"><Bot size={24} /></div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Gonab AI</h3>
              <p className="text-xs text-green-100 flex items-center"><span className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></span> Online</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Tanya Gonab AI..." className="flex-1 bg-gray-100 px-4 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-green-500/50" />
            <button type="submit" disabled={!inputText.trim()} className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50"><Send size={20} className="ml-0.5" /></button>
          </form>
        </div>
      </div>
    </div>
  );
};