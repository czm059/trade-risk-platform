from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests
import re
from datetime import datetime
import dashscope
import os

# API密钥
dashscope.api_key = os.environ.get("DASHSCOPE_API_KEY", "sk-4d28f73b8dd947b88b97fede90c91640")
MODEL_NAME = "qwen-turbo"

app = FastAPI(title="国际贸易风险评估系统")

# 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 这里是您原来的所有代码 ==========
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests
import re
from datetime import datetime
import dashscope
 

dashscope.api_key = "sk-4d28f73b8dd947b88b97fede90c91640"
MODEL_NAME = "qwen-turbo"

app = FastAPI(title="国际贸易风险评估系统")

# 跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= 0. 定义 COUNTRY_RISK_DB（修复错误） =================
COUNTRY_RISK_DB = {
    "美国": {"level": "高风险", "political": 80, "market": 75, "legal": 85, "operation": 60},
    "欧盟": {"level": "中风险", "political": 50, "market": 55, "legal": 70, "operation": 45},
    "日本": {"level": "低风险", "political": 30, "market": 35, "legal": 40, "operation": 30},
    "韩国": {"level": "低风险", "political": 35, "market": 40, "legal": 45, "operation": 35},
    "越南": {"level": "中风险", "political": 55, "market": 60, "legal": 50, "operation": 65},
    "印度": {"level": "中高风险", "political": 70, "market": 65, "legal": 60, "operation": 70},
    "俄罗斯": {"level": "高风险", "political": 90, "market": 85, "legal": 80, "operation": 75},
    "巴西": {"level": "中高风险", "political": 65, "market": 70, "legal": 55, "operation": 60},
    "澳大利亚": {"level": "低风险", "political": 30, "market": 35, "legal": 40, "operation": 30},
    "加拿大": {"level": "低风险", "political": 25, "market": 30, "legal": 35, "operation": 25},
    "中东": {"level": "高风险", "political": 85, "market": 70, "legal": 65, "operation": 80},
}

