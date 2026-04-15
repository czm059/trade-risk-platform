import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function News() {
  const [selected, setSelected] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  // 获取风险动态
  const fetchNews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/risk-news`);
      const data = await response.json();

      if (data.code === 200) {
        setNewsList(data.data);
        // 记录更新时间
        setLastUpdate(new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }));
      } else {
        setError("获取风险动态失败");
      }
    } catch (err) {
      console.error("获取风险动态失败:", err);
      setError("网络错误，请检查后端是否启动");
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchNews();
  }, []);

  // 刷新数据
  const handleRefresh = () => {
    fetchNews();
  };

  // 根据风险等级获取样式
  const getRiskLevelStyle = (level) => {
    switch(level) {
      case "高风险":
        return {
          badge: "bg-red-100 text-red-700 border-red-200",
          dot: "bg-red-500",
          border: "border-l-red-500"
        };
      case "中风险":
        return {
          badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
          dot: "bg-yellow-500",
          border: "border-l-yellow-500"
        };
      case "低风险":
        return {
          badge: "bg-green-100 text-green-700 border-green-200",
          dot: "bg-green-500",
          border: "border-l-green-500"
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          dot: "bg-gray-500",
          border: "border-l-gray-500"
        };
    }
  };

  // 👉 详情页
  if (selected) {
    const levelStyle = getRiskLevelStyle(selected.level);
    
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-1 transition"
        >
          ← 返回动态列表
        </button>

        <div className={`bg-white/80 p-6 rounded-2xl shadow-lg border-l-4 ${levelStyle.border}`}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold">{selected.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${levelStyle.badge}`}>
              {selected.level}
            </span>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-500">
              <span className="font-semibold">信息来源：</span>{selected.source}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">详细内容</h3>
            <p className="text-gray-700 leading-relaxed">
              {selected.content || "暂无详细内容，请关注后续更新。"}
            </p>
          </div>
          
          {/* 相关建议 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-800 mb-2">💡 风险提示</p>
            <p className="text-gray-700 text-sm">
              {selected.level === "高风险" && "建议密切关注事态发展，及时调整贸易策略，必要时咨询专业人士。"}
              {selected.level === "中风险" && "建议保持关注，评估对业务的具体影响，做好应对预案。"}
              {selected.level === "低风险" && "风险可控，可按正常流程开展业务，但仍需关注后续变化。"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 👉 列表页
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">📰 风险动态</h2>
        
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              更新于 {lastUpdate}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <svg 
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {loading ? "刷新中..." : "刷新"}
          </button>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">加载风险动态中...</p>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
          >
            重试
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && newsList.length === 0 && (
        <div className="text-center py-20 bg-white/50 rounded-2xl">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">暂无风险动态</p>
          <p className="text-gray-400 text-sm mt-2">点击刷新按钮获取最新动态</p>
        </div>
      )}

      {/* 统计信息 */}
      {!loading && !error && newsList.length > 0 && (
        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-gray-600">
              高风险 <span className="font-semibold">
                {newsList.filter(n => n.level === "高风险").length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-gray-600">
              中风险 <span className="font-semibold">
                {newsList.filter(n => n.level === "中风险").length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-600">
              低风险 <span className="font-semibold">
                {newsList.filter(n => n.level === "低风险").length}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* 动态列表 */}
      {!loading && !error && newsList.length > 0 && (
        <div className="space-y-4">
          {newsList.map((item, index) => {
            const levelStyle = getRiskLevelStyle(item.level);
            
            return (
              <div
                key={index}
                onClick={() => setSelected(item)}
                className={`bg-white/80 p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition hover:-translate-y-1 border-l-4 ${levelStyle.border}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition flex-1">
                    {item.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${levelStyle.badge} ml-3`}>
                    {item.level}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span>📌</span>
                    <span>{item.source}</span>
                  </p>
                </div>

                {/* 如果有内容预览 */}
                {item.content && (
                  <p className="text-gray-600 line-clamp-2 text-sm">
                    {item.content}
                  </p>
                )}

                <div className="mt-3 text-right">
                  <span className="text-blue-500 text-sm hover:underline">
                    查看详情 →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 底部提示 */}
      {!loading && !error && newsList.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <span>📊</span>
            <span>数据来源：中国信保、商务部、路透社等权威渠道，每日更新</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default News;