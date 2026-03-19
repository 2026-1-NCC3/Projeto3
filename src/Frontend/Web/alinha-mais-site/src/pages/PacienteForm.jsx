import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function PacienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = !!id;

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    observacoes: "",
    consultas_pagas: 0,
  });
  const [idLoginGerado, setIdLoginGerado] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (editando) carregarPaciente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarPaciente() {
    try {
      const res = await api.get(`/pacientes/${id}`);
      const p = res.data;
      setForm({
        nome: p.nome || "",
        email: p.email || "",
        cpf: p.cpf || "",
        telefone: p.telefone || "",
        data_nascimento: p.data_nascimento?.split("T")[0] || "",
        observacoes: p.observacoes || "",
        consultas_pagas: p.consultas_pagas || 0,
      });
    } catch (err) {
      setErro("Erro ao carregar paciente");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      if (editando) {
        await api.put(`/pacientes/${id}`, form);
        setSucesso("Paciente atualizado com sucesso!");
      } else {
        const res = await api.post("/pacientes", form);
        setIdLoginGerado(res.data.id_login);
        setSucesso(
          `Paciente cadastrado! Código de acesso: ${res.data.id_login}`,
        );
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setErro("CPF já cadastrado!");
      } else {
        setErro("Erro ao salvar paciente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ maxWidth: "640px" }}>
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
          {editando ? "Editar Paciente" : "Novo Paciente"}
        </h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="campo" style={{ gridColumn: "1 / -1" }}>
              <label>Nome completo *</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="campo">
              <label>CPF *</label>
              <input
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="00000000000"
                disabled={editando}
                required
              />
            </div>

            <div className="campo">
              <label>Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="11999999999"
              />
            </div>

            <div className="campo">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="campo">
              <label>Data de Nascimento</label>
              <input
                name="data_nascimento"
                type="date"
                value={form.data_nascimento}
                onChange={handleChange}
              />
            </div>

            <div className="campo">
              <label>Consultas Pagas</label>
              <input
                name="consultas_pagas"
                type="number"
                min="0"
                value={form.consultas_pagas}
                onChange={handleChange}
              />
            </div>

            <div className="campo" style={{ gridColumn: "1 / -1" }}>
              <label>Queixa / Observações Iniciais</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          {erro && <p className="erro-msg">{erro}</p>}

          {sucesso && (
            <div
              style={{
                background: "#f0fff4",
                border: "1px solid var(--sucesso)",
                borderRadius: "8px",
                padding: "16px",
                marginTop: "8px",
              }}
            >
              <p className="sucesso-msg" style={{ margin: 0 }}>
                {sucesso}
              </p>
              {idLoginGerado && (
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "13px", color: "var(--texto-claro)" }}>
                    Informe ao paciente para acessar o app:
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--primaria)",
                      letterSpacing: "4px",
                    }}
                  >
                    {idLoginGerado}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              type="submit"
              className="btn-primario"
              disabled={carregando}
            >
              {carregando
                ? "Salvando..."
                : editando
                  ? "Salvar Alterações"
                  : "Cadastrar Paciente"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate("/pacientes")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
