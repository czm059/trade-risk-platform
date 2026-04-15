import { useState } from "react";
import Home from "./pages/Home";
import Risk from "./pages/Risk";
import Policy from "./pages/Policy";
import News from "./pages/News";
import AI from "./pages/AI";
import Translate from "./pages/Translate";
import Recommend from "./pages/Recommend";

function App() {
  const [page, setPage] = useState("home");

  const menu = [
    { key: "home", label: "首页" },
    { key: "risk", label: "风险评估" },
    { key: "policy", label: "政策查询" },
    { key: "news", label: "风险动态" },
    { key: "ai", label: "AI助手" },
    { key: "translate", label: "翻译工具" },
    { key: "recommend", label: "推荐资源" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-100">
      {/* 左侧菜单 */}
      <div className="w-64 bg-white/80 backdrop-blur-lg shadow-xl p-6">
  <h1 className="text-2xl font-bold mb-8 text-blue-600">
    🌍 Trade AI
  </h1>

  {menu.map((item) => (
    <div
      key={item.key}
      onClick={() => setPage(item.key)}
      className={`p-3 rounded-lg cursor-pointer mb-3 transition-all duration-200 ${
        page === item.key
          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
          : "hover:bg-gray-100"
      }`}
    >
      {item.label}
    </div>
  ))}
</div>

      {/* 内容区 */}
      <div className="flex-1 p-6">
        {page === "home" && <Home setPage={setPage} />}
        {page === "risk" && <Risk />}
        {page === "policy" && <Policy />}
        {page === "news" && <News />}
        {page === "ai" && <AI />}
        {page === "translate" && <Translate />}
        {page === "recommend" && <Recommend />}
      </div>
    </div>
  );
}

export default App;