const CONFIG = window.DASHBOARD_CONFIG;

const HKO_WEATHER_URL =
  "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc";
const HKO_FORECAST_URL =
  "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=tc";
const KMB_ETA_URL = (stopId, route) =>
  `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/1`;
const KMB_STOP_URL = (stopId) =>
  `https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopId}`;
const AIR_QUALITY_URL = (lat, lon) =>
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10&timezone=Asia%2FHong_Kong`;

const WEATHER_ICONS = {
  50: "☀️", 51: "🌤️", 52: "⛅", 53: "🌥️", 54: "☁️",
  60: "🌧️", 61: "🌦️", 62: "⛈️", 63: "⛈️", 64: "🌧️", 65: "⛈️",
  70: "🌨️", 80: "🌫️", 82: "🌪️", 90: "🌡️",
};

const DRESS_INDEX = [
  { min: 28, level: 1, label: "炎熱", icon: "🩳", advice: "短袖、短褲或短裙，注意防曬補水" },
  { min: 25, level: 2, label: "熱", icon: "👕", advice: "短袖 T 恤配薄長褲或短褲" },
  { min: 22, level: 3, label: "舒適", icon: "👔", advice: "長袖襯衫或薄外套，早晚可加件" },
  { min: 19, level: 4, label: "稍涼", icon: "🧥", advice: "薄毛衣或風衣，建議穿長褲" },
  { min: 16, level: 5, label: "涼", icon: "🧶", advice: "毛衣配外套，注意保暖" },
  { min: 12, level: 6, label: "冷", icon: "🧣", advice: "厚外套或大衣，圍巾手套" },
  { min: 8, level: 7, label: "寒冷", icon: "🧥", advice: "羽絨服或厚大衣，多層穿搭" },
  { min: -Infinity, level: 8, label: "嚴寒", icon: "🧤", advice: "加厚羽絨、保暖內衣，減少戶外時間" },
];

function getDressIndex(temp) {
  return DRESS_INDEX.find((d) => temp >= d.min) || DRESS_INDEX[DRESS_INDEX.length - 1];
}

function pm25ToAqhiLevel(pm25) {
  if (pm25 <= 25) return { label: "低", class: "aq-low", advice: "適合戶外活動" };
  if (pm25 <= 50) return { label: "中", class: "aq-moderate", advice: "敏感人士減少戶外運動" };
  if (pm25 <= 75) return { label: "高", class: "aq-high", advice: "減少戶外活動，關閉窗戶" };
  return { label: "甚高", class: "aq-high", advice: "避免戶外活動，使用空氣淨化器" };
}

function formatTime(date) {
  return date.toLocaleTimeString("zh-HK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(date) {
  return date.toLocaleDateString("zh-HK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function minutesUntil(isoString) {
  const target = new Date(isoString);
  const now = new Date();
  return Math.max(0, Math.round((target - now) / 60000));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "早安 ☀️";
  if (hour < 18) return "午安 🌤️";
  return "晚安 🌙";
}

function updateClock() {
  const now = new Date();
  document.getElementById("greeting").textContent = getGreeting();
  document.getElementById("time").textContent = formatTime(now);
  document.getElementById("date").textContent = formatDate(now);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadWeather() {
  const [current, forecast] = await Promise.all([
    fetchJson(HKO_WEATHER_URL),
    fetchJson(HKO_FORECAST_URL),
  ]);

  const temps = current.temperature?.data || [];
  const placeData =
    temps.find((t) => t.place === CONFIG.weatherPlace) ||
    temps.find((t) => t.place === "香港天文台") ||
    temps[0];

  const humidity = current.humidity?.data?.[0]?.value ?? "--";
  const iconCode = current.icon?.[0] ?? 54;
  const iconUrl = `https://www.hko.gov.hk/images/HKOWxIconCode/pic${iconCode}.png`;

  document.getElementById("weather-icon").innerHTML =
    `<img src="${iconUrl}" alt="天氣" onerror="this.parentElement.textContent='${WEATHER_ICONS[iconCode] || "🌤️"}'">`;
  document.getElementById("temperature").textContent =
    `${placeData?.value ?? "--"}°C`;
  document.getElementById("weather-place").textContent = placeData?.place || "";
  document.getElementById("weather-place").title =
    forecast.forecastDesc?.split("。")[0] || "";
  document.getElementById("humidity").textContent = `${humidity}%`;

  const temp = placeData?.value;
  if (typeof temp === "number") {
    const dress = getDressIndex(temp);
    document.getElementById("dress-icon").textContent = dress.icon;
    document.getElementById("dress-level").textContent = dress.label;
    document.getElementById("dress-advice").textContent = dress.advice;
  }
}

