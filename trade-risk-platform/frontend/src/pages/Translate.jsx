import { useState } from "react";
import { API_BASE_URL } from "../config";

function Translate() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [from, setFrom] = useState("中文");
  const [to, setTo] = useState("英文");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("请输入要翻译的内容");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          from_lang: from,
          to_lang: to,
        }),
      });

      const data = await response.json();

      if (data.code === 200) {
        setResult(data.result);
      } else {
        setError(data.message || "翻译失败，请重试");
      }
    } catch (err) {
      console.error("翻译请求失败:", err);
      setError("网络错误，请检查后端是否启动");
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert("已复制到剪贴板！");
    }
  };

  const swapLanguages = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    // 如果有翻译结果，也交换文本
    if (result) {
      setText(result);
      setResult("");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">🌐 AI智能翻译</h2>

      {/* 语言选择 */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="input flex-1"
          disabled={loading}
        >
          <option>中文</option>
          <option>英文</option>
          <option>日文</option>
          <option>韩文</option>
          <option>法文</option>
          <option>德文</option>
          <option>西班牙文</option>
          <option>俄文</option>
        </select>

        <button
          onClick={swapLanguages}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          disabled={loading}
          title="交换语言"
        >
          ⇄
        </button>

        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="input flex-1"
          disabled={loading}
        >
          <option>英文</option>
          <option>中文</option>
          <option>日文</option>
          <option>韩文</option>
          <option>法文</option>
          <option>德文</option>
          <option>西班牙文</option>
          <option>俄文</option>
        </select>
      </div>

      {/* 翻译区域 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 输入 */}
        <div className="bg-white/80 p-4 rounded-2xl shadow-lg">
          <h3 className="mb-2 font-bold text-gray-600">
            输入（{from}）
          </h3>

          <textarea
            className="w-full h-48 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="请输入要翻译的内容..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          
          <div className="mt-2 text-sm text-gray-500 text-right">
            {text.length} 字符
          </div>
        </div>

        {/* 输出 */}
        <div className="bg-white/80 p-4 rounded-2xl shadow-lg relative">
          <h3 className="mb-2 font-bold text-gray-600">
            输出（{to}）
          </h3>

          <div className="h-48 border rounded-lg p-3 bg-gray-50 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                  翻译中...
                </div>
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap">{result}</div>
            ) : (
              <div className="text-gray-400 flex items-center justify-center h-full">
                {error || "翻译结果将显示在这里"}
              </div>
            )}
          </div>

          {/* 复制按钮 */}
          {result && !loading && (
            <button
              onClick={copyText}
              className="absolute top-3 right-3 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            >
              复制
            </button>
          )}
          
          {result && !loading && (
            <div className="mt-2 text-sm text-gray-500">
              {result.length} 字符
            </div>
          )}
        </div>
      </div>

      {/* 按钮 */}
      <button
        onClick={handleTranslate}
        disabled={loading || !text.trim()}
        className={`mt-4 px-6 py-2 rounded-lg shadow transition ${
          loading || !text.trim()
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105"
        }`}
      >
        {loading ? "翻译中..." : "🚀 开始翻译"}
      </button>
      
      {/* 提示信息 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-600">
        💡 提示：支持中、英、日、韩、法、德、西、俄等多语言互译，基于AI大模型提供准确翻译
      </div>
    </div>
  );
}

export default Translate;