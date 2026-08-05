//variáveis globais para armazenar informações fora das funções
let colunaApontada;
let spanApontado;

//função para atualizar a quantidade de tarefas mostrada no contador
function contador(coluna) {
	const divCaixa = coluna.querySelector(".caixa-de-tarefas");
	const quantidadeDeTarefas = divCaixa.querySelectorAll(".tarefa").length;
	const spanContador = coluna.querySelector(".contador");
	if (spanContador) {
		spanContador.innerText = quantidadeDeTarefas;
	}
}

//funções de arrastar e soltar
function dragstartHandler(event) {
	event.dataTransfer.setData("text", event.target.id);
}
function dragoverHandler(event) {
	event.preventDefault();
}
function dropHandler(event) {
	event.preventDefault();
	const info = event.dataTransfer.getData("text");
	const localCerto = event.target.closest(".caixa-de-tarefas");
	if (localCerto) {
		const tarefa = document.getElementById(info);
		const colunaInicial = tarefa.closest(".fluxo-de-trabalho");
		localCerto.appendChild(document.getElementById(info));
		const colunaFinal = localCerto.closest(".fluxo-de-trabalho");
		if(colunaFinal !== colunaInicial) {
			contador(colunaInicial);
			contador(colunaFinal);
		}
	}
	salvarDados();
}

//funções para criar e excluir tarefas
//função para abrir a janela modal adicionar tarefa
function addTarefa(buttonElement) {
	colunaApontada = buttonElement.closest(".fluxo-de-trabalho");
	const display = document.getElementById("janela-add-tarefa");
	display.showModal();
}
//botão da janela de adicionar tarefa
function salvarNovaTarefa() {
	const input = document.getElementById("input-add-tarefa");
	if (input.value.trim()!=="") {
		criarTarefa(colunaApontada, input.value);
		document.getElementById("janela-add-tarefa").close();
	}
	//atualiza o contador do fluxo de trabalho
	contador(colunaApontada);
	salvarDados();
}
//função para criar a tarefa e adicionar no fluxo de trabalho
function criarTarefa(colunaApontada, inputElement) {
	//cria a nova tarefa
	const newTarefa = document.createElement("div");
	//cria um id único para cada nova tarefa
	newTarefa.id = "tarefa-" + Date.now();
	newTarefa.className = "tarefa";
	newTarefa.setAttribute("draggable", "true");
	newTarefa.setAttribute("ondragstart", "dragstartHandler(event)");
	
	//cria o local onde ficará o texto da terfa
	const newSpan = document.createElement("span");
	newSpan.innerText = inputElement;
	
	//cria o botão de excluir tarefa
	const newButton = document.createElement("button");
	newButton.setAttribute("type", "button");
	newButton.className = "excluir-tarefa";
	newButton.setAttribute("onclick", "excluirTarefa(this)");
	newButton.innerHTML = "<i class=\"material-icons\">close</i>";
	
	//adiciona os elementos da tarefa
	newTarefa.appendChild(newSpan);
	newTarefa.appendChild(newButton);

	//adiciona a tarefa no fluxo de trabalho dentro da caixa de tarefas
	const lugarCerto = colunaApontada.querySelector(".caixa-de-tarefas");
	lugarCerto.appendChild(newTarefa);
}
function excluirTarefa(buttonElement) {
	const post = buttonElement.closest(".tarefa");
	const coluna = post.closest(".fluxo-de-trabalho");
	//rmeove a tarefa da caixa de tarefas
	post.remove();
	//atualiza o contador do fluxo de trabalho
	contador(coluna);
	salvarDados();
}

//funções para criar, editar e excluir um fluxo de trabalho
//função para abrir a janela modal adicionar fluxo de trabalho
function addFluxoDeTrabalho() {
	const display = document.getElementById("janela-add-fluxo-de-trabalho");
	display.showModal();
}
//botão da janela de adicionar fluxo de trabalho
function salvarNovoFluxoDeTrabalho() {
	const input = document.getElementById("input-add-fluxo-de-trabalho");
	if (input.value.trim()!=="") {
		criarFluxoDeTrabalho(input.value);
		document.getElementById("janela-add-fluxo-de-trabalho").close();
	}
	salvarDados();
}
//função para criar o fluxo de trabalho e adicionar ao quadro
function criarFluxoDeTrabalho(inputElement) {
	//cria uma nova coluna no quadro
	const quadro = document.getElementById("quadro");
	const newFluxoDeTrabalho = document.createElement("div");
	//cria um id único para cada novo fluxo de trabalho
	newFluxoDeTrabalho.id = "coluna-" + Date.now();
	newFluxoDeTrabalho.className = "fluxo-de-trabalho";
	
	//cria o cabeçalho do contador e título na nova coluna
	const newHeader = document.createElement("div");
	newHeader.className = "header";
	const newSpan = document.createElement("span");
	newSpan.innerText = inputElement;
	
	//cria o novo contador
	const newSpanContador = document.createElement("span");
	newSpanContador.className = "contador";
	newSpanContador.innerText = "0";

	//cria a nova caixa de tarefas
	const newCaixaDeTarefas = document.createElement("div");
	newCaixaDeTarefas.className = "caixa-de-tarefas";
	newCaixaDeTarefas.setAttribute("ondrop", "dropHandler(event)");
	newCaixaDeTarefas.setAttribute("ondragover", "dragoverHandler(event)");
	
	//cria o botão de criar tarefa
	const newButton = document.createElement("button");
	newButton.setAttribute("type", "button");
	newButton.className = "add-tarefa";
	newButton.setAttribute("onclick", "addTarefa(this)");
	newButton.innerText = "+ Adicionar Tarefa";
	
	//cria o botão de editar o fluxo de trabalho
	const newButtonEdit = document.createElement("button");
	newButtonEdit.setAttribute("type", "button");
	newButtonEdit.className = "editar-fluxo-de-trabalho";
	newButtonEdit.setAttribute("onclick", "editarFluxoDeTrabalho(this)");
	newButtonEdit.innerHTML = "<i class=\"material-icons\">menu</i>";
	
	//adiciona o novo fluxo de trabalho e seus elementos no quadro
	quadro.appendChild(newFluxoDeTrabalho);
	newFluxoDeTrabalho.appendChild(newHeader);
	newHeader.appendChild(newButtonEdit);
	newHeader.appendChild(newSpan);
	newHeader.appendChild(newSpanContador);
	newFluxoDeTrabalho.appendChild(newCaixaDeTarefas);
	newFluxoDeTrabalho.appendChild(newButton);
}

