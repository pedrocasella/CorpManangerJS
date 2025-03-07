import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { get, getDatabase, ref, push, set, remove, update, child } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

import { firebaseConfig } from './../firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

//Gerar código aleatório
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//Reduzir qualidade da imagem
function resizeImage(file, maxWidth, maxHeight, callback) {
    var img = new Image();
    var reader = new FileReader();

    reader.onload = function(e) {
        img.src = e.target.result;
    };

    img.onload = function() {
        var canvas = document.createElement("canvas");
        var width = img.width;
        var height = img.height;

        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(function(blob) {
            callback(blob);
        }, file.type);
    };

    reader.readAsDataURL(file);
}

//Cadastro dos Funcionários

        //Adiciona foto ao funcionário
        document.getElementById("cadastrar-foto-funcionario-input").addEventListener("change", function(e) {
            var file = e.target.files[0];
        
            if (file) {
                resizeImage(file, 600, 600, function(resizedBlob) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        var base64String = reader.result;
                        document.getElementById('cadastrar-foto-funcionario').style.backgroundImage = 'url(' + base64String + ')'
                    };
                    reader.readAsDataURL(resizedBlob);
                });
            }
        });

        //Carrega departamentos existentes
        const departamentoRef = ref(database, 'testeEmpresa/departamentos/')
        get(departamentoRef).then((snapshot)=>{
            const data = snapshot.val()

            if(data){
                Object.values(data).forEach((departamento)=>{
                    document.getElementById('cadastrar-departamento-funcionario-input').innerHTML += `
                    <option value="${departamento.uuid}">${departamento.nome} - ${departamento.sigla}</option>
                `
                })

            }
        })

            //Carrega os setores de cada departamento
            document.getElementById('cadastrar-departamento-funcionario-input').addEventListener('change',()=>{
                document.getElementById('cadastrar-setor-funcionario-input').innerHTML = '<option value="null">--Selecione um Setor--</option>'
                const departamentoUuid = document.getElementById('cadastrar-departamento-funcionario-input').value
                const departamento = ref(database, `testeEmpresa/departamentos/${departamentoUuid}`)
                get(departamento).then((snapshot)=>{
                    const data = snapshot.val()
                    
                    if(data.setores){
                        
                        Object.values(data.setores).forEach((setor)=>{
                            document.getElementById('cadastrar-setor-funcionario-input').innerHTML += `
                            <option value="${setor}">${setor}</option>
                        `
                        })
        
                    }
                })
            })

        //Carrega as empresas
        const empresasRef = ref(database, 'testeEmpresa/empresas/')
        get(empresasRef).then((snapshot)=>{
            const data = snapshot.val()

            if(data){
                Object.values(data).forEach((empresa)=>{
                    console.log(empresa)
                    document.getElementById("empresas-select-input").innerHTML += `<option value="${empresa.nomeFantasia}">${empresa.nomeFantasia}</option></select>`
                })
            }
        })

        //Adicionar Cargo do funcionário
        document.getElementById('add-cargo-funcionario-btn').addEventListener('click', ()=>{
            const cargo = document.getElementById('cargos-select-input').value

            if(cargo == ''){
                alert('Adicione um cargo ao funcionário!')
            }else{
                if(document.getElementById('cargos-box-area').innerHTML.indexOf(cargo) != -1){
                    alert('Essa cargo já foi adicionada!')
                }else{
                    document.getElementById('cargos-box-area').innerHTML += `<div class="cargo-box" id="cargo-box-${cargo}">${cargo}</div>`
                }
            }
            
            document.getElementById('cargos-select-input').value = ''
        })

            //Remover Cargo
            document.getElementById('cargos-box-area').addEventListener('click', (e)=>{
                const id = e.target.id

                if(id.indexOf('cargo-box-') != -1){
                    document.getElementById(id).remove()
                }
            })


        //Adicionar Função do funcionário
        document.getElementById('add-funcoes-funcionario-btn').addEventListener('click', ()=>{
            const funcoes = document.getElementById('funcoes-select-input').value

            if(funcoes == ''){
                alert('Adicione uma função ao funcionário!')
            }else{
                if(document.getElementById('funcoes-box-area').innerHTML.indexOf(funcoes) != -1){
                    alert('Essa função já foi adicionada!')
                }else{
                    document.getElementById('funcoes-box-area').innerHTML += `<div class="funcoes-box" id="funcoes-box-${funcoes}">${funcoes}</div>`
                }
            }
            
            document.getElementById('funcoes-select-input').value = ''
        })

             //Remover Função
            document.getElementById('funcoes-box-area').addEventListener('click', (e)=>{
                const id = e.target.id

                if(id.indexOf('funcoes-box-') != -1){
                    document.getElementById(id).remove()
                }
            })

            // Adicionar Atribuição do Funcionário
            document.getElementById('cadastrar-atribuicao-funcionario-btn').addEventListener('click', () => {
                const input = document.getElementById('cadastrar-atribuicao-funcionario-input');
                const atribuicao = input.value.trim(); // Remove espaços extras

                if (atribuicao === '') {
                    alert('Por favor, insira uma atribuição válida.');
                    return;
                }

                const idAtribuicao = `atribuicao-box-${atribuicao.replace(/\s+/g, '')}`;

                // Evita duplicatas
                if (document.getElementById(idAtribuicao)) {
                    alert('Essa atribuição já foi adicionada.');
                    return;
                }

                // Criando os elementos de forma segura
                const atribuicaoBox = document.createElement('div');
                atribuicaoBox.classList.add('atribuicao-box');
                atribuicaoBox.id = idAtribuicao;

                const removeBtn = document.createElement('div');
                removeBtn.classList.add('remove-atribuicao');
                removeBtn.innerText = '❌';
                removeBtn.style.cursor = 'pointer';
                removeBtn.addEventListener('click', () => atribuicaoBox.remove());

                atribuicaoBox.appendChild(removeBtn);
                atribuicaoBox.appendChild(document.createTextNode(` ${atribuicao}`));

                document.getElementById('atribuicao-lista-area').appendChild(atribuicaoBox);

                // Limpar o input após adicionar
                input.value = '';
            });
                    
            //Remover Atribuição
            document.getElementById('atribuicao-lista-area').addEventListener('click', (e)=>{
                const id = e.target.id

                if(id.indexOf('remove-atribuicao-') != -1){
                    document.getElementById(`atribuicao-box-${id.replaceAll(' ', '')}`).remove()
                }
            })

            //Adicionar Empresas do funcionário
            document.getElementById('add-empresas-funcionario-btn').addEventListener('click', ()=>{
                const empresa = document.getElementById('empresas-select-input').value

                if(empresa == ''){
                    alert('Adicione uma empresa ao funcionário!')
                }else{
                    if(document.getElementById('empresas-box-area').innerHTML.indexOf(empresa) != -1){
                        alert('Essa empresa já foi adicionada!')
                    }else{
                        document.getElementById('empresas-box-area').innerHTML += `<div class="empresas-box" id="empresas-box-${empresa}">${empresa}</div>`
                    }
                }
                
                document.getElementById('empresas-select-input').value = 'null'
            })

                //Remover Empresa
                document.getElementById('empresas-box-area').addEventListener('click', (e)=>{
                    const id = e.target.id

                    if(id.indexOf('empresas-box-') != -1){
                        document.getElementById(id).remove()
                    }
                })

                document.getElementById('cadastrar-funcionario-btn').addEventListener('click', () => {
                    const foto = document.getElementById('cadastrar-foto-funcionario').style.backgroundImage.replaceAll('url(', '').replaceAll(')', '').replaceAll('"', '')
                    const nomeCompleto = document.getElementById('cadastrar-nome-funcionario-input').value.trim();
                    const salario = document.getElementById('cadastro-salario-funcionario-input').value
                    const modalidadeSalario = document.getElementById('cadastro-modalidade-salario-funcionario-input').value
                    const pis = document.getElementById('cadastrar-pis-funcionario-input').value.trim();
                    const dataAdmissao = document.getElementById('cadastrar-data-admissao-funcionario-input').value
                    const apelido = document.getElementById('cadastrar-apelido-funcionario-input').value.trim();
                    const dataNascimento = document.getElementById('cadastrar-nascimento-funcionario-input').value;
                    const cpf = document.getElementById('cadastrar-cpf-funcionario-input').value.replace(/\D/g, ''); // Remove caracteres não numéricos
                    const email = document.getElementById('cadastrar-email-funcionario-input').value.trim();
                    const celular = document.getElementById('cadastrar-celular-funcionario-input').value.trim();
                    const departamento = document.getElementById('cadastrar-departamento-funcionario-input').value;
                    const setor = document.getElementById('cadastrar-setor-funcionario-input').value;
                    const estadoCivil = document.getElementById('cadastrar-estado-civil-funcionario-input').value;
                    const tag = document.getElementById('cadastrar-tag-funcionario-input').value;
                
                    // Coletar os cargos adicionados
                    const cargos = Array.from(document.querySelectorAll('.cargo-box')).map(cargo => cargo.innerText.trim());
                
                    // Coletar as funções adicionadas
                    const funcoes = Array.from(document.querySelectorAll('.funcoes-box')).map(funcao => funcao.innerText.trim());
                
                    // Coletar as atribuições adicionadas
                    const atribuicoes = Array.from(document.querySelectorAll('.atribuicao-box')).map(atribuicao => atribuicao.innerText.trim());
                
                    // Coletar as empresas adicionadas
                    const empresas = Array.from(document.querySelectorAll('.empresas-box')).map(empresa => empresa.innerText.trim());
                
                    // Verificação básica antes de salvar
                    if (!nomeCompleto || !cpf || !email || !celular) {
                        alert('Por favor, preencha todos os campos obrigatórios!');
                        return;
                    }
                
                    // Criar o objeto do funcionário
                    const funcionario = {
                        foto,
                        nomeCompleto,
                        salario,
                        modalidadeSalario,
                        pis,
                        dataAdmissao,
                        estadoCivil,
                        tag,
                        apelido,
                        dataNascimento,
                        cpf,
                        email,
                        celular,
                        departamento,
                        setor,
                        cargos,
                        funcoes,
                        atribuicoes,
                        empresas
                    };

                    console.log(funcionario)
                
                    // Gerar uma chave única no Firebase
                    const funcionarioRef = push(ref(database, 'testeEmpresa/funcionarios/'));
                
                    // Salvar no Firebase
                    set(funcionarioRef, {
                        foto,
                        nomeCompleto,
                        salario,
                        modalidadeSalario,
                        pis,
                        dataAdmissao,
                        estadoCivil,
                        tag,
                        apelido,
                        dataNascimento,
                        cpf,
                        email,
                        celular,
                        departamento,
                        setor,
                        cargos,
                        funcoes,
                        atribuicoes,
                        empresas,
                        uuid: funcionarioRef.key
                    })
                        .then(() => {
                            alert('Funcionário cadastrado com sucesso!');
                            // Opcional: Limpar os campos após o cadastro

                            document.getElementById('cadastrar-foto-funcionario').style.backgroundImage = 'url(./../img/profile.png)'

                            document.querySelectorAll('.cadastro-funcionario-area input').forEach((input)=>{
                                input.value = ''
                            })

                            document.querySelectorAll('.cadastro-funcionario-area select').forEach((select)=>{
                                select.value = 'null'
                            })

                            document.querySelectorAll('.cadastro-funcionario-area textarea').forEach((textarea)=>{
                                textarea.value = ''
                            })

                            document.getElementById('cargos-box-area').innerHTML = '';
                            document.getElementById('funcoes-box-area').innerHTML = '';
                            document.getElementById('atribuicao-lista-area').innerHTML = '';
                            document.getElementById('empresas-box-area').innerHTML = '';
                        })
                        .catch(error => {
                            console.error('Erro ao cadastrar funcionário:', error);
                            alert('Erro ao cadastrar funcionário. Tente novamente.');
                        });
                });
                

