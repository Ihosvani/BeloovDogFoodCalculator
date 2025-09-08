import React, { useState, useMemo } from 'react';
import data from './rations.json';
import './App.css';

const translations = {
  en: {
    title: 'Dog Food Calculator',
    dogName: 'Dog Name',
    weight: 'Weight (lbs)',
    age: 'Age (months)',
    activity: 'Activity Level',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    overweight: 'Is the dog overweight?',
    daily: 'Daily food amount',
    weekly: 'Weekly food amount',
    packDays: 'Days one 510g pack lasts',
    packsPerWeek: 'Packs of Belov needed per week',
    grams: 'grams',
    whatsapp: 'Send via WhatsApp',
    language: 'Español',
    required: 'Required',
  inputError: 'Please select valid ranges.'
  },
  es: {
    title: 'Calculadora de Comida para Perros',
    dogName: 'Nombre del Perro',
    weight: 'Peso (libras)',
    age: 'Edad (meses)',
    activity: 'Nivel de actividad',
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    overweight: '¿El perro tiene sobrepeso?',
    daily: 'Cantidad diaria de comida',
    weekly: 'Cantidad semanal de comida',
    packDays: 'Días que dura un paquete de 510g',
    packsPerWeek: 'Paquetes de comida Beloov necesarios por semana',
    grams: 'gramos',
    whatsapp: 'Enviar por WhatsApp',
    language: 'English',
    required: 'Requerido',
    inputError: 'Por favor, seleccione rangos válidos.'
  }
};
translations.en.ageRange = 'Age Range';
translations.en.weightRange = 'Weight Range (lbs)';
translations.es.ageRange = 'Rango de edad';
translations.es.weightRange = 'Rango de peso (lbs)';
const logo = './public/VITA.jpg';

function formatWeightRange(range) { return `${range.min}-${range.max}`; }
const weightIndexMap = {};
data.weightRanges.forEach((r, i) => { weightIndexMap[formatWeightRange(r)] = i; });

function getDailyRation(ageGroup, weightRangeLabel, activity, overweight) {
  if (!ageGroup || !weightRangeLabel) return 0;
  const idx = weightIndexMap[weightRangeLabel];
  if (idx == null) return 0;
  if (data.puppy[ageGroup]) { return data.puppy[ageGroup][idx] || 0; }
  if (ageGroup === 'adult') {
    if (overweight) return data.adult.overweight[idx] || 0;
    const arr = data.adult.normal[activity] || data.adult.normal.medium;
    return arr[idx] || 0;
  }
  if (ageGroup === 'senior') {
    if (activity === 'medium') return data.senior.medium[idx] || 0;
    return data.senior.low[idx] || 0;
  }
  return 0;
}

