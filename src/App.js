import React, { useMemo, useState } from 'react';
import config from './rations.json';
import './App.css';

const lbPerKg = 2.2046226218;

function poundsToKg(weightLb) {
  return Number(weightLb) / lbPerKg;
}

function getStage(stageKey) {
  return config.stages[stageKey] ? config.stages[stageKey] : null;
}

function getFactor(stageKey, activity) {
  const stage = getStage(stageKey);
  if (!stage) return null;
  if (typeof stage.factor === 'number') return stage.factor;
  return stage.factors && typeof stage.factors[activity] === 'number'
    ? stage.factors[activity]
    : null;
}

function calculateRation(stageKey, weightLb, activity) {
  const factor = getFactor(stageKey, activity || 'avg');
  const weightKg = poundsToKg(weightLb);
  if (factor === null || !Number.isFinite(weightKg)) return null;
  if (weightKg < config.weight.minKg || weightKg > config.weight.maxKg) return null;
  return Math.round(weightKg * factor);
}

function calculateBags(gramsPerDay) {
  const weekly = gramsPerDay * 7;
  return {
    weekly,
    bags250: Math.ceil(weekly / 250),
    bags510: Math.ceil(weekly / 510),
  };
}

function App() {
  const [dogName, setDogName] = useState('');
  const [age, setAge] = useState('puppy_4_6');
  const [weight, setWeight] = useState(String(config.weight.defaultLb));
  const [activity, setActivity] = useState('avg');

  const stage = useMemo(() => getStage(age), [age]);
  const activityOptions = stage && Array.isArray(stage.activity) ? stage.activity : [];
  const showActivity = activityOptions.length > 0;

  const grams = useMemo(() => calculateRation(age, weight, activity), [age, weight, activity]);
  const bags = useMemo(() => (grams === null ? null : calculateBags(grams)), [grams]);
  const name = dogName.trim();

  const handleAgeChange = (event) => {
    const nextAge = event.target.value;
    setAge(nextAge);
    const nextStage = getStage(nextAge);
    if (nextStage && Array.isArray(nextStage.activity)) {
      setActivity('avg');
    }
  };

  return (
    <div className="fc-page">
      <section className="fc-wrap">
        <div className="fc-card">
          <div className="fc-header">
            <h2 className="fc-title">Feeding Calculator</h2>
            <div className="fc-result-main">
              <span className="fc-label-main">Daily Ration</span>
              <strong className="fc-main-val">
                {grams === null ? '- g/day' : `${new Intl.NumberFormat('en-US').format(grams)} g/day`}
              </strong>
            </div>
          </div>

          <div className="fc-field">
            <label className="fc-label" htmlFor="dog-name">Dog's name</label>
            <input
              type="text"
              id="dog-name"
              name="dogName"
              className="fc-input"
              value={dogName}
              onChange={(event) => setDogName(event.target.value)}
              placeholder="e.g. Rocky"
            />
          </div>

          <div className="fc-grid">
            <div className="fc-field">
              <label className="fc-label" htmlFor="fc-age">Age</label>
              <select id="fc-age" className="fc-select" value={age} onChange={handleAgeChange}>
                {Object.entries(config.stages).map(([key, stageData]) => (
                  <option key={key} value={key}>{stageData.label}</option>
                ))}
              </select>
            </div>

            <div className="fc-field">
              <label className="fc-label" htmlFor="fc-w">Weight</label>
              <select id="fc-w" className="fc-select" value={weight} onChange={(event) => setWeight(event.target.value)}>
                {Array.from({ length: config.weight.maxLb - config.weight.minLb + 1 }, (_, index) => {
                  const lb = config.weight.minLb + index;
                  return <option key={lb} value={String(lb)}>{lb} lb</option>;
                })}
              </select>
            </div>

            <div className="fc-field" style={{ display: showActivity ? 'flex' : 'none' }}>
              <label className="fc-label" htmlFor="fc-activity">Activity</label>
              <select id="fc-activity" className="fc-select" value={activity} onChange={(event) => setActivity(event.target.value)}>
                {activityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="fc-divider" />

          <div className="fc-results">
            <div className="fc-row">
              <span className="fc-k">Daily ration</span>
              <strong className="fc-v">
                {grams === null ? '- g/day' : `${new Intl.NumberFormat('en-US').format(grams)} g/day`}
              </strong>
            </div>

            {grams !== null && bags ? (
              <div className="fc-summary-box">
                <p><strong>Feeding summary:</strong> {new Intl.NumberFormat('en-US').format(grams)} g/day · {new Intl.NumberFormat('en-US').format(bags.weekly)} g/week</p>
                {name ? (
                  <p>{name}&apos;s ideal weekly portion is {new Intl.NumberFormat('en-US').format(bags.weekly)} grams. We recommend getting {new Intl.NumberFormat('en-US').format(bags.bags250)} of the 250 g bags or {new Intl.NumberFormat('en-US').format(bags.bags510)} of the 510 g bags, which will cover their meals for the entire week.</p>
                ) : (
                  <p>The ideal weekly portion for your dog is {new Intl.NumberFormat('en-US').format(bags.weekly)} grams. We recommend getting {new Intl.NumberFormat('en-US').format(bags.bags250)} of the 250 g bags or {new Intl.NumberFormat('en-US').format(bags.bags510)} of the 510 g bags, which will last the whole week.</p>
                )}
              </div>
            ) : null}

            <p className="fc-note">Indicative result. Adjust according to activity and body condition.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
