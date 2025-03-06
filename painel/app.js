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
  
  const age = calculateAge('2003-05-10');
  console.log(`Anos: ${age.years}, Dias: ${age.totalDays}`);
  
  
//Painel de Dados do Funcionáro

    //Exibir dados do funcionário no painel
    const funcionarioRef = ref(database, 'testeEmpresa/funcionarios/-OKbJfv4eLzzz95tNiuq')

    get(funcionarioRef).then((snapshot)=>{
        const data = snapshot.val()

        if(data){
            //Preenche os dados superiores
            document.getElementById('nome-funcionario-painel-text').innerText = data.nomeCompleto
            if(data.cargos){
                Object.values(data.cargos).forEach((cargo)=>{
                    
                })
            }
            document.getElementById('cargo-funcionario-painel-text').innerHTML = data.cargo

            //Preenche o box inferior
            document.getElementById('nome-funcionario-text').innerText = data.nomeCompleto
            document.getElementById('data-nascimento-funcionario-text').innerText = formatDate(data.dataNascimento)
            document.getElementById('data-contratacao-funcionario-text').innerText = formatDate(data.dataAdmissao)
            document.getElementById('idade-funcionario-text').innerText = calculateAge(data.dataNascimento).years
            document.getElementById('tempo-contratacao-funcionario-text').innerText = calculateAge(data.dataAdmissao).years  + ' ano(s) '
            document.getElementById('salario-funcionario-text').innerHTML = `R$ ${data.salario} <span class="modalidade-salario">${data.modalidadeSalario == 'mes' ? 'p/Mês' : 'p/Hora'}</span>`
        }
    })