//Cadastro de Empresas

    //Logotipo da Empresa 
    document.getElementById("cadastrar-foto-empresa-input").addEventListener("change", function(e) {
        var file = e.target.files[0];
    
        if (file) {
            resizeImage(file, 600, 600, function(resizedBlob) {
                var reader = new FileReader();
                reader.onload = function() {
                    var base64String = reader.result;
                    document.getElementById('cadastrar-foto-empresa').style.backgroundImage = 'url(' + base64String + ')'
                };
                reader.readAsDataURL(resizedBlob);
            });
        }
    });

    //Endereço da Empresa
    document.getElementById('cepForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const cep = document.getElementById('cep-empresa').value;

        if (cep.length !== 9) {
            Toastify({
                text: "CEP Inválido",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: 'red',
                },
                onClick: function(){} // Callback after click
            }).showToast();
            return;
        }

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('CEP não encontrado.');
                    return;
                }
                document.getElementById('logradouro-empresa').value = data.logradouro;
                document.getElementById('bairro-empresa').value = data.bairro;
                document.getElementById('localidade-empresa').value = data.localidade;
                document.getElementById('uf-empresa').value = data.uf;
            })
            .catch(error => {
                alert('Erro ao buscar o CEP.');
                console.error('Erro:', error);
            });
    });

    document.getElementById('clearBtn').addEventListener('click', function() {
        document.getElementById('cep-empresa').value = '';
        document.getElementById('logradouro-empresa').value = '';
        document.getElementById('bairro-empresa').value = '';
        document.getElementById('localidade-empresa').value = '';
        document.getElementById('uf-empresa').value = '';
    });

    //Salvar Cadastro da Empresa
    document.getElementById('cadastrar-empresa-btn').addEventListener('click', ()=>{
        const foto = document.getElementById('cadastrar-foto-empresa').style.backgroundImage.replaceAll('url(', '').replaceAll(')', '').replaceAll('"', '')
        const razaoSocial =  document.getElementById('cadastrar-nome-empresa-input').value
        const nomeFantasia = document.getElementById('cadastrar-nome-fantasia-empresa-input').value
        const cnpj = document.getElementById('cadastrar-cnpj-empresa-input').value
        const telefone = document.getElementById('cadastrar-telefone-empresa-input').value
        const celular = document.getElementById('cadastrar-celular-empresa-input').value
        const email = document.getElementById('cadastrar-email-empresa-input').value

        //Endereço
        const cep = document.getElementById('cep-empresa').value
        const rua = document.getElementById('logradouro-empresa').value
        const bairro = document.getElementById('bairro-empresa').value
        const cidade = document.getElementById('localidade-empresa').value
        const uf = document.getElementById('uf-empresa').value
        const numero = document.getElementById('numero-empresa').value
        const complemento = document.getElementById('complemento-empresa').value
        const pontoReferencia = document.getElementById('ponto-referencia-empresa').value

        const empresaRef = ref(database, 'testeEmpresa/empresas/')
        const pushEmpresa = push(empresaRef)

        set(pushEmpresa, {
            foto: foto,
            razaoSocial: razaoSocial,
            nomeFantasia: nomeFantasia,
            cnpj: cnpj,
            telefone: telefone,
            celular: celular,
            email: email,
            endereco: {
                cep: cep,
                rua: rua,
                bairro: bairro,
                cidade: cidade,
                estado: uf,
                numero: numero,
                complemento: complemento,
                pontoReferencia: pontoReferencia
            },
            uuid: pushEmpresa.key
        }).then(()=>{
            document.getElementById('cadastrar-foto-empresa').style.backgroundImage = 'url(./../img/profile.png)'

            document.querySelectorAll('#cadastro-empresa-area input').forEach((input)=>{
                input.value = ''
            })

            Toastify({
                text: "Empresa Cadastrada com Sucesso",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: 'green',
                },
                onClick: function(){} // Callback after click
            }).showToast();
        })
        
    })

