import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await api.post("/auth/login-admin", { email, senha });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("nome", res.data.usuario.nome);
      localStorage.setItem("id_usuario", res.data.usuario.id);

      navigate("/pacientes");
    } catch {
      setErro("Email ou senha inválidos");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="https://mayayamamoto.com.br/wp-content/uploads/2018/11/Maya-logo_72_Positivo.png"
            alt="Maya"
            style={{ height: "120px", marginBottom: "12px" }}
          />
          <p>Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Senha</label>

            <div className="input-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <span
                className="input-icon"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {erro && <p className="erro-msg">{erro}</p>}

          <button
            type="submit"
            className="btn-primario login-btn"
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
