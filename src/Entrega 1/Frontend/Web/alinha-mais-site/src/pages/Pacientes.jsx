import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FaEyeSlash, FaEye } from "react-icons/fa";

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

  function formatarCPF(cpf) {
    if (!cpf) return "";
    cpf = cpf.replace(/\D/g, "");

    return cpf
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  function formatarTelefone(tel) {
    if (!tel) return "";
    tel = tel.replace(/\D/g, "");

    if (tel.length === 11) {
      return tel.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (tel.length === 10) {
      return tel.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return tel;
  }

  const filtrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf?.includes(busca),
  );

  const [display, setDisplay] = useState(false); // Usando no Pop-up tambem

  //Para Pop-up - Criado os estados
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function validarSenha() {
    try {
      await api.post("/auth/login-admin", { email, senha });

      setDisplay(true);
      setShowModal(false);
      setEmail("");
      setSenha("");
    } catch {
      alert("E-mail ou senha incorretos");
    }
  }

  //Pop Up Style
  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      background: "#fff",
      padding: "20px",
      borderRadius: "8px",
      minWidth: "300px",
    },
  };

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
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#e8735a",
          }}
        >
          Pacientes
        </h2>
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
                  <th>
                    Código
                    <button
                      className="eye-icon"
                      onClick={() => {
                        if (display) {
                          setDisplay(false); // já tá mostrando → esconde direto
                        } else {
                          setShowModal(true); // não tá mostrando → pede login
                        }
                      }}
                    >
                      {display ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                    </button>
                  </th>,
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
                  <td style={{ color: "var(--texto-claro)" }}>
                    {formatarCPF(p.cpf)}
                  </td>
                  <td style={{ color: "var(--texto-claro)" }}>
                    {formatarTelefone(p.telefone)}
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
                      {display ? p.id_login : "••••••"}
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

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Confirmar identidade</h3>

            <input
              type="text"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 10, width: "100%" }}
            />

            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{ marginBottom: 10, width: "100%" }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={validarSenha}>Confirmar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