function App() {
  const [lang, setLang] = useState('es');
  const t = translations[lang];

  const [dogName, setDogName] = useState('');
  const [weightRange, setWeightRange] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [activity, setActivity] = useState('medium');
  const [overweight, setOverweight] = useState(false);
  const [touched, setTouched] = useState(false);

  const daily = useMemo(() => {
    return getDailyRation(ageGroup, weightRange, activity, overweight);
  }, [ageGroup, weightRange, activity, overweight]);

  const weekly = daily * 7;
  const packSize = 510;
  const packDays = daily > 0 ? (packSize / daily) : 0;
  const packsPerWeek = daily > 0 ? Math.ceil(weekly / packSize) : 0;

  const whatsappText = () => {
    return lang === 'en'
      ? `Hi! My dog ${dogName} is ${ageGroup} old, weighs ${weightRange} lbs, and needs ${daily}g of Beloov food per day.`
      : `¡Hola! Mi perro ${dogName} tiene ${ageGroup} de edad, pesa ${weightRange} lbs y necesita ${daily}g de comida Beloov al día.`;
  };
  const handleInput = (setter) => (e) => { setter(e.target.value); setTouched(true); };
  const ageMeta = data.ageCategories.find(a => a.id === ageGroup);
  const isPuppy = ageMeta?.type === 'puppy';
  const isAdult = ageMeta?.type === 'adult';
  const isSenior = ageMeta?.type === 'senior';

  return (
    <div className="app-container">
      <button className="language-toggle" onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>
        {t.language}
      </button>
      <div className="calculator-card">
        <div className="animation-container">
          <img className="animation" src="dog_animation.gif" alt="Animation" />
          <img className="logo" src="BELOOV.png" alt="Vita" />
        </div>
        <h2>{t.title}</h2>
        <label htmlFor="dogName">{t.dogName} *</label>
        <input
          id="dogName"
          type="text"
          min="1"
          value={dogName}
          onChange={handleInput(setDogName)}
          placeholder={t.dogName}
        />
        <label htmlFor="ageGroup">{t.ageRange} *</label>
        <select id="ageGroup" value={ageGroup} onChange={e => { setAgeGroup(e.target.value); setTouched(true); setActivity('medium'); setOverweight(false); }}>
          <option value="">--</option>
          {data.ageCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label[lang]}</option>
          ))}
        </select>
        <label htmlFor="weightRange">{t.weightRange} *</label>
        <select id="weightRange" value={weightRange} onChange={e => { setWeightRange(e.target.value); setTouched(true); }} disabled={!ageGroup}>
          <option value="">--</option>
            {data.weightRanges.map(r => {
              const label = formatWeightRange(r);
              return <option key={label} value={label}>{label}</option>;
            })}
        </select>
        <label htmlFor="activity">{t.activity}</label>
        <select
          id="activity"
          value={activity}
          onChange={e => setActivity(e.target.value)}
          disabled={overweight || isPuppy || !ageGroup}
        >
          <option value="low">{t.low}</option>
          <option value="medium">{t.medium}</option>
          { (isAdult && !overweight) && <option value="high">{t.high}</option> }
        </select>
        <label>
          <input
            type="checkbox"
            checked={overweight && isAdult}
            onChange={e => { const v = e.target.checked; setOverweight(v); if (v && activity === 'high') setActivity('medium'); }}
            disabled={!isAdult}
          />
          {t.overweight}
        </label>
        <div className="results">
          {(!weightRange || !ageGroup) && touched ? (
            <span style={{ color: 'red' }}>{t.inputError}</span>
          ) : daily > 0 ? (
            <>
              <div><b>{t.daily}:</b> {daily} {t.grams}</div>
              <div><b>{t.weekly}:</b> {weekly} {t.grams}</div>
              <div><b>{t.packDays}:</b> {packDays.toFixed(1)}</div>
              <div><b>{t.packsPerWeek}:</b> {packsPerWeek}</div>
            </>
          ) : null}
        </div>
        <a
          className="whatsapp-btn"
          href={`https://wa.me/19548539090?text=${encodeURIComponent(whatsappText())}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2C6.477 2 2 6.477 2 12c0 1.85.504 3.59 1.38 5.08L2 22l5.09-1.36A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm0 18c-1.61 0-3.13-.488-4.4-1.32l-.31-.2-3.02.8.81-2.95-.2-.32A7.963 7.963 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8Zm4.29-5.38c-.23-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.51.12-.15.23-.58.75-.71.9-.13.15-.26.17-.49.06-.23-.12-.97-.36-1.85-1.13-.68-.6-1.14-1.34-1.28-1.57-.13-.23-.01-.35.11-.46.12-.12.23-.26.35-.39.12-.13.16-.23.24-.38.08-.15.04-.28-.02-.4-.06-.12-.51-1.23-.7-1.68-.18-.44-.37-.38-.51-.39-.13-.01-.28-.01-.43-.01-.15 0-.4.06-.61.28-.21.22-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.12.15 1.62 2.48 3.93 3.38.55.19.98.3 1.31.38.55.14 1.05.12 1.44.07.44-.07 1.36-.56 1.55-1.1.19-.54.19-1 .13-1.1-.07-.1-.21-.16-.44-.28Z"/></svg>
          {t.whatsapp}
        </a>
      </div>
    </div>
  );
}

export default App;
