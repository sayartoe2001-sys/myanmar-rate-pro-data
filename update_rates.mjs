import fs from 'node:fs';

const OVERRIDE_FILE = './manual_override.json';
const OUTPUT_FILE = './market_data.json';

const CURRENCY_META = [
  { code: 'USD', nameEn: 'United States Dollar', nameMm: 'အမေရိကန် ဒေါ်လာ', symbol: '$', flag: '🇺🇸', decimals: 0 },
  { code: 'THB', nameEn: 'Thai Baht', nameMm: 'ထိုင်း ဘတ်', symbol: '฿', flag: '🇹🇭', decimals: 2 },
  { code: 'SGD', nameEn: 'Singapore Dollar', nameMm: 'စင်ကာပူ ဒေါ်လာ', symbol: 'S$', flag: '🇸🇬', decimals: 0 },
  { code: 'EUR', nameEn: 'Euro', nameMm: 'ယူရို', symbol: '€', flag: '🇪🇺', decimals: 0 },
  { code: 'GBP', nameEn: 'British Pound', nameMm: 'ဗြိတိန် ပေါင်', symbol: '£', flag: '🇬🇧', decimals: 0 },
  { code: 'CNY', nameEn: 'Chinese Yuan', nameMm: 'တရုတ် ယွမ်', symbol: '¥', flag: '🇨🇳', decimals: 0 },
  { code: 'MYR', nameEn: 'Malaysian Ringgit', nameMm: 'မလေးရှား ရင်းဂစ်', symbol: 'RM', flag: '🇲🇾', decimals: 0 },
  { code: 'JPY', nameEn: 'Japanese Yen', nameMm: 'ဂျပန် ယန်း', symbol: '¥', flag: '🇯🇵', decimals: 2 },
  { code: 'KRW', nameEn: 'South Korean Won', nameMm: 'တောင်ကိုရီးယား ဝမ်', symbol: '₩', flag: '🇰🇷', decimals: 2 },
  { code: 'AED', nameEn: 'UAE Dirham', nameMm: 'ယူအေအီး ဒါဟမ်', symbol: 'د.إ', flag: '🇦🇪', decimals: 0 },
  { code: 'TWD', nameEn: 'New Taiwan Dollar', nameMm: 'ထိုင်ဝမ် ဒေါ်လာ', symbol: 'NT$', flag: '🇹🇼', decimals: 0 },
  { code: 'AUD', nameEn: 'Australian Dollar', nameMm: 'ဩစတြေးလျ ဒေါ်လာ', symbol: 'A$', flag: '🇦🇺', decimals: 0 },
  { code: 'NZD', nameEn: 'New Zealand Dollar', nameMm: 'နယူးဇီလန် ဒေါ်လာ', symbol: 'NZ$', flag: '🇳🇿', decimals: 0 },
  { code: 'CAD', nameEn: 'Canadian Dollar', nameMm: 'ကနေဒါ ဒေါ်လာ', symbol: 'CA$', flag: '🇨🇦', decimals: 0 },
  { code: 'HKD', nameEn: 'Hong Kong Dollar', nameMm: 'ဟောင်ကောင် ဒေါ်လာ', symbol: 'HK$', flag: '🇭🇰', decimals: 0 },
  { code: 'INR', nameEn: 'Indian Rupee', nameMm: 'အိန္ဒိယ ရူပီး', symbol: '₹', flag: '🇮🇳', decimals: 2 },
  { code: 'MOP', nameEn: 'Macanese Pataca', nameMm: 'မကာအို ပါတာကာ', symbol: 'MOP$', flag: '🇲🇴', decimals: 0 },
  { code: 'VND', nameEn: 'Vietnamese Dong', nameMm: 'ဗီယက်နမ် ဒေါင်', symbol: '₫', flag: '🇻🇳', decimals: 2 },
  { code: 'LAK', nameEn: 'Laotian Kip', nameMm: 'လာအို ကစ်ပ်', symbol: '₭', flag: '🇱🇦', decimals: 2 },
  { code: 'KHR', nameEn: 'Cambodian Riel', nameMm: 'ကမ္ဘောဒီးယား ရီယယ်', symbol: '៛', flag: '🇰🇭', decimals: 2 },
  { code: 'PHP', nameEn: 'Philippine Peso', nameMm: 'ဖိလစ်ပိုင် ပီဆို', symbol: '₱', flag: '🇵🇭', decimals: 2 },
];

