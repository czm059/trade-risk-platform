import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";  // 可选，支持表格等扩展语法
import { API_BASE_URL } from "../config"; 

// 可选：自定义样式组件
const MarkdownComponents = {
  // 自定义标题样式
  h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-3 mb-2" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-md font-semibold mt-2 mb-1" {...props} />,
  // 自定义列表样式
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
  // 自定义粗体
  strong: ({ node, ...props }) => <strong className="font-bold text-blue-700" {...props} />,
  // 自定义分隔线
  hr: ({ node, ...props }) => <hr className="my-3 border-gray-300" {...props} />,
  // 自定义代码块
  code: ({ node, inline, ...props }) => 
    inline ? (
      <code className="bg-gray-300 px-1 rounded text-sm" {...props} />
    ) : (
      <code className="block bg-gray-800 text-white p-2 rounded my-2 overflow-x-auto" {...props} />
    ),
  // 自定义引用块
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-blue-400 pl-3 my-2 text-gray-600 italic" {...props} />
  ),
  // 自定义链接
  a: ({ node, ...props }) => (
    <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
};

function AI() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "你好，我是你的国际贸易AI助手，可以问我任何问题～" },
  ]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const question = input;
    setInput("");

    const loadingMsg = { role: "ai", content: "思考中..." };
    setMessages((prev) => [...prev, loadingMsg]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", content: data.answer },
      ]);
    } catch (err) {
      console.error("请求失败:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", content: "请求失败，请检查后端是否启动" },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[80vh]">
      <h2 className="text-3xl font-bold mb-4">🤖 AI助手</h2>

      <div className="flex-1 overflow-y-auto bg-white/70 rounded-2xl p-4 shadow">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[85%] ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.role === "user" ? (
                // 用户消息：普通文本
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
              ) : (
                // AI消息：使用 Markdown 渲染
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}  // 支持表格等扩展语法
                  components={MarkdownComponents}  // 自定义样式
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 border p-3 rounded-lg"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 rounded-lg"
        >
          发送
        </button>
      </div>
    </div>
  );
}

export default AI;