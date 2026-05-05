import React, { useState, useEffect, useRef } from "react";
import api from "../api/api";

export default function Lembretes() {
  const [lembretes, setLembretes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fotoRemovida, setFotoRemovida] = useState(false);
  const fileRef = useRef();
  const id_admin = localStorage.getItem("id_usuario");

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    intervalo_minutos: 60,
    horario_inicio: "08:00",
    horario_fim: "18:00",
    pacientes: [],
    foto: null,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [lemRes, pacRes] = await Promise.all([
        api.get("/lembretes"),
        api.get("/pacientes"),
      ]);
      setLembretes(lemRes.data);
      setPacientes(pacRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFoto(e) {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, foto: file });
      setPreview(URL.createObjectURL(file));
    }
  }

  function togglePaciente(id) {
    setForm((prev) => ({
      ...prev,
      pacientes: prev.pacientes.includes(id)
        ? prev.pacientes.filter((p) => p !== id)
        : [...prev.pacientes, id],
    }));
  }

  function abrirNovo() {
    setEditando(null);
    setForm({
      titulo: "",
      descricao: "",
      intervalo_minutos: 60,
      horario_inicio: "08:00",
      horario_fim: "18:00",
      pacientes: [],
      foto: null,
    });
    setPreview(null);
    setMostrarForm(true);
  }

  async function abrirEdicao(l) {
    // Busca pacientes já vinculados ao lembrete
    const res = await api.get(`/lembretes/${l.id_lembrete}`);
    const vinculados = res.data.pacientes?.map((p) => p.id_usuario) || [];

    setEditando(l.id_lembrete);
    setForm({
      titulo: l.titulo,
      descricao: l.descricao || "",
      intervalo_minutos: l.intervalo_minutos || 60,
      horario_inicio: l.horario_inicio || "08:00",
      horario_fim: l.horario_fim || "18:00",
      pacientes: vinculados,
      foto: null,
    });
    setPreview(l.foto ? `${process.env.REACT_APP_API_URL}${l.foto}` : null);
    setMostrarForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editando) {
        // Se tiver nova foto, envia como multipart
        if (form.foto) {
          const data = new FormData();
          data.append("foto", form.foto);
          data.append("titulo", form.titulo);
          data.append("descricao", form.descricao);
          data.append("intervalo_minutos", form.intervalo_minutos);
          data.append("horario_inicio", form.horario_inicio);
          data.append("horario_fim", form.horario_fim);
          data.append("pacientes", JSON.stringify(form.pacientes));
          await api.put(`/lembretes/${editando}/upload`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.put(`/lembretes/${editando}`, {
            titulo: form.titulo,
            descricao: form.descricao,
            intervalo_minutos: form.intervalo_minutos,
            horario_inicio: form.horario_inicio,
            horario_fim: form.horario_fim,
            pacientes: form.pacientes,
            remover_foto: fotoRemovida,
          });
        }
      } else {
        if (form.foto) {
          const data = new FormData();
          data.append("foto", form.foto);
          data.append("titulo", form.titulo);
          data.append("descricao", form.descricao);
          data.append("intervalo_minutos", form.intervalo_minutos);
          data.append("horario_inicio", form.horario_inicio);
          data.append("horario_fim", form.horario_fim);
          data.append("id_admin", id_admin);
          data.append("pacientes", JSON.stringify(form.pacientes));
          await api.post("/lembretes/upload", data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.post("/lembretes", {
            titulo: form.titulo,
            descricao: form.descricao,
            intervalo_minutos: form.intervalo_minutos,
            horario_inicio: form.horario_inicio,
            horario_fim: form.horario_fim,
            id_admin,
            pacientes: form.pacientes,
          });
        }
      }
      setMostrarForm(false);
      carregarDados();
      setFotoRemovida(false);
    } catch (err) {
      alert("Erro ao salvar lembrete");
    }
  }

  async function deletar(id) {
    if (!window.confirm("Deletar este lembrete?")) return;
    try {
      await api.delete(`/lembretes/${id}`);
      setLembretes(lembretes.filter((l) => l.id_lembrete !== id));
    } catch (err) {
      alert("Erro ao deletar");
    }
  }

  function formatarIntervalo(minutos) {
    if (!minutos) return "—";
    if (minutos < 60) return `${minutos} min`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

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
        <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Lembretes</h2>
        <button className="btn-primario" onClick={abrirNovo}>
          + Novo Lembrete
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3>{editando ? "Editar Lembrete" : "Novo Lembrete"}</h3>
            <button
              className="btn-ghost"
              style={{ padding: "6px 12px" }}
              onClick={() => setMostrarForm(false)}
            >
              ✕ Fechar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div className="campo" style={{ gridColumn: "1 / -1" }}>
                <label>Título *</label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="campo" style={{ gridColumn: "1 / -1" }}>
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="campo">
                <label>Intervalo (minutos)</label>
                <input
                  name="intervalo_minutos"
                  type="number"
                  min="1"
                  value={form.intervalo_minutos}
                  onChange={handleChange}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--texto-claro)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Ex: 60 = notificação a cada 1 hora
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="campo">
                  <label>Horário Início</label>
                  <input
                    name="horario_inicio"
                    type="time"
                    value={form.horario_inicio}
                    onChange={handleChange}
                  />
                </div>
                <div className="campo">
                  <label>Horário Fim</label>
                  <input
                    name="horario_fim"
                    type="time"
                    value={form.horario_fim}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Foto */}
              <div className="campo" style={{ gridColumn: "1 / -1" }}>
                <label>
                  {editando ? "Trocar Foto (opcional)" : "Foto (opcional)"}
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: "8px 16px", whiteSpace: "nowrap" }}
                    onClick={() => fileRef.current.click()}
                  >
                    {preview ? "Trocar Foto" : "Selecionar Foto"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFoto}
                  />
                  {preview ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <img
                        src={preview}
                        alt="preview"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <button
                        type="button"
                        className="btn-perigo"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => {
                          setPreview(null);
                          setForm({ ...form, foto: null });
                          setFotoRemovida(true);
                          fileRef.current.value = "";
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <span
                      style={{ fontSize: "13px", color: "var(--texto-claro)" }}
                    >
                      Nenhuma foto selecionada
                    </span>
                  )}
                </div>
              </div>

              {/* Pacientes */}
              <div className="campo" style={{ gridColumn: "1 / -1" }}>
                <label>
                  Pacientes que receberão este lembrete
                  {form.pacientes.length > 0 && (
                    <span
                      style={{
                        marginLeft: "8px",
                        color: "var(--primaria)",
                        fontWeight: 700,
                      }}
                    >
                      ({form.pacientes.length} selecionado
                      {form.pacientes.length > 1 ? "s" : ""})
                    </span>
                  )}
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  {pacientes.map((p) => (
                    <label
                      key={p.id_usuario}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        background: form.pacientes.includes(p.id_usuario)
                          ? "#e6f7f8"
                          : "var(--fundo)",
                        border: form.pacientes.includes(p.id_usuario)
                          ? "1.5px solid var(--primaria)"
                          : "1px solid var(--borda)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "normal",
                        color: "var(--texto)",
                        fontSize: "14px",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.pacientes.includes(p.id_usuario)}
                        onChange={() => togglePaciente(p.id_usuario)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                      {p.nome}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button type="submit" className="btn-primario">
                {editando ? "Salvar Alterações" : "Criar Lembrete"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setMostrarForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <p style={{ color: "var(--texto-claro)" }}>Carregando...</p>
      ) : lembretes.length === 0 ? (
        <p style={{ color: "var(--texto-claro)" }}>
          Nenhum lembrete cadastrado.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {lembretes.map((l) => (
            <div
              key={l.id_lembrete}
              className="card"
              style={{ padding: "0", overflow: "hidden" }}
            >
              {l.foto ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}${l.foto}`}
                  alt={l.titulo}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    background: "linear-gradient(135deg, #e6f7f8, #b2ebf2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                  }}
                >
                  🔔
                </div>
              )}

              <div style={{ padding: "16px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  {l.titulo}
                </h3>

                {l.descricao && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--texto-claro)",
                      marginBottom: "12px",
                      lineHeight: "1.4",
                    }}
                  >
                    {l.descricao}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      background: "#e6f7f8",
                      color: "var(--primaria)",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    ⏱ {formatarIntervalo(l.intervalo_minutos)}
                  </span>
                  {l.horario_inicio && (
                    <span
                      style={{
                        background: "var(--fundo)",
                        color: "var(--texto-claro)",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                      }}
                    >
                      🕐 {l.horario_inicio} — {l.horario_fim}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, padding: "8px", fontSize: "13px" }}
                    onClick={() => abrirEdicao(l)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-perigo"
                    style={{ flex: 1, padding: "8px", fontSize: "13px" }}
                    onClick={() => deletar(l.id_lembrete)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
