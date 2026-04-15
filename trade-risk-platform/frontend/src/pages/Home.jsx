function Home({ setPage }) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        🌍 国际贸易风险评估平台
      </h1>

      <p className="text-gray-600 mb-6">
        AI驱动的跨境贸易风险分析与决策辅助系统
      </p>

      <div className="grid grid-cols-3 gap-6">
        <Card title="📊 风险评估" desc="智能分析贸易风险" onClick={() => setPage("risk")} />
        <Card title="📜 政策查询" desc="实时获取国际法规" onClick={() => setPage("policy")} />
        <Card title="🤖 AI助手" desc="生成专业建议" onClick={() => setPage("ai")} />
        <Card title="🌐 翻译工具" desc="多语言快速转换" onClick={() => setPage("translate")} />
        <Card title="📰 风险动态" desc="掌握全球变化" onClick={() => setPage("news")} />
        <Card title="📚 推荐资源" desc="优质外贸工具与资讯" onClick={() => setPage("recommend")} />
      </div>
    </div>
  );
}

function Card({ title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-gray-600 mt-2">{desc}</p>
    </div>
  );
}

export default Home;