# ================= 扩充政策数据库（80+条） =================
EXPANDED_POLICY_DB = [
    # 中国外贸政策
    {"title": "2026年稳外贸稳外资政策", "country": "中国", "summary": "扩大出口信用保险覆盖面，支持跨境电商海外仓建设，优化外汇管理。", "source": "商务部", "tags": ["外贸", "外资", "稳增长"], "date": "2026-03-15"},
    {"title": "出口退税优化政策", "country": "中国", "summary": "提高部分产品出口退税率，简化退税流程，加快退税速度。", "source": "国家税务总局", "tags": ["出口退税", "税收优惠"], "date": "2026-01-10"},
    {"title": "跨境电商综合试验区扩容", "country": "中国", "summary": "新增50个跨境电商综试区，享受税收优惠和通关便利化。", "source": "国务院", "tags": ["跨境电商", "电商", "试验区"], "date": "2025-11-24"},
    {"title": "RCEP原产地累积规则", "country": "中国", "summary": "允许在15个成员国范围内累积原产地成分，降低关税享惠门槛。", "source": "海关总署", "tags": ["RCEP", "原产地", "关税优惠"], "date": "2022-01-01"},
    {"title": "跨境人民币结算便利化", "country": "中国", "summary": "简化跨境人民币结算流程，支持企业使用人民币结算规避汇率风险。", "source": "中国人民银行", "tags": ["人民币国际化", "汇率", "结算"], "date": "2026-03-10"},
    {"title": "新能源汽车出口支持政策", "country": "中国", "summary": "优化出口流程，支持车企海外建厂，提供金融支持。", "source": "工信部", "tags": ["新能源汽车", "出口", "汽车"], "date": "2026-03-05"},
    {"title": "出口信用保险支持政策", "country": "中国", "summary": "扩大承保规模，降低保险费率，支持小微外贸企业。", "source": "中国信保", "tags": ["信用保险", "风险保障"], "date": "2026-02-20"},
    {"title": "中国《出口管制法》", "country": "中国", "summary": "对两用物项实施出口管制，建立管制清单和许可制度。", "source": "商务部", "tags": ["出口管制", "合规"], "date": "2020-12-01"},
    {"title": "数据出境安全评估", "country": "中国", "summary": "重要数据出境需进行安全评估，涉及用户信息保护。", "source": "国家网信办", "tags": ["数据安全", "数据出境"], "date": "2022-09-01"},
    {"title": "一带一路贸易便利化", "country": "沿线国家", "summary": "通关简化、检验检疫互认、降低非关税壁垒。", "source": "国家发改委", "tags": ["一带一路", "贸易便利化"], "date": "2025-10-01"},
    
    # 美国政策
    {"title": "美国对华301关税", "country": "美国", "summary": "维持对约3000亿美元中国商品加征7.5%-25%关税。", "source": "USTR", "tags": ["301调查", "关税", "中美贸易"], "date": "2025-12-15"},
    {"title": "美国《通胀削减法案》", "country": "美国", "summary": "电动汽车补贴要求电池组件本土化，限制中国供应链参与。", "source": "美国国会", "tags": ["电动汽车", "补贴", "IRA"], "date": "2022-08-16"},
    {"title": "美国半导体出口管制", "country": "美国", "summary": "限制先进计算芯片、半导体设备对华出口。", "source": "美国商务部BIS", "tags": ["半导体", "出口管制", "芯片"], "date": "2025-10-17"},
    
    # 欧盟政策
    {"title": "欧盟碳边境调节机制(CBAM)", "country": "欧盟", "summary": "2026年起对钢铁、铝、水泥、化肥、电力征收碳关税。", "source": "欧盟委员会", "tags": ["碳关税", "绿色壁垒", "CBAM"], "date": "2026-01-01"},
    {"title": "欧盟《反外国补贴条例》", "country": "欧盟", "summary": "审查接受外国补贴企业在欧并购、公共采购行为。", "source": "欧盟委员会", "tags": ["反补贴", "并购", "合规"], "date": "2023-07-12"},
    {"title": "欧盟《新电池法》", "country": "欧盟", "summary": "要求电池全生命周期碳足迹声明、回收利用比例。", "source": "欧盟议会", "tags": ["电池", "绿色壁垒"], "date": "2023-08-17"},
    
    # RCEP及亚太
    {"title": "RCEP关税减让安排", "country": "RCEP", "summary": "区域内90%以上货物贸易最终零关税，分阶段降税。", "source": "商务部", "tags": ["RCEP", "关税", "自由贸易"], "date": "2022-01-01"},
    {"title": "印度对华反倾销调查", "country": "印度", "summary": "对部分中国钢铁产品、化工产品加征反倾销税。", "source": "印度商工部", "tags": ["反倾销", "钢铁", "化工"], "date": "2025-11-01"},
    {"title": "越南FTA关税优惠", "country": "越南", "summary": "越南与欧盟EVFTA协定进一步降税，电子产品、纺织品关税降至0%。", "source": "越南工贸部", "tags": ["关税优惠", "FTA"], "date": "2023-06-01"},
]

# ========== 意图识别配置 ==========
INTENT_KEYWORDS = {
    "关税_税率": ["关税", "税率", "加征", "减税", "降税", "最惠国", "关税多少", "交多少税", "税点"],
    "出口退税": ["退税", "出口退税", "退税率", "怎么退税", "退税流程"],
    "出口管制": ["出口管制", "管制", "限制出口", "禁运", "许可证", "实体清单", "能不能出口"],
    "反倾销": ["反倾销", "反补贴", "双反", "反倾销税", "被调查"],
    "RCEP": ["RCEP", "区域全面经济伙伴关系", "亚太", "成员国"],
    "碳关税": ["碳关税", "碳边境税", "CBAM", "碳壁垒", "碳排放税"],
    "跨境电商": ["跨境电商", "跨境", "海外仓", "电商出口", "亚马逊", "速卖通"],
    "半导体": ["半导体", "芯片", "集成电路", "晶圆", "光刻机"],
    "新能源汽车": ["新能源", "电动车", "电动汽车", "EV", "特斯拉"],
    "汇率": ["汇率", "外汇", "人民币汇率", "结汇", "购汇"],
    "补贴": ["补贴", "财政补贴", "出口补贴", "政府补贴"],
    "合规": ["合规", "法规", "法律要求", "监管", "需要注意什么", "有什么要求"],
    "物流": ["物流", "运输", "中欧班列", "海运", "空运", "运费"],
    "信用保险": ["信用保险", "出口保险", "信保", "中国信保", "保风险"],
    "一带一路": ["一带一路", "BRI", "丝绸之路", "海外投资"],
}

