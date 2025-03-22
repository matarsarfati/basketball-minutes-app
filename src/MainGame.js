import React, { useState, useEffect } from 'react';
import './App.css';

const defaultPlayers = [
  { name: "שירה", active: true },
  { name: "נועה", active: true },
  { name: "דנה", active: true },
  { name: "רות", active: true },
  { name: "הילה", active: true }
];

const getSavedPlayers = () => {
  const saved = localStorage.getItem("players");
  return saved ? JSON.parse(saved) : defaultPlayers;
};

function formatTime(sec) {
  const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
  const seconds = String(sec % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function MainGame() {
  const [quarter, setQuarter] = useState(1);
  const [timeLeft, setTimeLeft] = useState(600);
  const [totalGameTime, setTotalGameTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editOpponentsMode, setEditOpponentsMode] = useState(false);
  const [timeoutMode, setTimeoutMode] = useState(false);
  const [breakMode, setBreakMode] = useState(false);
  const [editClockMode, setEditClockMode] = useState(false);
  const [editClockValue, setEditClockValue] = useState(600);

  const [players, setPlayers] = useState(getSavedPlayers().map(p => ({
    name: p.name,
    active: p.active,
    total: 0,
    startTime: null,
    restStart: 0,
    fouls: 0,
    points: 0,
    history: []
  })));

  const [opponents, setOpponents] = useState([]);

  useEffect(() => {
    let timer;
    if (running && timeLeft > 0 && !timeoutMode && !breakMode) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setTotalGameTime(prev => prev + 1);
      }, 1000);
    }
    if (timeLeft === 0 && running) {
      setRunning(false);
      setBreakMode(true);
      alert(`סיום רבע ${quarter}`);
      if (quarter < 4) {
        setQuarter(prev => prev + 1);
        setTimeLeft(600);
      }
    }
    return () => clearInterval(timer);
  }, [running, timeLeft, quarter, timeoutMode, breakMode]);

  const startQuarter = () => {
    setRunning(true);
    setTimeoutMode(false);
    setBreakMode(false);
  };

  const stopQuarter = () => setRunning(false);

  const togglePlayer = (index) => {
    setPlayers(prev => {
      const updated = [...prev];
      const p = updated[index];
      if (p.startTime === null) {
        updated[index] = {
          ...p,
          startTime: totalGameTime,
          restStart: 0,
          history: [...p.history, { action: 'in', time: totalGameTime }]
        };
      } else {
        const newTotal = p.total + (totalGameTime - p.startTime);
        updated[index] = {
          ...p,
          startTime: null,
          total: newTotal,
          restStart: totalGameTime,
          history: [...p.history, { action: 'out', time: totalGameTime }]
        };
      }
      return updated;
    });
  };

  const toggleOpponent = (index) => {
    setOpponents(prev => {
      const updated = [...prev];
      const p = updated[index];
      if (p.startTime === null) {
        updated[index] = { ...p, startTime: totalGameTime, restStart: 0 };
      } else {
        const newTotal = p.total + (totalGameTime - p.startTime);
        updated[index] = { ...p, startTime: null, total: newTotal, restStart: totalGameTime };
      }
      return updated;
    });
  };

  const changeValue = (listSetter, index, key, delta) => {
    listSetter(prev => {
      const updated = [...prev];
      updated[index][key] = Math.max(0, updated[index][key] + delta);
      return updated;
    });
  };

  const savePlayers = () => {
    localStorage.setItem("players", JSON.stringify(players.map(p => ({ name: p.name, active: p.active }))));
    setEditMode(false);
  };

  const saveOpponents = () => setEditOpponentsMode(false);

  return (
    <div className="App" dir="rtl">
      <h1>בדיקת דקות משחק</h1>

      <div className="controls">
        <div className="section">
          <h3>שליטה במשחק</h3>
          <button onClick={startQuarter}>התחל</button>
          <button onClick={stopQuarter}>עצור</button>
          <button onClick={() => { setTimeoutMode(true); stopQuarter(); }}>⏱ טיים אאוט</button>
          <button onClick={() => { setBreakMode(true); stopQuarter(); }}>📣 הפסקת רבע</button>
          <button onClick={() => setEditClockMode(!editClockMode)}>⏰ סנכרון שעון</button>
        </div>
        <div className="section">
          <h3>ניווט</h3>
          <button onClick={() => { setShowHistory(false); setEditMode(false); setEditOpponentsMode(false); }}>חזרה למשחק</button>
          <button onClick={() => { setShowHistory(true); setEditMode(false); setEditOpponentsMode(false); }}>היסטוריית כניסות</button>
        </div>
        <div className="section">
          <h3>ניהול קבוצות</h3>
          <button onClick={() => { setEditMode(!editMode); setShowHistory(false); setEditOpponentsMode(false); }}>ניהול קבוצה</button>
          <button onClick={() => { setEditOpponentsMode(!editOpponentsMode); setShowHistory(false); setEditMode(false); }}>ניהול קבוצה יריבה</button>
        </div>
      </div>

      {editClockMode && (
        <div className="sync-clock">
          <input type="number" value={editClockValue} onChange={(e) => setEditClockValue(Number(e.target.value))} />
          <button onClick={() => setTimeLeft(editClockValue)}>עדכן שעון</button>
        </div>
      )}

      {!showHistory && !editMode && !editOpponentsMode && (
        <>
          <h2>רבע: {quarter} | שעון: {formatTime(timeLeft)}</h2>
          {timeoutMode && <p className="orange">⏱ טיים אאוט</p>}
          {breakMode && <p className="green">📣 הפסקת רבע</p>}

          <h3>שחקניות</h3>
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>רצוף</th>
                <th>מנוחה</th>
                <th>סה"כ</th>
                <th>פעולה</th>
                <th>נק'</th>
                <th>+/-</th>
                <th>עב'</th>
                <th>+/-</th>
              </tr>
            </thead>
            <tbody>
              {players.filter(p => p.active).map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.startTime !== null ? formatTime(totalGameTime - p.startTime) : '-'}</td>
                  <td>{p.startTime === null && p.restStart !== 0 ? formatTime(totalGameTime - p.restStart) : '-'}</td>
                  <td>{formatTime(p.total + (p.startTime !== null ? totalGameTime - p.startTime : 0))}</td>
                  <td><button onClick={() => togglePlayer(i)}>{p.startTime === null ? 'הכנס' : 'הוצא'}</button></td>
                  <td>{p.points}</td>
                  <td>
                    <button onClick={() => changeValue(setPlayers, i, 'points', 1)}>+1</button>
                    <button onClick={() => changeValue(setPlayers, i, 'points', -1)}>-1</button>
                  </td>
                  <td>{p.fouls}</td>
                  <td>
                    <button onClick={() => changeValue(setPlayers, i, 'fouls', 1)}>+1</button>
                    <button onClick={() => changeValue(setPlayers, i, 'fouls', -1)}>-1</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>קבוצת יריבה</h3>
          <table>
            <thead>
              <tr>
                <th>שם</th>
                <th>רצוף</th>
                <th>מנוחה</th>
                <th>סה"כ</th>
                <th>פעולה</th>
                <th>נק'</th>
                <th>+/-</th>
                <th>עב'</th>
                <th>+/-</th>
              </tr>
            </thead>
            <tbody>
              {opponents.filter(p => p.active !== false).map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.startTime !== null ? formatTime(totalGameTime - p.startTime) : '-'}</td>
                  <td>{p.startTime === null && p.restStart !== 0 ? formatTime(totalGameTime - p.restStart) : '-'}</td>
                  <td>{formatTime(p.total + (p.startTime !== null ? totalGameTime - p.startTime : 0))}</td>
                  <td><button onClick={() => toggleOpponent(i)}>{p.startTime === null ? 'הכנס' : 'הוצא'}</button></td>
                  <td>{p.points}</td>
                  <td>
                    <button onClick={() => changeValue(setOpponents, i, 'points', 1)}>+1</button>
                    <button onClick={() => changeValue(setOpponents, i, 'points', 2)}>+2</button>
                    <button onClick={() => changeValue(setOpponents, i, 'points', 3)}>+3</button>
                    <button onClick={() => changeValue(setOpponents, i, 'points', -1)}>-1</button>
                  </td>
                  <td>{p.fouls}</td>
                  <td>
                    <button onClick={() => changeValue(setOpponents, i, 'fouls', 1)}>+1</button>
                    <button onClick={() => changeValue(setOpponents, i, 'fouls', -1)}>-1</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showHistory && (
        <>
          <h2>היסטוריית כניסות ויציאות</h2>
          {players.map((p, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <h4>{p.name}</h4>
              <table>
                <thead>
                  <tr>
                    <th>פעולה</th>
                    <th>שניות</th>
                    <th>שעה</th>
                  </tr>
                </thead>
                <tbody>
                  {p.history.map((h, j) => (
                    <tr key={j}>
                      <td>{h.action === 'in' ? 'כניסה' : 'יציאה'}</td>
                      <td>{h.time}</td>
                      <td>{formatTime(h.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}

      {editMode && (
        <div>
          <h3>ניהול קבוצה</h3>
          {players.map((p, i) => (
            <div key={i}>
              <input type="text" value={p.name} onChange={(e) => {
                const updated = [...players];
                updated[i].name = e.target.value;
                setPlayers(updated);
              }} />
              <input type="checkbox" checked={p.active} onChange={(e) => {
                const updated = [...players];
                updated[i].active = e.target.checked;
                setPlayers(updated);
              }} /> פעילה
              <button onClick={() => {
                const updated = [...players];
                updated.splice(i, 1);
                setPlayers(updated);
              }}>מחק</button>
            </div>
          ))}
          <button onClick={() => setPlayers([...players, {
            name: '', active: true, total: 0, startTime: null, restStart: 0, fouls: 0, points: 0, history: []
          }])}>הוסף שחקנית</button>
          <button onClick={savePlayers}>שמור קבוצה</button>
        </div>
      )}

      {editOpponentsMode && (
        <div>
          <h3>ניהול קבוצה יריבה</h3>
          {opponents.map((p, i) => (
            <div key={i}>
              <input type="text" value={p.name} onChange={(e) => {
                const updated = [...opponents];
                updated[i].name = e.target.value;
                setOpponents(updated);
              }} />
              <input type="checkbox" checked={p.active !== false} onChange={(e) => {
                const updated = [...opponents];
                updated[i].active = e.target.checked;
                setOpponents(updated);
              }} /> פעילה
              <button onClick={() => {
                const updated = [...opponents];
                updated.splice(i, 1);
                setOpponents(updated);
              }}>מחק</button>
            </div>
          ))}
          <button onClick={() => setOpponents([...opponents, {
            name: '', active: true, total: 0, startTime: null, restStart: 0, fouls: 0, points: 0
          }])}>הוסף שחקנית</button>
          <button onClick={saveOpponents}>שמור קבוצה יריבה</button>
        </div>
      )}
    </div>
  );
}

export default MainGame;