import { useState } from "react";
import { API_BASE_URL } from "../config";

function Risk() {
  const [formData, setFormData] = useState({
    trade_country: "",
    goods_type: "",
    amount: "",
    transport: "",
    company_type: "一般企业"
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 国家列表（与后端数据库对应）
  const countries = [
    "美国", "欧盟", "日本", "韩国", "越南", 
    "印度", "俄罗斯", "巴西", "澳大利亚", "加拿大", "中东"
  ];

  // 运输方式列表
  const transportMethods = ["海运", "空运", "陆运", "铁路", "多式联运"];

  // 商品类型列表
  const goodsTypes = [
    "电子产品", "机械设备", "纺织品", "化工产品", 
    "农产品", "汽车及零部件", "医疗器械", "其他"
  ];

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 调用后端API进行风险评估
  const calculateRisk = async () => {
    // 表单验证
    if (!formData.trade_country) {
      setError("请选择贸易国家");
      return;
    }
    if (!formData.goods_type) {
      setError("请选择商品类型");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError("请输入有效的交易金额");
      return;
    }
    if (!formData.transport) {
      setError("请选择运输方式");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/risk-assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trade_country: formData.trade_country,
          goods_type: formData.goods_type,
          amount: parseFloat(formData.amount),
          transport: formData.transport,
          company_type: formData.company_type
        }),
      });

      const data = await response.json();

      if (data.code === 200) {
        setResult(data.data);
      } else {
        setError("评估失败，请重试");
      }
    } catch (err) {
      console.error("风险评估请求失败:", err);
      setError("网络错误，请检查后端是否启动");
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      trade_country: "",
      goods_type: "",
      amount: "",
      transport: "",
      company_type: "一般企业"
    });
    setResult(null);
    setError("");
  };

  // 根据风险等级获取颜色
  const getRiskColor = (level) => {
    switch(level) {
      case "高风险": return "text-red-600";
      case "中风险": return "text-orange-500";
      case "低风险": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">📊 智能风险评估</h2>

      {/* 输入区 */}
      <div className="bg-white/80 p-6 rounded-2xl shadow-lg mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* 贸易国家 - 下拉选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              贸易国家 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.trade_country}
              onChange={(e) => handleInputChange("trade_country", e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="">请选择国家/地区</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* 商品类型 - 下拉选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品类型 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.goods_type}
              onChange={(e) => handleInputChange("goods_type", e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="">请选择商品类型</option>
              {goodsTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* 交易金额 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              交易金额（万元） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="请输入金额"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="input"
              disabled={loading}
            />
          </div>

          {/* 运输方式 - 下拉选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              运输方式 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.transport}
              onChange={(e) => handleInputChange("transport", e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="">请选择运输方式</option>
              {transportMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* 企业类型 - 可选 */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              企业类型（可选）
            </label>
            <select
              value={formData.company_type}
              onChange={(e) => handleInputChange("company_type", e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="一般企业">一般企业</option>
              <option value="国有企业">国有企业</option>
              <option value="高新技术企业">高新技术企业</option>
              <option value="小微企业">小微企业</option>
            </select>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={calculateRisk}
            disabled={loading}
            className={`flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                评估中...
              </span>
            ) : (
              "🚀 开始评估"
            )}
          </button>
          
          <button
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            重置
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 结果区 */}
      {result && (
        <div className="bg-white/80 p-6 rounded-2xl shadow-lg animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">风险分析结果</h3>
            <span className="text-sm text-gray-500">
              数据源：{result.data_source}
            </span>
          </div>

          {/* 总体风险 */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">综合风险评分</span>
              <span className={`text-3xl font-bold ${getRiskColor(result.risk_level)}`}>
                {result.total_score}分
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">风险等级</span>
              <span className={`text-xl font-bold ${getRiskColor(result.risk_level)}`}>
                {result.risk_level}
              </span>
            </div>
          </div>

          {/* 分类风险 */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">风险详细分析</h4>
            {result.details && Object.entries(result.details).map(([key, value]) => (
              <Progress key={key} label={key} value={value} />
            ))}
          </div>

          {/* 风险原因 */}
          {result.reason && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <p className="font-semibold text-gray-700 mb-1">🔍 风险因素</p>
              <p className="text-gray-600">{result.reason}</p>
            </div>
          )}

          {/* AI建议 */}
          {result.suggestion && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-bold text-blue-800 mb-2">💡 AI智能建议</p>
              <p className="text-gray-700">{result.suggestion}</p>
            </div>
          )}
        </div>
      )}

      {/* 使用提示 */}
      {!result && !loading && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-1">📌 使用说明</p>
          <p>填写贸易国家、商品类型、交易金额和运输方式，系统将基于中国信保国别风险报告和商务部公开数据进行智能风险评估。</p>
          <p className="mt-2 text-xs text-gray-500">* 交易金额越大，风险系数会相应提高</p>
        </div>
      )}
    </div>
  );
}

// 进度条组件
function Progress({ label, value }) {
  // 根据分值确定颜色
  const getColorClass = (val) => {
    if (val >= 70) return "from-red-500 to-red-400";
    if (val >= 40) return "from-yellow-500 to-yellow-400";
    return "from-green-500 to-green-400";
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColorClass(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

export default Risk;