import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    buscarPacientes();
  }, []);

  async function buscarPacientes() {
    try {
      const res = await api.get("/pacientes");
      setPacientes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function deletarPaciente(id, nome) {
    if (!window.confirm(`Deseja deletar o paciente ${nome}?`)) return;
    try {
      await api.delete(`/pacientes/${id}`);
      setPacientes(pacientes.filter((p) => p.id_usuario !== id));
    } catch (err) {
      alert("Erro ao deletar paciente");
    }
  }

  const filtrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf?.includes(busca),
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Pacientes</h2>
        <button
          className="btn-primario"
          onClick={() => navigate("/pacientes/novo")}
        >
          + Novo Paciente
        </button>
      </div>

      <div className="card">
        <input
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ marginBottom: "16px", maxWidth: "360px" }}
        />

        {carregando ? (
          <p style={{ color: "var(--texto-claro)" }}>Carregando...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: "var(--texto-claro)" }}>
            Nenhum paciente encontrado.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--borda)" }}>
                {[
                  "Nome",
                  "CPF",
                  "Telefone",
                  "Código",
                  "Status",
                  "Consultas Pagas",
                  "Ações",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      fontSize: "13px",
                      color: "var(--texto-claro)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr
                  key={p.id_usuario}
                  style={{ borderBottom: "1px solid var(--borda)" }}
                >
                  <td style={{ padding: "12px 8px", fontWeight: 600 }}>
                    {p.nome}
                  </td>
                  <td
                    style={{ padding: "12px 8px", color: "var(--texto-claro)" }}
                  >
                    {p.cpf}
                  </td>
                  <td
                    style={{ padding: "12px 8px", color: "var(--texto-claro)" }}
                  >
                    {p.telefone}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "var(--primaria)",
                        letterSpacing: "3px",
                      }}
                    >
                      {p.id_login}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span
                      className={
                        p.status_tratamento === "Ativo"
                          ? "badge-ativo"
                          : "badge-inativo"
                      }
                    >
                      {p.status_tratamento}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    {p.consultas_pagas}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn-primario"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() =>
                          navigate(`/pacientes/${p.id_usuario}/prontuario`)
                        }
                      >
                        Prontuário
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() =>
                          navigate(`/pacientes/editar/${p.id_usuario}`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="btn-perigo"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => deletarPaciente(p.id_usuario, p.nome)}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