async function loadAirQuality() {
  const data = await fetchJson(
    AIR_QUALITY_URL(CONFIG.airQualityLat, CONFIG.airQualityLon)
  );
  const pm25 = data.current?.pm2_5;
  const pm10 = data.current?.pm10;
  const aqi = data.current?.european_aqi;

  const level = pm25ToAqhiLevel(pm25 ?? 0);
  document.getElementById("aqi-value").innerHTML =
    `${Math.round(pm25 ?? aqi ?? 0)}<span class="aq-badge ${level.class}">${level.label}</span>`;
  document.getElementById("aqi-label").textContent = "PM2.5";
  document.getElementById("aqi-label").title =
    `PM10 ${pm10?.toFixed(0) ?? "--"} µg/m³ · ${level.advice}`;
}

async function loadBus() {
  const cfg = CONFIG;
  document.getElementById("bus-route").textContent = cfg.busRoute;
  document.getElementById("bus-direction").textContent = `→ ${cfg.busDirection}方向`;

  let stopName = cfg.busStopName;
  try {
    const stopData = await fetchJson(KMB_STOP_URL(cfg.busStopId));
    stopName = stopData.data?.name_tc || stopName;
  } catch {
    /* use config name */
  }
  document.getElementById("bus-stop").textContent = stopName;

  const etaData = await fetchJson(KMB_ETA_URL(cfg.busStopId, cfg.busRoute));
  const etas = (etaData.data || [])
    .filter(
      (e) =>
        e.dest_tc?.includes("牛頭角") &&
        e.eta &&
        !e.rmk_tc?.includes("最後")
    )
    .slice(0, 3);

  const list = document.getElementById("eta-list");
  if (etas.length === 0) {
    list.innerHTML = '<p class="error-text">暫無班次資料</p>';
    return;
  }

  list.innerHTML = etas
    .map((e, i) => {
      const mins = minutesUntil(e.eta);
      const time = formatTime(new Date(e.eta));
      const rank = ["eta-near", "eta-mid", "eta-far"][i] || "eta-far";
      return `
        <div class="eta-item ${rank}">
          <div class="eta-minutes">${mins}<span class="unit">分</span></div>
          <div class="eta-time">${time} 到站</div>
        </div>`;
    })
    .join("");
}

async function refreshAll() {
  updateClock();
  const tasks = [
    { fn: loadWeather, id: "info-bar" },
    { fn: loadAirQuality, id: "aqi-card" },
    { fn: loadBus, id: "bus-card" },
  ];

  await Promise.allSettled(
    tasks.map(async ({ fn, id }) => {
      const el = document.getElementById(id);
      el?.classList.add("loading");
      try {
        await fn();
      } catch (err) {
        console.error(err);
        if (id === "bus-card") {
          document.getElementById("eta-list").innerHTML =
            `<p class="error-text">無法載入巴士資料</p>`;
        }
      } finally {
        el?.classList.remove("loading");
      }
    })
  );

  document.getElementById("last-updated").textContent =
    `最後更新：${formatTime(new Date())}`;
}

updateClock();
setInterval(updateClock, 1000);
refreshAll();
setInterval(refreshAll, CONFIG.refreshInterval);