//Cadastrar Departamento e Setores
let setoresArray = [] // Armazena os setores temporariamente

// Adicionar Setor
document.getElementById('adicionar-setor-btn').addEventListener('click', () => {
    const nomeSetor = document.getElementById('cadastrar-nome-setor-input').value.trim();

    if (nomeSetor === '') {
        Toastify({
            text: "O nome do setor é obrigatório!",
            duration: 3000,
            close: true,
            gravity: "bottom",
            position: "right",
            style: { background: 'red' }
        }).showToast();
        return;
    }

    const uuidSetorTemp = generateUUID();

    // Adiciona setor à lista visível
    document.getElementById('lista-setores-area').innerHTML += `
        <ul class="ul-setor" id="ul-setor-${uuidSetorTemp}">
            <li><div class="foto-setor-lista-area"></div></li>
            <li><p class="lista-cadastro-nome-setor">${nomeSetor}</p></li>
            <li><div class="remove-lista-cadastro-setor" id="remove-lista-cadastro-setor-${uuidSetorTemp}"></div></li>
        </ul><br>`;

    // Armazena no array
    setoresArray.push({ id: uuidSetorTemp, nome: nomeSetor });

    // Limpa input
    document.getElementById('cadastrar-nome-setor-input').value = '';
});

// Remover setor
document.getElementById('lista-setores-area').addEventListener('click', (e) => {
    const idClicked = e.target.id;

    if (idClicked.includes('remove-lista-cadastro-setor')) {
        const idSetor = idClicked.replace('remove-lista-cadastro-setor-', '');
        document.getElementById(`ul-setor-${idSetor}`).remove();

        // Remove do array
        setoresArray = setoresArray.filter(setor => setor.id !== idSetor);
    }
});

