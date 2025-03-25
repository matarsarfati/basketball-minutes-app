import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import i18n from './i18n/i18n';
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
  const { t, i18n } = useTranslation();
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
  const [timeoutStart, setTimeoutStart] = useState(null);

  const [players, setPlayers] = useState(getSavedPlayers().map(p => ({
    name: p.name,
    active: p.active,
    total: 0,
    startTime: null,
    restStart: 0,
    totalRest: 0,
    hideRest: false,
    fouls: 0,
    points: 0,
    history: [],
    starForTimeout: false
  })));

  const [opponents, setOpponents] = useState([]);
  useEffect(() => {
    let timer;
    if (running && timeLeft > 0 && !timeoutMode && !breakMode) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setTotalGameTime(prev => {
          const newTime = prev + 1;

          setPlayers(players => players.map(p => {
            if (p.startTime === null && p.restStart !== 0 && !p.hideRest) {
              return {
                ...p,
                totalRest: p.totalRest + 1
              };
            }
            return p;
          }));

          return newTime;
        });
      }, 1000);
    }

    if (timeLeft === 0 && running) {
      setRunning(false);
      setBreakMode(true);
      alert(`${t('quarterEnd')} ${quarter}`);
      if (quarter < 4) {
        setQuarter(prev => prev + 1);
        setTimeLeft(600);
      }
    }

    return () => clearInterval(timer);
  }, [running, timeLeft, quarter, timeoutMode, breakMode, t]);
  const handleTimeout = () => {
    setRunning(false);
    setTimeoutMode(true);
    setTimeoutStart(totalGameTime);
  };

  const resumeFromTimeout = () => {
    const timeoutEnd = totalGameTime;

    setPlayers(players => players.map(p => {
      if (p.startTime !== null && timeoutStart !== null && timeoutEnd > timeoutStart) {
        return {
          ...p,
          starForTimeout: true
        };
      }
      return p;
    }));
    setTimeoutMode(false);
    setTimeoutStart(null);
    setRunning(true);
  };

  const startQuarter = () => {
    setRunning(true);
    setTimeoutMode(false);
    setBreakMode(false);
  };

  const stopQuarter = () => {
    setRunning(false);
  };

  const togglePlayer = (index) => {
    setPlayers(prev => {
      const updated = [...prev];
      const player = updated[index];
      const onCourt = player.startTime !== null;

      if (onCourt) {
        const now = totalGameTime;
        player.total += now - player.startTime;
        player.startTime = null;
        player.restStart = now;
        player.starForTimeout = false;
        player.history.push({ action: 'out', time: now });
      } else {
        const now = totalGameTime;
        player.startTime = now;
        player.restStart = 0;
        player.history.push({ action: 'in', time: now });
      }

      updated[index] = player;
      return updated;
    });
  };

  const toggleOpponent = (index) => {
    setOpponents(prev => {
      const updated = [...prev];
      const player = updated[index];
      const onCourt = player.startTime !== null;

      if (onCourt) {
        const now = totalGameTime;
        player.total += now - player.startTime;
        player.startTime = null;
        player.restStart = now;
      } else {
        const now = totalGameTime;
        player.startTime = now;
        player.restStart = 0;
      }

      updated[index] = player;
      return updated;
    });
  };

  const changeValue = (setFunc, index, key, amount) => {
    setFunc(prev => {
      const updated = [...prev];
      updated[index][key] += amount;
      if (updated[index][key] < 0) updated[index][key] = 0;
      return updated;
    });
  };

  const savePlayers = () => {
    localStorage.setItem("players", JSON.stringify(players));
    alert(t("teamSaved"));
  };

  const saveOpponents = () => {
    localStorage.setItem("opponents", JSON.stringify(opponents));
    alert(t("opponentsSaved"));
  };
  return (
    <div className="App" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
      <div className="language-switcher">
        <button onClick={() => i18n.changeLanguage('he')}>עברית</button>
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
      </div>

      <div className="sidebar-controls">
        <button onClick={() => setEditMode(true)}>⚙ {t("manageMyTeam")}</button>
        <button onClick={() => setEditOpponentsMode(true)}>⚙ {t("manageOpponentsTeam")}</button>
        <button onClick={() => setShowHistory(true)}>📜 {t("entryHistory")}</button>
      </div>

      <h1>{t("title")}</h1>

      <div className="main-controls">
        <button onClick={startQuarter}>▶ {t("start")}</button>
        <button onClick={stopQuarter}>⏹ {t("stop")}</button>
        <button onClick={handleTimeout}>⏱ {t("timeout")}</button>
        <button onClick={() => { setBreakMode(true); setRunning(false); }}>📣 {t("quarterBreak")}</button>
        <button onClick={() => setEditClockMode(!editClockMode)}>⏰ {t("syncClock")}</button>
        {timeoutMode && (
          <button className="return-button" onClick={resumeFromTimeout}>🔁 {t("resumeFromTimeout")}</button>
        )}
      </div>

      <div className="section">
        <h3>{t("navigation")}</h3>
        <button onClick={() => { setShowHistory(false); setEditMode(false); setEditOpponentsMode(false); }}>{t("backToGame")}</button>
        <button onClick={() => { setShowHistory(true); setEditMode(false); setEditOpponentsMode(false); }}>{t("entryHistory")}</button>
      </div>
      <div className="section">
        <h3>{t("teamsManagement")}</h3>
        <button onClick={() => { setEditMode(!editMode); setShowHistory(false); setEditOpponentsMode(false); }}>{t("manageTeam")}</button>
        <button onClick={() => { setEditOpponentsMode(!editOpponentsMode); setShowHistory(false); setEditMode(false); }}>{t("manageOpponentsTeam")}</button>
      </div>

      {editClockMode && (
        <div className="sync-clock">
          <input type="number" value={editClockValue} onChange={(e) => setEditClockValue(Number(e.target.value))} />
          <button onClick={() => setTimeLeft(editClockValue)}>{t("updateClock")}</button>
        </div>
      )}

      {!showHistory && !editMode && !editOpponentsMode && (
        <>
          <h2>{t("quarter")}: {quarter} | {t("clock")}: {formatTime(timeLeft)}</h2>
          {timeoutMode && <p className="orange">⏱ {t("timeout")}</p>}
          {breakMode && <p className="green">📣 {t("quarterBreak")}</p>}
          {timeoutMode && (
            <button onClick={resumeFromTimeout}>{t("resumeFromTimeout")}</button>
          )}

          <h3>{t("players")}</h3>
          <table>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("consecutive")}</th>
                <th>{t("rest")}</th>
                <th>{t("total")}</th>
                <th>{t("totalRest")}</th>
                <th>{t("action")}</th>
                <th>{t("pointsShort")}</th>
                <th>+/-</th>
                <th>{t("foulsShort")}</th>
                <th>+/-</th>
                <th>{t("hideRest")}</th>
              </tr>
            </thead>
            <tbody>
              {players.filter(p => p.active).map((p, i) => {
                const onCourt = p.startTime !== null;
                const restTime = !onCourt && p.restStart !== 0 && !p.hideRest
                  ? totalGameTime - p.restStart
                  : 0;
                const playingTime = p.total + (onCourt ? totalGameTime - p.startTime : 0);

                return (
                  <tr key={i}>
                    <td>
                      {p.name}
                      {p.starForTimeout ? ' *' : ''}
                    </td>
                    <td>{p.startTime !== null ? formatTime(totalGameTime - p.startTime) : '-'}</td>
                    <td>
                      {p.startTime === null && !p.hideRest && p.restStart !== 0
                        ? formatTime(totalGameTime - p.restStart)
                        : '-'}
                    </td>
                    <td>{formatTime(playingTime)}</td>
                    <td>{formatTime(p.totalRest)}</td>
                    <td>
                      <button onClick={() => togglePlayer(i)}>
                        {p.startTime === null ? t("insert") : t("remove")}
                      </button>
                    </td>
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
                    <td>
                      <button onClick={() => {
                        const updated = [...players];
                        updated[i].hideRest = !updated[i].hideRest;
                        setPlayers(updated);
                      }}>
                        {p.hideRest ? `👁️ ${t("show")}` : `🙈 ${t("hide")}`}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3>{t("opponentTeam")}</h3>
          <table>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("onCourt")}</th>
                <th>{t("rest")}</th>
                <th>{t("total")}</th>
                <th>{t("totalRest")}</th>
                <th>{t("action")}</th>
                <th>{t("pointsShort")}</th>
                <th>+/-</th>
                <th>{t("foulsShort")}</th>
                <th>+/-</th>
                <th>{t("hideRest")}</th>
              </tr>
            </thead>
            <tbody>
              {opponents.filter(p => p.active !== false).map((p, i) => {
                const onCourt = p.startTime !== null;
                const restTime = !onCourt && p.restStart !== 0 && !p.hideRest
                  ? totalGameTime - p.restStart
                  : 0;
                const playingTime = p.total + (onCourt ? totalGameTime - p.startTime : 0);

                return (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{onCourt ? formatTime(totalGameTime - p.startTime) : '-'}</td>
                    <td>{restTime > 0 ? formatTime(restTime) : '-'}</td>
                    <td>{formatTime(playingTime)}</td>
                    <td>{formatTime(p.totalRest || 0)}</td>
                    <td>
                      <button onClick={() => toggleOpponent(i)}>
                        {onCourt ? t("remove") : t("insert")}
                      </button>
                    </td>
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
                    <td>
                      <button onClick={() => {
                        const updated = [...opponents];
                        updated[i].hideRest = !updated[i].hideRest;
                        setOpponents(updated);
                      }}>
                        {p.hideRest ? t("show") : t("hide")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </>
      )}
      {showHistory && (
        <>
          <h2>{t("entryExitHistory")}</h2>
          {players.map((p, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <h4>{p.name}</h4>
              <table>
                <thead>
                  <tr>
                    <th>{t("action")}</th>
                    <th>{t("seconds")}</th>
                    <th>{t("time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.history.map((h, j) => (
                    <tr key={j}>
                      <td>{h.action === 'in' ? t("enter") : t("exit")}</td>
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
          <h3>{t("manageTeam")}</h3>
          {players.map((p, i) => (
            <div key={i}>
              <input
                type="text"
                value={p.name}
                onChange={(e) => {
                  const updated = [...players];
                  updated[i].name = e.target.value;
                  setPlayers(updated);
                }}
              />
              <input
                type="checkbox"
                checked={p.active}
                onChange={(e) => {
                  const updated = [...players];
                  updated[i].active = e.target.checked;
                  setPlayers(updated);
                }}
              /> {t("active")}
              <button onClick={() => {
                const updated = [...players];
                updated.splice(i, 1);
                setPlayers(updated);
              }}>{t("delete")}</button>
            </div>
          ))}
          <button onClick={() => setPlayers([...players, {
            name: '', active: true, total: 0, startTime: null, restStart: 0,
            totalRest: 0, hideRest: false, fouls: 0, points: 0, history: [], starForTimeout: false
          }])}>➕ {t("addPlayer")}</button>
          <button onClick={savePlayers}>💾 {t("saveTeam")}</button>
        </div>
      )}

      {editOpponentsMode && (
        <div>
          <h3>{t("manageOpponentTeam")}</h3>
          {opponents.map((p, i) => (
            <div key={i}>
              <input
                type="text"
                value={p.name}
                onChange={(e) => {
                  const updated = [...opponents];
                  updated[i].name = e.target.value;
                  setOpponents(updated);
                }}
              />
              <input
                type="checkbox"
                checked={p.active !== false}
                onChange={(e) => {
                  const updated = [...opponents];
                  updated[i].active = e.target.checked;
                  setOpponents(updated);
                }}
              /> {t("active")}
              <button onClick={() => {
                const updated = [...opponents];
                updated.splice(i, 1);
                setOpponents(updated);
              }}>🗑️ {t("delete")}</button>
            </div>
          ))}
          <button onClick={() => setOpponents([...opponents, {
            name: '', active: true, total: 0, startTime: null, restStart: 0, totalRest: 0, fouls: 0, points: 0
          }])}>➕ {t("addPlayer")}</button>
          <button onClick={saveOpponents}>💾 {t("saveOpponentTeam")}</button>
        </div>
      )}
    </div>
  );
}

export default MainGame;