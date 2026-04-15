import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config"; 

function Policy() {
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selected, setSelected] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [intent, setIntent] = useState("");
  const [total, setTotal] = useState(0);

  // 热门搜索标签
  const hotTags = ["碳关税", "出口管制", "RCEP", "出口退税", "反倾销", "跨境电商", "半导体", "新能源汽车"];

  // 搜索政策
  const searchPolicies = async (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) {
      setError("请输入搜索关键词");
      return;
    }

    setLoading(true);
    setError("");
    setPolicies([]);
    setSuggestion("");
    setIntent("");
    setTotal(0);

    try {
      const response = await fetch(`${API_BASE_URL}/api/policy-search?keyword=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.code === 200) {
        setPolicies(data.data);
        setTotal(data.total);
        setIntent(data.intent);
        
        if (data.suggestion) {
          setSuggestion(data.suggestion);
        }

        // 如果没有搜索结果，显示提示
        if (data.data.length === 0) {
          setError("未找到相关政策和解读");
        }
      } else {
        setError("搜索失败，请重试");
      }
    } catch (err) {
      console.error("政策搜索失败:", err);
      setError("网络错误，请检查后端是否启动");
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    setSearchKeyword(keyword);
    searchPolicies(keyword);
  };

  // 处理标签点击
  const handleTagClick = (tag) => {
    setKeyword(tag);
    setSearchKeyword(tag);
    searchPolicies(tag);
  };

  // 处理回车搜索
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setKeyword("");
    setSearchKeyword("");
    setPolicies([]);
    setTotal(0);
    setIntent("");
    setSuggestion("");
    setError("");
  };

  // 返回列表
  const handleBack = () => {
    setSelected(null);
  };

  // 页面加载时显示热门政策（可选）
  useEffect(() => {
    // 可以默认显示一些推荐政策
    // searchPolicies("最新政策");
  }, []);

  // 👉 详情页
  if (selected) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          ← 返回搜索结果
        </button>

        <div className="bg-white/80 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <p className="text-gray-500">
              <span className="font-semibold">国家/地区：</span>{selected.country}
            </p>
            <p className="text-gray-500">
              <span className="font-semibold">发布时间：</span>{selected.date}
            </p>
            <p className="text-gray-500">
              <span className="font-semibold">来源：</span>{selected.source}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">政策摘要</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selected.summary}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">📜 智能政策查询</h2>

      {/* 搜索框 */}
      <div className="bg-white/80 p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入关键词（如：碳关税、出口管制、RCEP...）"
              className="w-full input pr-10"
              disabled={loading}
            />
            {keyword && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            disabled={loading || !keyword.trim()}
            className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 rounded-lg shadow transition ${
              loading || !keyword.trim() ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {loading ? "搜索中..." : "🔍 搜索"}
          </button>
        </div>

        {/* 热门标签 */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">热门搜索：</p>
          <div className="flex gap-2 flex-wrap">
            {hotTags.map((tag, i) => (
              <span
                key={i}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 bg-gray-100 rounded-full cursor-pointer hover:bg-blue-200 hover:text-blue-700 transition text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索信息 */}
      {(intent || total > 0) && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {intent && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                识别意图：{intent}
              </span>
            )}
            {total > 0 && (
              <span className="text-gray-600 text-sm">
                找到 <span className="font-semibold">{total}</span> 条相关政策
              </span>
            )}
          </div>
          {searchKeyword && (
            <span className="text-gray-500 text-sm">
              搜索："{searchKeyword}"
            </span>
          )}
        </div>
      )}

      {/* 提示信息 */}
      {suggestion && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          💡 {suggestion}
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">正在智能分析政策...</p>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && policies.length === 0 && searchKeyword && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg mb-2">未找到相关政策</p>
          <p className="text-gray-400 text-sm">试试其他关键词，如"碳关税"、"RCEP"等</p>
        </div>
      )}

      {/* 初始状态提示 */}
      {!loading && !error && policies.length === 0 && !searchKeyword && (
        <div className="text-center py-16 bg-white/50 rounded-2xl">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-600 text-lg mb-2">输入关键词开始搜索</p>
          <p className="text-gray-400 text-sm">支持智能意图识别，为您精准匹配相关政策</p>
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">试试这些：</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {hotTags.slice(0, 4).map((tag, i) => (
                <span
                  key={i}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 bg-white rounded-full cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition text-sm shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 结果列表 */}
      {!loading && policies.length > 0 && (
        <div className="space-y-4">
          {policies.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelected(item)}
              className="bg-white/80 p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition hover:-translate-y-1 border border-transparent hover:border-blue-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition">
                {item.title}
              </h3>

              <div className="flex flex-wrap gap-3 mb-3">
                <p className="text-sm text-gray-500">
                  <span className="inline-block w-16">国家/地区：</span>
                  <span className="font-medium text-gray-700">{item.country}</span>
                </p>
                <p className="text-sm text-gray-500">
                  <span className="inline-block w-16">来源：</span>
                  <span className="font-medium text-gray-700">{item.source}</span>
                </p>
                <p className="text-sm text-gray-500">
                  <span className="inline-block w-16">发布时间：</span>
                  <span className="font-medium text-gray-700">{item.date}</span>
                </p>
              </div>

              <p className="text-gray-600 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
              
              <div className="mt-3 text-right">
                <span className="text-blue-500 text-sm hover:underline">
                  查看详情 →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Policy;