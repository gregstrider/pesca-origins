"use client";
import Head from "next/head";
<Head>
  <title>Ranking de Pesca - Habbo Origins BR</title>
  <meta name="description" content="Veja o ranking de habilidade de pesca dos jogadores do Habbo Origins BR" />
</Head>

import { useState, useEffect } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [sortKey, setSortKey] = useState("level");
  const [sortAsc, setSortAsc] = useState(false); // false = descendente

  useEffect(() => {
    const savedHistory = localStorage.getItem("ranking");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ranking", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleSearch = async () => {
    if (!username.trim()) return;

    try {
      const userResponse = await fetch(
        `https://origins.habbo.com.br/api/public/users?name=${username}`
      );
      const userJson = await userResponse.json();
      setUserData(userJson);

      const uniqueId = userJson.uniqueId;
      if (!uniqueId.startsWith("hhobr-")) return;

      const skillResponse = await fetch(
        `https://origins.habbo.com.br/api/public/skills/${uniqueId}?skillType=FISHING`
      );
      const skillJson = await skillResponse.json();
      setSkillData(skillJson);

      const newEntry = {
        name: userJson.name,
        motto: userJson.motto,
        memberSince: userJson.memberSince,
        lastAccessTime: userJson.lastAccessTime,
        level: skillJson.level,
        experience: skillJson.experience,
      };

      setSearchHistory((prev) => {
        // Remove usuário duplicado
        const filtered = prev.filter((item) => item.name !== newEntry.name);
        const updated = [newEntry, ...filtered];
        // Ordenar e limitar 100
        return updated
          .sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            if (b.experience !== a.experience) return b.experience - a.experience;
            return a.name.localeCompare(b.name);
          })
          .slice(0, 100);
      });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const clearHistory = () => {
    if (confirm("Tem certeza que deseja apagar o ranking local?")) {
      setSearchHistory([]);
      localStorage.removeItem("ranking");
    }
  };

  const exportCSV = () => {
    if (searchHistory.length === 0) return alert("Ranking vazio para exportar.");

    const csvHeader = "Posição,Nome,Nível,Experiência\n";
    const csvRows = searchHistory
      .map(
        (entry, index) =>
          `${index + 1},"${entry.name}",${entry.level},${entry.experience}`
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + csvHeader + csvRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ranking_pesca.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedHistory = [...searchHistory].sort((a, b) => {
    // Usa o sortKey e sortAsc para ordenar a tabela
    let comp = 0;
    if (sortKey === "level") {
      comp = b.level - a.level; // descendente por padrão
      if (comp === 0) comp = b.experience - a.experience;
      if (comp === 0) comp = a.name.localeCompare(b.name);
    } else if (sortKey === "experience") {
      comp = b.experience - a.experience;
      if (comp === 0) comp = b.level - a.level;
      if (comp === 0) comp = a.name.localeCompare(b.name);
    } else if (sortKey === "name") {
      comp = a.name.localeCompare(b.name);
    }

    return sortAsc ? -comp : comp;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#1a1a1a",
        color: "#f0f0f0",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Pesca  Habbo Origins BR
      </h1>
      <p style={{ fontSize: "1rem", color: "#ccc", marginTop: "-1rem", marginBottom: "1.5rem" }}>
  Criado por Greg
</p>

      

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite o nome do usuário"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            minWidth: "250px",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
            backgroundColor: "#007b00",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
          }}
        >
          Buscar
        </button>
      </div>

      {userData && (
        <div
          style={{
            marginTop: "0",
            textAlign: "center",
            background: "#2b2b2b",
            padding: "1rem",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h2>{userData.name}</h2>
          <p>
            <strong>Missão:</strong> {userData.motto}
          </p>
          <p>
            <strong>Último acesso:</strong>{" "}
            {new Date(userData.lastAccessTime).toLocaleString()}
          </p>
          <p>
            <strong>Registrado em:</strong>{" "}
            {new Date(userData.memberSince).toLocaleDateString()}
          </p>
        </div>
      )}

      {skillData && (
        <div
          style={{
            marginTop: "1rem",
            textAlign: "center",
            background: "#333",
            padding: "1rem",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h3>Habilidade de Pesca</h3>
          <p>
            <strong style={{ color: "green" }}>Nível:</strong>{" "}
            <span style={{ color: "green" }}>{skillData.level}</span>
          </p>
          <p>
            <strong style={{ color: "yellow" }}>Experiência:</strong>{" "}
            <span style={{ color: "yellow" }}>{skillData.experience}</span>
          </p>
        </div>
      )}

      {searchHistory.length > 0 && (
        <><section
          style={{
            marginTop: "2rem",
            maxWidth: "600px",
            width: "100%",
            color: "#f0f0f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <h2>Ranking Local</h2>
            <div>
              <button
                onClick={clearHistory}
                style={{
                  marginRight: "0.5rem",
                  padding: "0.4rem 0.8rem",
                  cursor: "pointer",
                  backgroundColor: "#a00",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                title="Limpar ranking local"
              >
                Limpar Ranking
              </button>

              <button
                onClick={exportCSV}
                style={{
                  padding: "0.4rem 0.8rem",
                  cursor: "pointer",
                  backgroundColor: "#0066cc",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                title="Exportar ranking CSV"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#222",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{ cursor: "default", padding: "0.5rem 0.75rem" }}
                >
                  Posição
                </th>
                <th
                  onClick={() => toggleSort("name")}
                  style={{
                    cursor: "pointer",
                    padding: "0.5rem 0.75rem",
                    userSelect: "none",
                  }}
                  title="Ordenar por Nome"
                >
                  Nome{" "}
                  {sortKey === "name" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => toggleSort("level")}
                  style={{
                    cursor: "pointer",
                    padding: "0.5rem 0.75rem",
                    userSelect: "none",
                    color: "green",
                  }}
                  title="Ordenar por Nível"
                >
                  Nível{" "}
                  {sortKey === "level" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => toggleSort("experience")}
                  style={{
                    cursor: "pointer",
                    padding: "0.5rem 0.75rem",
                    userSelect: "none",
                    color: "goldenrod",
                  }}
                  title="Ordenar por Experiência"
                >
                  EXP{" "}
                  {sortKey === "experience" && (sortAsc ? "▲" : "▼")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((entry, idx) => (
                <tr
                  key={entry.name}
                  style={{
                    borderBottom: "1px solid #444",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setUsername(entry.name);
                    handleSearch();
                  } }
                  title={`Clique para consultar ${entry.name}`}
                >
                  <td
                    style={{
                      textAlign: "center",
                      padding: "0.5rem 0.75rem",
                      width: "60px",
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{entry.name}</td>
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      color: "green",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {entry.level}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      color: "goldenrod",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {entry.experience}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section></>
      )}
    </main>
  );
}
