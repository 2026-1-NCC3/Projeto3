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

function mascaraTelefone(e, setForm, form){
  let digitos = e.target.value.replace(/\D/g, "").slice(0,11);

  let mascarado = digitos;
  if (digitos.length > 6){
    mascarado = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  } else if (digitos.length > 2) {
     mascarado = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  } else if (digitos.length > 0) {
    mascarado = `(${digitos})`;
  }
  setForm({...form, telefone: mascarado});
}

function mascaraCPF(e, setForm, form) {
  let digitos = e.target.value.replace(/\D/g, "").slice(0, 11);

  let mascarado = digitos;
  if (digitos.length > 9) {
    mascarado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  } else if (digitos.length > 6) {
    mascarado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  } else if (digitos.length > 3) {
    mascarado = `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  }

  setForm({ ...form, cpf: mascarado });
}

export function validarCPF(cpf) {
  const digitos = cpf.replace(/\D/g, "");

  if (digitos.length !== 11) return false;
  // não aceita sequências repetidas como 111.111.111-11
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  // valida o 1 dígito 
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(digitos[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digitos[9])) return false;

  // valida 2 dígito 
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(digitos[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(digitos[10]);
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
    status_tratamento: "Ativo",
  });
  const [modal, setModal] = useState({ visivel: false, idLogin: "", nome: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const hoje = new Date().toISOString().split("T")[0];

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
        status_tratamento: p.status_tratamento || "Ativo",
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

    if (!validarCPF(form.cpf)){
      setErro("CPF inválido. Verifique os dígitos e tente novamente.");
      return;
    }
    
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
                onChange={(e) => mascaraCPF(e, setForm, form)}
                placeholder="000.000.000-00"
                disabled={editando}
                required
              />
            </div>

            <div className="campo">
              <label>Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={(e) => mascaraTelefone(e, setForm, form)}
                placeholder="(11)99999-9999"
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
                max={hoje}
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

            <div className="campo">
              <label>Status do Tratamento</label>
              <select
                name="status_tratamento"
                value={form.status_tratamento}
                onChange={handleChange}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
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