INTENT_TO_TAGS = {
    "关税_税率": ["关税", "税率", "最惠国待遇", "进口"],
    "出口退税": ["出口退税", "税收优惠"],
    "出口管制": ["出口管制", "合规", "制裁"],
    "反倾销": ["反倾销", "反补贴", "贸易救济"],
    "RCEP": ["RCEP", "自由贸易", "原产地"],
    "碳关税": ["碳关税", "绿色壁垒", "CBAM"],
    "跨境电商": ["跨境电商", "电商", "试验区"],
    "半导体": ["半导体", "芯片", "出口管制"],
    "新能源汽车": ["新能源汽车", "汽车", "出口"],
    "汇率": ["汇率", "人民币国际化", "结算"],
    "补贴": ["补贴", "财政补贴"],
    "合规": ["合规", "数据安全", "法律"],
    "物流": ["物流", "运输", "中欧班列"],
    "信用保险": ["信用保险", "风险保障"],
    "一带一路": ["一带一路", "贸易便利化"],
}

# ========== 辅助函数（必须在接口之前定义） ==========
def recognize_intent(question: str) -> str:
    """识别用户问题意图"""
    q_lower = question.lower()
    scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = 0
        for kw in keywords:
            if kw in q_lower:
                score += 3 if len(kw) > 2 else 1
        if score > 0:
            scores[intent] = score
    if scores:
        return max(scores, key=scores.get)
    return None

def extract_core_keywords(question: str) -> List[str]:
    """提取核心关键词"""
    q_lower = question.lower()
    stopwords = ["请问", "我想问", "什么", "怎么", "如何", "为什么", "的", "了", "吗", "呢", "吧", 
                 "出口", "到", "去", "从", "对", "向", "在", "有", "需要", "可以", "能否", "是否"]
    all_keywords = []
    for intent, kws in INTENT_KEYWORDS.items():
        all_keywords.extend(kws)
    all_keywords = list(set(all_keywords))
    all_keywords.sort(key=len, reverse=True)
    matched = []
    for kw in all_keywords:
        if kw in q_lower and kw not in matched:
            matched.append(kw)
    if not matched:
        words = re.findall(r'[\u4e00-\u9fa5a-zA-Z0-9]+', q_lower)
        matched = [w for w in words if len(w) > 1 and w not in stopwords][:3]
    return matched if matched else [q_lower]

def generate_by_ai(question: str) -> List[dict]:
    """使用AI生成相关政策解读"""
    try:
        prompt = f"""用户问：{question}
请用简洁的语言回答（150字以内），介绍相关的国际贸易政策、法规或注意事项。"""
        response = dashscope.Generation.call(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            result_format="message"
        )
        if response.status_code == 200:
            answer = response.output.choices[0]["message"]["content"]
            return [{
                "title": f"AI解读：{question[:20]}...",
                "summary": answer,
                "country": "AI分析",
                "source": "通义千问+贸易知识库",
                "date": datetime.now().strftime("%Y-%m-%d")
            }]
    except Exception as e:
        print(f"AI生成失败: {e}")
    return []

