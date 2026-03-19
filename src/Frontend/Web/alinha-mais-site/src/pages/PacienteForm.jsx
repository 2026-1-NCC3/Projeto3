import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

// Componente do Modal
function ModalCodigoAcesso({ idLogin, nome, onFechar }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "420px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#e6f7f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <span style={{ fontSize: "32px" }}>✓</span>
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Paciente Cadastrado!
        </h2>

        <p style={{ color: "var(--texto-claro)", marginBottom: "24px" }}>
          Informe o código abaixo para <strong>{nome}</strong> acessar o app:
        </p>

        <div
          style={{
            background: "var(--fundo)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--texto-claro)",
              marginBottom: "8px",
            }}
          >
            Código de Acesso
          </p>
          <p
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "8px",
              color: "var(--primaria)",
              fontFamily: "monospace",
            }}
          >
            {idLogin}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "var(--texto-claro)",
              marginTop: "8px",
            }}
          >
            CPF + este código para entrar no app
          </p>
        </div>

        <button
          className="btn-primario"
          onClick={onFechar}
          style={{ width: "100%", padding: "14px", fontSize: "16px" }}
        >
          OK, entendido!
        </button>
      </div>
    </div>
  );
}

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
  const [modal, setModal] = useState({ visivel: false, idLogin: "", nome: "" });
  const [erro, setErro] = useState("");
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
    setCarregando(true);

    try {
      if (editando) {
        await api.put(`/pacientes/${id}`, form);
        navigate("/pacientes");
      } else {
        const res = await api.post("/pacientes", form);
        // Abre o modal com o código gerado
        setModal({
          visivel: true,
          idLogin: res.data.id_login,
          nome: form.nome,
        });
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
      {/* Modal de código de acesso */}
      {modal.visivel && (
        <ModalCodigoAcesso
          idLogin={modal.idLogin}
          nome={modal.nome}
          onFechar={() => navigate("/pacientes")}
        />
      )}

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
