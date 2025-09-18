const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');


registerLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
});

//BACK
const API_URL = "http://localhost:8080/api/clientes";

// LOGIN 
document.querySelector('.form-box.login form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const senha = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const cliente = await response.json();
            alert("Login realizado com sucesso!");

            // Salva o ID do cliente no localStorage 
            localStorage.setItem("userId", cliente.id);
            localStorage.setItem("userName", cliente.nome);

            // Redireciona para página inicial ou dashboard
            window.location.href = "/Pages/Home.html";
        } else {
            const msg = await response.text();
            alert("Falha no login: " + msg);
        }
    } catch (err) {
        console.error("Erro ao fazer login:", err);
        alert("Erro ao conectar com o servidor.");
    }
});

// CADASTRO 
document.querySelector('.form-box.register form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Coleta os dados do formulário
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const novoCliente = await response.json();
            alert("Cadastro realizado com sucesso! Agora você pode fazer login.");

            wrapper.classList.remove("active");
        } else {
            const msg = await response.text();
            alert("Erro ao cadastrar: " + msg);
        }
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        alert("Erro ao conectar com o servidor.");
    }
});