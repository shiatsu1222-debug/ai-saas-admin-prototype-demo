"use strict";

const glyphs = {
  spark:"M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2z",
  grid:"M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  people:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-4 M16 3a4 4 0 0 1 0 8",
  app:"M3 5h18v14H3z M3 9h18 M7 7h.01 M10 7h.01",
  shield:"M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z M9 12l2 2 4-4",
  layers:"M12 2l10 5-10 5L2 7z M2 12l10 5 10-5 M2 17l10 5 10-5",
  ai:"M6 6h12v12H6z M9 9h6v6H9z M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4",
  card:"M3 5h18v14H3z M3 10h18 M7 15h3",
  chart:"M3 3v18h18 M7 16l4-5 4 2 5-6",
  audit:"M4 3h16v18H4z M8 8h8 M8 12h8 M8 16h6",
  search:"M10 17a7 7 0 1 1 0-14 7 7 0 0 1 0 14z M15 15l6 6",
  settings:"M4 7h16 M4 17h16 M9 4v6 M15 14v6",
  send:"M22 2L9 15 M22 2l-8 20-5-7-7-5 20-8z",
  chevron:"M9 6l6 6-6 6", down:"M6 9l6 6 6-6", swap:"M3 7h17m-4-4 4 4-4 4 M21 17H4m4-4-4 4 4 4",
  plus:"M12 5v14 M5 12h14", arrow:"M3 12h17m-6-6 6 6-6 6", back:"M21 12H4m6-6-6 6 6 6", close:"M6 6l12 12M18 6 6 18",
  check:"M5 12l4 4L19 6", clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  alert:"M12 3L2 21h20L12 3z M12 9v5m0 3h.01", menu:"M4 6h16 M4 12h16 M4 18h16",
};
const icon = (name, size = 17) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${glyphs[name] || glyphs.grid}"/></svg>`;
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const btn = (label, action, value = "", cls = "", symbol = "") =>
  `<button class="btn ${cls}" data-action="${action}" data-value="${esc(value)}">${symbol ? icon(symbol) : ""}${esc(label)}</button>`;