const MYANMAR_GOLD_META = [
  { id: 'gold_mm_16', titleEn: '16 Pae Yee (Old)', titleMm: '၁၆ ပဲရည် (စနစ်ဟောင်း)', isNewSystem: false },
  { id: 'gold_mm_15', titleEn: '15 Pae Yee (Old)', titleMm: '၁၅ ပဲရည် (စနစ်ဟောင်း)', isNewSystem: false },
  { id: 'gold_mm_new16', titleEn: 'New 16 Pae Yee', titleMm: '၁၆ ပဲရည် (စနစ်သစ်)', isNewSystem: true },
  { id: 'gold_mm_new15', titleEn: 'New 15 Pae Yee', titleMm: '၁၅ ပဲရည် (စနစ်သစ်)', isNewSystem: true },
];

const PETROL_REGIONS_META = [
  { code: 'YGN', nameEn: 'Yangon', nameMm: 'ရန်ကုန်', offset: 0 },
  { code: 'MDY', nameEn: 'Mandalay', nameMm: 'မန္တလေး', offset: 65 },
  { code: 'NPT', nameEn: 'Nay Pyi Taw', nameMm: 'နေပြည်တော်', offset: 55 },
  { code: 'BGO', nameEn: 'Bago', nameMm: 'ပဲခူး', offset: 15 },
  { code: 'AYY', nameEn: 'Ayeyarwady', nameMm: 'ဧရာဝတီ', offset: 35 },
  { code: 'MON', nameEn: 'Mon', nameMm: 'မွန်', offset: 45 },
  { code: 'SGG', nameEn: 'Sagaing', nameMm: 'စစ်ကိုင်း', offset: 80 },
  { code: 'MGW', nameEn: 'Magway', nameMm: 'မကွေး', offset: 75 },
  { code: 'SHN', nameEn: 'Shan', nameMm: 'ရှမ်း', offset: 110 },
  { code: 'KYN', nameEn: 'Kayin', nameMm: 'ကရင်', offset: 60 },
  { code: 'KCN', nameEn: 'Kachin', nameMm: 'ကချင်', offset: 145 },
  { code: 'RKH', nameEn: 'Rakhine', nameMm: 'ရခိုင်', offset: 130 },
  { code: 'TNI', nameEn: 'Tanintharyi', nameMm: 'တနင်္သာရီ', offset: 95 },
  { code: 'KYH', nameEn: 'Kayah', nameMm: 'ကယား', offset: 120 },
  { code: 'CHN', nameEn: 'Chin', nameMm: 'ချင်း', offset: 160 },
];

const FUEL_META = [
  { id: 'petrol_92', nameEn: '92 RON Octane', nameMm: '၉၂ အောက်တိန်း' },
  { id: 'petrol_95', nameEn: '95 RON Octane', nameMm: '၉၅ အောက်တိန်း' },
  { id: 'petrol_diesel', nameEn: 'Diesel', nameMm: 'ဒီဇယ် (ရိုးရိုး)' },
  { id: 'petrol_premium_diesel', nameEn: 'Premium Diesel', nameMm: 'ပရီမီယမ် ဒီဇယ်' },
];

function roundVal(val, decimals = 0) {
  if (!Number.isFinite(val)) return 0;
  return decimals === 0 ? Math.round(val) : Number(val.toFixed(decimals));
}

function getYangonDateTime(dateObj = new Date()) {
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Yangon',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);

  const timeLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Yangon',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);

  return { dateLabel, timeLabel, full: `${dateLabel}, ${timeLabel}` };
}

