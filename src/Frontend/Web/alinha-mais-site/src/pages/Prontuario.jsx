import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Prontuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const id_admin = localStorage.getItem("id_usuario");

  const [paciente, setPaciente] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [novaSessao, setNovaSessao] = useState("");
  const [novaConsulta, setNovaConsulta] = useState({
    data_consulta: "",
    observacoes: "",
  });
  const [abaAtiva, setAbaAtiva] = useState("sessoes");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarDados() {
    try {
      const [pacRes, sesRes, conRes] = await Promise.all([
        api.get(`/pacientes/${id}`),
        api.get(`/sessoes/paciente/${id}`),
        api.get(`/consultas/paciente/${id}`),
      ]);
      setPaciente(pacRes.data);
      setSessoes(sesRes.data);
      setConsultas(conRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  async function adicionarSessao() {
    if (!novaSessao.trim()) return;
    try {
      await api.post("/sessoes", {
        anotacoes: novaSessao,
        id_paciente: id,
        id_admin,
      });
      setNovaSessao("");
      const res = await api.get(`/sessoes/paciente/${id}`);
      setSessoes(res.data);
    } catch (err) {
      alert("Erro ao registrar sessão");
    }
  }

  async function adicionarConsulta() {
    if (!novaConsulta.data_consulta) return;
    try {
      await api.post("/consultas", {
        ...novaConsulta,
        id_paciente: id,
        id_admin,
      });
      setNovaConsulta({ data_consulta: "", observacoes: "" });
      const res = await api.get(`/consultas/paciente/${id}`);
      setConsultas(res.data);
    } catch (err) {
      alert("Erro ao agendar consulta");
    }
  }

  async function atualizarStatusConsulta(id_consulta, status) {
    try {
      await api.put(`/consultas/${id_consulta}`, { status });
      const res = await api.get(`/consultas/paciente/${id}`);
      setConsultas(res.data);
    } catch (err) {
      alert("Erro ao atualizar consulta");
    }
  }

  async function deletarSessao(id_sessao) {
    if (!window.confirm("Deletar esta sessão?")) return;
    try {
      await api.delete(`/sessoes/${id_sessao}`);
      setSessoes(sessoes.filter((s) => s.id_sessao !== id_sessao));
    } catch (err) {
      alert("Erro ao deletar sessão");
    }
  }

  if (carregando) return <p>Carregando...</p>;
  if (!paciente) return <p>Paciente não encontrado</p>;

  const estiloAba = (aba) => ({
    padding: "10px 24px",
    background: abaAtiva === aba ? "var(--primaria)" : "transparent",
    color: abaAtiva === aba ? "white" : "var(--texto-claro)",
    borderRadius: "8px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          className="btn-ghost"
          style={{ padding: "8px 12px" }}
          onClick={() => navigate("/pacientes")}
        >
          ← Voltar
        </button>
        <h2 style={{ fontSize: "22px", fontWeight: 700 }}>
          Prontuário — {paciente.nome}
        </h2>
      </div>

      {/* Info do paciente */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {[
            { label: "CPF", valor: paciente.cpf },
            { label: "Telefone", valor: paciente.telefone },
            { label: "Código de Acesso", valor: paciente.id_login },
            { label: "Consultas Pagas", valor: paciente.consultas_pagas },
            { label: "Status", valor: paciente.status_tratamento },
            {
              label: "Nascimento",
              valor: paciente.data_nascimento?.split("T")[0],
            },
          ].map(({ label, valor }) => (
            <div key={label}>
              <p style={{ fontSize: "12px", color: "var(--texto-claro)" }}>
                {label}
              </p>
              <p style={{ fontWeight: 600 }}>{valor || "—"}</p>
            </div>
          ))}
        </div>
        {paciente.observacoes && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "var(--fundo)",
              borderRadius: "8px",
            }}
          >
            <p style={{ fontSize: "12px", color: "var(--texto-claro)" }}>
              Observações iniciais
            </p>
            <p style={{ marginTop: "4px" }}>{paciente.observacoes}</p>
          </div>
        )}
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          style={estiloAba("sessoes")}
          onClick={() => setAbaAtiva("sessoes")}
        >
          Sessões ({sessoes.length})
        </button>
        <button
          style={estiloAba("consultas")}
          onClick={() => setAbaAtiva("consultas")}
        >
          Consultas ({consultas.length})
        </button>
      </div>

      {/* Aba Sessões */}
      {abaAtiva === "sessoes" && (
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Nova Anotação de Sessão</h3>
          <textarea
            value={novaSessao}
            onChange={(e) => setNovaSessao(e.target.value)}
            placeholder="Descreva as observações da sessão..."
            rows={4}
            style={{ marginBottom: "12px" }}
          />
          <button className="btn-primario" onClick={adicionarSessao}>
            Registrar Sessão
          </button>

          <div style={{ marginTop: "24px" }}>
            {sessoes.length === 0 ? (
              <p style={{ color: "var(--texto-claro)" }}>
                Nenhuma sessão registrada.
              </p>
            ) : (
              sessoes.map((s) => (
                <div
                  key={s.id_sessao}
                  style={{
                    borderLeft: "4px solid var(--primaria)",
                    padding: "12px 16px",
                    marginBottom: "12px",
                    background: "var(--fundo)",
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{ fontSize: "13px", color: "var(--texto-claro)" }}
                    >
                      {new Date(s.data_sessao).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      className="btn-perigo"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => deletarSessao(s.id_sessao)}
                    >
                      Deletar
                    </button>
                  </div>
                  <p>{s.anotacoes}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Aba Consultas */}
      {abaAtiva === "consultas" && (
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>Agendar Consulta</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "16px",
            }}
          >
            <div className="campo">
              <label>Data e Hora</label>
              <input
                type="datetime-local"
                value={novaConsulta.data_consulta}
                onChange={(e) =>
                  setNovaConsulta({
                    ...novaConsulta,
                    data_consulta: e.target.value,
                  })
                }
              />
            </div>
            <div className="campo">
              <label>Observações</label>
              <input
                value={novaConsulta.observacoes}
                onChange={(e) =>
                  setNovaConsulta({
                    ...novaConsulta,
                    observacoes: e.target.value,
                  })
                }
                placeholder="Observações da consulta..."
              />
            </div>
          </div>
          <button className="btn-primario" onClick={adicionarConsulta}>
            Agendar
          </button>

          <div style={{ marginTop: "24px" }}>
            {consultas.length === 0 ? (
              <p style={{ color: "var(--texto-claro)" }}>
                Nenhuma consulta agendada.
              </p>
            ) : (
              consultas.map((c) => (
                <div
                  key={c.id_consulta}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    marginBottom: "8px",
                    background: "var(--fundo)",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600 }}>
                      {new Date(c.data_consulta).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {c.observacoes && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--texto-claro)",
                        }}
                      >
                        {c.observacoes}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className={
                        c.status === "agendada"
                          ? "badge-ativo"
                          : "badge-inativo"
                      }
                    >
                      {c.status}
                    </span>
                    {c.status === "agendada" && (
                      <button
                        className="btn-secundario"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() =>
                          atualizarStatusConsulta(c.id_consulta, "realizada")
                        }
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