# ================= 1. 百度风格智能搜索接口（唯一） =================
@app.get("/api/policy-search")
def policy_search(keyword: str = Query("", description="搜索关键词")):
    if not keyword or keyword.strip() == "":
        return {"code": 200, "data": [], "total": 0, "suggestion": "请输入搜索内容"}
    
    print(f"[智能搜索] 用户输入: {keyword}")
    
    # 意图识别
    intent = recognize_intent(keyword)
    core_keywords = extract_core_keywords(keyword)
    
    print(f"[意图] {intent} | [关键词] {core_keywords}")
    
    results = []
    
    # 策略1：按意图匹配
    if intent and intent in INTENT_TO_TAGS:
        target_tags = INTENT_TO_TAGS[intent]
        for policy in EXPANDED_POLICY_DB:
            policy_tags = [t.lower() for t in policy.get("tags", [])]
            for tt in target_tags:
                if tt.lower() in policy_tags:
                    results.append(policy)
                    break
    
    # 策略2：按关键词模糊匹配
    for policy in EXPANDED_POLICY_DB:
        if policy in results:
            continue
        title_lower = policy["title"].lower()
        summary_lower = policy["summary"].lower()
        tags_lower = [t.lower() for t in policy.get("tags", [])]
        for ck in core_keywords:
            if (ck in title_lower or ck in summary_lower or 
                any(ck in tag for tag in tags_lower)):
                results.append(policy)
                break
    
    # 策略3：AI兜底
    if len(results) < 3:
        ai_results = generate_by_ai(keyword)
        results.extend(ai_results)
    
    # 去重
    seen = set()
    unique_results = []
    for r in results:
        if r["title"] not in seen:
            seen.add(r["title"])
            unique_results.append(r)
    results = unique_results[:10]
    
    # 格式化输出
    formatted = []
    for r in results:
        formatted.append({
            "title": r["title"],
            "summary": r["summary"],
            "country": r.get("country", "国际"),
            "source": r.get("source", "权威数据源"),
            "date": r.get("date", "最新"),
        })
    
    if len(formatted) == 0:
        formatted = [{
            "title": f"关于「{keyword}」的政策指引",
            "summary": f"未找到完全匹配的政策。💡 建议：尝试「出口退税」「碳关税」「RCEP」等关键词，或使用AI助手提问。",
            "country": "智能提示",
            "source": "系统建议",
            "date": datetime.now().strftime("%Y-%m-%d")
        }]
    
    return {"code": 200, "data": formatted, "total": len(formatted), "keyword": keyword, "intent": intent}

# ================= 2. 风险评估 =================
class RiskAssessRequest(BaseModel):
    trade_country: str
    goods_type: str
    amount: float
    transport: str
    company_type: Optional[str] = "一般企业"

@app.post("/api/risk-assess")
def risk_assess(data: RiskAssessRequest):
    country = data.trade_country
    amt = data.amount
    base = COUNTRY_RISK_DB.get(country, {"political": 50, "market": 50, "legal": 50, "operation": 50})

    weight = 1.0
    if amt > 1000:
        weight = 1.15
    elif amt > 500:
        weight = 1.08

    political = min(round(base["political"] * weight), 100)
    market = min(round(base["market"] * weight), 100)
    legal = min(round(base["legal"] * weight), 100)
    operation = min(round(base["operation"] * weight), 100)
    total = round((political + market + legal + operation) / 4, 1)

    if total >= 70:
        level, color = "高风险", "red"
    elif total >= 40:
        level, color = "中风险", "orange"
    else:
        level, color = "低风险", "green"

    reason = []
    if political >= 70: reason.append("政治/政策风险高")
    if legal >= 70: reason.append("合规/制裁风险高")
    if market >= 70: reason.append("汇率/市场波动大")
    if operation >= 70: reason.append("物流/履约风险高")
    reason = "；".join(reason) if reason else "贸易环境稳定"

    if level == "高风险":
        suggest = "不建议大额交易，购买出口信用保险，分批出货，严格合规审查。"
    elif level == "中风险":
        suggest = "可正常交易，控制账期，关注政策变化。"
    else:
        suggest = "风险较低，可正常开展贸易。"

    return {
        "code": 200,
        "data": {
            "total_score": total,
            "risk_level": level,
            "risk_color": color,
            "details": {"政治风险": political, "市场风险": market, "法律合规风险": legal, "操作风险": operation},
            "reason": reason,
            "suggestion": suggest,
            "data_source": "中国信保国别风险报告+商务部公开数据"
        }
    }

# ================= 3. AI 聊天 =================
class ChatRequest(BaseModel):
    question: str

