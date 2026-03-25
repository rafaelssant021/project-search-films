const apiKey = "f8ae092c693d8558e7c59f7435e00315";
let paginaAtual = 1;

async function buscarFilmes(novaBusca = true){
    const query = document.getElementById("search").value;

    if(!query) {
        alert("digite um filme");
        return;
    }

    if(novaBusca){
        paginaAtual = 1;
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=pt-BR&page=${paginaAtual}`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    mostrarFilmes(dados.results);
}

function mostrarFilmes(filmes){
    const container = document.getElementById("filmes");
    const paginacao = document.getElementById("paginacao");

    container.innerHTML = "";

    filmes.forEach(filme => {
        const card = document.createElement("div");
        card.classList.add("filme");

        card.addEventListener("click", () => abrirModal(filme));

        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;

        const titulo = document.createElement("h3");
        titulo.textContent = filme.title;

        const nota = document.createElement("p");
        nota.textContent = `⭐ ${filme.vote_average}`;

        card.appendChild(img);
        card.appendChild(titulo);
        card.appendChild(nota);
        container.appendChild(card);
    });

    paginacao.style.display = filmes.length > 0 ? "block" : "none";
}

function salvarFavorito(id){
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if(!favoritos.includes(id)){
        favoritos.push(id);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        alert("Filme favoritado com sucesso!");
    }
}

async function verFavoritos(){
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if(favoritos.length === 0){
        alert ("Você não possui filmes favoritados");
        return;
    }

    const filmes = [];

    for (let id of favoritos){
        const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=pt-BR`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        filmes.push(dados);
    }

    mostrarFilmes(filmes);
}

function favoritado(id){
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    return favoritos.includes(id);
}

function toggleFavorito(id){
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if(favoritos.includes(id)){
        favoritos = favoritos.filter(f => f !== id);
    } else {
        favoritos.push(id);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function proximaPagina(){
    paginaAtual++;
    buscarFilmes(false);
}

function paginaAnterior(){
    if (paginaAtual > 1){
        paginaAtual--;
        buscarFilmes(false);
    }
}

function abrirModal(filme){
    const modal = document.getElementById("modal");
    const detalhes = document.getElementById("modal-detalhes");

    const isFavorito = favoritado(filme.id);

    detalhes.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" style="width:100%">
    <h2>${filme.title}</h2>
    <p>⭐ ${filme.vote_average}</p>
    <p>${filme.overview}</p>
    <button id="btn-favorito"
            style="
                background: ${isFavorito ? 'rgb(107, 9, 9)' : '#e50914'};
                color: white;
                margin-top: 10px;
            ">
            ${isFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
        </button>
        `;

        const botao = document.getElementById("btn-favorito");

        botao.addEventListener("click", () => {
            toggleFavorito(filme.id);
            abrirModal(filme);
        });

    modal.style.display = "flex";

    document.body.style.overflow = "hidden";
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = function(event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}