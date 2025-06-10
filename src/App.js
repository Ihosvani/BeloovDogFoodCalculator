import React, { useState, useMemo } from 'react';
import calculateDailyRation from './calculateDailyRation';
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
    inputError: 'Please enter valid values for weight and age.'
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
    inputError: 'Por favor, ingrese valores válidos para peso y edad.'
  }
};
const logo = './public/VITA.jpg';
function calculateRacion(weight, age, activity, overweight) {
  // All calculations in grams, weight in lbs
  if (!weight || !age) return 0;
  if (age < 2) return 0; // Too young
  if (age < 4) return calculateDailyRation(weight, 50); // 50g for puppies
  if (age < 6) return calculateDailyRation(weight, 40);
  if (age < 8) return calculateDailyRation(weight, 30);
  if (age < 10) return calculateDailyRation(weight, 20);
  if (age < 12) return calculateDailyRation(weight, 15);
  if (age < 85) {
    if (overweight) return calculateDailyRation(weight, 10);
    if (activity === 'low') return calculateDailyRation(weight, 10);
    if (activity === 'medium') return calculateDailyRation(weight, 12.5);
    if (activity === 'high') return calculateDailyRation(weight, 15);
  }
  // 7+ years
  if (activity === 'low') return calculateDailyRation(weight, 10);
  if (activity === 'medium') return calculateDailyRation(weight, 11);
  return calculateDailyRation(weight, 10);
}

function App() {
  const [lang, setLang] = useState('es');
  const t = translations[lang];

  const [dogName, setDogName] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [activity, setActivity] = useState('medium');
  const [overweight, setOverweight] = useState(false);
  const [touched, setTouched] = useState(false);

  const daily = useMemo(() => {
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (isNaN(w) || isNaN(a)) return 0;
    return Math.round(calculateRacion(w, a, activity, overweight));
  }, [weight, age, activity, overweight]);

  const weekly = daily * 7;
  const packSize = 510;
  const packDays = daily > 0 ? (packSize / daily) : 0;
  const packsPerWeek = daily > 0 ? Math.ceil(weekly / packSize) : 0;

  const whatsappText = () => {
    return lang == 'en' ? `Hi! Mi dog ${dogName}  weights ${weight} lbs, he is ${age} month old, and he needs ${daily}g of Beloov food per day.` : `¡Hola! Mi perro ${dogName} pesa ${weight} lbs, tiene ${age} meses, y necesita ${daily}g de comida Beloov al día.`;
  }
  const handleInput = (setter) => (e) => {
    setter(e.target.value);
    setTouched(true);
  };

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
        <label htmlFor="weight">{t.weight} *</label>
        <input
          id="weight"
          type="number"
          min="1"
          value={weight}
          onChange={handleInput(setWeight)}
          placeholder={t.weight}
        />
        <label htmlFor="age">{t.age} *</label>
        <input
          id="age"
          type="number"
          min="1"
          value={age}
          onChange={handleInput(setAge)}
          placeholder={t.age}
        />
        <label htmlFor="activity">{t.activity}</label>
        <select
          id="activity"
          value={activity}
          onChange={e => setActivity(e.target.value)}
          disabled={overweight || (parseInt(age) < 12)}
        >
          <option value="low">{t.low}</option>
          <option value="medium">{t.medium}</option>
          { parseInt(age) < 85 && <option value="high">{t.high}</option>}
        </select>
        <label>
          <input
            type="checkbox"
            checked={overweight}
            onChange={e => setOverweight(e.target.checked)}
            disabled={parseInt(age) < 12}
          />
          {t.overweight}
        </label>
        <div className="results">
          {(!weight || !age) && touched ? (
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