function isSaneChange(newVal, oldVal, maxPct = 0.15) {
  if (!Number.isFinite(newVal) || newVal <= 0) return false;
  if (!Number.isFinite(oldVal) || oldVal <= 0) return true;
  return Math.abs(newVal - oldVal) / oldVal <= maxPct;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(12000),
    headers: {
      'User-Agent': 'MyanmarRateProBot/1.0',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

// 1. Fetch Global FX rates (USD base)
async function fetchGlobalFxRates() {
  const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
  if (data && data.result === 'success' && data.rates) {
    return data.rates;
  }
  throw new Error('Invalid FX API response');
}

// 2. Fetch World Gold (XAU/USD per troy ounce) with Backup
async function fetchWorldGoldOz() {
  try {
    const primary = await fetchJson('https://api.gold-api.com/price/XAU');
    if (primary && Number(primary.price) > 500) {
      return Number(primary.price);
    }
  } catch (err) {
    console.warn('Primary gold API failed, trying backup:', err.message);
  }

  const backup = await fetchJson('https://data-asg.goldprice.org/dbXRates/USD');
  const price = backup?.items?.[0]?.xauPrice;
  if (Number(price) > 500) return Number(price);
  throw new Error('All World Gold APIs failed');
}

// 3. Fetch P2P USDT/MMK Market Reference Rate (Median of listings to avoid outliers)
async function fetchAutoUsdMmk() {
  const payload = {
    fiat: 'MMK',
    page: 1,
    rows: 10,
    tradeType: 'BUY',
    asset: 'USDT',
    countries: [],
    proMerchantAds: false,
    publisherType: null,
    payTypes: [],
  };

  const data = await fetchJson(
    'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  const prices = (data?.data || [])
    .map((item) => Number(item?.adv?.price))
    .filter((p) => Number.isFinite(p) && p > 1000 && p < 20000)
    .sort((a, b) => a - b);

  if (prices.length < 3) {
    throw new Error('Not enough valid P2P listings');
  }
  const mid = Math.floor(prices.length / 2);
  return prices[mid];
}

// Optional Telegram Alert if any live source fails
async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `⚠️ Myanmar Rate Pro Bot:\n${message}`,
      }),
    });
  } catch (err) {
    console.warn('Telegram alert failed:', err.message);
  }
}

// Update 30-day history cleanly (Index 0 = newest)
function updateHistory(prevHistory, buy, sell, decimals, nowDt) {
  const list = Array.isArray(prevHistory) ? [...prevHistory] : [];
  const rBuy = roundVal(buy, decimals);
  const rSell = roundVal(sell, decimals);

  // First-ever run: seed 7 clean daily points so the Flutter chart renders immediately
  if (list.length === 0) {
    const seeded = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const dt = getYangonDateTime(d);
      seeded.push({
        dateLabel: dt.dateLabel,
        timeLabel: i === 0 ? nowDt.timeLabel : '09:30 AM',
        buy: rBuy,
        sell: rSell,
        changeBuy: 0,
        changeSell: 0,
      });
    }
    return { history: seeded, changeBuy: 0, changeSell: 0 };
  }

  let prevDay = null;
  if (list[0].dateLabel === nowDt.dateLabel) {
    prevDay = list.length > 1 ? list[1] : null;
  } else {
    prevDay = list[0];
  }

  const changeBuy = prevDay ? roundVal(rBuy - Number(prevDay.buy), decimals) : 0;
  const changeSell = prevDay ? roundVal(rSell - Number(prevDay.sell), decimals) : 0;

  const todayPoint = {
    dateLabel: nowDt.dateLabel,
    timeLabel: nowDt.timeLabel,
    buy: rBuy,
    sell: rSell,
    changeBuy,
    changeSell,
  };

  if (list[0].dateLabel === nowDt.dateLabel) {
    list[0] = todayPoint;
  } else {
    list.unshift(todayPoint);
  }

  return {
    history: list.slice(0, 30),
    changeBuy,
    changeSell,
  };
}

