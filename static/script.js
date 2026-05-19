import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Lê o firebaseConfig que o Flask injetou no HTML
const config = window.firebaseConfig;

//inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para registrar o voto
let opcaoSelecionada = null;

// Apenas pinta a opção escolhida na tela
window.selecionarOpcao = function(opcao, elemento) {
    opcaoSelecionada = opcao;
    
    // Tira a cor das outras e coloca na clicada
    document.querySelectorAll('.opcao-voto').forEach(el => el.classList.remove('selecionada'));
    elemento.classList.add('selecionada');
    elemento.querySelector('input').checked = true;
}

// envia pro Firebase
window.confirmarVoto = async function() {
    if (!opcaoSelecionada) {
        alert("Por favor, selecione uma linguagem antes de votar!");
        return;
    }

    try {
        // Envia para a nuvem
        await addDoc(collection(db, "votos"), {
            opcao: opcaoSelecionada,
            timestamp: Date.now()
        });
        
        alert(`Voto em ${opcaoSelecionada} registrado com sucesso!`);
        
    } catch (e) {
        console.error("Erro ao registrar voto: ", e);
        alert("Ocorreu um erro ao votar. Verifique o console.");
    }
}

//Listener de Tempo Real
onSnapshot(collection(db, "votos"), (snapshot) => {
    //Inicializa os contadores
    const contagem = { 'Python': 0, 'JavaScript': 0, 'Java': 0, 'C++': 0 };
    let totalVotos = 0;

    //Conta os votos que vieram da nuvem
    snapshot.forEach((doc) => {
        const voto = doc.data().opcao;
        if (contagem[voto] !== undefined) {
            contagem[voto]++;
            totalVotos++;
        }
    });

    //Atualiza as barras de progresso na tela
    atualizarGrafico(contagem, totalVotos);
});

//Atualiza o DOM usando o HTML das barras
function atualizarGrafico(contagem, total) {
    const container = document.getElementById('barras-container');
    container.innerHTML = '';

    if (total === 0) {
        container.innerHTML = '<p style="color: var(--gray-mid);">Nenhum voto registrado ainda.</p>';
        return;
    }

    //Identificar a opção mais votada para dar "destaque"
    let maxVotos = -1;
    for (const votos of Object.values(contagem)) {
        if (votos > maxVotos) maxVotos = votos;
    }

    //Renderiza cada barra
    for (const [opcao, votos] of Object.entries(contagem)) {
        const porcentagem = Math.round((votos / total) * 100) || 0;
        const destaqueClass = (votos === maxVotos && votos > 0) ? 'destaque' : '';
        
        const htmlBarra = `
            <div class="barra-resultado">
                <div class="barra-resultado-label">
                    <strong>${opcao}</strong>
                    <span>${votos} votos (${porcentagem}%)</span>
                </div>
                <div class="barra-resultado-track">
                    <div class="barra-resultado-fill ${destaqueClass}" style="width: ${porcentagem}%"></div>
                </div>
            </div>
        `;
        container.innerHTML += htmlBarra;
    }
}
