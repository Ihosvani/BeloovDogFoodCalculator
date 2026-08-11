import React, { useMemo, useState } from 'react';
import data from './rations.json';
import './App.css';

// Localized copy for the visible labels and result text.
const translations = {
  en: {
    title: 'Feeding Calculator',
    dogName: 'Dog Name',
    weight: 'Weight (lbs)',
    age: 'Age',
    activity: 'Activity',
    low: 'Low',
    avg: 'Average',
    high: 'High',
    daily: 'Daily food amount',
    weekly: 'Weekly food amount',
    packDays: 'Days one 510g pack lasts',
    packsPerWeek: 'Packs of Beloov needed per week',
    grams: 'grams',
    whatsapp: 'Send via WhatsApp',
    language: 'Español',
    required: 'Required',
    note: 'Indicative result. Adjust according to activity and body condition.'
  },
  es: {
    title: 'Calculadora de Alimentación',
    dogName: 'Nombre del Perro',
    weight: 'Peso (libras)',
    age: 'Edad',
    activity: 'Actividad',
    low: 'Bajo',
    avg: 'Medio',
    high: 'Alto',
    daily: 'Cantidad diaria de comida',
    weekly: 'Cantidad semanal de comida',
    packDays: 'Días que dura un paquete de 510g',
    packsPerWeek: 'Paquetes de comida Beloov necesarios por semana',
    grams: 'gramos',
    whatsapp: 'Enviar por WhatsApp',
    language: 'English',
    required: 'Requerido',
    note: 'Resultado indicativo. Ajuste según la actividad y la condición corporal.'
  }
};

// Convert the lbs input into the kg-based lookup model used by the ration data.
const lbPerKg = 2.2046226218;

function poundsToKg(weightLb) {
  return Number(weightLb) / lbPerKg;
}

// Resolve the configured feeding stage for the selected age group.
function getStage(stageKey) {
  return data.stages[stageKey] ? data.stages[stageKey] : null;
}

// Pick the correct factor for the current stage and activity level.
function getFactor(stageKey, activity) {
  const stage = getStage(stageKey);
  if (!stage) return null;
  if (typeof stage.factor === 'number') return stage.factor;
  return stage.factors && typeof stage.factors[activity] === 'number'
    ? stage.factors[activity]
    : null;
}

// Compute the daily ration in grams, rejecting unsupported ranges early.
function calculateRation(stageKey, weightLb, activity) {
  const factor = getFactor(stageKey, activity || 'avg');
  const weightKg = poundsToKg(weightLb);
  if (factor === null || !Number.isFinite(weightKg)) return null;
  if (weightKg < data.weight.minKg || weightKg > data.weight.maxKg) return null;
  return Math.round(weightKg * factor);
}

function App() {
  // Keep the interface bilingual while the calculation model stays shared.
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  const [dogName, setDogName] = useState('');
  const [ageGroup, setAgeGroup] = useState('puppy_4_6');
  const [weight, setWeight] = useState(String(data.weight.defaultLb));
  const [activity, setActivity] = useState('avg');

  const stage = useMemo(() => getStage(ageGroup), [ageGroup]);
  const activityOptions = stage && Array.isArray(stage.activity) ? stage.activity : [];
  const showActivity = activityOptions.length > 0;

  // Recompute the ration whenever the inputs change.
  const daily = useMemo(() => {
    return calculateRation(ageGroup, weight, activity);
  }, [ageGroup, weight, activity]);
  const weekly = daily === null ? 0 : daily * 7;
  const packSize = 510;
  const packDays = daily > 0 ? (packSize / daily) : 0;
  const packsPerWeek = daily > 0 ? Math.ceil(weekly / packSize) : 0;

  const whatsappText = () => {
    return lang === 'en'
      ? `Hi! My dog ${dogName} is in the ${stage?.label || ageGroup} stage, weighs ${weight} lbs, and needs ${daily}g of Beloov food per day.`
      : `¡Hola! Mi perro ${dogName} está en la etapa ${stage?.label || ageGroup}, pesa ${weight} lbs y necesita ${daily}g de comida Beloov al día.`;
  };

  function handleAgeChange(event) {
    const nextAge = event.target.value;
    setAgeGroup(nextAge);
    const nextStage = getStage(nextAge);
    // Reset to the default activity when the stage exposes activity choices.
    if (nextStage && Array.isArray(nextStage.activity)) {
      setActivity('avg');
    }
  }

  function showEmpty() {
    return daily === null;
  }

  return (
    <div className="app-container">
      <button className="language-toggle" onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>
        {t.language}
      </button>
      <div className="calculator-card">
        <div className="animation-container">
          <img className="logo" src="BELOOV.png" alt="Vita" />
          <img className="animation" src="dog_animation.gif" alt="Animation" />
        </div>
        <h2>{t.title}</h2>
        <label htmlFor="dogName">{t.dogName}</label>
        <input
          id="dogName"
          type="text"
          min="1"
          value={dogName}
          onChange={(e) => setDogName(e.target.value)}
          placeholder={t.dogName}
        />
        <label htmlFor="ageGroup">{t.age}</label>
        <select id="ageGroup" value={ageGroup} onChange={handleAgeChange}>
          {Object.entries(data.stages).map(([key, stageData]) => (
            <option key={key} value={key}>{stageData.label}</option>
          ))}
        </select>
        <label htmlFor="weightRange">{t.weight}</label>
        <select id="weightRange" value={weight} onChange={(e) => setWeight(e.target.value)}>
            {Array.from({ length: data.weight.maxLb - data.weight.minLb + 1 }, (_, index) => {
              const lb = data.weight.minLb + index;
              return <option key={lb} value={String(lb)}>{lb} lb</option>;
            })}
        </select>
        <label htmlFor="activity">{t.activity}</label>
        <select
          id="activity"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          disabled={!showActivity}
        >
          <option value="low">{t.low}</option>
          <option value="avg">{t.avg}</option>
          {activityOptions.some(item => item.value === 'high') && <option value="high">{t.high}</option>}
        </select>
        <div className="results">
          {showEmpty() ? null : daily > 0 ? (
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
          href={`https://wa.me/9546614091?text=${encodeURIComponent(whatsappText())}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2C6.477 2 2 6.477 2 12c0 1.85.504 3.59 1.38 5.08L2 22l5.09-1.36A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm0 18c-1.61 0-3.13-.488-4.4-1.32l-.31-.2-3.02.8.81-2.95-.2-.32A7.963 7.963 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8Zm4.29-5.38c-.23-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.51.12-.15.23-.58.75-.71.9-.13.15-.26.17-.49.06-.23-.12-.97-.36-1.85-1.13-.68-.6-1.14-1.34-1.28-1.57-.13-.23-.01-.35.11-.46.12-.12.23-.26.35-.39.12-.13.16-.23.24-.38.08-.15.04-.28-.02-.4-.06-.12-.51-1.23-.7-1.68-.18-.44-.37-.38-.51-.39-.13-.01-.28-.01-.43-.01-.15 0-.4.06-.61.28-.21.22-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.12.15 1.62 2.48 3.93 3.38.55.19.98.3 1.31.38.55.14 1.05.12 1.44.07.44-.07 1.36-.56 1.55-1.1.19-.54.19-1 .13-1.1-.07-.1-.21-.16-.44-.28Z"/></svg>
          {t.whatsapp}
        </a>
        <p className="note" style={{ marginTop: '0.75rem' }}>{t.note}</p>
      </div>
    </div>
  );
}

export default App;