async function main() {
  const nowDt = getYangonDateTime();
  const override = JSON.parse(fs.readFileSync(OVERRIDE_FILE, 'utf8'));
  const prevData = fs.existsSync(OUTPUT_FILE)
    ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'))
    : null;

  const warnings = [];

  // --- 1. Determine USD Buy / Sell ---
  const prevUsd = prevData?.currencies?.find((c) => c.code === 'USD');
  let usdBuy = Number(override.usdBuy) || prevUsd?.buyPrice || 5140;
  let usdSell = Number(override.usdSell) || prevUsd?.sellPrice || 5240;
  const spread = Number(override.usdSpreadMmk) || 100;

  if (override.useAutoUsd) {
    try {
      const p2pSell = await fetchAutoUsdMmk();
      const referenceCheck = prevUsd?.sellPrice || usdSell;
      if (isSaneChange(p2pSell, referenceCheck, 0.15)) {
        usdSell = Math.round(p2pSell / 5) * 5;
        usdBuy = usdSell - spread;
        console.log(`Auto P2P USD updated: Buy ${usdBuy} / Sell ${usdSell}`);
      } else {
        warnings.push(`Auto USD (${p2pSell}) failed 15% sanity check vs ${referenceCheck}. Kept previous rate.`);
      }
    } catch (err) {
      warnings.push(`Auto USD fetch failed: ${err.message}. Using safe fallback rate.`);
    }
  } else {
    console.log(`Manual USD Override active: Buy ${usdBuy} / Sell ${usdSell}`);
  }

  // --- 2. Fetch Global FX Rates ---
  let fxRates = null;
  try {
    fxRates = await fetchGlobalFxRates();
  } catch (err) {
    warnings.push(`Global FX API failed: ${err.message}. Preserving previous currency rates.`);
  }

  const currencies = CURRENCY_META.map((meta) => {
    const prev = prevData?.currencies?.find((c) => c.code === meta.code);
    let buy = prev?.buyPrice || 0;
    let sell = prev?.sellPrice || 0;

    if (meta.code === 'USD') {
      buy = usdBuy;
      sell = usdSell;
    } else if (fxRates && Number(fxRates[meta.code]) > 0) {
      const ratePerUsd = Number(fxRates[meta.code]);
      const calcBuy = roundVal(usdBuy / ratePerUsd, meta.decimals);
      const calcSell = roundVal(usdSell / ratePerUsd, meta.decimals);
      if (isSaneChange(calcSell, prev?.sellPrice, 0.2)) {
        buy = calcBuy;
        sell = calcSell;
      }
    }

    const { history, changeBuy, changeSell } = updateHistory(
      prev?.history,
      buy,
      sell,
      meta.decimals,
      nowDt
    );

    return {
      code: meta.code,
      nameEn: meta.nameEn,
      nameMm: meta.nameMm,
      symbol: meta.symbol,
      flag: meta.flag,
      buyPrice: roundVal(buy, meta.decimals),
      sellPrice: roundVal(sell, meta.decimals),
      changeBuy,
      changeSell,
      decimals: meta.decimals,
      history,
    };
  });

  // --- 3. World Gold (1 oz, 1 g, 1 Kyatthar) ---
  const prevWorldOz = prevData?.worldGold?.find((g) => g.id === 'gold_world_oz');
  let ozPrice = prevWorldOz?.sellPrice || 3656.63;
  try {
    const liveOz = await fetchWorldGoldOz();
    if (isSaneChange(liveOz, prevWorldOz?.sellPrice, 0.15)) {
      ozPrice = liveOz;
      console.log(`Live World Gold updated: $${ozPrice}/oz`);
    } else {
      warnings.push(`World Gold ($${liveOz}) failed sanity check.`);
    }
  } catch (err) {
    warnings.push(`World Gold API failed: ${err.message}. Kept previous gold price.`);
  }

  const gramPrice = ozPrice / 31.1034768;
  const kyattharUsdPrice = gramPrice * 16.606;

  const worldGoldSpecs = [
    { id: 'gold_world_oz', titleEn: 'World Gold (1 oz)', titleMm: 'ကမ္ဘာ့ရွှေ (၁ အောင်စ)', unitEn: '1 oz', unitMm: '၁ အောင်စ', price: ozPrice },
    { id: 'gold_world_g', titleEn: 'World Gold (1 g)', titleMm: 'ကမ္ဘာ့ရွှေ (၁ ဂရမ်)', unitEn: '1 g', unitMm: '၁ ဂရမ်', price: gramPrice },
    { id: 'gold_world_kyat', titleEn: 'World Gold (1 Kyatthar)', titleMm: 'ကမ္ဘာ့ရွှေ (၁ ကျပ်သား)', unitEn: '1 Kyatthar', unitMm: '၁ ကျပ်သား', price: kyattharUsdPrice },
  ];

  const worldGold = worldGoldSpecs.map((spec) => {
    const prev = prevData?.worldGold?.find((g) => g.id === spec.id);
    const p = roundVal(spec.price, 2);
    const { history, changeBuy, changeSell } = updateHistory(prev?.history, p, p, 2, nowDt);
    return {
      id: spec.id,
      titleEn: spec.titleEn,
      titleMm: spec.titleMm,
      unitEn: spec.unitEn,
      unitMm: spec.unitMm,
      isWorldGold: true,
      isNewSystem: false,
      buyPrice: p,
      sellPrice: p,
      changeBuy,
      changeSell,
      history,
    };
  });

  // --- 4. Myanmar Gold (from manual_override.json) ---
  const myanmarGold = MYANMAR_GOLD_META.map((meta) => {
    const prev = prevData?.myanmarGold?.find((g) => g.id === meta.id);
    const ov = override.myanmarGold?.[meta.id];
    const buy = Number(ov?.buy) || prev?.buyPrice || 10000000;
    const sell = Number(ov?.sell) || prev?.sellPrice || 10100000;
    const { history, changeBuy, changeSell } = updateHistory(prev?.history, buy, sell, 0, nowDt);
    return {
      id: meta.id,
      titleEn: meta.titleEn,
      titleMm: meta.titleMm,
      unitEn: '1 Kyatthar',
      unitMm: '၁ ကျပ်သား',
      isWorldGold: false,
      isNewSystem: meta.isNewSystem,
      buyPrice: roundVal(buy, 0),
      sellPrice: roundVal(sell, 0),
      changeBuy,
      changeSell,
      history,
    };
  });

  // --- 5. Petrol Prices (15 Regions calculated from Yangon base + regional offsets) ---
  const petrolRegions = PETROL_REGIONS_META.map((reg) => {
    const prevReg = prevData?.petrolRegions?.find((r) => r.code === reg.code);
    const fuels = FUEL_META.map((fMeta) => {
      const prevFuel = prevReg?.fuels?.find((f) => f.id === fMeta.id);
      const basePrice = Number(override.yangonPetrol?.[fMeta.id]) || 3815;
      const regionalPrice = roundVal(basePrice + reg.offset, 0);
      const { history, changeSell } = updateHistory(
        prevFuel?.history,
        regionalPrice,
        regionalPrice,
        0,
        nowDt
      );
      return {
        id: fMeta.id,
        nameEn: fMeta.nameEn,
        nameMm: fMeta.nameMm,
        price: regionalPrice,
        change: changeSell,
        history,
      };
    });

    return {
      code: reg.code,
      nameEn: reg.nameEn,
      nameMm: reg.nameMm,
      fuels,
    };
  });

  const snapshot = {
    lastUpdated: nowDt.full,
    announcementEn: override.announcementEn || 'Live reference rates for Gold, Currency & Fuel in Myanmar.',
    announcementMm: override.announcementMm || 'မြန်မာပြည်တွင်း ရွှေဈေး၊ ငွေလဲနှုန်းနှင့် စက်သုံးဆီဈေးနှုန်းများကို တစ်နေရာတည်းတွင် ကြည့်ရှုတွက်ချက်နိုင်ပါသည်။',
    worldGold,
    myanmarGold,
    currencies,
    petrolRegions,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`Successfully wrote ${OUTPUT_FILE} at ${nowDt.full}`);

  if (warnings.length > 0) {
    const msg = warnings.join('\n');
    console.warn('Warnings:\n' + msg);
    await sendTelegramAlert(msg);
  }
}

main().catch(async (err) => {
  console.error('Fatal Bot Error:', err);
  await sendTelegramAlert(`Fatal error: ${err.message}`);
  process.exit(1);
});
