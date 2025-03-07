import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { get, getDatabase, ref, push, set, remove, update, child } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

import { firebaseConfig } from './../firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Os meses são indexados a partir de 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function calculateAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
  
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getUTCMonth() - birthDate.getUTCMonth();
    let days = today.getUTCDate() - birthDate.getUTCDate();
  
    // Ajusta se o mês ainda não chegou no ano atual
    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }
  
    // Ajusta se o dia ainda não chegou no mês atual
    if (days < 0) {
      months--;
      const lastMonth = (today.getUTCMonth() - 1 + 12) % 12;
      const daysInLastMonth = new Date(today.getFullYear(), lastMonth + 1, 0).getUTCDate();
      days += daysInLastMonth;
    }
  
    const totalDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
  
    return { years, totalDays };
  }
  
//Fechar Modais
document.getElementById('black-background').addEventListener('click', (e)=>{
  if(e.target.id == 'black-background' || e.target.id == 'close-modal'){
    document.getElementById('black-background').style.display = 'none'
    document.getElementById('avaliacao-competencias-funcionario-modal').style.display = 'none'
  }
})
  
  
//Painel de Dados do Funcionáro

    //Exibir dados do funcionário no painel
    const funcionarioRef = ref(database, 'testeEmpresa/funcionarios/-OKbJfv4eLzzz95tNiuq')

    get(funcionarioRef).then((snapshot)=>{
        const data = snapshot.val()

        if(data){
            //Preenche os dados superiores
            document.getElementById('foto-funcionario-painel').style.backgroundImage = `url(${data.foto})`
            document.getElementById('nome-funcionario-painel-text').innerText = data.nomeCompleto
            if(data.cargos){
                Object.values(data.cargos).forEach((cargo)=>{
                  document.getElementById('cargo-painel-area').innerHTML += `<div class="cargo-box">${cargo}</div>`
                    
                })
            }

            if(data.funcoes){
              Object.values(data.funcoes).forEach((funcao)=>{
                document.getElementById('funcoes-painel-area').innerHTML += `<div class="funcao-box">${funcao}</div>`
                  
              })
            }else{
              document.getElementById('funcoes-painel-area').innerHTML = '--'
            }

            if(data.departamento){
              const departamentoRef = ref(database, 'testeEmpresa/departamentos/' + data.departamento)
              get(departamentoRef).then((snapshot)=>{
                const data = snapshot.val()
                document.getElementById('departamento-funcionario-painel-text').innerText = data.nome
              })
            }
            
            document.getElementById('setor-funcionario-painel-text').innerText = data.setor

            if(data.empresas){
              Object.values(data.empresas).forEach((empresa)=>{
                console.log(empresa)
                document.getElementById('empresa-painel-area').innerHTML += `<div class="empresa-box">${empresa}</div>`
              })
            }

            //Preenche o box inferior
            document.getElementById('nome-funcionario-text').innerText = data.nomeCompleto
            document.getElementById('data-nascimento-funcionario-text').innerText = formatDate(data.dataNascimento)
            document.getElementById('data-contratacao-funcionario-text').innerText = formatDate(data.dataAdmissao)
            document.getElementById('idade-funcionario-text').innerText = calculateAge(data.dataNascimento).years
            document.getElementById('tempo-contratacao-funcionario-text').innerText = calculateAge(data.dataAdmissao).years <= 1  ? calculateAge(data.dataAdmissao).years + ' ano' : calculateAge(data.dataAdmissao).years + ' anos'
            document.getElementById('salario-funcionario-text').innerHTML = `R$ ${data.salario} <span class="modalidade-salario">${data.modalidadeSalario == 'mes' ? 'p/Mês' : 'p/Hora'}</span>`
        }
    })

    //Carrega gráfico com as competências (Radar)
    function gerarGraficoRadar(labels, valores) {
      const ctx = document.getElementById('graficoRadar').getContext('2d');
      new Chart(ctx, {
          type: 'radar',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Avaliação de Competências',
                  data: valores,
                  borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderWidth: 2
              }]
          },
          options: {
              responsive: true,
              scales: {
                  r: {
                      beginAtZero: true,
                      suggestedMin: 0,
                      suggestedMax: 100
                  }
              }
          }
      });
  }

  async function carregarCompetencias() {
    const competenciasRef = ref(database, 'testeEmpresa/competencias');
    const funcionarioRef = ref(database, 'testeEmpresa/funcionarios/-OKbJfv4eLzzz95tNiuq');

    try {
        // Buscar as competências
        const competenciasSnapshot = await get(competenciasRef);
        if (!competenciasSnapshot.exists()) return;
        const competencias = competenciasSnapshot.val();

        // Buscar os dados do funcionário
        const funcionarioSnapshot = await get(funcionarioRef);
        if (!funcionarioSnapshot.exists()) return;
        const funcionario = funcionarioSnapshot.val();

        // Labels e valores das competências
        let labels = [];
        let valores = [];

        Object.values(competencias).forEach(comp => {
            labels.push(comp.nome);
            
            // Pegando o valor da competência do funcionário ou atribuindo 0
            const valor = funcionario.valorCompetencias?.[comp.nome] ?? 0;
            valores.push(valor);
        });

        // Gerar gráficos com os dados do funcionário
        gerarGraficoRadar(labels, valores);
        gerarGraficoBarras(labels, valores);
    } catch (error) {
        console.error("Erro ao buscar dados do Firebase:", error);
    }
  }

  carregarCompetencias();

  //Gráfico de Barras
  function gerarGraficoBarras(labels, valores) {
    const ctx = document.getElementById('graficoBarras').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avaliação de Competências',
                data: valores,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Define que o gráfico será horizontal
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

  //Painel de Avaliação do Funcionário
  
  const competenciasRef = ref(database, 'testeEmpresa/competencias');
  get(competenciasRef).then((snapshot)=>{
    const data = snapshot.val()

    if(data){
      Object.values(data).forEach((competencia)=>{
        document.getElementById('avaliacao-competencias-competencias-lista').innerHTML += `
                                <ul class="competencias-ul">
                        <li><p class="title">${competencia.nome}</p></li>
                        <li><input type="number" value="0"></li>
                    </ul><br>
        
        `
      })
    }
  })

  //Avalia Funcionário
  document.getElementById('avaliacao-competencias-funcionario-btn').addEventListener('click', async () => {
    const funcionarioRef = ref(database, 'testeEmpresa/funcionarios/-OKbJfv4eLzzz95tNiuq');
    
    try {
        // Buscar os dados do funcionário
        const snapshot = await get(funcionarioRef);
        if (!snapshot.exists()) return;
        const funcionario = snapshot.val();

        // Criar um objeto para armazenar as notas
        let valorCompetencias = funcionario.valorCompetencias || {};

        // Percorrer os inputs e capturar os valores digitados
        document.querySelectorAll('.competencias-ul').forEach(competenciaElement => {
            const nomeCompetencia = competenciaElement.querySelector('.title').innerText;
            const valor = parseInt(competenciaElement.querySelector('input').value) || 0;
            
            // Atualizar a nota da competência no objeto
            valorCompetencias[nomeCompetencia] = valor;
        });

        // Atualizar o Firebase com os novos valores
        await update(funcionarioRef, { valorCompetencias });

        alert('Avaliação salva com sucesso!');
    } catch (error) {
        console.error("Erro ao atualizar as competências:", error);
    }
});
