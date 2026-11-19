
// ================================
// ELEMENTS
// ================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const feelsLikeDetail = document.getElementById("feelsLikeDetail");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const errorMessage = document.getElementById("errorMessage");
const forecastContainer = document.getElementById("forecastContainer");


// ================================
// WEATHER CODE INTERPRETATION
// ================================

function getWeatherInfo(code) {

    const weatherCodes = {
        0: ["Clear Sky", "☀️"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Rime Fog", "🌫️"],
        51: ["Light Drizzle", "🌦️"],
        53: ["Moderate Drizzle", "🌦️"],
        55: ["Dense Drizzle", "🌧️"],
        61: ["Light Rain", "🌦️"],
        63: ["Moderate Rain", "🌧️"],
        65: ["Heavy Rain", "🌧️"],
        71: ["Light Snow", "🌨️"],
        73: ["Moderate Snow", "🌨️"],
        75: ["Heavy Snow", "❄️"],
        80: ["Rain Showers", "🌦️"],
        81: ["Moderate Showers", "🌧️"],
        82: ["Heavy Showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with Hail", "⛈️"],
        99: ["Heavy Thunderstorm", "⛈️"]
    };

    return weatherCodes[code] || ["Unknown Weather", "🌡️"];

}

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.add("show");

}

// ================================
// SEARCH CITY
// ================================

async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    errorMessage.classList.remove("show");

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another name.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        await getWeather(latitude, longitude, location);
        

    } catch (error) {

        showError(error.message);

    } finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

    }

}


// ================================
// GET WEATHER DATA
// ================================

async function getWeather(latitude, longitude, location) {

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

    const response = await fetch(weatherURL);

    if (!response.ok) {
        throw new Error("Unable to fetch weather data.");
    }

    const data = await response.json();

    displayCurrentWeather(data, location);
    displayForecast(data);

}


// ================================
// DISPLAY CURRENT WEATHER
// ================================

function displayCurrentWeather(data, location) {

    const current = data.current;

    const weather = getWeatherInfo(current.weather_code);

    cityName.textContent =
        `${location.name}, ${location.country}`;

    weatherDescription.textContent = weather[0];

    weatherIcon.textContent = weather[1];

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    feelsLikeDetail.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

}


// ================================
// DISPLAY 5-DAY FORECAST
// ================================

function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const daily = data.daily;

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(daily.time[i] + "T12:00:00");

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const weather = getWeatherInfo(daily.weather_code[i]);

        const card = document.createElement("div");

        card.classList.add("forecast-card");

        card.innerHTML = `
            <h3>${dayName}</h3>

            <div class="forecast-icon">${weather[1]}</div>

            <p class="forecast-temp">
                ${Math.round(daily.temperature_2m_max[i])}° /
                ${Math.round(daily.temperature_2m_min[i])}°
            </p>

            <p class="forecast-description">
                ${weather[0]}
            </p>
        `;

        forecastContainer.appendChild(card);

    }

}


// ================================
// EVENT LISTENERS
// ================================

searchBtn.addEventListener("click", searchCity);

cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchCity();
    }

});
