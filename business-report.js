const businessReport = (() => {
  const hour = 3600000;
  const day = 24 * hour;
  const offset = 8 * hour;
  const periods = {today:1, week:7, month:30};
  const metrics = {amount:"收款金额", payment:"支付成功率", signups:"新增注册账号", tasks:"AI 生成任务"};
  const profiles = {
    viora:{scale:5, currencies:["INR","USD"], seed:13},
    studio:{scale:2, currencies:["USD"], seed:37},
  };
  const moneyFormats = {};
  const percentFormat = new Intl.NumberFormat("zh-CN",{style:"percent",maximumFractionDigits:1});
  const pointFormat = new Intl.NumberFormat("zh-CN",{maximumFractionDigits:1,signDisplay:"exceptZero"});
  const money = (code,value) => {
    moneyFormats[code] ??= new Intl.NumberFormat("zh-CN",{style:"currency",currency:code,maximumFractionDigits:2});
    return moneyFormats[code].format(value/100);
  };
  const pct = (top,bottom) => bottom?percentFormat.format(top/bottom):"—";
  const dayString = time => new Date(time+offset).toISOString().slice(0,10);
  const hourString = time => new Date(time+offset).toISOString().slice(11,16);
  const midnight = time => Math.floor((time+offset)/day)*day-offset;
  const startDate = value => Date.parse(value+"T00:00:00+08:00");

  function defaults() {
    return {period:"today", selected:null, start:"", end:"", metric:"amount", currency:"", sort:"amount", ascending:false};
  }
  let filters=defaults();

  function range() {
    const updated=Math.floor(Date.now()/hour)*hour;
    const today=midnight(updated);
    const firstAvailable=today-119*day;
    const custom=filters.period==="custom";
    const days=periods[filters.period]||1;
    const start=custom?startDate(filters.start):today-(days-1)*day;
    const lastDay=custom?startDate(filters.end):today;
    const end=Math.min(lastDay+day,updated);
    const comparisonShift=lastDay+day-start;
    return {start,end,updated,today,firstAvailable,comparisonShift};
  }

  function events(profile,time,firstAvailable,cutoff) {
    const tick=Math.floor(time/hour);
    const fluctuation=(value,modulo)=>(value*17+7*Math.floor((value*hour+offset)/day)+profile.seed)%modulo;
    const volume=hourString(time)>="08:00"?profile.scale:Math.max(1,Math.floor(profile.scale/2));
    const initiated=volume+fluctuation(tick,4);
    const onTime=initiated-1-fluctuation(tick,2);
    const completesLater=fluctuation(tick,3)===0;
    const paidFromEarlier=time>firstAvailable&&fluctuation(tick-1,3)===0?1:0;
    const collected=onTime+paidFromEarlier;
    const amounts={};
    for (const code of profile.currencies) {
      const count=code==="INR"?Math.ceil(collected*0.8):profile.currencies.length===1?collected:Math.floor(collected*0.2);
      amounts[code]=count*(code==="INR"?19900:499);
    }
    const tasks=volume*8+fluctuation(tick,19);
    const ended=tasks-fluctuation(tick,5);
    return {
      amounts,initiated,successful:onTime+Number(completesLater&&time+hour<cutoff),paid:collected,
      signups:volume*2+fluctuation(tick,11),tasks,ended,completed:ended-fluctuation(tick,7),
    };
  }
  function emptyStats() {
    return {amounts:{},initiated:0,successful:0,paid:0,signups:0,tasks:0,ended:0,completed:0};
  }
  function add(target,source) {
    for (const key of Object.keys(target)) {
      if (key!=="amounts") target[key]+=source[key];
    }
    for (const [code,value] of Object.entries(source.amounts)) {
      target.amounts[code]=(target.amounts[code]||0)+value;
    }
    return target;
  }
  function buckets(products,dates) {
    const interval=filters.period==="today"?hour:day;
    const comparisonShift=dates.comparisonShift;
    return products.map(product=>{
      const profile=profiles[product.id];
      if (!profile) return {product,current:null,previous:null,points:[]};
      const current=emptyStats();
      const previous=dates.start-comparisonShift<dates.firstAvailable?null:emptyStats();
      const points=[];
      for (let time=dates.start;time<dates.end;time+=interval) {
        const data=emptyStats();
        for (let tick=time;tick<Math.min(time+interval,dates.end);tick+=hour) {
          add(data,events(profile,tick,dates.firstAvailable,dates.updated));
          if (previous) add(previous,events(profile,tick-comparisonShift,dates.firstAvailable,dates.end-comparisonShift));
        }
        points.push({time,data});
        add(current,data);
      }
      return {product,current,previous,points};
    });
  }
  function delta(current,previous) {
    if (previous===undefined || previous===null) return "暂无同期数据";
    if (!previous) return current?"本期新增":"持平";
    const ratio=(current-previous)/previous;
    if (!ratio) return "持平";
    return (ratio>0?"+":"−")+percentFormat.format(Math.abs(ratio));
  }
  function changeHint(current,previous) {
    const comparison=filters.period==="today"?"昨天同期":"上期同期";
    if (previous===undefined||previous===null) return "暂无同期数据";
    const change=delta(current,previous);
    return change==="持平"?`与${comparison}持平`:change==="本期新增"?"上期为 0，本期新增":`较${comparison} ${change}`;
  }
  function metricValue(data,currency,metric=filters.metric) {
    if (!data) return null;
    if (metric==="amount") return data.amounts[currency]||0;
    if (metric==="payment") return data.initiated?data.successful/data.initiated:null;
    return data[metric];
  }
  function valueLabel(value,currency) {
    if (value===null) return "—";
    if (filters.metric==="amount") return money(currency,value);
    if (filters.metric==="payment") return percentFormat.format(value);
    return formatNumber(value);
  }

  function controls(products,dates) {
    const selected=filters.selected;
    const periodOptions=[["today","今天"],["week","近 7 天"],["month","近 30 天"],["custom","自定义"]];
    const min=dayString(dates.firstAvailable),max=dayString(dates.today);
    return `<div class="report-controls">
      <details class="report-products">
        <summary>${selected===null?"全部获准产品":`已选 ${products.filter(product=>selected.includes(product.id)).length} 个产品`}</summary>
        <form data-form="reportProducts">
          <div class="checks">${products.map(p=>check("product",p.id,p.name,selected===null||selected.includes(p.id))).join("")}</div>
          <div class="actions"><button type="button" class="btn ghost" data-action="reportAll">恢复全部</button><button type="submit" class="btn primary">应用</button></div>
          <div class="error" role="alert"></div>
        </form>
      </details>
      <label class="report-period"><span>时间范围</span><select aria-label="时间范围" data-change="report-period">${periodOptions.map(([value,label])=>option(label,value,filters.period===value)).join("")}</select></label>
      ${filters.period==="custom"?`<form class="report-dates" data-form="reportDates">
        ${field("开始日期","start",filters.start,"date",`required min="${min}" max="${max}"`)}
        ${field("结束日期","end",filters.end,"date",`required min="${min}" max="${max}"`)}
        <button class="btn" type="submit">应用日期</button><div class="error" role="alert"></div>
      </form>`:""}
      <span class="report-timestamp">UTC+8 · 演示数据 · 更新至 ${hourString(dates.updated)}</span>
    </div>`;
  }
  function cards(total,previous,currencies) {
    if (!total) return card('<div class="empty">当前筛选范围暂无经营数据</div>');
    const currencyRows=currencies.map(code=>`<div class="report-money"><strong>${esc(money(code,total.amounts[code]||0))}</strong>
      <small>${esc(code)} · ${esc(changeHint(total.amounts[code]||0,previous?previous.amounts[code]||0:null))}</small></div>`).join("");
    const payment=pct(total.successful,total.initiated);
    const paymentDetail=total.initiated?`${total.successful} / ${total.initiated} 笔发起`:"暂无支付发起";
    const paymentChange=total.initiated&&previous?.initiated
      ? `较${filters.period==="today"?"昨天同期":"上期同期"} ${pointFormat.format(100*(total.successful/total.initiated-previous.successful/previous.initiated))} 个百分点`
      : "暂无同期数据";
    return `<div class="metrics report-metrics">
      <section class="card metric"><div class="metric-top">${tile("card")}成功收款</div>${currencyRows||"<strong>0</strong>"}</section>
      <section class="card metric"><div class="metric-top">${tile("chart")}支付成功率</div><strong>${payment}</strong>
        <small>${paymentDetail} · ${paymentChange}</small><small>${filters.period==="today"?"今日":"本期"}支付成功 ${total.paid} 笔（按付款时间）</small></section>
      <section class="card metric"><div class="metric-top">${tile("people")}新增注册账号</div><strong>${formatNumber(total.signups)}</strong><small>${esc(changeHint(total.signups,previous?.signups))}</small></section>
      <section class="card metric"><div class="metric-top">${tile("ai")}AI 生成任务</div><strong>${formatNumber(total.tasks)}</strong><small>${esc(changeHint(total.tasks,previous?.tasks))}</small>
        <small>完成率 ${pct(total.completed,total.ended)}（${formatNumber(total.completed)} / ${formatNumber(total.ended)}）</small></section>
    </div>`;
  }

  function trend(rows,currency,currencies) {
    const grouped=new Map();
    for (const row of rows) {
      for (const {time,data} of row.points) {
        if (!grouped.has(time)) grouped.set(time,emptyStats());
        add(grouped.get(time),data);
      }
    }
    const points=[...grouped].map(([time,data])=>[
      filters.period==="today"?hourString(time):dayString(time).slice(5),metricValue(data,currency),
    ]);
    const max=filters.metric==="payment"?1:Math.max(1,...points.map(([,value])=>value??0));
    const tickStep=Math.max(1,Math.ceil(points.length/8));
    const axis=points.length?[1,.5,0].map(fraction=>`<span>${esc(valueLabel(max*fraction,currency))}</span>`).join(""):"";
    const graph=points.length?`<div class="report-graph" aria-hidden="true"><div class="report-y">${axis}</div><div class="report-plot">${points.map(([label,value],index)=>
      `<div class="report-bar-cell"><div class="report-bar" title="${esc(label+" · "+valueLabel(value,currency))}" style="--bar-height:${100*(value??0)/max}%"></div>
        <span>${index%tickStep===0?esc(label):""}</span></div>`).join("")}</div></div>
      <details class="report-trend-data"><summary>查看趋势数据</summary>
      ${table(["时间",metrics[filters.metric]],points.map(([label,value])=>[esc(label),esc(valueLabel(value,currency))]))}</details>`
      : '<div class="empty">暂无趋势数据</div>';
    return card(cardHead("经营趋势",filters.metric==="amount"&&currency?"金额币种 "+currency:"")+
      `<div class="report-trend-controls" role="group" aria-label="趋势指标">${Object.entries(metrics).map(([key,label])=>
      `<button class="btn ${key===filters.metric?"primary":"ghost"}" data-action="reportMetric" data-value="${key}" aria-pressed="${key===filters.metric}">${label}</button>`).join("")}
      ${filters.metric==="amount"&&currencies.length?`<select aria-label="收款币种" data-change="report-currency">${currencies.map(code=>option(code,code,code===currency)).join("")}</select>`:""}</div>${graph}`);
  }
  function comparison(rows,currency) {
    const columns=[
      ["amount",currency?`成功收款（${currency}）`:"成功收款"],["payment","支付成功率"],
      ["paid","成功支付订单"],["signups","新增注册账号"],["tasks","AI 生成任务"],["completion","AI 完成率"],
    ];
    const value=(data,key)=>key==="completion"?(data?.ended?data.completed/data.ended:null):metricValue(data,currency,key);
    const ordered=[...rows].sort((a,b)=>{
      const left=value(a.current,filters.sort),right=value(b.current,filters.sort);
      if (left===null) return right===null?0:1;
      if (right===null) return -1;
      return filters.ascending?left-right:right-left;
    });
    const cells=ordered.map(({product,current})=>[
      appName(product),
      current&&currency?esc(money(currency,current.amounts[currency]||0)):"—",
      current?pct(current.successful,current.initiated):"—",
      ...["paid","signups","tasks"].map(key=>current?formatNumber(current[key]):"—"),
      current?pct(current.completed,current.ended):"—",
      current?btn("查看产品","openApp",product.id,"ghost") : `<span class="report-muted">暂无数据</span> ${btn("查看产品","openApp",product.id,"ghost")}`,
    ]);
    const sortOptions=`<select aria-label="产品对比排序" data-change="report-sort">${columns.map(([key,label])=>option(label,key,key===filters.sort)).join("")}</select>`;
    const direction=btn(filters.ascending?"升序":"降序","reportOrder");
    return card(cardHead("产品对比","",`<div class="actions">${sortOptions}${direction}</div>`)+table(["业务产品",...columns.map(([,label])=>label),"操作"],cells));
  }
  function render(products) {
    const {selected}=filters;
    const visible=selected===null?products:products.filter(p=>selected.includes(p.id));
    const dates=range();
    const rows=buckets(visible,dates);
    const available=rows.filter(row=>row.current);
    const total=available.length?available.reduce((out,row)=>add(out,row.current),emptyStats()):null;
    const previous=available.length&&available.every(row=>row.previous)?available.reduce((out,row)=>add(out,row.previous),emptyStats()):null;
    const currencies=[...new Set(visible.flatMap(p=>profiles[p.id]?.currencies||[]))].sort();
    const currency=currencies.includes(filters.currency)?filters.currency:currencies[0];
    const subtitle=available.length===visible.length?"":`有数据的产品 ${available.length} / ${visible.length}`;
    return page(labels.business,"按获准产品汇总经营数据。")+
      card(cardHead("全部产品经营概览",subtitle)+controls(products,dates))+
      `<div class="report-sections">${cards(total,previous,currencies)}${trend(available,currency,currencies)}${comparison(rows,currency)}</div>`;
  }
  return {
    render,
    reset(){ filters=defaults(); },
    chooseProducts(selected){ filters.selected=selected; },
    setPeriod(period){
      if (period==="custom"&&!filters.start) {
        filters.end=dayString(Date.now());
        filters.start=dayString(Date.now()-6*day);
      }
      filters.period=period;
    },
    applyDates(start,end){
      const {firstAvailable,today}=range();
      if (!Number.isFinite(startDate(start))||!Number.isFinite(startDate(end))||
          start>end||startDate(start)<firstAvailable||startDate(end)>today) return false;
      Object.assign(filters,{start,end});
      return true;
    },
    setMetric(metric){ filters.metric=metric; },
    setCurrency(currency){ filters.currency=currency; },
    setSort(sort){ filters.sort=sort; filters.ascending=false; },
    reverseSort(){ filters.ascending=!filters.ascending; },
  };
})();