//função para abrir a janela modal edição do fluxo de trabalho
function editarFluxoDeTrabalho(buttonElement) {
	colunaApontada = buttonElement.closest(".fluxo-de-trabalho");
	spanApontado = colunaApontada.querySelector(".header span");

	const display = document.getElementById("janela-editar-fluxo-de-trabalho");
	const input = document.getElementById("input-editar-fluxo-de-trabalho");
	input.value = spanApontado.innerText;

	display.showModal();
}
//botões da janela de edição do fluxo de trabalho
function salvarFluxoDeTrabalho() {
	const input = document.getElementById("input-editar-fluxo-de-trabalho");

	if (input.value.trim()!=="") {
		spanApontado.innerText = input.value;
		document.getElementById("janela-editar-fluxo-de-trabalho").close();
	}
	salvarDados();
}
function excluirFluxoDeTrabalho() {
	colunaApontada.remove();
	document.getElementById("janela-editar-fluxo-de-trabalho").close();
	salvarDados();
}

//função para fechar as janelas modais
function cancelar(buttonElement) {
	const janela = buttonElement.closest("dialog");
	janela.close();
}

//funções para salvar e carregar dados do localStorage
function salvarDados() {
	const colunas = document.querySelectorAll(".fluxo-de-trabalho");
	const dadosKanban = [];
	
	//função que vai guardar cada coluna individualmente
	function processarTrabalho(coluna) {
		const id = coluna.id;
		const titulo = coluna.querySelector(".header span").innerText;
		const posts = coluna.querySelectorAll(".tarefa");
		const tarefas = [];
		
		//função que vai guardar todas os post individualmente
		function processarTarefa(post) {
			tarefas.push({
				id: post.id,
				texto: post.querySelector("span").innerText
			});
		}
		posts.forEach(processarTarefa);
		
		//estrutura os dados no array
		dadosKanban.push({
			id, titulo, tarefas
		});
	}
	colunas.forEach(processarTrabalho);
	
	//salva no localStorage
	localStorage.setItem("meuKanban", JSON.stringify(dadosKanban));
}

function carregarDados() {
	//se não houver dados salvos, inicia a página na configuração escrita no HTML
	const dadosSalvos = localStorage.getItem("meuKanban");
	if (!dadosSalvos) {
		atualizarContagem();
		return;
	}
	
	//converte de JSON para um array de objetos que o navegador conseguirá interpretar
	const dadosKanban = JSON.parse(dadosSalvos);
	const quadro = document.getElementById("quadro");
	//limpa o quadro para carregar a configuração salva
	quadro.innerHTML = "";
	
	//recria os elementos HTML
	function dadosColuna(coluna) {
		function dadosTarefa(post) {
			//o sinal de crase serve pra poder quebrar linhas e inserir informações ${}
			tarefasHtml += `
				<div id="${post.id}" class="tarefa" draggable="true" ondragstart="dragstartHandler(event)">
					<button type="button" class="excluir-tarefa" onclick="excluirTarefa(this)"><i class="material-icons">close</i></button>
					<span>${post.texto}</span>
				</div>
			`;
		}
		
		//variável para juntar os post-its da cada coluna
		let tarefasHtml = "";
		coluna.tarefas.forEach(dadosTarefa);
		const colunaHtml = `
			<div id="${coluna.id}" class="fluxo-de-trabalho">
				<div class="header">
					<button type="button" class="editar-fluxo-de-trabalho" onclick="editarFluxoDeTrabalho(this)"><i class="material-icons">menu</i></button>
					<span>${coluna.titulo}</span>
					<span class="contador">${coluna.tarefas.length}</span>
				</div>
				<div class="caixa-de-tarefas" ondrop="dropHandler(event)" ondragover="dragoverHandler(event)">
					${tarefasHtml}
				</div>
				<button type="button" class="add-tarefa" onclick="addTarefa(this)">+ Adicionar Tarefa</button>
			</div>
		`;
		quadro.insertAdjacentHTML("beforeend", colunaHtml);
	}
	dadosKanban.forEach(dadosColuna);
	console.log("informações recuperadas com sucesso:", dadosKanban);
}

//função para passar pelas colunas atualizando a quantidade de tarefas mostrada no contador
function atualizarContagem() {
	const contagem = document.querySelectorAll(".fluxo-de-trabalho");
	contagem.forEach(contador);
}
document.addEventListener("DOMContentLoaded", carregarDados);