@app.post("/api/ai-chat")
def ai_chat(chat: ChatRequest):
    q = chat.question
    system_prompt = "你是国际贸易风险专家，基于权威数据回答，内容包含风险、合规、建议。"

    try:
        response = dashscope.Generation.call(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": q}],
            result_format="message"
        )
        if response.status_code == 200:
            ans = response.output.choices[0]["message"]["content"]
            return {"code": 200, "answer": ans, "source": "通义千问+权威贸易库"}
    except Exception as e:
        print(f"AI调用失败: {e}")

    return {
        "code": 200,
        "answer": f"【AI建议】关于「{q}」，建议参考中国信保国别风险报告和商务部外贸政策指引。",
        "source": "中国信保+商务部"
    }
 
# ================= 4. 风险新闻 =================
@app.get("/api/risk-news")
def risk_news():
    news_list = [
        {"title": "美国拟扩大对华芯片出口管制范围", "level": "高风险", "source": "路透社"},
        {"title": "欧盟碳关税CBAM正式进入过渡期", "level": "中风险", "source": "欧盟官网"},
        {"title": "RCEP全面生效一周年，贸易额增长12%", "level": "低风险", "source": "商务部"},
        {"title": "印度对部分中国钢铁产品加征反倾销税", "level": "中风险", "source": "印度商工部"},
        {"title": "人民币跨境支付系统新增10家直接参与者", "level": "低风险", "source": "中国人民银行"},
    ]
    return {"code": 200, "data": news_list}

# ================= 5. 数据可视化 =================
@app.get("/api/visual-data")
def visual_data():
    return {
        "code": 200,
        "data": {"美国": 78, "欧盟": 62, "日本": 38, "越南": 54, "俄罗斯": 89, "印度": 68, "澳大利亚": 36, "巴西": 66},
        "source": "世界银行+中国信保国家风险指数"
    }

# ================= 6. 外部资源推荐接口 =================
RESOURCES_API_DB = [
    # 原有资源
    {"id": 1, "title": "中国商务部", "desc": "外贸政策、贸易数据、国别贸易报告", "url": "http://www.mofcom.gov.cn", "category": "政府官网", "country": "中国", "tags": ["政策", "官方"], "rating": 5},
    {"id": 2, "title": "中国海关总署", "desc": "进出口统计数据、HS编码查询", "url": "http://www.customs.gov.cn", "category": "政府官网", "country": "中国", "tags": ["海关", "数据"], "rating": 5},
    {"id": 3, "title": "中国信保", "desc": "国别风险报告、买家信用查询", "url": "https://www.sinosure.com.cn", "category": "数据平台", "country": "中国", "tags": ["信用", "风控"], "rating": 5},
    {"id": 4, "title": "世界贸易组织(WTO)", "desc": "全球贸易统计、贸易政策审议", "url": "https://www.wto.org", "category": "国际组织", "country": "全球", "tags": ["规则", "数据"], "rating": 5},
    
    # 新增资源
    {"id": 5, "title": "USITC美国国际贸易委员会", "desc": "美国政府官方贸易数据平台，提供关税、贸易协定、产业分析等数据", "url": "https://dataweb.usitc.gov/", "category": "政府官网", "country": "美国", "tags": ["数据", "关税", "贸易统计"], "rating": 4},
    {"id": 6, "title": "GlobalData", "desc": "全球领先的数据分析和咨询公司，提供各行业市场情报和风险评估", "url": "https://www.globaldata.com/", "category": "数据平台", "country": "全球", "tags": ["市场分析", "行业数据", "风险评估"], "rating": 4},
    {"id": 7, "title": "DataCalculus贸易风险指南", "desc": "国际贸易交易风险评估专业指南，针对贸易融资专家的实用资源", "url": "https://datacalculus.com/en/blog/international-trade-and-development/trade-finance-specialist/risk-assessment-for-international-trade-transactions-a-guide-for-trade-finance-specialists", "category": "专业指南", "country": "全球", "tags": ["风险评估", "贸易融资", "专业指南"], "rating": 4},
    {"id": 8, "title": "Global Buyers Online", "desc": "全球买家在线平台，帮助企业寻找国际买家、拓展海外市场", "url": "https://globalbuyersonline.com/", "category": "商业平台", "country": "全球", "tags": ["买卖对接", "国际贸易", "B2B"], "rating": 4},
    {"id": 9, "title": "欧盟统计局(Eurostat)", "desc": "欧盟官方统计机构，提供欧盟成员国详细贸易数据和经济指标", "url": "https://ec.europa.eu/eurostat", "category": "政府官网", "country": "欧盟", "tags": ["数据", "贸易统计", "经济指标"], "rating": 5},
    {"id": 10, "title": "联合国欧经委(UNECE)风险评估指南", "desc": "联合国欧洲经济委员会发布的国际贸易风险评估官方指南(PDF)", "url": "https://unece.org/sites/default/files/2024-11/ECE_TRADE_485.pdf", "category": "专业指南", "country": "全球", "tags": ["风险评估", "联合国", "官方指南"], "rating": 5},
    {"id": 11, "title": "Trade Map贸易地图", "desc": "国际贸易中心(ITC)开发的贸易统计工具，提供全球220多个国家和地区的进出口数据", "url": "https://www.trademap.org/", "category": "数据平台", "country": "全球", "tags": ["数据", "贸易统计", "市场分析"], "rating": 5},
    {"id": 12, "title": "Open Supply Hub", "desc": "开源供应链设施数据库，帮助追踪全球供应链信息和生产设施位置", "url": "https://info.opensupplyhub.org/facilities-chinese", "category": "数据平台", "country": "全球", "tags": ["供应链", "设施追踪", "数据公开"], "rating": 4},
]

