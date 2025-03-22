import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/he';

dayjs.locale('he');

const SHEET_BASE = "https://opensheet.elk.sh/1x1e53gsx3VzEJ5ON5QOvYeJTGI8auMtSxJYYpUUmreY";

const formatDate = (timestamp) => {
  const d = dayjs(timestamp, 'DD/MM/YYYY HH:mm:ss');
  return d.isValid() ? d.format('YYYY-MM-DD') : null;
};

function processRPE(data, field) {
  const daily = {};
  const playerDaily = {};

  data.forEach(row => {
    const name = row["Name"];
    const rawDate = formatDate(row["Timestamp"]);
    const value = Number(row[field]);
    if (!name || !rawDate || isNaN(value)) return;

    if (!daily[rawDate]) daily[rawDate] = [];
    daily[rawDate].push(value);

    if (!playerDaily[name]) playerDaily[name] = {};
    if (!playerDaily[name][rawDate]) playerDaily[name][rawDate] = [];
    playerDaily[name][rawDate].push(value);
  });

  const sortedDailyAvg = Object.entries(daily)
    .map(([date, values]) => ({
      date,
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return { sortedDailyAvg, playerDaily };
}

function RollingAvg({ data }) {
  const getRolling = (days) => {
    const recent = data.slice(-days);
    const values = recent.map(d => Number(d.avg)).filter(n => !isNaN(n));
    return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'אין נתונים';
  };
  return (
    <>
      <h4>ממוצע מתגלגל</h4>
      <p>3 ימים: {getRolling(3)} | 5 ימים: {getRolling(5)} | 8 ימים: {getRolling(8)}</p>
    </>
  );
}

function PlayerBlock({ name, data }) {
  const [show, setShow] = useState(false);
  const dates = Object.keys(data).sort();
  const lastNDays = (n) => dates.slice(-n);

  const calcAvg = (selectedDates) => {
    const values = selectedDates.flatMap(d => data[d] || []);
    return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'אין נתונים';
  };

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const customDates = dates.filter(d => (!from || d >= from) && (!to || d <= to));

  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={() => setShow(!show)}>
        {show ? '🔽' : '▶️'} {name}
      </button>
      {show && (
        <div style={{ paddingRight: '20px' }}>
          <h4>ממוצעים לפי ימים (8 ימים אחרונים)</h4>
          <table border="1" cellPadding="6">
            <thead><tr><th>תאריך</th><th>RPE</th></tr></thead>
            <tbody>
              {lastNDays(8).map(date => {
                const values = data[date];
                const avg = values && values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'אין נתונים';
                return <tr key={date}><td>{date}</td><td>{avg}</td></tr>;
              })}
            </tbody>
          </table>
          <h4>ממוצע מתגלגל</h4>
          <p>3 ימים: {calcAvg(lastNDays(3))} | 5 ימים: {calcAvg(lastNDays(5))} | 8 ימים: {calcAvg(lastNDays(8))}</p>
          <div>
            <h4>ממוצע לפי טווח תאריכים</h4>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
            <p>ממוצע: {calcAvg(customDates)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RPEReport({ title, tab, field }) {
  const [data, setData] = useState([]);
  const [processed, setProcessed] = useState(null);

  useEffect(() => {
    fetch(`${SHEET_BASE}/${tab}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setProcessed(processRPE(json, field));
      });
  }, [tab, field]);

  if (!processed) return <p>טוען נתונים עבור {title}...</p>;

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2>{title}</h2>
      <h3>ממוצעים לפי ימים (8 ימים אחרונים)</h3>
      <table border="1" cellPadding="6">
        <thead><tr><th>תאריך</th><th>ממוצע RPE</th></tr></thead>
        <tbody>
          {processed.sortedDailyAvg.slice(-8).map((entry, i) => (
            <tr key={i}><td>{entry.date}</td><td>{entry.avg}</td></tr>
          ))}
        </tbody>
      </table>

      <RollingAvg data={processed.sortedDailyAvg} />

      <h3>ממוצע לפי טווח תאריכים</h3>
      <DateRangeAverage data={processed.sortedDailyAvg} />

      <h3>ממוצעים לפי שחקנית</h3>
      {Object.entries(processed.playerDaily).map(([name, values], i) => (
        <PlayerBlock key={i} name={name} data={values} />
      ))}
    </div>
  );
}

function DateRangeAverage({ data }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const filtered = data.filter(d => (!from || d.date >= from) && (!to || d.date <= to));
  const avg = filtered.length ? (filtered.reduce((a, b) => a + Number(b.avg), 0) / filtered.length).toFixed(1) : 'אין נתונים';

  return (
    <div>
      <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
      <input type="date" value={to} onChange={e => setTo(e.target.value)} />
      <p>ממוצע בטווח: {avg}</p>
    </div>
  );
}

export default function GymCourtReport() {
  return (
    <div className="report" dir="rtl" style={{ padding: '20px' }}>
      <h1>דו\"ח RPE - חדר כושר ומגרש</h1>
      <RPEReport title="🏋️ חדר כושר (Gym)" tab="Gym" field="RPE בחדר כושר" />
      <RPEReport title="🏀 מגרש (Court)" tab="Court" field="RPE במגרש" />
    </div>
  );
}