// Salvar Departamento
document.getElementById('criar-departamento-btn').addEventListener('click', () => {
    const nomeDepartamento = document.getElementById('cadastrar-nome-departamento-input').value.trim();
    const siglaDepartamento = document.getElementById('cadastrar-sigla-departamento-input').value.trim();

    if (nomeDepartamento === '' || siglaDepartamento === '') {
        Toastify({
            text: "Nome e sigla do departamento são obrigatórios!",
            duration: 3000,
            close: true,
            gravity: "bottom",
            position: "right",
            style: { background: 'red' }
        }).showToast();
        return;
    }

    // Monta o objeto final
    const departamentoObject = {
        nome: nomeDepartamento,
        sigla: siglaDepartamento,
        setores: setoresArray.reduce((obj, setor, index) => {
            obj[index] = setor.nome; // Armazena os setores com índice numérico
            return obj;
        }, {})
    };

    console.log(departamentoObject); // Aqui você pode enviar para o Firebase ou outra lógica

    const departamentoRef = ref(database, 'testeEmpresa/departamentos/')
    const pushDepartamento = push(departamentoRef)

    set(pushDepartamento, {
        nome: nomeDepartamento,
        sigla: siglaDepartamento,
        setores: setoresArray.reduce((obj, setor, index) => {
            obj[index] = setor.nome; // Armazena os setores com índice numérico
            return obj;
        }, {}),
        uuid: pushDepartamento.key
    }).then(()=>{
        // Limpa os inputs e a lista de setores
        document.getElementById('cadastrar-nome-departamento-input').value = '';
        document.getElementById('cadastrar-sigla-departamento-input').value = '';
        document.getElementById('lista-setores-area').innerHTML = '';
        setoresArray = [];

        Toastify({
            text: "Departamento salvo com sucesso!",
            duration: 3000,
            close: true,
            gravity: "bottom",
            position: "right",
            style: { background: 'green' }
        }).showToast();
    })


});

