import React, { useState, useEffect } from 'react';

function WellnessReport() {
  const [data, setData] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [groupStatsByDay, setGroupStatsByDay] = useState([]);
  const [groupRollingAverage, setGroupRollingAverage] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customGroupAverage, setCustomGroupAverage] = useState(null);
  const [expandedPlayers, setExpandedPlayers] = useState({});

  const sheetUrl = 'https://opensheet.elk.sh/1x1e53gsx3VzEJ5ON5QOvYeJTGI8auMtSxJYYpUUmreY/Wallnes';

  useEffect(() => {
    fetch(sheetUrl)
      .then((res) => res.json())
      .then((json) => {
        const parsed = json.map((entry) => ({
          name: entry['Name'],
          sleep: Number(entry['What is the quality of your sleep at night?']),
          sore: Number(entry['How sore are you?']),
          fatigue: Number(entry['How Fatigued are you?']),
          date: parseDate(entry['Timestamp']),
        })).filter(e => !isNaN(e.sleep) && !isNaN(e.sore) && !isNaN(e.fatigue) && e.date);

        setData(parsed);

        const groupedByDate = groupByDate(parsed);
        setGroupStatsByDay(groupedByDate);

        const rollingAvg = calcRollingAverage(parsed);
        setGroupRollingAverage(rollingAvg);

        const players = {};
        parsed.forEach(e => {
          if (!players[e.name]) players[e.name] = [];
          players[e.name].push(e);
        });
        setPlayerStats(players);
      });
  }, []);

  const parseDate = (str) => {
    const [datePart] = str.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const groupByDate = (data) => {
    const days = {};
    data.forEach(entry => {
      const key = entry.date.toDateString();
      if (!days[key]) days[key] = [];
      days[key].push(entry);
    });
    const result = Object.entries(days).map(([dateStr, entries]) => {
      const sleepAvg = avg(entries.map(e => e.sleep));
      const soreAvg = avg(entries.map(e => e.sore));
      const fatigueAvg = avg(entries.map(e => e.fatigue));
      return { dateStr, sleepAvg, soreAvg, fatigueAvg };
    }).slice(-8); // last 8 days
    return result;
  };

  const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'אין דיווח';

  const calcRollingAverage = (entries) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const lastDays = entries.filter(e => e.date >= cutoff);
    return {
      sleep: avg(lastDays.map(e => e.sleep)),
      sore: avg(lastDays.map(e => e.sore)),
      fatigue: avg(lastDays.map(e => e.fatigue))
    };
  };

  const calcAverageInRange = (entries, start, end) => {
    const filtered = entries.filter(e => e.date >= start && e.date <= end);
    return {
      sleep: avg(filtered.map(e => e.sleep)),
      sore: avg(filtered.map(e => e.sore)),
      fatigue: avg(filtered.map(e => e.fatigue))
    };
  };

  const renderDayAveragesTable = () => (
    <table>
      <thead>
        <tr>
          <th>תאריך</th>
          <th>שינה 💤</th>
          <th>עייפות 😴</th>
          <th>כאבי שרירים 💪</th>
        </tr>
      </thead>
      <tbody>
        {groupStatsByDay.map((d, idx) => (
          <tr key={idx}>
            <td>{d.dateStr}</td>
            <td>{d.sleepAvg}</td>
            <td>{d.fatigueAvg}</td>
            <td>{d.soreAvg}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPlayerSection = (name, entries) => {
    const last8 = groupByDate(entries).slice(-8);
    const avgRolling = calcRollingAverage(entries);
    const getLastDaysAvg = (n) => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (n - 1));
      return calcAverageInRange(entries, start, end);
    };

    return (
      <div key={name}>
        <h4 style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => setExpandedPlayers(p => ({ ...p, [name]: !p[name] }))}>
          {name}
        </h4>
        {expandedPlayers[name] && (
          <div style={{ marginBottom: '20px' }}>
            {renderDayAveragesTable(last8)}
            <p>ממוצע מתגלגל:</p>
            <p>שינה: {avgRolling.sleep} | עייפות: {avgRolling.fatigue} | כאבי שרירים: {avgRolling.sore}</p>
            <p>ממוצע 3 ימים: {getLastDaysAvg(3).sleep}, {getLastDaysAvg(3).fatigue}, {getLastDaysAvg(3).sore}</p>
            <p>ממוצע 5 ימים: {getLastDaysAvg(5).sleep}, {getLastDaysAvg(5).fatigue}, {getLastDaysAvg(5).sore}</p>
            <p>ממוצע 8 ימים: {getLastDaysAvg(8).sleep}, {getLastDaysAvg(8).fatigue}, {getLastDaysAvg(8).sore}</p>
            <div>
              <label>טווח מותאם אישי:</label><br />
              <input type="date" onChange={(e) => setCustomStartDate(e.target.value)} />
              <input type="date" onChange={(e) => setCustomEndDate(e.target.value)} />
              <button onClick={() => {
                const start = new Date(customStartDate);
                const end = new Date(customEndDate);
                const avg = calcAverageInRange(entries, start, end);
                alert(`שינה: ${avg.sleep}, עייפות: ${avg.fatigue}, כאבי שרירים: ${avg.sore}`);
              }}>חשב ממוצע</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }} dir="rtl">
      <h2>דוח Wellness</h2>
      <h3>ממוצע קבוצתי - לפי ימים (8 ימים אחרונים)</h3>
      {renderDayAveragesTable()}

      <h3>ממוצע קבוצתי מתגלגל (8 ימים אחרונים)</h3>
      <p>שינה: {groupRollingAverage?.sleep} | עייפות: {groupRollingAverage?.fatigue} | כאבי שרירים: {groupRollingAverage?.sore}</p>

      <h3>ממוצע קבוצתי לפי טווח תאריכים</h3>
      <input type="date" onChange={(e) => setCustomStartDate(e.target.value)} />
      <input type="date" onChange={(e) => setCustomEndDate(e.target.value)} />
      <button onClick={() => {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const avg = calcAverageInRange(data, start, end);
        setCustomGroupAverage(avg);
      }}>חשב ממוצע</button>
      {customGroupAverage && (
        <p>שינה: {customGroupAverage.sleep}, עייפות: {customGroupAverage.fatigue}, כאבי שרירים: {customGroupAverage.sore}</p>
      )}

      <h3>ממוצעים לפי שחקנית</h3>
      {Object.entries(playerStats).map(([name, entries]) => renderPlayerSection(name, entries))}
    </div>
  );
}

export default WellnessReport;