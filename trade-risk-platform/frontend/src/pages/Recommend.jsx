import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

function Recommend() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [categories, setCategories] = useState([]);

  // 获取资源数据
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/resources`)
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 200) {
          setData(res.data);
          setFilteredData(res.data);
          
          // 提取所有分类
          const allCategories = ["全部", ...new Set(res.data.map(item => item.category))];
          setCategories(allCategories);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("获取推荐资源失败:", err);
        setError("网络错误，请检查后端是否启动");
        setLoading(false);
      });
  }, []);

  // 分类筛选
  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "全部") {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter(item => item.category === category));
    }
  };

  // 获取分类的图标
  const getCategoryIcon = (category) => {
    const icons = {
      "全部": "📚",
      "政府官网": "🏛️",
      "数据平台": "📊",
      "国际组织": "🌐",
      "专业指南": "📖",
      "商业平台": "💼"
    };
    return icons[category] || "🔗";
  };

  // 获取分类的颜色样式
  const getCategoryStyle = (category) => {
    const styles = {
      "全部": "bg-gray-100 text-gray-700 hover:bg-gray-200",
      "政府官网": "bg-blue-100 text-blue-700 hover:bg-blue-200",
      "数据平台": "bg-green-100 text-green-700 hover:bg-green-200",
      "国际组织": "bg-purple-100 text-purple-700 hover:bg-purple-200",
      "专业指南": "bg-orange-100 text-orange-700 hover:bg-orange-200",
      "商业平台": "bg-pink-100 text-pink-700 hover:bg-pink-200"
    };
    return styles[category] || "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  // 获取资源标签的样式
  const getCategoryBadgeStyle = (category) => {
    const styles = {
      "政府官网": "bg-blue-50 text-blue-600 border-blue-200",
      "数据平台": "bg-green-50 text-green-600 border-green-200",
      "国际组织": "bg-purple-50 text-purple-600 border-purple-200",
      "专业指南": "bg-orange-50 text-orange-600 border-orange-200",
      "商业平台": "bg-pink-50 text-pink-600 border-pink-200"
    };
    return styles[category] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  // 加载状态
  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">📚 推荐资源</h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">加载资源中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">📚 推荐资源</h2>
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">📚 推荐资源</h2>

      {/* 分类标签筛选 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">按分类筛选：</p>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => filterByCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105"
                  : getCategoryStyle(category)
              }`}
            >
              <span>{getCategoryIcon(category)}</span>
              <span>{category}</span>
              {selectedCategory === category && (
                <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {filteredData.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mb-4 text-sm text-gray-500">
        共 <span className="font-semibold text-gray-700">{filteredData.length}</span> 个资源
        {selectedCategory !== "全部" && (
          <span>
            （{selectedCategory}分类下）
            <button
              onClick={() => filterByCategory("全部")}
              className="ml-2 text-blue-500 hover:underline"
            >
              查看全部
            </button>
          </span>
        )}
      </div>

      {/* 资源网格 */}
      <div className="grid grid-cols-2 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="bg-white/80 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition hover:-translate-y-1 flex flex-col"
          >
            {/* 标题行 */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800 flex-1">
                {item.title}
              </h3>
             
            </div>

            {/* 描述 */}
            <p className="text-gray-600 mb-4 flex-1">
              {item.desc}
            </p>

            {/* 标签信息 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryBadgeStyle(item.category)}`}>
                {getCategoryIcon(item.category)} {item.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                🌍 {item.country}
              </span>
              {item.tags && item.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs border border-gray-200">
                  #{tag}
                </span>
              ))}
            </div>

            {/* 跳转按钮 */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition hover:scale-105"
            >
              <span>🔗 访问官网</span>
              <span>→</span>
            </a>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredData.length === 0 && (
        <div className="text-center py-16 bg-white/50 rounded-2xl">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">该分类下暂无资源</p>
          <button
            onClick={() => filterByCategory("全部")}
            className="mt-4 text-blue-500 hover:underline"
          >
            查看全部资源
          </button>
        </div>
      )}

      {/* 底部提示 */}
      <div className="mt-6 p-4 bg-blue-50/50 rounded-lg text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <span>💡</span>
          <span>点击分类标签可筛选不同类型的资源，所有链接均为官方或权威第三方平台</span>
        </p>
      </div>
    </div>
  );
}

export default Recommend;