const badge = (label, color = "") => `<span class="badge ${color}">${esc(label)}</span>`;
const tile = (symbol, color = "") => `<span class="tile ${color}">${icon(symbol,16)}</span>`;
const modal = document.querySelector("#dialog");
const root = document.querySelector("#main");
const visibleCatalog = catalog.map((domain, d) => ({...domain, modules:domain.modules.map((module,m) => ({...module,id:`c-${d}-${m}`,domain:domain.name}))}));
const moduleById = Object.fromEntries(visibleCatalog.flatMap(domain => domain.modules.map(module => [module.id,module])));
const appModules = ["图片创作","视频创作","人像工具","角色聊天","剧集与剧情","直播互动","福利与活动"];
const businessPermissions = {
  materials:"素材库", templates:"模板库", content:"前台内容", features:"功能开放",
  growth:"投放与增长", products:"付费墙与套餐", rewards:"福利活动",
  users:"用户查询", support:"在线客服与反馈", reports:"举报查询", orders:"订单查询",
  tasks:"生成任务", aiPricing:"AI 消耗规则", analytics:"经营分析", diagnosis:"运营诊断",
};
const exceptionPermissions = {
  compensate:"单人补发", batchRewards:"批量发放奖励", exportOrders:"订单明细导出",
  refundInitiate:"现金退款发起",refundReview:"现金退款复核",
};
const permissions = {...businessPermissions,...exceptionPermissions};
const legacyGrants = {
  "运营与发布":["materials","templates","content","features","growth","products","rewards","tasks","aiPricing","analytics","diagnosis"],
  "仅查订单":["orders"],
  "查询与补发":["users","support","reports","orders","tasks","compensate"],
};
const accounts = {platform:"平台超级管理员",owner:"租户最高管理员",operator:"运营 1",operator2:"运营 2",support:"客服"};
const steps = ["归属与入口","结构与配置来源","功能与依赖","运营内容和规则","公共服务关联","核对与交付"];
const stepFields = [
  ["业务标识","市场与客户端","客服入口"],
  ["配置来源","页面结构","配置基线"],
  ["已授功能","缺项说明"],
  ["默认内容","商品及用户消耗"],
  ["AI 服务","支付与归因","存储与通知"],
  ["核对结果","历史数据与回调"],
];
const stateKey = "ai-saas-admin-demo-v1";
const seeded = {
  tenants:[{id:"t1",name:"星海运营团队",owner:"林晓",allowed:[0,1,2,3,4,5,6],active:true},{id:"t2",name:"远航运营团队",owner:"周宁",allowed:[0,1,6],active:true}],
  apps:[
    {id:"viora",tenant:"t1",name:"Viora",letter:"V",color:"",market:"印度 H5",type:"现有 App 接入",done:[0,1,3],ready:[0,2,3,6],enabled:[0,2,3],live:[0,2,3],fields:{},template:1,status:"接入核对中"},
    {id:"studio",tenant:"t1",name:"Studio B",letter:"S",color:"teal",market:"演练环境",type:"新建 App",done:[0,1,2,3,4,5],ready:[0,1,3],enabled:[0,3],live:[0,3],fields:{},template:1,status:"已交付"},
    {id:"drai",tenant:"t2",name:"DRAI",letter:"D",color:"blue",market:"Web · 英语",type:"现有 App 接入",done:[0],ready:[0],enabled:[],live:[],fields:{},template:1,status:"待接入"},
  ],
  grants:{operator:{viora:"运营与发布"},operator2:{studio:"运营与发布"},support:{viora:"查询与补发"}},
  users:[{id:"U-10328",app:"viora",name:"Meera",balance:120},{id:"U-10346",app:"viora",name:"Anika",balance:80},{id:"U-22015",app:"studio",name:"Sora",balance:55},{id:"U-10328",app:"drai",name:"Robin",balance:20}],
  tasks:[{id:"AI-3854",app:"viora",user:"U-10328",feature:"图片创作",status:"故障待结算",debit:10,refund:0},{id:"AI-3862",app:"viora",user:"U-10346",feature:"人像工具",template:"Portrait Motion",status:"已交付",debit:15,refund:0}],
  orders:[{id:"ORD-8217",app:"viora",user:"U-10328",name:"金币礼包",amount:"₹199",units:100,status:"已支付待到账"},{id:"ORD-8230",app:"viora",user:"U-10346",name:"VIP 会员",amount:"₹499",units:0,status:"已到账"}],
  reports:[{id:"RP-105",app:"viora",name:"模板封面举报",reason:"用户反馈封面素材存在授权疑问",status:"待处理"}],
  products:[{id:"SKU-01",app:"viora",name:"金币礼包",price:199,units:100},{id:"SKU-02",app:"viora",name:"VIP 会员",price:499,units:300}],
  ledger:[],audit:[],
};
let db = structuredClone(seeded);
function loadDemoData(snapshot) {
  try {
    const raw=JSON.parse(snapshot);
    if (raw && Array.isArray(raw.apps) && raw.grants) {
      for (const sample of seeded.tasks.filter(task=>task.template)) {
        const task=raw.tasks?.find(item=>item.id===sample.id && item.app===sample.app);
        if (task && !Object.hasOwn(task,"template")) task.template=sample.template;
      }
      return raw;
    }
  } catch {}
  return structuredClone(seeded);
}
try { db=loadDemoData(localStorage.getItem(stateKey)); } catch {}
let role = "platform";
let route = "overview";
let appId = "viora";
let tenantId = "t1";
let step = 0;
let range = 7;
let menuOpen = false;
let recordQuery = "";
let navigationIndex = 0;
let returnLabel = "";
let navigationContext = history.state?.role === role && history.state.navigationContext || Math.random();
let toastTimer;
const userDirectoryFilters = {query:"",tenant:"",app:"",status:""};
const demoUserProfiles = {
  "viora:U-10328":{type:"邮箱账号",status:"正常",contact:"meera@example.com",joined:"2026-10-22",lastActive:"2026-11-13",source:"广告投放"},
  "viora:U-10346":{type:"游客",status:"正常",joined:"2026-10-30",lastActive:"2026-11-12",source:"自然流量"},
  "studio:U-22015":{type:"邮箱账号",status:"受限",contact:"sora@example.com",joined:"2026-11-02",lastActive:"2026-11-10",source:"邀请链接"},
  "drai:U-10328":{type:"游客",status:"正常",joined:"2026-11-04",lastActive:"2026-11-11",source:"自然流量"},
};
const userProfile = user => demoUserProfiles[`${user.app}:${user.id}`] || {};
const save = () => { try { localStorage.setItem(stateKey, JSON.stringify(db)); } catch {} };
const isPlatform = () => role === "platform";
const currentApp = () => db.apps.find(app => app.id === appId);
const tenantFor = app => db.tenants.find(tenant => tenant.id === app?.tenant);
const tenantName = app => tenantFor(app)?.name || "—";
const currentTenant = () => db.tenants.find(tenant => tenant.id === tenantId);
function accessibleApps() {
  if (isPlatform()) return db.apps;
  return db.apps.filter(app => app.tenant === tenantId && tenantFor(app)?.active &&
    (isDelivered(app) || app.type === "现有 App 接入") &&
    (role === "owner" || assignedPermissions(role,app.id).some(key=>permissionCeiling(app).includes(key))));
}
const inScope = app => accessibleApps().some(item => item.id === app);
function assignedPermissions(employee,id) {
  const grant = db.grants[employee]?.[id];
  return Array.isArray(grant) ? grant : legacyGrants[grant] || [];
}
const permissionCeiling = app => app?.businessCeiling ?? Object.keys(permissions);
function hasPermission(key, app=currentApp()) {
  return Boolean(app && (isPlatform() || (
    inScope(app.id) && permissionCeiling(app).includes(key) &&
    (role === "owner" || assignedPermissions(role,app.id).includes(key))
  )));
}
const isDelivered = app => app?.status === "已交付";
function log(action, app = appId) {
  db.audit.unshift({who:accounts[role],action,app,at:new Date().toLocaleString("zh-CN")});
  save();
}
function say(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
const labels = {
  overview:"平台总览",tenants:"租户管理",apps:"产品管理",initialize:"产品初始化",
  myapps:"我的产品",staff:"人员与权限",business:"多产品经营分析",app:"经营概览",features:"功能开关与开放范围",
  users:"用户",tasks:"生成任务",orders:"订单与支付记录",reports:"投诉建议与举报",products:"付费墙与套餐",templates:"模板库",
  materials:"素材库",support:"在线客服",aiPricing:"AI 消耗规则",
  directory:"用户管理",system:"系统管理",telegram:"Telegram 机器人",audit:"操作审计",
};
const aliases = {
  "租户管理":"tenants","功能授权":"tenants","产品管理":"apps","产品初始化":"initialize","平台运行与审计":"audit",
  "我的产品":"myapps","人员与权限":"staff","多产品经营分析":"business","功能配置与发布":"features",
  "素材与创作模板":"templates","用户管理":"users","用户权益":"users","客服与反馈":"support","商品管理":"products",
  "生成任务":"tasks","交易订单":"orders","内容举报":"reports","经营机器人管理（草案）":"telegram",
  "平台协作":"features",
  "经营概览":"app",
  "页面访问与点击统计":"pageAnalytics","AI 任务与消耗统计":"taskAnalytics","功能与模板排行":"usageRanking",
};
const operationalModules = {
  "平台公共资源": {entity:"公共资源",fields:["资源名称","当前版本","授权范围"],sample:["Portrait Motion","v2.0","星海运营团队"]},
  "模型管理": {entity:"模型绑定",fields:["绑定功能","供应商与模型","规格"],sample:["Viora · 图片创作","演示模型服务 · Image Standard","1080P"]},
  "AI 预算与成本": {entity:"产品预算",fields:["业务产品","预算金额（USD）","超额策略"],sample:["Viora","2500","仅提醒并继续"],choices:["暂停新 AI 请求","仅提醒并继续"]},
  "支付管理": {entity:"通道路由",fields:["支付通道","市场与币种","状态"],sample:["UPI","印度 · INR","演示已启用"],choices:["演示已启用","暂停新收款"]},
  "归因配置": {entity:"归因接入",fields:["渠道","事件映射","上报范围"],sample:["AppsFlyer","注册、真实支付","Viora · H5"]},
  "经营机器人管理（草案）": {entity:"推送计划",fields:["计划名称","频率","接收范围"],sample:["经营日报","每日 09:00","平台超级管理员"]},
  "前台内容运营": {entity:"运营位",fields:["内容名称","页面位置","显示状态"],sample:["首页创作推荐","Discover · 顶部轮播","已上架"],choices:["草稿","已上架","已下架"]},
  "角色管理": {entity:"角色档案",fields:["角色名称","档案简介","显示状态"],sample:["Ava","旅行与生活话题","已上架"],choices:["草稿","已上架","已下架"]},
  "剧集与剧情": {entity:"剧集",fields:["剧集名称","分集与观看规则","状态"],sample:["城市来信","首集可试看","草稿"],choices:["草稿","已上架","已下架"]},
  "直播互动": {entity:"直播房间",fields:["房间名称","播放素材与互动规则","状态"],sample:["夜间电台","预置素材 · 开放评论","草稿"],choices:["草稿","已上架","已下架"]},
  "福利与活动": {entity:"福利活动",fields:["活动名称","领取与到账规则","状态"],sample:["连续签到","成功签到后领取金币","已启用"],choices:["草稿","已启用","已停止"]},
  "渠道与推客（草案）": {entity:"推客档案",fields:["推客名称","上级与来源","数据范围"],sample:["Creator A","社媒渠道","本人及直属下级"]},
  "营销短链与落地页（草案）": {entity:"营销链接",fields:["活动名称","落地页路径","渠道与推客"],sample:["创作模板邀新","/discover","Organic"]},
  "投放计划": {entity:"投放计划",fields:["计划名称","目标人群","状态"],sample:["视频创作推广","印度 H5 · 新用户","草稿"],choices:["草稿","运行中","已暂停"]},
  "流量分发（草案）": {entity:"分发规则",fields:["规则名称","命中来源","素材范围"],sample:["自然流量 A 面","Organic","已授权模板与产品自有素材"]},
  "产品归因运营（草案）": {entity:"上报规则",fields:["规则名称","事件名称","状态"],sample:["H5 转化","注册、支付","已启用"],choices:["草稿","已启用","已停止"]},
  "消息运营": {entity:"通知计划",fields:["消息标题","目标人群","状态"],sample:["本周新模板","已授权通知的活跃用户","草稿"],choices:["草稿","待发送","已停止"]},
};
const routeFor = module => aliases[module.name] || module.id;
const moduleTitle = module => labels[routeFor(module)] || module.name;
const platformModule = name => visibleCatalog[0].modules.find(module=>module.name===name);
const appModule = name => visibleCatalog[2].modules.find(module=>module.name===name);
const contentTools = ["图片创作","视频创作","人像工具"].map(name=>appModule(name));
const draiContent = new Set(["剧集与剧情","直播互动"].map(name=>appModule(name).id));
const productSupports = (target,app) => app?.id!=="viora"||!draiContent.has(target);
aliases["角色聊天"] = appModule("角色管理").id;
for (const [name,title] of [["角色管理","角色与聊天"],["前台内容运营","轮播与营销位"],
  ["流量分发（草案）","内容投放范围"],["产品归因运营（草案）","来源归因"],["消息运营","端内通知"],
  ["福利与活动","签到与奖励"],["运营诊断","诊断日志"]]) {
  labels[appModule(name).id] = title;
}
const appModulePermissions = {
  "前台内容运营":"content","角色管理":"content","角色聊天":"content","图片创作":"content","视频创作":"content",
  "人像工具":"content","剧集与剧情":"content","直播互动":"content","福利与活动":"rewards",
  "渠道与推客（草案）":"growth","营销短链与落地页（草案）":"growth","投放计划":"growth",
  "流量分发（草案）":"growth","产品归因运营（草案）":"growth","消息运营":"growth",
  "运营诊断":"diagnosis",
};
const appRoutePermissions = {
  app:"analytics",pageAnalytics:"analytics",taskAnalytics:"analytics",usageRanking:"analytics",
  features:"features",templates:"templates",materials:"materials",users:"users",reports:"reports",
  support:"support",tasks:"tasks",products:"products",orders:"orders",aiPricing:"aiPricing",
};
function moduleAllowed(module, app=currentApp()) {
  if (!productSupports(routeFor(module),app)) return false;
  if (isPlatform()) return true;
  if (module.domain === "租户工作台") {
    const target=routeFor(module);
    return target==="business"?businessProducts().length>0:role==="owner"||target==="myapps";
  }
  if (module.domain !== "产品运营" || !app || !inScope(app.id)) return false;
  const permission = appRoutePermissions[routeFor(module)] || appModulePermissions[module.name];
  const index = appModules.indexOf(module.name);
  return hasPermission(permission,app) && (index < 0 || tenantFor(app)?.allowed.includes(index));
}
function allowedRoute(target, app=currentApp()) {
  if (appRoute(target) && !app) return false;
  if (!productSupports(target,app)) return false;
  if (isPlatform()) return true;
  if (["system","telegram","directory"].includes(target)) return false;
  if (target === "myapps") return true;
  if (target === "staff") return role === "owner";
  if (target === "business") return businessProducts().length>0;
  if (moduleById[target]) return moduleAllowed(moduleById[target],app);
  if (!app || !inScope(app.id)) return false;
  const required=appRoutePermissions[target]||productFramework[target]?.[1];
  if (required) return hasPermission(required,app);
  return visibleCatalog[2].modules.some(module => routeFor(module) === target && moduleAllowed(module,app));
}
function saveNavigation(replace = true) {
  const state = {role, tenantId, route, appId, step, recordQuery, navigationIndex, navigationContext, returnLabel};
  if (replace) history.replaceState(state, "");
  else history.pushState(state, "");
}
function restoreNavigation(state) {
  if (!state || state.navigationContext !== navigationContext ||
      !Number.isInteger(state.navigationIndex)) return false;
  const app = db.apps.find(item => item.id === state.appId);
  const target=state.route===appModule("经营概览").id?"app":state.route;
  if (!allowedRoute(target, app) || (appRoute(target) && !inScope(state.appId))) return false;
  ({appId, step, recordQuery, navigationIndex} = state);
  returnLabel=state.returnLabel||"";
  route=target;
  return true;
}
function showPage() {
  menuOpen = false;
  render();
  window.scrollTo({top:0});
}
function go(target, query="", nextAppId=appId, nextStep=step, backTo="") {
  const app = db.apps.find(item => item.id === nextAppId);
  if (!allowedRoute(target, app)) { say("当前账号没有该页面权限"); return; }
  const changed = target !== route || query !== recordQuery || nextAppId !== appId;
  if (changed) saveNavigation();
  route = target;
  recordQuery = query;
  appId = nextAppId;
  step = nextStep;
  if (changed) {
    navigationIndex++;
    returnLabel=backTo;
  }
  saveNavigation(!changed);
  showPage();
}
function selectApp(id, target, query="") {
  const app=accessibleApps().find(app=>app.id===id);
  if (app && !target) target=["app",...appGroupsForRole().flatMap(([, ,entries])=>entries.map(([,path])=>path))]
    .find(path=>allowedRoute(path,app));
  if (!target) { say("当前产品暂无可打开的业务页面"); return; }
  if (!app || !allowedRoute(target,app)) { say("当前账号没有该产品或页面的权限"); return; }
  go(target,query,id,0);
}
function page(title, description, actions = "") {
  return `<div class="page-heading"><div><h1>${esc(title)}</h1>${description ? `<p>${esc(description)}</p>` : ""}</div><div class="actions">${actions}</div></div>`;
}
function table(headers, rows) {
  return `<div class="table-scroll"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map(row=>`<tr>${row.map(v=>`<td>${v}</td>`).join("")}</tr>`).join("") : `<tr><td class="empty" colspan="${headers.length}">当前范围内暂无记录</td></tr>`}</tbody></table></div>`;
}
const card = html => `<section class="card">${html}</section>`;
const cardHead = (title, subtitle = "", action = "") => `<div class="card-head"><div><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div>${action}</div>`;
const appName = app => `<span class="table-name"><span class="tile ${app.color}">${esc(app.letter)}</span><span>${esc(app.name)}<small>${esc(app.market)}</small></span></span>`;
const appStatus = app => badge(app.status,app.status === "已交付" ? "good" : app.status === "待接入" ? "gray" : "warn");
const productPaths = {"新建 App":"新建产品","现有 App 接入":"接入现有产品"};
const productSubpage = () => route==="initialize" || route===platformModule("终端交付配置（批次待定）").id;
function appTable(list, productView = false) {
  const headers = [productView?"产品与终端":"业务产品","所属租户","交付状态",productView?"已生效功能":"接手摘要","操作"];
  return table(headers, list.map(app => {
    const detail=productView?btn("产品详情","appDetail",app.id,"ghost"):"";
    const action=productView&&!isDelivered(app)
      ? btn(app.done.length?"继续初始化":"开始初始化","initApp",app.id,"ghost")
      : btn("进入工作区","openApp",app.id,"ghost");
    const summary=productView?`${app.live.length} 项`:handoverSummary(app);
    const staff=!productView&&role==="owner"?btn("查看获授人员","openProductStaff",app.id,"ghost"):"";
    return [appName(app),esc(tenantName(app)),appStatus(app),summary,`<div class="actions">${detail}${action}${staff}</div>`];
  }));
}
function handoverSummary(app) {
  if (!allowedRoute("features",app)) return "—";
  const {ready,waiting,draft}=featureReadiness(app);
  return `<div class="handover-summary">${badge(`已就绪 ${ready}`,"good")}${badge(`待平台准备 ${waiting}`,waiting?"warn":"gray")}${badge(`待租户发布 ${draft}`,draft?"warn":"gray")}</div>`+
    btn("查看功能状态","openWork",`${app.id}:features`,"ghost","arrow");
}
function navButton(label,target,symbol = "") {
  const active=route===target;
  const parent=(target==="system" && ["audit",platformModule("平台安全设置").id].includes(route)) ||
    (target==="apps" && productSubpage()) ||
    (target==="creationPages" && contentTools.some(tool=>routeFor(tool)===route));
  return `<button class="${active||parent?"active":""}" ${active?'aria-current="page"':parent?'aria-current="location"':""} data-action="go" data-value="${target}">${symbol?icon(symbol):""}${esc(label)}</button>`;
}
function navGroup(title, entries) {
  const items = entries.filter(([,id])=>allowedRoute(id));
  if (!items.length) return "";
  return `<div class="nav-group"><div class="nav-label">${title}</div>${items.map(([label,id,symbol])=>navButton(label,id,symbol)).join("")}</div>`;
}
function navDetails(title,symbol,entries) {
  const items = entries.filter(([,id])=>allowedRoute(id));
  if (!items.length) return "";
  return `<details ${items.some(([,id])=>id===route||id==="creationPages"&&contentTools.some(tool=>routeFor(tool)===route))?"open":""}><summary>${icon(symbol)}${title}${icon("chevron",13)}</summary>${items.map(([name,id])=>navButton(name,id)).join("")}</details>`;
}
const entry = module => [moduleTitle(module),routeFor(module)];
const platformMain = [
  ["平台总览","overview","grid"],["租户管理","tenants","people"],[labels.apps,"apps","app"],
  ["用户管理","directory","people"],
];
const platformResources = ["平台公共资源","模型管理","AI 预算与成本","支付管理","归因配置","资源配额（草案）"]
  .map(name=>entry(platformModule(name)));
for (const name of ["文件服务","通知服务","翻译服务"]) {
  platformResources.push(entry(visibleCatalog[4].modules.find(module=>module.name===name)));
}
const platformSettings = [["系统管理","system","settings"],["Telegram 机器人","telegram","send"]];
const tenantNav = [[labels.business,"business","chart"],[labels.myapps,"myapps","app"],[labels.staff,"staff","people"]];
const appCommon = [["经营概览","app","grid"]];
const appEntry = (name,label=name) => [label,routeFor(appModule(name))];
const productFramework = {
  creationPages:["创作页与工具页配置","content","创作页及各工具入口的内容与展示"],
  agreements:["协议文档","content","用户协议及相关文档"],
  translations:["文案翻译","content","产品内文案与语言资源"],
  landingStats:["落地页统计","growth","落地页访问及转化"],
  experiments:["A/B 实验","growth","针对符合投放条件的用户进行实验"],
  pushNotifications:["端外通知（系统通知）","growth","通过系统通知触达终端用户"],
  lottery:["抽奖活动","rewards","产品内抽奖活动"],
  superGifts:["超级赠品","rewards","商品关联赠品与权益"],
  referralRewards:["创作与邀请福利","rewards","创作活动与邀请奖励"],
  prizeAnnouncements:["超级大奖播报","rewards","中奖结果的用户侧展示"],
  devices:["设备与安装","users","设备、终端与安装实例"],
  vipBenefits:["VIP 与权益","users","会员状态与已有权益"],
  assetAccounts:["资产账户","users","用户的各类资产余额"],
  assetLedger:["资产流水","users","资产变化与历史记录"],
  usageQuotas:["额度","users","免费额度及其他次数权益"],
  quotaLedger:["额度流水","users","次数变动与返还"],
  consumption:["消费记录","users","用户消费、扣减及相关返还"],
  userContent:["用户会话与作品","users","所属产品的用户会话和作品"],
};
for (const [id,[title]] of Object.entries(productFramework)) labels[id]=title;
const frameworkEntries = (...keys) => keys.map(id=>[labels[id],id]);
const appGroups = [
  ["内容运营","layers",[
    ["素材库","materials"],["模板库","templates"],appEntry("前台内容运营","轮播与营销位"),
    appEntry("角色管理","角色与聊天"),...frameworkEntries("creationPages","agreements","translations"),
    appEntry("剧集与剧情"),appEntry("直播互动"),
  ]],
  ["投放与增长","chart",[
    appEntry("流量分发（草案）","内容投放范围"),["功能开关与开放范围","features"],
    appEntry("产品归因运营（草案）","来源归因"),...frameworkEntries("landingStats","experiments"),
    appEntry("消息运营","端内通知"),...frameworkEntries("pushNotifications"),appEntry("投放计划"),
    appEntry("渠道与推客（草案）"),appEntry("营销短链与落地页（草案）"),
  ]],
  ["商业化","card",[["付费墙与套餐","products"],["订单与支付记录","orders"],appEntry("福利与活动","签到与奖励"),
    ...frameworkEntries("lottery","superGifts","referralRewards","prizeAnnouncements")]],
  ["用户运营","people",[["用户","users"],["在线客服","support"],["投诉建议与举报","reports"],
    ...frameworkEntries("devices","vipBenefits","assetAccounts","assetLedger","usageQuotas","quotaLedger","consumption","userContent")]],
  ["AI 运营","ai",[["AI 消耗规则","aiPricing"],["生成任务","tasks"]]],
  ["数据分析","chart",["页面访问与点击统计","AI 任务与消耗统计","功能与模板排行"].map(name=>appEntry(name))],
  ["运营诊断","audit",[appEntry("运营诊断","诊断日志")]],
];
function appRoute(target=route) {
  return Object.hasOwn(appRoutePermissions,target) || Object.hasOwn(productFramework,target) ||
    visibleCatalog[2].modules.some(module=>routeFor(module)===target);
}
function appGroupsForRole() {
  if(role!=="support") return appGroups;
  const order=["用户运营","商业化","AI 运营","运营诊断"];
  const groups=[...appGroups].sort(([a],[b])=>(order.indexOf(a)+1||5)-(order.indexOf(b)+1||5));
  return groups.map(([title,symbol,entries])=>title==="用户运营"
    ? [title,symbol,[entries[1],entries[0],...entries.slice(2)]]
    : [title,symbol,entries]);
}
function renderChrome() {
  const activeApp = currentApp();
  const inApp = appRoute();
  const scope = inApp ? activeApp?.name : isPlatform() ? "平台总后台" : currentTenant()?.name;
  const scopeSub = inApp ? "产品运营工作区" : isPlatform() ? "全部租户与产品" : "租户工作台";
  const productCrumb=productSubpage()?btn(labels.apps,"go","apps","ghost")+icon("chevron",13):"";
  document.body.classList.toggle("menu-open",menuOpen);
  document.querySelector("#sidebar").innerHTML = `
    <div class="brand"><span class="brand-logo">${icon("spark",22)}</span><span>AI SaaS <small>统一运营后台</small></span></div>
    <button class="context" data-action="workspace">${tile(inApp?"app":"layers")}<span><b>${esc(scope)}</b><small>${scopeSub}</small></span>${icon("swap",15)}</button>
    <nav class="nav">
      ${inApp ? navGroup("产品运营",appCommon)+
        appGroupsForRole().map(([title,symbol,entries])=>navDetails(title,symbol,entries)).join("") :
        isPlatform() ? navGroup("平台管理",platformMain)+
          navDetails("公共资源与服务","layers",platformResources)+
          navGroup("平台分析",[entry(platformModule("平台经营分析"))])+navGroup("平台设置",platformSettings) :
          navGroup("租户工作台",tenantNav)+navDetails("组织与消息","layers",visibleCatalog[1].modules.filter(m=>!aliases[m.name]).map(entry))}
    </nav>
    <div class="sidebar-foot"><span class="dot"></span>演示环境 <span style="margin-left:auto">v0.53</span></div>`;
  document.querySelector("#topbar").innerHTML = `
    <div class="crumb">${btn("","mobile","","icon mobile-menu","menu").replace('data-action="mobile"','aria-label="菜单" data-action="mobile"')}<button class="btn nav-back" data-action="back" ${navigationIndex===0?"disabled":""}>${icon("back",16)}${esc(returnLabel||"返回上一页")}</button><span class="root-crumb" title="${esc(inApp?`${tenantName(activeApp)} · ${scope}`:scope)}">${esc(inApp?`${tenantName(activeApp)} / ${scope}`:scope)}</span><span class="root-chevron">${icon("chevron",13)}</span>${productCrumb}<strong>${esc(labels[route] || moduleById[route]?.name)}</strong></div>
    <div class="top-actions">
      <button class="btn search-trigger" data-action="search" aria-label="搜索模块">${icon("search",16)}<span class="search-copy">搜索模块</span><kbd>Ctrl K</kbd></button>
      <button class="profile" data-action="roles" aria-label="切换身份"><span class="avatar">${isPlatform()?"管":role==="support"?"客":"运"}</span><span class="profile-text"><b>${accounts[role]}</b><small>切换身份</small></span>${icon("down",13)}</button>
    </div>`;
}
function overview() {
  const pending = db.apps.filter(a=>!isDelivered(a)).length;
  const metrics = [
    ["活跃租户",db.tenants.filter(t=>t.active).length,"people","","本月新增 1 个"],
    ["业务产品",db.apps.length,"app","blue",`${db.apps.filter(isDelivered).length} 个已交付 · ${pending} 个待交付`],
    ["AI 生成任务",range===7?"18,642":range===30?"74,386":"224,870","ai","teal","成功率 96.8%"],
  ];
  const samplePayments={
    7:[126480,2340],30:[492750,9160],90:[1430260,27480],
  };
  const [rupeeTotal,dollarTotal]=samplePayments[range];
  const paymentsCard=`<div class="card metric">
    <div class="metric-top">${tile("card","amber")}用户成功支付金额</div>
    <dl class="platform-payment-totals">
      <div><dt>INR</dt><dd>₹${formatNumber(rupeeTotal)}</dd></div>
      <div><dt>USD</dt><dd>US$${formatNumber(dollarTotal)}</dd></div>
    </dl>
    <small>近 ${range} 天 · 演示数据</small>
  </div>`;
  const work = pendingWork(db.apps);
  const delivery = work.filter(item=>item.target==="initialize");
  const blocked=delivery.filter(item=>item.blocked);
  const ready=delivery.filter(item=>!item.blocked);
  return page("平台总览","查看业务异常、产品交付进度和经营趋势。")+
    `<div class="overview-grid platform-queues">
      ${card(cardHead("线上异常")+workQueue(work.filter(item=>item.target!=="initialize")))}
      ${card(cardHead("交付阻塞")+workQueue(blocked)+
        (ready.length?cardHead("待确认交付")+workQueue(ready):""))}
    </div>
    <section class="metrics">${metrics.map(([label,value,symbol,color,detail])=>`<div class="card metric"><div class="metric-top">${tile(symbol,color)}${label}</div><strong>${value}</strong><small>${detail}</small></div>`).join("")}${paymentsCard}</section>`+
    card(cardHead("经营趋势","生成任务与支付订单数量",`<div class="segmented">${[7,30,90].map(n=>`<button data-action="range" data-value="${n}" class="${range===n?"selected":""}" aria-pressed="${range===n}">近 ${n} 天</button>`).join("")}</div>`)+
      `<div class="chart"><canvas id="chart" aria-label="生成任务和支付订单趋势图"></canvas></div><div class="legend"><span><i></i>生成任务</span><span><i></i>支付订单</span></div>`);
}
function pendingWork(apps) {
  const work=[];
  const types=[
    ["支付到账",db.orders,"已支付待到账","orders","card","blue","优先核对","客服跟进 · 系统或通道异常由平台接手"],
    ["生成任务返还",db.tasks,"故障待结算","tasks","clock","amber","待跟进","客服跟进 · 系统异常由平台接手"],
    ["内容举报",db.reports,"待处理","reports","shield","teal","待处置","平台处置"],
  ];
  for(const [title,records,status,target,symbol,color,label,owner] of types) {
    for(const app of apps) {
      if(!allowedRoute(target,app)||(target==="reports"&&!isPlatform())) continue;
      const found=records.filter(record=>record.app===app.id&&record.status===status);
      if(found.length) work.push({title,detail:`${tenantName(app)} / ${app.name} · ${found.length===1?found[0].id:found.length+" 条"}`,
        app:app.id,target,symbol,color,label,owner,status:found.length===1?found[0].id:status});
    }
  }
  if(isPlatform()) {
    for(const app of apps.filter(app=>!isDelivered(app))) {
      const blocker=deliveryBlockers(app)[0];
      work.push({title:"产品初始化",detail:`${tenantName(app)} / ${app.name} · ${app.done.length}/${steps.length} 步已核对`,
        app:app.id,target:"initialize",symbol:"spark",color:"",label:blocker?"待核对":"待确认",owner:blocker||"平台确认交付",blocked:Boolean(blocker)});
    }
  }
  return work;
}
function workQueue(work) {
  if(!work.length) return '<div class="empty">当前范围内暂无待办</div>';
  return `<div class="queue">${work.map(({title,detail,app,target,symbol,color,label,owner,status=""})=>`<button data-action="openWork" data-value="${esc(app)}:${target}:${esc(status)}">${tile(symbol,color)}<span><b>${title}</b><small>${esc(detail)}</small><small>${esc(owner)}</small></span>${badge(label,"warn")}</button>`).join("")}</div>`;
}
function drawChart() {
  const canvas = document.querySelector("#chart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect(), scale = devicePixelRatio || 1;
  const w = rect.width, h = rect.height;
  if (w<130) return;
  canvas.width=w*scale; canvas.height=h*scale;
  const ctx=canvas.getContext("2d"); ctx.scale(scale,scale);
  const left=38,right=w-14,top=12,bottom=h-25;
  ctx.font='11px "Segoe UI", sans-serif'; ctx.fillStyle="#777187"; ctx.strokeStyle="#eeeaf4";
  for(let i=0;i<5;i++) {
    const y=top+(bottom-top)*i/4;
    ctx.beginPath(); ctx.moveTo(left,y); ctx.lineTo(right,y); ctx.stroke();
    ctx.fillText(["4,000","3,000","2,000","1,000","0"][i],2,y+3);
  }
  const series=range===7?[1.22,1.53,1.45,2.39,2.05,2.81,2.63,3.37]:range===30?[.85,1.42,1.28,1.96,2.31,2.52,2.18,3.53]:[.48,.82,1.43,1.3,2.24,2.72,2.42,3.48];
  const x=i=>left+(right-left)*i/7;
  const y=v=>bottom-v/4*(bottom-top);
  const dateLabels=range===7?["11/07","11/08","11/09","11/10","11/11","11/12","11/13"]:range===30?["10/15","10/20","10/25","10/30","11/04","11/09","11/13"]:["08/16","08/31","09/15","09/30","10/15","10/30","11/13"];
  dateLabels.forEach((label,i)=>ctx.fillText(label,Math.min(right-17,left+(right-left)*i/6-11),h-6));
  function line(values,color,fill) {
    ctx.beginPath();
    values.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));
    if(fill){
      const gradient=ctx.createLinearGradient(0,top,0,bottom); gradient.addColorStop(0,"#8d6cf34a"); gradient.addColorStop(1,"#ad97ff04");
      ctx.lineTo(right,bottom); ctx.lineTo(left,bottom); ctx.closePath(); ctx.fillStyle=gradient; ctx.fill();
      ctx.beginPath(); values.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));
    }
    ctx.strokeStyle=color; ctx.lineWidth=2.3; ctx.lineJoin="round"; ctx.stroke();
    ctx.fillStyle=color; ctx.beginPath(); ctx.arc(right,y(values[7]),3.6,0,Math.PI*2); ctx.fill();
  }
  line(series,"#7554e3",true); line(series.map((v,i)=>v*.32+.08*(i%3)),"#42a894",false);
}