// Cadastro de competências

    //Carregar competências existentes
    const competenciaRef = ref(database, 'testeEmpresa/competencias/')
    get(competenciaRef).then((snapshot)=>{
        const data = snapshot.val()

        if(data){
            Object.values(data).forEach((competencia)=>{
                document.getElementById('competencias-lista-area').innerHTML += `
                <div class="competencia-box" id="competencia-box-${competencia.uuid}">
        <ul class="competencia-ul">
            <li><p class="nome-competencia">${competencia.nome}</p></li>
            <li><div class="remover-competencia-btn" id="remover-competencia-btn-${competencia.uuid}" data-competencia-uuid="${competencia.uuid}"></div></li>
        </ul>
    </div>

`
            })
        }
    })

    document.getElementById('cadastrar-competencia-btn').addEventListener('click', ()=>{
        const competenciaRef = ref(database, 'testeEmpresa/competencias/')

        const nomeCompetencia = document.getElementById('cadastrar-competencia-input').value

        if(nomeCompetencia == ''){
            Toastify({
                text: "Dê um nome para a competência!",
                duration: 3000,
                close: true,
                gravity: "bottom",
                position: "right",
                style: { background: 'red' }
            }).showToast();
            return
        }

        const pushCompetencia = push(competenciaRef)
        set(pushCompetencia, {
            nome: nomeCompetencia,
            uuid: pushCompetencia.key
        }).then(()=>{

            document.getElementById('competencias-lista-area').innerHTML += `
                                <div class="competencia-box" id="competencia-box-${pushCompetencia.key}">
                        <ul class="competencia-ul">
                            <li><p class="nome-competencia">${nomeCompetencia}</p></li>
                            <li><div class="remover-competencia-btn" id="remover-competencia-btn-${pushCompetencia.key}" data-competencia-uuid="${pushCompetencia.key}"></div></li>
                        </ul>
                    </div>
            
            `

            nomeCompetencia = document.getElementById('cadastrar-competencia-input').value = ''
            Toastify({
                text: "Competência cadastrada com sucesso!",
                duration: 3000,
                close: true,
                gravity: "bottom",
                position: "right",
                style: { background: 'green' }
            }).showToast();

        })
    })

    //Remover Competência
    document.getElementById('competencias-lista-area').addEventListener('click', (e)=>{
        const id = e.target.id

        if(id.includes('remover-competencia-btn-')){
            const competenciaUuid = e.target.dataset.competenciaUuid
            const competenciaRef = ref(database, 'testeEmpresa/competencias/' + competenciaUuid)
            remove(competenciaRef).then(()=>{
                document.getElementById(`competencia-box-${competenciaUuid}`).remove()
                Toastify({
                    text: "Competência removida com sucesso!",
                    duration: 3000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    style: { background: 'green' }
                }).showToast();
            })
        }
    })

//Visualizar Empresas Area
function carregarEmpresas(){
    const empresasRef = ref(database, 'testeEmpresa/empresas/')
    get(empresasRef).then((snapshot)=>{
        const data = snapshot.val()

        if(data){
            Object.values(data).forEach((empresa)=>{
                console.log(empresa)
                document.getElementById("lista-empresa-empresa-area").innerHTML += `
                                    <ul class="empresa-ul">
                    <li><div class="empresa-foto" style="background-image: url(${empresa.foto})"></div></li>
                    <li><p class="nome-empresa">${empresa.razaoSocial}</p></li>
                    <li><p class="cnpj-empresa">${empresa.cnpj}</p></li>
                    <li><div class="edit-btn"></div></li>
                    <li><div class="remove-btn"></div></li>
                </ul>
            </div>
                
                `
            
            })
        }
    })}

    carregarEmpresas()