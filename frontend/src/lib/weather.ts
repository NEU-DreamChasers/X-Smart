const API_KEY = 'e6a9ac520f15ef26ef5a4d86d1006ce9';

export interface WeatherData {
  cityName: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  feelsLike: number;
  pressure: number;
}

const MOCK_WEATHER: WeatherData = {
  cityName: 'TP. Hồ Chí Minh (Giả lập)',
  temp: 32,
  humidity: 70,
  windSpeed: 5.5,
  description: 'Dữ liệu mẫu (Lỗi API)',
  icon: '01d',
  feelsLike: 36,
  pressure: 1012,
};

async function getWeatherFromUrl(url: string, isSearch = false): Promise<WeatherData | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.statusText;
      console.error(`❌ Lỗi API (${response.status}): ${errorText}`);
      if (isSearch) return null;
      return MOCK_WEATHER;
    }

    const data = await response.json();

    return {
      cityName: data.name,
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1),
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
    };
  } catch (error) {
    console.error('❌ Lỗi mạng:', error);
    return isSearch ? null : MOCK_WEATHER;
  }
}

export const fetchWeather = async (lat: number, lon: number) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`;
  return getWeatherFromUrl(url);
};

export const fetchWeatherByCity = async (city: string) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=vi`;
  return getWeatherFromUrl(url, true);
};