const field = (label,name,value="",type="text",extra="") => `<label class="field"><span>${esc(label)}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const option = (label,value,selected=false) => `<option value="${esc(value)}" ${selected?"selected":""}>${esc(label)}</option>`;
const select = (label,name,options) => `<label class="field"><span>${esc(label)}</span><select name="${name}">${options.join("")}</select></label>`;
const check = (name,value,label,on=false) => `<label><input type="checkbox" name="${name}" value="${esc(value)}" ${on?"checked":""}>${esc(label)}</label>`;
function tenantsPage() {
  return page("租户管理","管理租户档案、最高管理员、业务产品和功能授权。",btn("新建租户","newTenant","","primary","plus"))+
    card(cardHead("租户列表")+`<div class="filters"><input aria-label="筛选租户" placeholder="搜索租户名称或管理员" data-filter="tenants"><select aria-label="租户状态" data-filter="tenants"><option value="">全部状态</option><option>启用</option><option>停用</option></select></div><div id="filtered-tenants">${tenantRows()}</div>`);
}
function tenantRows(query="",state="") {
  const list=db.tenants.filter(t=>`${t.name} ${t.owner}`.toLowerCase().includes(query) && (!state || state===(t.active?"启用":"停用")));
  return table(["租户","最高管理员","关联产品","获授模块","状态","操作"],list.map(t=>[
    `<span class="table-name">${tile("people")}${esc(t.name)}</span>`,esc(t.owner),db.apps.filter(a=>a.tenant===t.id).map(a=>esc(a.name)).join("、")||"—",
    `${t.allowed.length} 项`,badge(t.active?"启用":"停用",t.active?"good":"gray"),
    btn("详情","tenantDetail",t.id,"ghost")
  ]));
}
function appsPage() {
  const onlyMine = route === "myapps";
  const apps=accessibleApps();
  return page(onlyMine?labels.myapps:labels.apps,
    onlyMine?"选择有权管理的产品进入运营工作区。":"管理产品、终端和交付，覆盖 H5、Web 和移动客户端。",
    onlyMine?"":btn("创建 / 登记产品","newApp","","primary","plus"))+
    card(cardHead("产品列表",`${apps.length} 个产品`)+appTable(apps,!onlyMine));
}
function permissionChecks(name, options, selected, ceiling=Object.keys(permissions)) {
  return `<div class="checks permission-options">${Object.entries(options).filter(([key])=>ceiling.includes(key))
    .map(([key,label])=>check(name,key,label,selected.includes(key))).join("")}</div>`;
}
function initializePage() {
  const app=currentApp();
  const readiness=featureReadiness(app);
  const destinations = {
    0:[["终端交付配置",platformModule("终端交付配置（批次待定）").id]],
    2:[["模型管理",platformModule("模型管理").id]],
    4:[["支付管理",platformModule("支付管理").id],["归因配置",platformModule("归因配置").id],
      ...platformResources.filter(([label])=>["文件服务","通知服务"].includes(label))],
  };
  const links=(destinations[step]||[]).map(([label,id])=>btn(label,"openInitConfig",id,"ghost","arrow")).join("");
  const fallback = app.type==="现有 App 接入" ?
    [[app.name,app.market,"沿用现有入口"],["现有配置","保留现网导航","盘点发布版本"],["租户授权","按产品核对模型及功能依赖"],["沿用现网内容","保留商品和消耗规则"],["核对模型绑定","保留在途回调","核对现网存储"],["确认权限和配置版本","账号、订单、权益、任务和作品"]]:
    [[app.name,app.market,"平台维护"],["初始化模板 v1","平台预设导航","建立配置快照"],["租户授权","检查模块内部依赖"],["预置基础素材","配置初始商品和消耗"],["AI 模型绑定","按实际需要接入","按需配置"],["检查可见范围","准备交付快照"]];
  return page(labels.initialize,"为新产品准备运营配置，或为现有产品建立接入基线。",isDelivered(app)?btn("进入运营工作区","openApp",app.id,"primary","arrow"):"")+
    `<div class="card pad initialization-summary"><div class="actions">${appName(app)} ${badge(productPaths[app.type]||app.type)} <select aria-label="初始化目标产品" data-change="init-app">${db.apps.map(a=>option(a.name,a.id,a.id===app.id)).join("")}</select></div>
    <div class="framework-status">
      <span><small>依赖就绪</small><b>${readiness.ready} 项已就绪 · ${readiness.waiting} 项待平台准备</b></span>
      <span><small>产品交付</small><b>${esc(app.status)}</b></span>
      <span><small>用户端发布</small><b>${readiness.live} 项已生效 · ${readiness.draft} 项待租户发布</b></span>
    </div></div>
    <div class="flow-layout"><div class="card steps">${steps.map((s,i)=>`<button class="step ${step===i?"selected":""}" aria-current="${step===i?"step":"false"}" data-action="step" data-value="${i}"><span aria-hidden="true">${app.done.includes(i)?icon("check",13):i+1}</span>${s}</button>`).join("")}</div>
    <section class="card pad"><h2>${steps[step]}</h2><p>${app.type==="现有 App 接入"?"核对现有值，按确认结果记录本次接入基线。":"核对预置内容，按目标产品保存准备结果。"}</p>
    ${links?`<div class="actions framework-links">${step===2?btn("查看租户授权","tenantDetail",app.tenant,"ghost","arrow"):""}${links}</div>`:""}
    <form data-form="step">
    ${stepFields[step].map((label,i)=>field(label,`f${i}`,productWording(app.fields[step]?.[i]??fallback[step][i]),"text","required")).join("")}
    ${step===2?`<div class="checks">${appModules.map((m,i)=>tenantFor(app).allowed.includes(i)?check("ready",i,`${m}依赖已核对`,app.ready.includes(i)):"").join("")}</div>`:""}
    ${step===5?`<div class="inline-note">${deliveryBlockers(app).map(esc).join("。")||"六步核对及已启用功能准备就绪。交付后由租户决定功能的开放时间。"}</div>`:""}
    <div class="actions"><button class="btn primary" type="submit">保存并标记已核对</button>${step===5?btn("确认交付","deliver",app.id,"", "check").replace("<button ","<button type=\"button\" "):""}</div></form>
    </section></div>`;
}
function deliveryBlockers(app) {
  const unchecked = steps.filter((_,index)=>!app.done.includes(index));
  const unready = app.enabled.filter(index=>!featureState(app,index).granted || !app.ready.includes(index));
  return [
    ...(unchecked.length?[`待核对：${unchecked.join("、")}`]:[]),
    ...(unready.length?[`待准备功能：${unready.map(index=>appModules[index]).join("、")}`]:[]),
  ];
}
function featureState(app,i) {
  const granted = tenantFor(app).allowed.includes(i);
  const ready = app.ready.includes(i);
  const enabled = app.enabled.includes(i);
  const live = app.live.includes(i) && granted && ready;
  return {granted,ready,enabled,live};
}
function featureReadiness(app) {
  const granted=appModules.map((_,index)=>featureState(app,index)).filter(state=>state.granted);
  return {
    ready:granted.filter(state=>state.ready).length,
    waiting:granted.filter(state=>!state.ready).length,
    live:granted.filter(state=>state.live).length,
    draft:granted.filter(state=>state.ready&&!state.live).length,
  };
}
function featuresPage() {
  const app = currentApp();
  return page(labels.features,`${app.name} · 查看授权、依赖、启用和用户侧生效状态。`,btn("预览用户侧","previewFeatures","","","app")+btn("发布启用配置","publish","","primary","arrow"))+
  (!isDelivered(app)?`<div class="inline-note">当前产品尚未交付。已有线上功能继续显示，新增配置在交付后发布。</div>`:"")+
  card(cardHead("业务功能", "独立工具关闭只影响自身入口，已启用业务可继续使用已配置的内部依赖。")+table(
    ["功能模块","租户授权","依赖准备","产品启用","用户侧生效"],
    appModules.map((label,i)=>{
      const s=featureState(app,i);
      return [esc(label),badge(s.granted?"已授权":"未授权",s.granted?"good":"gray"),badge(s.ready?"已就绪":"待平台准备",s.ready?"good":"warn"),
        `<button class="switch" aria-label="启用${esc(label)}" role="switch" aria-checked="${s.enabled}" ${!s.granted||!s.ready||!hasPermission("features")?"disabled":""} data-action="toggleFeature" data-value="${i}"></button>`,
        badge(s.live?"已生效":"未生效",s.live?"good":"gray")];
    })
  ));
}
function staffPage() {
  const scoped=accessibleApps().find(app=>app.id===recordQuery);
  const list=scoped?[scoped]:accessibleApps();
  if(tenantId!=="t1") return page("人员与权限","按产品分配员工权限。")+card('<div class="empty">当前租户暂无演示员工</div>');
  const staff=Object.keys(db.grants).filter(id=>!scoped||assignedPermissions(id,scoped.id).some(key=>permissionCeiling(scoped).includes(key)));
  return page("人员与权限",scoped?`${scoped.name} · 获授人员`:"同一员工可以在不同产品拥有不同角色和操作范围。",
    scoped?btn("查看全部人员","go","staff","ghost"):"")+
    card(cardHead("员工账号")+table(["员工","已分配产品和权限","操作"],staff.map(id=>[
      `<span class="table-name">${tile("people")}${accounts[id]}</span>`,
      list.map(app=>[app,assignedPermissions(id,app.id).filter(key=>permissionCeiling(app).includes(key))])
        .filter(([,keys])=>keys.length).map(([app,keys])=>`${esc(app.name)} · ${keys.length} 项`).join("　")||"尚未分配",
      btn("编辑权限","editStaff",id,"ghost"),
    ])));
}
function businessPage() {
  return businessReport.render(businessProducts());
}
const businessProducts = () => accessibleApps().filter(app=>app.tenant===tenantId&&hasPermission("analytics",app));
const currentAppRecords = rows => rows.filter(row=>row.app===appId);
const numberFormat = new Intl.NumberFormat("zh-CN");
const formatNumber = value => numberFormat.format(value);
function taskStats(tasks) {
  const completed=tasks.filter(task=>task.status==="已交付").length;
  const failed=tasks.filter(task=>task.status.startsWith("最终失败")).length;
  const deducted=tasks.reduce((sum,task)=>sum+task.debit,0);
  const refunded=tasks.reduce((sum,task)=>sum+task.refund,0);
  const successRate=completed+failed?formatNumber(Math.round(completed/(completed+failed)*100))+"%":"—";
  return {completed,failed,deducted,refunded,net:deducted-refunded,successRate};
}
function overviewMetrics(metrics) {
  return `<section class="metrics">${metrics.map(([label,value,symbol,detail])=>
    `<div class="card metric"><div class="metric-top">${tile(symbol)}${esc(label)}</div><strong>${esc(value)}</strong><small>${esc(detail)}</small></div>`).join("")}</section>`;
}
function appPage() {
  const app=currentApp();
  const active=appModules.filter((m,i)=>featureState(app,i).live);
  const tasks=currentAppRecords(db.tasks);
  const orders=currentAppRecords(db.orders);
  const stats=taskStats(tasks);
  const drilldown=(target,label)=>allowedRoute(target)?btn(label,"go",target,"ghost","arrow"):"—";
  return page("经营概览",`${app.name} · ${app.market} · 演示数据`,appStatus(app))+
    overviewMetrics([
      ["用户记录",formatNumber(currentAppRecords(db.users).length),"people","当前产品的演示用户"],
      ["支付订单",formatNumber(orders.length),"card",`${orders.filter(order=>order.status==="已到账").length} 笔权益已到账`],
      ["AI 任务",formatNumber(tasks.length),"ai",`${stats.completed} 次已交付`],
      ["金币净消耗",formatNumber(stats.net),"chart","任务扣减减去返还"],
    ])+
    `<div class="overview-grid">
      ${card(cardHead("当前产品待办")+workQueue(pendingWork([app])))}
      ${card(cardHead("已对用户开放的功能")+`<div class="pad actions">${active.length?active.map(name=>badge(name,"good")).join(""):"暂无已上线功能"}</div>`)}
    </div>`+
    card(cardHead("经营报表")+table(["经营维度","关注指标","明细"],[
      ["用户增长","新增、活跃与留存","—"],
      ["内容与模板","内容表现、创作请求、结果、下载与分享",drilldown("usageRanking","查看功能与模板排行")],
      ["AI 生产","任务量、成功率与用户资产净消耗",drilldown("taskAnalytics","查看 AI 任务与消耗")],
      ["支付与收入","成交、到账、支付日期、时区与币种",drilldown("orders","查看订单")],
      ["投放转化","访问、点击、业务漏斗及展示热度",drilldown("pageAnalytics","查看访问与点击")],
      ["产品运营操作记录","查看业务变更及处理记录",drilldown(routeFor(appModule("运营诊断")),"查看诊断日志")],
    ]));
}
const demoPageEvents = [
  {app:"viora",page:"Discover",event:"页面浏览",users:28,count:45},
  {app:"viora",page:"Create",event:"页面浏览",users:19,count:32},
  {app:"viora",page:"Discover",event:"打开模板",users:15,count:24},
  {app:"viora",page:"Create",event:"开始创作",users:11,count:17},
];
function pageAnalytics() {
  const events=currentAppRecords(demoPageEvents);
  const mode=recordQuery==="clicks"?"clicks":"views";
  const rows=events.filter(event=>(event.event==="页面浏览")===(mode==="views"));
  const views=[["views","页面浏览"],["clicks","按钮点击"]];
  const controls=`<div class="segmented" aria-label="统计类型">${views.map(([key,label])=>
    `<button data-action="analysisView" data-value="${key}" class="${key===mode?"selected":""}" aria-pressed="${key===mode}">${label}</button>`).join("")}</div>`;
  return page("页面访问与点击统计",`${currentApp().name} · 演示事件`)+
    card(cardHead("事件统计","",controls)+table(["页面","行为","次数","人数"],rows.map(row=>[
      esc(row.page),esc(row.event),formatNumber(row.count),formatNumber(row.users),
    ])));
}
function taskAnalytics() {
  const tasks=currentAppRecords(db.tasks);
  const stats=taskStats(tasks);
  const features=[...new Set(tasks.map(task=>task.feature))];
  return page("AI 任务与消耗统计",`${currentApp().name} · 演示任务`,allowedRoute("tasks")?btn("查看生成任务","go","tasks","ghost","arrow"):"")+
    overviewMetrics([
      ["任务总数",formatNumber(tasks.length),"ai","当前产品的演示任务"],
      ["成功率",stats.successRate,"chart","已交付／已交付及最终失败"],
      ["金币扣减",formatNumber(stats.deducted),"card",`已返还 ${formatNumber(stats.refunded)}`],
      ["金币净消耗",formatNumber(stats.net),"grid","金币扣减减去返还"],
    ])+
    card(cardHead("按业务功能汇总")+table(["业务功能","任务数","已交付","最终失败","金币扣减","金币返还","金币净消耗"],features.map(feature=>{
      const list=tasks.filter(task=>task.feature===feature);
      const totals=taskStats(list);
      return [esc(feature),list.length,totals.completed,totals.failed,totals.deducted,totals.refunded,totals.net];
    })));
}
function usageRanking() {
  const byTemplate=recordQuery==="templates";
  const key=byTemplate?"template":"feature";
  const title=byTemplate?"模板排行":"功能排行";
  const groups=new Map();
  for (const task of currentAppRecords(db.tasks)) {
    if (!task[key]) continue;
    if (!groups.has(task[key])) groups.set(task[key],[]);
    groups.get(task[key]).push(task);
  }
  const rows=[...groups].sort(([,a],[,b])=>b.length-a.length).map(([name,tasks],index)=>{
    const stats=taskStats(tasks);
    return [index+1,esc(name),tasks.length,new Set(tasks.map(task=>task.user)).size,stats.successRate,stats.net];
  });
  const controls=`<div class="segmented" aria-label="排行类型">
    <button data-action="analysisView" data-value="features" class="${byTemplate?"":"selected"}" aria-pressed="${!byTemplate}">功能排行</button>
    <button data-action="analysisView" data-value="templates" class="${byTemplate?"selected":""}" aria-pressed="${byTemplate}">模板排行</button>
  </div>`;
  return page("功能与模板排行",`${currentApp().name} · 演示任务`)+
    card(cardHead(title,"",controls)+table(["排名",byTemplate?"模板":"业务功能","使用次数","使用人数","成功率","金币净消耗"],rows));
}
function directoryAppOptions() {
  return option("全部产品","")+db.apps.filter(a=>!userDirectoryFilters.tenant||a.tenant===userDirectoryFilters.tenant)
    .map(a=>option(a.name,a.id,a.id===userDirectoryFilters.app)).join("");
}
function directoryRows() {
  const {query,tenant,app,status}=userDirectoryFilters;
  const rows=db.users.filter(user=>{
    const owner=db.apps.find(a=>a.id===user.app);
    return owner&&(!tenant||owner.tenant===tenant)&&(!app||user.app===app)&&
      (!status||userProfile(user).status===status)&&`${user.name} ${user.id}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  return table(["用户","所属租户 / 产品","账号类型","状态","注册日期","最近活跃","操作"],rows.map(user=>{
    const owner=db.apps.find(a=>a.id===user.app);
    const profile=userProfile(user);
    return [
      `<span class="table-name">${tile("people")}<span>${esc(user.name)}<small>${esc(user.id)}</small></span></span>`,
      `<span class="table-name"><span>${esc(owner.name)}<small>${esc(tenantName(owner))}</small></span></span>`,
      esc(profile.type||"—"),badge(profile.status||"未知",profile.status==="正常"?"good":profile.status==="受限"?"warn":"gray"),
      esc(profile.joined||"—"),esc(profile.lastActive||"—"),
      btn("查看产品用户","directoryUser",`${user.app}:${user.id}`,"ghost","arrow"),
    ];
  }));
}
function directoryPage() {
  const {query,tenant,status}=userDirectoryFilters;
  return page("用户管理","跨租户和产品定位终端用户。用户详情与售后操作按所属产品管理。")+
    card(cardHead("终端用户")+`<div class="filters">
      <input aria-label="搜索终端用户" placeholder="搜索用户编号或昵称" data-user-filter="query" value="${esc(query)}">
      <select aria-label="所属租户" data-user-filter="tenant">${option("全部租户","")}${db.tenants.map(t=>option(t.name,t.id,t.id===tenant)).join("")}</select>
      <select aria-label="所属产品" data-user-filter="app">${directoryAppOptions()}</select>
      <select aria-label="账号状态" data-user-filter="status">${option("全部状态","")}${["正常","受限"].map(s=>option(s,s,s===status)).join("")}</select>
      ${btn("清除筛选","resetDirectory","","ghost")}
    </div><div id="directory-results">${directoryRows()}</div>`);
}
const records = () => ({
  users:{title:labels.users,description:"查找本产品用户并查看账号及权益。",list:db.users,headers:["用户","用户编号","金币余额","操作"],render:u=>[
    `<span class="table-name">${tile("people")}${esc(u.name)}</span>`,esc(u.id),u.balance,btn("查看用户","userDetail",u.id,"ghost")]},
  tasks:{title:"生成任务",description:"查看生成进度、实际扣减、交付和故障返还。",list:db.tasks,headers:["任务编号","用户","功能","任务状态","实际扣减","返还","操作"],render:t=>[
    esc(t.id),esc(t.user),esc(t.feature),badge(t.status,t.status==="已交付"?"good":"warn"),t.debit,t.refund,btn("查看任务","taskDetail",t.id,"ghost")]},
  orders:{title:labels.orders,description:"查看支付状态、原商品快照和权益到账情况。",list:db.orders,headers:["订单编号","用户","商品","原币金额","状态","操作"],render:o=>[
    esc(o.id),esc(o.user),esc(o.name),esc(o.amount),badge(o.status,o.status==="已到账"?"good":"warn"),btn("查看订单","orderDetail",o.id,"ghost")]},
  reports:{title:labels.reports,description:"查看本产品的内容举报、进度及处置结果。",list:db.reports,headers:["举报编号","举报对象","原因","状态","操作"],render:r=>[
    esc(r.id),esc(r.name),esc(r.reason),badge(r.status,r.status==="已处理"?"good":"warn"),btn("查看举报","reportDetail",r.id,"ghost")]},
  products:{title:labels.products,description:"维护当前产品的商品售价和到账权益，历史订单沿用建单快照。",list:db.products,headers:["商品编号","商品","价格","到账金币","操作"],render:p=>[
    esc(p.id),esc(p.name),p.price,p.units,btn("编辑商品","editProduct",p.id,"ghost")]},
});
function recordRows(key,query="") {
  const config = records()[key];
  return table(config.headers,filteredRecords(key,query).map(config.render));
}
function filteredRecords(key,query) {
  return records()[key].list.filter(item=>item.app===appId &&
    [...Object.values(item),key==="users"?userProfile(item).contact:""].join(" ").toLowerCase().includes(query));
}
function recordPage(key) {
  const config=records()[key];
  const actions=key==="products"?btn("创建商品","editProduct","","primary","plus"):
    key==="users"?btn("导出邮箱","exportEmails"):
    key==="orders"&&hasPermission("exportOrders")?btn("导出订单明细","exportOrders"):"";
  return page(config.title,`${currentApp().name} · ${config.description}`,actions)+
  card(`<div class="filters"><input aria-label="搜索记录" placeholder="搜索名称、编号或状态" data-filter="${key}" value="${esc(recordQuery)}">${recordQuery?btn("查看全部记录","go",key,"ghost"):""}</div><div id="filtered-${key}">${recordRows(key,recordQuery.toLowerCase())}</div>`);
}
function exportCsv(name, rows) {
  const cell=value=>{
    const text=String(value??"");
    const literal=/^[\s]*[=+@-]|^[\t\r\n]/.test(text)?"'"+text:text;
    return '"'+literal.replaceAll('"','""')+'"';
  };
  const download=document.createElement("a");
  const file=new Blob(["\ufeff",rows.map(row=>row.map(cell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"});
  download.href=URL.createObjectURL(file);
  download.download=name;
  download.click();
  setTimeout(()=>URL.revokeObjectURL(download.href),1000);
}
function templatesPage() {
  const app=currentApp();
  const links=[["materials","素材库"],["features","功能开关与开放范围"],["aiPricing","AI 消耗规则"],
    [appModule("流量分发（草案）").id,"内容投放范围"]].filter(([target])=>allowedRoute(target));
  return page("模板库",`${app.name} · 管理本产品获准使用的公共模板。`)+
    `<div class="stack">${card(cardHead("公共模板版本")+table(["模板","来源","当前使用版本","可用版本","操作"],[
      ["Portrait Motion",badge("平台公共模板"),`v${app.template}.0`,"v2.0",app.template===2?badge("已使用最新版","good"):btn("查看并更新","template","","primary","arrow")],
    ]))}
    ${links.length?card(cardHead("关联配置")+`<div class="pad actions">${links.map(([target,label])=>btn(label,"openTemplateConfig",target,"ghost","arrow")).join("")}</div>`):""}</div>`;
}
const previousProductWording = {
  "按 App 核对模型及功能依赖":"按产品核对模型及功能依赖",
  "已授权模板与 App 自有素材":"已授权模板与产品自有素材",
};
const productWording = value => Object.hasOwn(previousProductWording,value)?previousProductWording[value]:value;
function auditPage() {
  return page("操作审计","查看实际操作者、目标产品、动作和时间。")+
    card(table(["时间","操作者","目标产品","操作"],db.audit.map(({at,who,app,action})=>[
      esc(at),esc(who),esc(db.apps.find(item=>item.id===app)?.name||"平台"),
      esc(action.replace(/^创建 App /,"创建产品 ")
        .replace(/^更新 App 授权上限 · /,"更新产品授权上限 · ")
        .replace(/^发布 App 功能配置$/,"发布产品功能配置")
        .replace(/^(更新 .+ 的) App 权限$/,"$1产品权限")
        .replace(/^保存App 预算 /,"保存产品预算 ")),
    ])));
}
function systemPage() {
  const safety = platformModule("平台安全设置");
  return page("系统管理","查看平台管理员、后台菜单、运行审计和安全设置。")+
    `<div class="stack">
      ${card(cardHead("平台账号与角色")+table(["管理角色","管理范围","账号状态"],[
        ["平台超级管理员","平台及所有租户与产品",badge("演示账号","good")],
      ]))}
      <div class="grid">
        ${card(`<div class="module">${tile("audit")}<h2>运行与审计</h2><p>按操作者和目标产品查看操作记录。</p>${btn("查看操作审计","go","audit","ghost","arrow")}</div>`)}
        ${card(`<div class="module">${tile("shield")}<h2>平台安全设置</h2><p>查看身份校验、验签、凭据和运行限制的设计。</p>${btn("查看安全设置","go",safety.id,"ghost","arrow")}</div>`)}
      </div>
    </div>`;
}
function discoveryGroups() {
  const [platform,tenant,app,endUser,services,delivery]=visibleCatalog;
  const domains=isPlatform()?[platform,app,services,endUser,delivery]:[tenant,app];
  const searchParents={"产品初始化":"apps","平台运行与审计":"system","平台安全设置":"system"};
  for (const tool of contentTools) searchParents[tool.name]="creationPages";
  if(appRoute()) domains.unshift(...domains.splice(domains.indexOf(app),1));
  const apps=accessibleApps();
  return domains.map(domain=>{
    const destinations=new Map();
    const main=domain===app?[...appCommon,...appGroupsForRole().flatMap(([, ,entries])=>entries)]:domain===platform?[...platformMain,...platformSettings]:domain===tenant?tenantNav:[];
    const available=id=>domain===app?apps.some(candidate=>allowedRoute(id,candidate)):allowedRoute(id);
    for(const [name,id] of main.filter(([,id])=>available(id))) destinations.set(id,{id,name,terms:[]});
    for(const module of domain.modules) {
      if (domain===app ? !apps.some(candidate=>moduleAllowed(module,candidate)) : !moduleAllowed(module)) continue;
      const id=searchParents[module.name]||routeFor(module);
      const destination=destinations.get(id)||{id,name:moduleTitle(module),terms:[]};
      destination.terms.push(module.name,...module.items);
      destinations.set(id,destination);
    }
    if(domain===platform) {
      destinations.get("directory").terms.push("终端用户","跨租户查找");
      destinations.get("system").terms.push("平台账号","后台菜单","运行审计","安全设置");
    }
    return {name:domain.name,items:[...destinations.values()]};
  });
}
function modulePage(module, description=module.domain) {
  if (returnLabel==="返回产品初始化") description=`${tenantName(currentApp())} / ${currentApp().name} · 从初始化进入平台配置`;
  const config=operationalModules[module.name];
  const catalogCard=card(cardHead("功能目录")+`<ul class="feature-list">${module.items.map(item=>`<li>${esc(item)}</li>`).join("")}</ul>`);
  if(!config) return page(moduleTitle(module),description)+catalogCard;
  const rows=moduleRecords(module).map((values,i)=>[
    ...values.map(esc),btn("编辑","moduleEdit",`${module.id}:${i}`,"ghost"),
  ]);
  return page(moduleTitle(module),description,btn(`新建${config.entity}`,"moduleEdit",module.id,"primary","plus"))+
    `<div class="stack">${card(cardHead(`${config.entity}列表`)+table([...config.fields,"操作"],rows))}${catalogCard}</div>`;
}
function moduleKey(module) {
  return module.domain==="产品运营"?`${appId}:${module.id}`:module.id;
}
function moduleRecords(module) {
  const saved=db.moduleRecords?.[moduleKey(module)];
  if(saved) return module.name==="流量分发（草案）"
    ? saved.map(([name,source,material])=>[name,source,productWording(material)]) : saved;
  const config=operationalModules[module.name];
  return module.domain==="产品运营"&&appId!=="viora"?[]:[config.sample];
}
function render() {
  renderChrome();
  const pages={overview,tenants:tenantsPage,apps:appsPage,myapps:appsPage,initialize:initializePage,
    features:featuresPage,staff:staffPage,business:businessPage,app:appPage,templates:templatesPage,audit:auditPage,
    pageAnalytics,taskAnalytics,usageRanking,
    materials:()=>pendingPage("materials","图片、视频及产品自有素材"),
    support:supportFrameworkPage,
    aiPricing:()=>pendingPage("aiPricing","本产品各模型规格的用户消耗"),
    directory:directoryPage,system:systemPage,telegram:()=>modulePage(platformModule("经营机器人管理（草案）"),"编辑演示推送计划，查看接收权限、查询指令和告警配置范围。")};
  root.innerHTML=pages[route]?pages[route]():records()[route]?recordPage(route):
    productFramework[route]?frameworkPage(route):modulePage(moduleById[route]);
  drawChart();
}
function pendingPage(key, description) {
  return page(labels[key],`${currentApp().name} · ${description}`)+card('<div class="empty">工作区入口已就绪，页面功能将在后续批次接入。</div>');
}
function frameworkPage(key) {
  if (key!=="creationPages") return pendingPage(key,productFramework[key][2]);
  const links=contentTools.filter(tool=>allowedRoute(routeFor(tool))).map(tool=>
    btn(tool.name,"go",routeFor(tool),"ghost","arrow")).join("");
  return page(labels[key],`${currentApp().name} · ${productFramework[key][2]}`)+
    card(cardHead("创作与工具")+`<div class="pad actions">${links||"当前产品暂无获授工具"}</div>`);
}
function supportFrameworkPage() {
  const app=currentApp();
  const details=app.id==="viora"?[
    ["付款后权益未到账",getRecord(db.orders,"ORD-8217"),"orders","查看关联订单"],
    ["生成失败后仍扣费",getRecord(db.tasks,"AI-3854"),"tasks","查看关联任务"],
  ]:[];
  const rows=details.filter(([,record])=>record).map(([title,record,target,label])=>{
    const links=[["users",record.user,"查看关联用户"],[target,record.id,label]].filter(([id])=>allowedRoute(id))
      .map(([id,query,text])=>btn(text,"openSupportRecord",`${id}:${query}`,"ghost","arrow")).join("");
    return [title,`<div class="actions">${links||"当前无关联记录查看权限"}</div>`];
  });
  return page(labels.support,`${app.name} · 客服交接演示`)+
    card(cardHead("会话入口")+(rows.length
      ? table(["演示咨询","关联记录"],rows)
      : '<div class="empty">当前产品暂无演示咨询</div>'));
}

function openDialog(title,body) {
  modal.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${esc(title)}</h2><button class="btn icon" data-action="close" aria-label="关闭">${icon("close")}</button></div><div class="dialog-body">${body}</div>`;
  if (!modal.open) modal.showModal();
}
function openForm(title,action,body,label="保存",id="") {
  openDialog(title,`<form data-form="${action}" data-id="${esc(id)}">${body}<div class="error" role="alert"></div><div class="actions"><button class="btn" type="button" data-action="close">取消</button><button class="btn primary" type="submit">${label}</button></div></form>`);
}
function facts(pairs) {
  return `<dl>${pairs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
}
const dialogActions = html => `<div class="actions">${html}</div>`;
const completed = message => { modal.close(); render(); say(message); };
const getRecord = (list,id) => inScope(appId) ? list.find(r=>r.app===appId && r.id===id) : undefined;
function showUser(id,section="profile") {
  if(!hasPermission("users")) return;
  const user=getRecord(db.users,id);
  if(!user) return;
  const profile=userProfile(user);
  const ownRecords=list=>list.filter(record=>record.user===id&&record.app===appId);
  const ledger=ownRecords(db.ledger);
  const sections={
    profile:facts([["用户编号",id],["所属租户",tenantName(currentApp())],["所属产品",currentApp().name],["账号类型",profile.type||"—"],["账号状态",profile.status||"—"],
      ["绑定邮箱",profile.contact||"—"],["注册来源",profile.source||"—"],["注册日期",profile.joined||"—"],["最近活跃",profile.lastActive||"—"]])+
      `<h3 class="detail-heading">权益摘要</h3>${facts([["金币余额",user.balance],["权益流水",`${ledger.length} 条演示记录`]])}`,
    ledger:facts([["金币余额",user.balance]])+
      `<h3 class="detail-heading">权益流水</h3>${table(["来源","数量","说明"],ledger.map(l=>[esc(l.kind),l.units,esc(l.reason)]))}`,
    orders:table(["订单编号","原币金额","到账状态","操作"],ownRecords(db.orders).map(o=>[
      esc(o.id),esc(o.amount),esc(o.status),btn("查看订单","orderDetail",o.id,"ghost")])),
    tasks:table(["任务编号","状态","返还金币","操作"],ownRecords(db.tasks).map(t=>[
      esc(t.id),esc(t.status),t.refund,btn("查看任务","taskDetail",t.id,"ghost")])),
  };
  const controls=[["profile","基本资料"],["ledger","权益与流水"],
    ...[["orders","交易订单"],["tasks","生成任务"]].filter(([key])=>hasPermission(key))];
  if(!controls.some(([key])=>key===section)) return;
  openDialog(`用户详情 · ${user.name}`,`<div class="segmented detail-tabs" aria-label="用户详情分类">${controls.map(([key,label])=>
    `<button data-action="userSection" data-value="${esc(id)}:${key}" class="${section===key?"selected":""}" aria-pressed="${section===key}">${label}</button>`).join("")}</div>`+
    sections[section]+(hasPermission("compensate")?dialogActions(btn("补发金币","compensate",id,"primary","plus")):""));
}
const legacySearchTerms = {
  apps:["App 管理","App管理"],myapps:["我的 App"],business:["多 App 经营分析"],app:["单 App 经营分析"],
};
function moduleSearch(query="") {
  const needle=query.trim().toLowerCase();
  const results=discoveryGroups().flatMap(({name,items})=>items.filter(item=>
    [item.name,...item.terms,...(legacySearchTerms[item.id]||[])].some(term=>term.toLowerCase().includes(needle))).map(item=>{
    const detail=needle&&item.terms.find(term=>term!==item.name&&term.toLowerCase().includes(needle));
    return `<button class="btn" data-action="searchResult" data-value="${item.id}"><span><b>${esc(item.name)}</b><small>${esc(name)}${detail?" · "+esc(detail):""}</small></span>${icon("arrow",14)}</button>`;
  })).join("");
  return results||`<div class="empty">没有找到匹配模块</div>`;
}
const handlers = {
  back:()=>{if(navigationIndex>0) history.back();},
  go: target=>{ modal.close(); go(target); },
  reportMetric:metric=>{ if(route==="business") { businessReport.setMetric(metric); render(); } },
  reportOrder:()=>{ if(route==="business") { businessReport.reverseSort(); render(); } },
  reportAll:()=>{ if(route==="business") { businessReport.chooseProducts(null); render(); } },
  analysisView:view=>{
    if (route==="pageAnalytics" || route==="usageRanking") go(route,view);
  },
  openApp: id=>{ modal.close(); selectApp(id); },
  initApp: id=>{ if(isPlatform()) selectApp(id,"initialize"); },
  openWork:value=>{
    const [id,target,status=""]=value.split(":");
    modal.close();
    selectApp(id,target,status);
  },
  openInitConfig:target=>{
    if(isPlatform()&&route==="initialize") go(target,"",appId,step,"返回产品初始化");
  },
  openProductStaff:id=>{
    if(role==="owner"&&inScope(id)) go("staff",id,appId,step,"返回我的产品");
  },
  openSupportRecord:value=>{
    if(route!=="support") return;
    const [target,query]=value.split(":");
    go(target,query,appId,step,"返回在线客服");
  },
  openTemplateConfig:target=>{
    if(route==="templates") go(target,"",appId,step,"返回模板库");
  },
  close:()=>modal.close(),
  mobile:()=>{menuOpen=!menuOpen; document.body.classList.toggle("menu-open",menuOpen);},
  range:value=>{range=Number(value);render();},
  step:value=>{if(isPlatform()) {step=Number(value);saveNavigation();render();}},
  search:()=>{
    openDialog("搜索可用功能",`<div class="module-search-bar"><input id="search-module" aria-label="输入模块或功能名称" placeholder="搜索当前身份可用的模块或功能"></div><div id="search-results" class="mini-list">${moduleSearch()}</div>`);
    document.querySelector("#search-module").focus();
  },
  searchResult:target=>{
    if(!appRoute(target)) {modal.close();go(target);return;}
    const apps=accessibleApps().filter(app=>allowedRoute(target,app));
    const current=appRoute()?apps.find(app=>app.id===appId):null;
    if(current||apps.length===1) {
      modal.close();
      selectApp((current||apps[0]).id,target);
      return;
    }
    openDialog("选择产品",`<div class="mini-list">${apps.map(app=>btn(`${app.name} · ${tenantName(app)}`,"searchApp",`${app.id}:${target}`,"","app")).join("")}</div>`);
  },
  searchApp:value=>{
    const [id,target]=value.split(":");
    modal.close();
    selectApp(id,target);
  },
  roles:()=>openDialog("切换演示身份",`<div class="mini-list">${Object.entries(accounts).map(([id,label])=>btn(label,"role",id,role===id&&tenantId==="t1"?"primary":"","people")).join("")}
    ${db.tenants.filter(t=>t.active&&t.id!=="t1").map(t=>btn(`${t.name} · 租户最高管理员`,"role",`owner:${t.id}`,role==="owner"&&tenantId===t.id?"primary":"","people")).join("")}</div>`),
  role:value=>{
    const [id,tenant="t1"]=value.split(":");
    if(!Object.hasOwn(accounts,id)) return;
    if(!db.tenants.some(t=>t.id===tenant&&t.active)) return;
    role=id; tenantId=tenant; modal.close();
    businessReport.reset();
    appId=accessibleApps()[0]?.id||"";
    route=isPlatform()?"overview":"myapps";
    step=0; recordQuery=""; navigationIndex=0; returnLabel=""; navigationContext=Math.random();
    saveNavigation(); showPage();
    say(`已切换为${accounts[role]}`);
  },
  workspace:()=>openDialog("切换工作区",`<div class="mini-list">${isPlatform()?btn("平台总后台","go","overview","", "layers"):btn("租户工作台","go","myapps","", "layers")}${accessibleApps().map(a=>btn(`${a.name} · ${tenantName(a)}`,"openApp",a.id,"","app")).join("")}</div>`),
  newTenant:()=>{ if(isPlatform()) openForm("新建租户","tenant",field("租户名称","name","","text","required maxlength=40")+field("最高管理员","owner","","text","required maxlength=30")+`<div class="checks">${appModules.map((m,i)=>check("modules",i,m,i<2)).join("")}</div>`,"创建租户"); },
  tenantDetail:id=>{
    if(!isPlatform()) return;
    const t=db.tenants.find(t=>t.id===id);
    if(!t) return;
    const apps=db.apps.filter(a=>a.tenant===id);
    openDialog("租户详情",facts([["租户名称",t.name],["最高管理员",t.owner],["获授功能",t.allowed.map(i=>appModules[i]).join("、")],["状态",t.active?"启用":"停用"]])+
      table(["关联产品","授权上限","操作"],apps.map(a=>[esc(a.name),`${permissionCeiling(a).length} 项`,btn("设置产品授权上限","grantApp",a.id,"ghost")]))+
      dialogActions(btn("创建 / 登记产品","newApp",id,"ghost","plus")+
        btn("设置租户功能","grantTenant",id,"primary")));
  },
  grantApp:id=>{
    const app=db.apps.find(item=>item.id===id);
    if(!isPlatform()||!app) return;
    const assigned=permissionCeiling(app);
    openForm(`产品授权上限 · ${app.name}`,"grantApp",
      '<p class="inline-note">收回的权限立即失效。重新开放时，仍持有该项授权的员工会自动恢复。</p>'+
      '<h3>日常业务</h3>'+permissionChecks("ceiling",businessPermissions,assigned)+
      '<h3>独立授权</h3>'+permissionChecks("ceiling",exceptionPermissions,assigned),"保存产品授权",id);
  },
  grantTenant:id=>{
    if(!isPlatform()) return;
    const t=db.tenants.find(t=>t.id===id);
    if(!t) return;
    openForm(`设置授权 · ${t.name}`,"grantTenant",`<p class="inline-note">租户在获授范围内为产品启用功能并分配人员。</p><div class="checks">${appModules.map((m,i)=>check("modules",i,m,t.allowed.includes(i))).join("")}</div>`,"保存授权",id);
  },
  newApp:initialTenant=>{
    if(!isPlatform()) return;
    openForm("创建 / 登记产品","app",
      field("产品名称","name","","text","required maxlength=35")+
      select("所属租户","tenant",db.tenants.filter(t=>t.active).map(t=>option(t.name,t.id,t.id===initialTenant)))+
      select("初始化路径","type",Object.entries(productPaths).map(([value,label])=>option(label,value)))+
      field("市场或终端","market","演练环境","text","required maxlength=40"),"创建并初始化");
  },
  appDetail:id=>{
    const app=db.apps.find(item=>item.id===id);
    if(!isPlatform()||!app) return;
    openDialog(`产品详情 · ${app.name}`,facts([
      ["所属租户",tenantName(app)],["市场或终端",app.market],["初始化路径",productPaths[app.type]||app.type],["交付状态",app.status],
      ["已核对",`${app.done.length} / ${steps.length}`],
    ])+dialogActions(btn("终端交付配置","openWork",`${id}:${platformModule("终端交付配置（批次待定）").id}`,"ghost")+
      btn(isDelivered(app)?"查看初始化记录":"产品初始化","viewInitialization",id,"primary")));
  },
  viewInitialization:id=>{ if(isPlatform()) {modal.close();selectApp(id,"initialize");} },
  deliver:id=>{
    const app=currentApp();
    if(!isPlatform()||app.id!==id) return;
    const blockers=deliveryBlockers(app);
    if(blockers.length) {say(blockers.join("。"));return;}
    if(isDelivered(app)) {say("该产品已交付");return;}
    app.status="已交付"; log("确认初始化交付");
    render(); say(`${app.name} 已交付租户`);
  },
  toggleFeature:value=>{
    if(!hasPermission("features")) return;
    const app=currentApp(),i=Number(value),s=featureState(app,i);
    if(!s.granted||!s.ready) return;
    app.enabled=s.enabled?app.enabled.filter(x=>x!==i):[...app.enabled,i];
    save(); render();
    say("已保存启用配置，发布后对用户生效");
  },
  previewFeatures:()=>{
    if(!allowedRoute("features")) return;
    const app=currentApp();
    openDialog(`${app.name} 用户侧预览`,facts([["当前可用",appModules.filter((m,i)=>featureState(app,i).live).join("、")||"无"],["待发布配置",appModules.filter((m,i)=>{const s=featureState(app,i);return s.granted&&s.ready&&s.enabled;}).join("、")||"无"],["内部依赖",app.enabled.includes(3)&&app.ready.includes(3)?"角色聊天可调用已配置的内部生图能力":"按已启用业务的依赖运行"]]));
  },
  publish:()=>{
    const app=currentApp();
    if(!hasPermission("features")) return;
    if(!isDelivered(app)) {say("交付完成后可发布启用配置");return;}
    openForm("发布启用配置","publish",`<p>发布后应用当前启用项。关闭独立工具只影响对应入口与独立请求。</p>`,"确认发布");
  },
  editStaff:id=>{
    if(!["platform","owner"].includes(role)||!db.grants[id]) return;
    const list=accessibleApps().filter(a=>a.tenant==="t1");
    openForm(`员工授权 · ${accounts[id]}`,"staff",
      '<p>展开产品，勾选员工需要的业务功能。独立操作权限在下方单独分配。</p>'+
      (list.map((a,index)=>{
        const selected=assignedPermissions(id,a.id);
        const ceiling=permissionCeiling(a);
        const name=`grant-${a.id}`;
        const suspended=selected.filter(key=>!ceiling.includes(key));
        return `<details class="permission-app" ${index===0?"open":""}><summary>${esc(a.name)}</summary>
          <h3>日常业务</h3>${permissionChecks(name,businessPermissions,selected,ceiling)}
          <h3>独立授权</h3>${permissionChecks(name,exceptionPermissions,selected,ceiling)}
          ${suspended.length?'<h3>平台暂停的权限</h3><p>取消勾选可撤销员工原有授权。</p>'+permissionChecks(name,permissions,selected,suspended):""}</details>`;
      }).join("")||'<p class="inline-note">暂无可授权的产品。</p>'),"保存权限",id);
  },
  template:()=>{
    if(!hasPermission("templates")||currentApp().template===2) return;
    openForm("更新公共模板","template",facts([["模板","Portrait Motion"],["当前版本","v1.0"],["目标版本","v2.0"],["版本变更","更新封面示例和说明文案"],["生效范围",currentApp().name]]),"更新到 v2.0");
  },
  resetDirectory:()=>{
    if(!isPlatform()) return;
    Object.assign(userDirectoryFilters,{query:"",tenant:"",app:"",status:""});
    render();
  },
  directoryUser:value=>{
    if(!isPlatform()) return;
    const [app,id]=value.split(":");
    if(!inScope(app)||!db.users.some(user=>user.app===app&&user.id===id)) return;
    selectApp(app,"users");
    showUser(id);
  },
  userDetail:id=>showUser(id),
  exportEmails:()=>{
    if(route!=="users"||!hasPermission("users")) return;
    const users=filteredRecords("users",recordQuery.trim().toLowerCase()).filter(user=>userProfile(user).contact);
    if(!users.length) {say("当前筛选范围没有邮箱记录");return;}
    exportCsv("用户邮箱.csv",[["用户编号","邮箱"],...users.map(user=>[user.id,userProfile(user).contact])]);
    log(`导出 ${users.length} 条用户邮箱`);
  },
  exportOrders:()=>{
    if(route!=="orders"||!hasPermission("orders")||!hasPermission("exportOrders")) return;
    const orders=filteredRecords("orders",recordQuery.trim().toLowerCase());
    if(!orders.length) {say("当前筛选范围没有订单记录");return;}
    exportCsv("订单明细.csv",[["订单编号","用户编号","商品","原币金额","状态"],...orders.map(o=>[o.id,o.user,o.name,o.amount,o.status])]);
    log(`导出 ${orders.length} 条订单明细`);
  },
  userSection:value=>{
    const [id,section]=value.split(":");
    if(["profile","ledger","orders","tasks"].includes(section)) showUser(id,section);
  },
  compensate:id=>{
    if(!hasPermission("users")||!hasPermission("compensate")||!getRecord(db.users,id)) return;
    openForm("人工补发金币","compensate",field("补发数量","units","","number","required min=1 max=100000 step=1")+
      `<label class="field"><span>补发原因</span><textarea name="reason" required maxlength="120"></textarea></label>`,"确认补发",id);
  },
  taskDetail:id=>{
    if(!allowedRoute("tasks")) return;
    const t=getRecord(db.tasks,id);
    if(!t) return;
    openDialog(`任务详情 · ${t.id}`,facts([["用户编号",t.user],["功能",t.feature],["状态",t.status],["实际扣减",`${t.debit} 金币`],["已返还",`${t.refund} 金币`]])+
      (isPlatform()&&t.status==="故障待结算"?dialogActions(btn("模拟系统自动返还","refund",t.id,"primary")):""));
  },
  orderDetail:id=>{
    if(!hasPermission("orders")) return;
    const o=getRecord(db.orders,id);
    if(!o) return;
    openDialog(`订单详情 · ${o.id}`,facts([["用户编号",o.user],["下单商品",o.name],["原币金额",o.amount],["原到账金币",o.units],["状态",o.status]])+
      (isPlatform()&&o.status==="已支付待到账"?dialogActions(btn("模拟到账回调","settle",id,"primary")):""));
  },
  reportDetail:id=>{
    if(!allowedRoute("reports")) return;
    const r=getRecord(db.reports,id);
    if(!r) return;
    openDialog(`举报详情 · ${r.id}`,facts([["对象",r.name],["原因",r.reason],["当前状态",r.status],["处理记录",r.result||"—"]])+
      (isPlatform()&&r.status==="待处理"?dialogActions(btn("记录处置","resolveReport",id,"primary")):""));
  },
  resolveReport:id=>{
    if(!isPlatform()||!getRecord(db.reports,id)) return;
    openForm("记录举报处置","report",`<label class="field"><span>处置结果与原因</span><textarea name="result" required maxlength="160"></textarea></label>`,"提交处置",id);
  },
  editProduct:id=>{
    if(!hasPermission("products")) return;
    const p=getRecord(db.products,id);
    openForm(p?"编辑商品":"创建商品","product",field("商品名称","name",p?.name,"text","required maxlength=40")+
      field("售价（演示币种 INR）","price",p?.price,"number","required min=0 max=1000000 step=.01")+
      field("到账金币","units",p?.units,"number","required min=0 max=1000000 step=1"),"保存商品",id);
  },
  moduleEdit:value=>{
    const [id,index]=value.split(":"),module=moduleById[id],config=module&&operationalModules[module.name];
    if(!config||!moduleAllowed(module)) return;
    const record=moduleRecords(module)[Number(index)]||[];
    const fields=config.fields.map((label,i)=>i===2&&config.choices?
      select(label,`m${i}`,config.choices.map(choice=>option(choice,choice,choice===record[i]))):
      field(label,`m${i}`,record[i],"text","required maxlength=120")).join("");
    openForm(`${index===undefined?"新建":"编辑"}${config.entity}`,"moduleRecord",fields,"保存演示配置",value);
  },
  refund:id=>{
    if(!isPlatform()) return;
    const t=getRecord(db.tasks,id),u=t&&getRecord(db.users,t.user);
    if(!u||t.status!=="故障待结算"||t.refund) return;
    t.refund=t.debit; t.status="最终失败 · 已返还"; u.balance+=t.debit;
    db.ledger.unshift({user:u.id,app:appId,kind:"故障自动返还",units:t.debit,reason:t.id});
    log(`模拟系统返还 ${t.id}`); completed(`已返还本次扣除的 ${t.debit} 金币`);
  },
  settle:id=>{
    if(!isPlatform()) return;
    const o=getRecord(db.orders,id),u=o&&getRecord(db.users,o.user);
    if(!u||o.status!=="已支付待到账") return;
    o.status="已到账"; u.balance+=o.units;
    db.ledger.unshift({user:u.id,app:appId,kind:"订单到账",units:o.units,reason:o.id});
    log(`模拟订单到账 ${o.id}`); completed("已按原订单快照发放权益");
  },
};
const idFor = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const forms = {
  reportProducts:data=>{
    if(route!=="business") return;
    const available=businessProducts();
    const selected=available.filter(product=>data.getAll("product").includes(product.id)).map(product=>product.id);
    if(!selected.length) return "请选择至少一个产品";
    businessReport.chooseProducts(selected.length===available.length?null:selected);
    render();
  },
  reportDates:data=>{
    if(route!=="business") return;
    if(!businessReport.applyDates(data.get("start"),data.get("end"))) return "请选择有效的开始和结束日期";
    render();
  },
  tenant:data=>{
    if(!isPlatform()) return;
    const name=data.get("name").trim(),owner=data.get("owner").trim();
    if(!name||!owner) return "请填写租户名称和最高管理员";
    if(db.tenants.some(t=>t.name===name)) return "该租户名称已存在";
    db.tenants.push({id:idFor("t"),name,owner,allowed:data.getAll("modules").map(Number),active:true});
    log(`新建租户 ${name}`,"");
    modal.close(); go("tenants"); say("租户已创建");
  },
  grantTenant:(data,id)=>{
    if(!isPlatform()) return;
    const t=db.tenants.find(t=>t.id===id);
    if(!t) return;
    t.allowed=data.getAll("modules").map(Number);
    for(const app of db.apps.filter(a=>a.tenant===id)) {
      app.live=app.live.filter(i=>t.allowed.includes(i)); app.enabled=app.enabled.filter(i=>t.allowed.includes(i));
    }
    log(`更新租户授权 ${t.name}`,""); completed("授权已更新");
  },
  grantApp:(data,id)=>{
    const app=db.apps.find(item=>item.id===id);
    if(!isPlatform()||!app) return;
    app.businessCeiling=Object.keys(permissions).filter(key=>data.getAll("ceiling").includes(key));
    log(`更新产品授权上限 · ${app.name}`,id);
    completed("产品授权上限已更新");
  },
  app:data=>{
    if(!isPlatform()) return;
    const name=data.get("name").trim(),market=data.get("market").trim(),tenant=data.get("tenant");
    if(!name||!market||!db.tenants.some(t=>t.id===tenant&&t.active)) return "请填写产品资料并选择租户";
    if(db.apps.some(a=>a.name===name&&a.tenant===tenant)) return "该租户已存在同名产品";
    const id=idFor("app");
    db.apps.push({id,tenant,name,letter:name[0],market,color:"",type:data.get("type"),done:[],ready:[],enabled:[],live:[],fields:{},template:1,status:"待准备"});
    log(`创建产品 ${name}`,id); modal.close(); selectApp(id,"initialize"); say("产品已创建，进入产品初始化");
  },
  step:data=>{
    if(!isPlatform()) return;
    const app=currentApp(),values=stepFields[step].map((_,i)=>data.get(`f${i}`).trim());
    if(values.some(v=>!v)) {say("请填写本步骤的核对结果");return;}
    app.fields[step]=values;
    if(!app.done.includes(step)) app.done.push(step);
    if(step===2) app.ready=data.getAll("ready").map(Number).filter(i=>tenantFor(app).allowed.includes(i));
    if(!isDelivered(app)) app.status=app.done.length===steps.length?"可交付":"接入核对中";
    log(`保存初始化 · ${steps[step]}`); render(); say("已保存并标记本步骤已核对");
  },
  publish:()=>{
    const app=currentApp();
    if(!hasPermission("features")||!isDelivered(app)) return;
    app.live=app.enabled.filter(i=>featureState(app,i).granted&&featureState(app,i).ready);
    log("发布产品功能配置"); completed("用户侧功能已更新");
  },
  staff:(data,id)=>{
    if(!["platform","owner"].includes(role)||!db.grants[id]) return;
    accessibleApps().filter(a=>a.tenant==="t1").forEach(a=>{
      const ceiling=permissionCeiling(a);
      const previous=assignedPermissions(id,a.id);
      db.grants[id][a.id]=data.getAll(`grant-${a.id}`).filter(key=>ceiling.includes(key)||previous.includes(key));
    });
    log(`更新 ${accounts[id]} 的产品权限`,""); completed("员工权限已保存");
  },
  template:()=>{
    if(!hasPermission("templates")) return;
    currentApp().template=2; log("主动更新公共模板到 v2.0"); completed("当前产品已更新到 v2.0");
  },
  compensate:(data,id)=>{
    const u=getRecord(db.users,id),units=Number(data.get("units")),reason=data.get("reason").trim();
    if(!u||!hasPermission("users")||!hasPermission("compensate")) return;
    if(!Number.isInteger(units)||units<1||!reason) return "请填写有效数量和补发原因";
    u.balance+=units; db.ledger.unshift({user:id,app:appId,kind:"人工补发",units,reason});
    log(`为 ${id} 补发 ${units} 金币`);
    render(); showUser(id,"ledger"); say("补发成功，已记录权益流水");
  },
  report:(data,id)=>{
    if(!isPlatform()) return;
    const r=getRecord(db.reports,id),result=data.get("result").trim();
    if(!r||r.status!=="待处理") return;
    if(!result) return "请填写处置结果";
    r.status="已处理"; r.result=result; log(`处置举报 ${id}`); completed("举报处理结果已记录");
  },
  product:(data,id)=>{
    if(!hasPermission("products")) return;
    const name=data.get("name").trim(),price=Number(data.get("price")),units=Number(data.get("units"));
    if(!name||!Number.isFinite(price)||price<0||!Number.isInteger(units)||units<0) return "请填写有效商品信息";
    const old=getRecord(db.products,id);
    if(id&&!old) return;
    if(old) Object.assign(old,{name,price,units});
    else db.products.push({id:idFor("SKU"),app:appId,name,price,units});
    log(`保存商品 ${name}`); completed("商品已保存");
  },
  moduleRecord:(data,value)=>{
    const [id,index]=value.split(":"),module=moduleById[id],config=module&&operationalModules[module.name];
    if(!config||!moduleAllowed(module)) return;
    const values=config.fields.map((_,i)=>data.get(`m${i}`).trim());
    if(values.some(v=>!v)) return "请填写完整配置";
    const records=structuredClone(moduleRecords(module));
    if(index===undefined) records.push(values);
    else records[Number(index)]=values;
    db.moduleRecords||={};
    db.moduleRecords[moduleKey(module)]=records;
    log(`保存${config.entity} ${values[0]}`,module.domain==="产品运营"?appId:"");
    completed("演示配置已保存");
  },
};
document.addEventListener("click",event=>{
  const target=event.target.closest("[data-action]");
  if(target&&!target.disabled) handlers[target.dataset.action]?.(target.dataset.value||"");
});
document.addEventListener("submit",event=>{
  const form=event.target;
  if(!form.dataset.form) return;
  event.preventDefault();
  const error=forms[form.dataset.form]?.(new FormData(form),form.dataset.id);
  const output=form.querySelector(".error");
  if(output) output.textContent=error||"";
});
function updateFilter(target) {
  const key=target.dataset.filter;
  if(!key) return;
  const query=root.querySelector(`input[data-filter="${key}"]`).value.trim().toLowerCase();
  const container=document.querySelector(`#filtered-${key}`);
  if(key!=="tenants") {
    recordQuery=target.value;
    saveNavigation();
  }
  container.innerHTML=key==="tenants"?tenantRows(query,root.querySelector("select[data-filter=tenants]").value):recordRows(key,query);
}
function updateDirectoryFilter(target) {
  const filter=target.dataset.userFilter;
  if(!filter||!isPlatform()||route!=="directory") return;
  userDirectoryFilters[filter]=target.value;
  if(filter==="tenant") {
    userDirectoryFilters.app="";
    root.querySelector('[data-user-filter="app"]').innerHTML=directoryAppOptions();
  }
  root.querySelector("#directory-results").innerHTML=directoryRows();
}
document.addEventListener("input",event=>{
  if(event.target.id==="search-module") document.querySelector("#search-results").innerHTML=moduleSearch(event.target.value);
  if(event.target.matches("input")) {
    updateDirectoryFilter(event.target);
    updateFilter(event.target);
  }
});
document.addEventListener("change",event=>{
  if(event.target.dataset.change==="init-app") selectApp(event.target.value,"initialize");
  if(route==="business") {
    const changes={"report-period":businessReport.setPeriod,"report-currency":businessReport.setCurrency,"report-sort":businessReport.setSort};
    const apply=changes[event.target.dataset.change];
    if(apply) { apply(event.target.value); render(); }
  }
  if(event.target.matches("select")) {
    updateDirectoryFilter(event.target);
    updateFilter(event.target);
  }
});
document.addEventListener("keydown",event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k") {event.preventDefault();handlers.search();}
});
window.addEventListener("resize",drawChart);
window.addEventListener("storage",event=>{
  if(event.key!==stateKey && event.key!==null) return;
  db=loadDemoData(event.newValue);
  modal.close();
  if(!allowedRoute(route)) {
    go(isPlatform()?"overview":"myapps");
    say("权限已更新，请从可用页面继续");
    return;
  }
  render();
});
window.addEventListener("popstate",event=>{
  modal.close();
  if (!restoreNavigation(event.state)) {
    route=isPlatform()?"overview":"myapps";
    appId=accessibleApps()[0]?.id||"";
    step=0; recordQuery=""; navigationIndex=0; returnLabel="";
    saveNavigation();
  }
  showPage();
});
if (!restoreNavigation(history.state)) saveNavigation();
render();