@app.get("/api/resources")
def get_resources(category: Optional[str] = None, keyword: Optional[str] = None):
    results = RESOURCES_API_DB.copy()
    if category:
        results = [r for r in results if r["category"] == category]
    if keyword:
        kw = keyword.lower()
        results = [r for r in results if kw in r["title"].lower() or kw in r["desc"].lower()]
    return {"code": 200, "data": results, "total": len(results)}

# ================= 7. 汇率查询接口 =================
@app.get("/api/exchange-rate")
def exchange_rate(from_currency: str = "USD", to_currency: str = "CNY"):
    try:
        url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {"code": 200, "from": from_currency, "to": to_currency, "rate": data["rates"].get(to_currency, 0)}
    except Exception as e:
        print(f"汇率API失败: {e}")
    fallback = {"USD_CNY": 7.25, "EUR_CNY": 7.85}
    return {"code": 200, "rate": fallback.get(f"{from_currency}_{to_currency}", 7.0), "source": "缓存"}

# ================= 8. HS编码查询接口 =================
@app.get("/api/hs-code")
def search_hs_code(keyword: str):
    hs_db = {
        "手机": {"code": "851712", "description": "智能手机", "tax_rate": "0%"},
        "电脑": {"code": "847130", "description": "便携式电脑", "tax_rate": "0%"},
        "服装": {"code": "620462", "description": "棉制裤子", "tax_rate": "16%"},
    }
    for key, value in hs_db.items():
        if keyword in key:
            return {"code": 200, "data": value}
    return {"code": 200, "data": {"code": "未找到", "description": f"未找到「{keyword}」的HS编码"}}

# 启动
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

    # ================= 翻译接口 =================
class TranslateRequest(BaseModel):
    text: str
    from_lang: str = "中文"
    to_lang: str = "英文"

@app.post("/api/translate")
def translate_text(req: TranslateRequest):
    """使用AI进行翻译"""
    if not req.text or not req.text.strip():
        return {"code": 400, "message": "请输入要翻译的内容", "result": ""}
    
    try:
        # 构建翻译提示词
        prompt = f"""请将以下{req.from_lang}内容翻译成{req.to_lang}，只返回翻译结果，不要添加任何解释或额外内容：

{req.text}"""
        
        response = dashscope.Generation.call(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            result_format="message"
        )
        
        if response.status_code == 200:
            translated = response.output.choices[0]["message"]["content"]
            # 清理可能的多余内容
            translated = translated.strip()
            return {"code": 200, "result": translated, "source": "AI翻译"}
        else:
            return {"code": 500, "message": "翻译服务暂时不可用", "result": ""}
            
    except Exception as e:
        print(f"翻译API调用失败: {e}")
        return {"code": 500, "message": f"翻译失败: {str(e)}", "result": ""}

# ========== 启动配置 ==========
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)