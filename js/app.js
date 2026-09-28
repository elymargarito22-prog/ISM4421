const BOCA_RATON = { name: "Boca Raton, FL", latitude: 26.3683, longitude: -80.1289 };

const WEATHER_CODES = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mostly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Icy fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Drizzle", icon: "🌦️" },
  55: { text: "Heavy drizzle", icon: "🌧️" },
  56: { text: "Freezing drizzle", icon: "🌧️" },
  57: { text: "Freezing drizzle", icon: "🌧️" },
  61: { text: "Light rain", icon: "🌦️" },
  63: { text: "Rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  66: { text: "Freezing rain", icon: "🌧️" },
  67: { text: "Freezing rain", icon: "🌧️" },
  71: { text: "Light snow", icon: "🌨️" },
  73: { text: "Snow", icon: "🌨️" },
  75: { text: "Heavy snow", icon: "❄️" },
  77: { text: "Snow grains", icon: "❄️" },
  80: { text: "Light showers", icon: "🌦️" },
  81: { text: "Showers", icon: "🌧️" },
  82: { text: "Violent showers", icon: "⛈️" },
  85: { text: "Snow showers", icon: "🌨️" },
  86: { text: "Snow showers", icon: "❄️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { text: "Thunderstorm w/ hail", icon: "⛈️" },
};

function weatherInfo(code) {
  return WEATHER_CODES[code] || { text: "Unknown", icon: "🌡️" };
}

const els = {
  form: document.getElementById("search-form"),
  input: document.getElementById("search-input"),
  locateBtn: document.getElementById("locate-btn"),
  status: document.getElementById("status"),
  currentCard: document.getElementById("current-card"),
  currentLocation: document.getElementById("current-location"),
  currentUpdated: document.getElementById("current-updated"),
  currentIcon: document.getElementById("current-icon"),
  currentTemp: document.getElementById("current-temp"),
  currentCondition: document.getElementById("current-condition"),
  currentFeels: document.getElementById("current-feels"),
  statHumidity: document.getElementById("stat-humidity"),
  statWind: document.getElementById("stat-wind"),
  statPrecip: document.getElementById("stat-precip"),
  statSunset: document.getElementById("stat-sunset"),
  hourlyCard: document.getElementById("hourly-card"),
  hourlyScroll: document.getElementById("hourly-scroll"),
  dailyCard: document.getElementById("daily-card"),
  dailyList: document.getElementById("daily-list"),
};

function setStatus(message, isError = false) {
  els.status.textContent = message || "";
  els.status.classList.toggle("error", isError);
}

async function geocode(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${query}"`);
  }
  const r = data.results[0];
  const parts = [r.name, r.admin1, r.country].filter(Boolean);
  return { name: parts.join(", "), latitude: r.latitude, longitude: r.longitude };
}

async function reverseLabelFromCoords(lat, lon) {
  return { name: "My location", latitude: lat, longitude: lon };
}

async function fetchForecast({ latitude, longitude }) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
    hourly: "temperature_2m,weather_code,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "7",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast request failed");
  return res.json();
}

// Open-Meteo (timezone=auto) returns naive local wall-clock strings for the
// queried location, e.g. "2026-09-28T19:12" with no offset. They must be read
// as plain text, not run through Date/timeZone conversion, or a viewer whose
// device is in a different timezone than the queried city would see a
// double-shifted time.
function parseLocalTime(isoString) {
  const match = isoString.match(/T(\d{2}):(\d{2})/);
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function to12Hour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return { h12, period };
}

function formatTime(isoString) {
  const { hour, minute } = parseLocalTime(isoString);
  const { h12, period } = to12Hour(hour);
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatHour(isoString) {
  const { hour } = parseLocalTime(isoString);
  const { h12, period } = to12Hour(hour);
  return `${h12} ${period}`;
}

function formatDay(isoString) {
  return new Date(isoString + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
}

function renderCurrent(locationName, data) {
  const c = data.current;
  const info = weatherInfo(c.weather_code);

  els.currentLocation.textContent = locationName;
  els.currentUpdated.textContent = `Updated ${formatTime(c.time)}`;
  els.currentIcon.textContent = info.icon;
  els.currentTemp.textContent = `${Math.round(c.temperature_2m)}°`;
  els.currentCondition.textContent = info.text;
  els.currentFeels.textContent = `Feels like ${Math.round(c.apparent_temperature)}°`;
  els.statHumidity.textContent = `${Math.round(c.relative_humidity_2m)}%`;
  els.statWind.textContent = `${Math.round(c.wind_speed_10m)} mph`;
  els.statPrecip.textContent = `${Math.round(data.daily.precipitation_probability_max[0] ?? 0)}%`;
  els.statSunset.textContent = formatTime(data.daily.sunset[0]);

  els.currentCard.hidden = false;
}

function renderHourly(data) {
  // Compare against current.time (same naive local format) rather than the
  // browser's own clock, so the starting hour is correct for the queried
  // location regardless of the viewer's device timezone.
  const currentTime = data.current.time;
  const times = data.hourly.time;
  let startIdx = times.findIndex((t) => t >= currentTime);
  if (startIdx === -1) startIdx = 0;

  els.hourlyScroll.innerHTML = "";
  for (let i = startIdx; i < startIdx + 24 && i < times.length; i++) {
    const info = weatherInfo(data.hourly.weather_code[i]);
    const item = document.createElement("div");
    item.className = "hour-item";
    item.innerHTML = `
      <div class="hour-time">${formatHour(times[i])}</div>
      <div class="hour-icon">${info.icon}</div>
      <div class="hour-temp">${Math.round(data.hourly.temperature_2m[i])}°</div>
    `;
    els.hourlyScroll.appendChild(item);
  }
  els.hourlyCard.hidden = false;
}

function renderDaily(data) {
  const days = data.daily.time;
  els.dailyList.innerHTML = "";
  for (let i = 0; i < days.length; i++) {
    const info = weatherInfo(data.daily.weather_code[i]);
    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `
      <div class="day-name">${i === 0 ? "Today" : formatDay(days[i])}</div>
      <div class="day-icon">${info.icon}</div>
      <div class="day-precip">${info.text} · ${Math.round(data.daily.precipitation_probability_max[i] ?? 0)}% rain</div>
      <div class="day-temps">${Math.round(data.daily.temperature_2m_max[i])}°<span class="lo">${Math.round(data.daily.temperature_2m_min[i])}°</span></div>
    `;
    els.dailyList.appendChild(row);
  }
  els.dailyCard.hidden = false;
}

async function loadWeatherFor(location) {
  setStatus(`Loading weather for ${location.name}…`);
  try {
    const data = await fetchForecast(location);
    renderCurrent(location.name, data);
    renderHourly(data);
    renderDaily(data);
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Something went wrong fetching weather data.", true);
  }
}

async function handleSearch(query) {
  if (!query.trim()) return;
  setStatus(`Looking up "${query}"…`);
  try {
    const location = await geocode(query.trim());
    await loadWeatherFor(location);
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Could not find that location.", true);
  }
}

function handleLocate() {
  if (!navigator.geolocation) {
    setStatus("Geolocation isn't supported in this browser.", true);
    return;
  }
  setStatus("Finding your location…");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const location = await reverseLabelFromCoords(pos.coords.latitude, pos.coords.longitude);
      await loadWeatherFor(location);
    },
    () => setStatus("Couldn't get your location — showing Boca Raton instead.", true) || loadWeatherFor(BOCA_RATON),
    { timeout: 8000 }
  );
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch(els.input.value);
});

els.locateBtn.addEventListener("click", handleLocate);

loadWeatherFor(BOCA_RATON);
