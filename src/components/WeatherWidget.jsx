import React, {useEffect,useState} from 'react';
import { CloudSun, Wind, Droplets, RefreshCw } from 'lucide-react';
import {getWeather,describeWeather} from '../services/api.js';
export default function WeatherWidget({city}) {
 const [weather,setWeather]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{if(!city){setWeather(null);return;}let cancelled=false;setLoading(true);setError('');getWeather(city).then(data=>{if(!cancelled)setWeather(data)}).catch(err=>{if(!cancelled){setWeather(null);setError(err.message)}}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[city,refresh]);
 if(!city)return <div className="weather-empty">Assign a patrol city to display live conditions.</div>;
 return <section className="weather-content"><div className="weather-top"><span className="eyebrow">LIVE PATROL WEATHER</span><button className="ghost-icon" onClick={()=>setRefresh(n=>n+1)} aria-label="Refresh weather"><RefreshCw size={16}/></button></div>{loading?<p className="muted">Contacting weather satellite...</p>:error?<p className="error">{error}</p>:weather?<><p className="weather-location">{weather.location}</p><div className="weather-main"><CloudSun size={42} color="#a7b8ff"/><strong>{Math.round(weather.temperature_2m)}{weather.unit}</strong></div><p className="muted">{describeWeather(weather.weather_code)}</p><div className="weather-metrics"><span><Wind size={15}/> {weather.wind_speed_10m} mph</span><span><Droplets size={15}/> {weather.relative_humidity_2m}% humidity</span></div></>:null}</section>;
}
