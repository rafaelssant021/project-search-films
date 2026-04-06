const apiKey = "f8ae092c693d8558e7c59f7435e00315";
let paginaAtual = 1;

async function buscarFilmes(novaBusca = true){
    const query = document.getElementById("search").value;

    if(!query) {
        alert("digite um filme");
        return;
    }

    document.getElementById("filmes").innerHTML = "<p>Carregando...</p>";

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
        img.src = filme.poster_path
            ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
            : "https://via.placeholder.com/500x750?text=Sem+Imagem";

        img.loading = "lazy";

        const titulo = document.createElement("h3");
        titulo.textContent = filme.title;

        const nota = document.createElement("p");
        nota.textContent = `⭐ ${filme.vote_average.toFixed(1)}`;

        const ano = document.createElement("p");
        ano.textContent = filme.release_date
            ? filme.release_date.split("-")[0]
            : "N/A";

        card.appendChild(img);
        card.appendChild(titulo);
        card.appendChild(nota);
        card.appendChild(ano);
        container.appendChild(card);
    });

    if(filmes.length === 0){
        container.innerHTML = "<p>Nenhum filme foi encontrado</p>";
        return;
    }

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

async function abrirModal(filme){
    const modal = document.getElementById("modal");
    const detalhes = document.getElementById("modal-detalhes");

    const isFavorito = favoritado(filme.id);

    const [respostaCreditos, respostaVideos] = await Promise.all ([
        fetch(`https://api.themoviedb.org/3/movie/${filme.id}/credits?api_key=${apiKey}&language=pt-BR`),
        fetch(`https://api.themoviedb.org/3/movie/${filme.id}/videos?api_key=${apiKey}&language=pt-BR`)
    ]);

    const creditos = await respostaCreditos.json();
    const videos = await respostaVideos.json();

    const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube") || videos.results.find(v => v.site === "YouTube");

    const trailerHtml = trailer ? `
    <div class="trailer">
        <h3 class="elenco-titulo">Trailer</h3>
        <div class="trailer-wrapper">
            <iframe
                src="https://www.youtube.com/embed/${trailer.key}"
                allowfullscreen
                allow="autoplay; encrypted-media"
                loading="lazy">
            </iframe>
        </div>
    </div>
    ` : `<p class="sem-trailer">Nenhum trailer disponível</p>`;

    const diretor = creditos.crew.find(pessoa => pessoa.job === "Director");

    const diretorHtml = diretor ? `
    <div class="diretor">
        <h3 class="elenco-titulo">Diretor</h3>
        <div class="ator" onclick="abrirModalPessoa(${diretor.id})" style="cursor: pointer;">
            <img src="${diretor.profile_path
                ? `https://image.tmdb.org/t/p/w185${diretor.profile_path}`
                : 'https://via.placeholder.com/80x80?text=?'}"
                alt="${diretor.name}">
            <div class="ator-info">
                <span class="ator-nome">${diretor.name}</span>
                <span class="ator-personagem">Diretor</span>
            </div>
        </div>
    </div>
` : "";

    const elenco = creditos.cast.slice(0,5);
    const atoresHtml = elenco.map(ator => `
        <div class="ator" onclick="abrirModalPessoa(${ator.id})" style="cursor: pointer;">
            <img src="${ator.profile_path
                ? `https://image.tmdb.org/t/p/w185${ator.profile_path}`
                : 'https://via.placeholder.com/80x80?text=?'}" 
                alt="${ator.name}">
            <div class="ator-info">
                <span class="ator-nome">${ator.name}</span>
                <span class="ator-personagem">${ator.character}</span>
            </div>
        </div>
    `).join("");
    
    detalhes.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" style="width:100%">
    <h2>${filme.title}</h2>
    <p>⭐ ${filme.vote_average}</p>
    <p>${filme.overview}</p>
    ${diretorHtml}
    <div class="elenco">
        <h3 class="elenco-titulo">Elenco Principal</h3>
        ${atoresHtml}
    </div>
    ${trailerHtml}
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

async function abrirModalPessoa(id){
    const modal = document.getElementById("modal");
    const detalhes = document.getElementById("modal-detalhes");

    detalhes.innerHTML = "<p style='text-align:center; padding: 20px;'>Carregando...</p>";
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    const [respostaPessoa, respostaFilmes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}&language=pt-BR`),
        fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${apiKey}&language=pt-BR`)
    ]);

    const pessoa = await respostaPessoa.json();
    const creditos = await respostaFilmes.json();

    const filmes = (creditos.cast || [])
        .sort((a,b) => b.popularity - a.popularity)
        .slice(0,8);

    const filmesHtml = filmes.map(filme => `
        <div class="filme-mini" onclick="abrirModalPorId(${filme.id})">
            <img src="${filme.poster_path
                ? `https://image.tmdb.org/t/p/w185${filme.poster_path}`
                : 'https://via.placeholder.com/80x120?text=?'}"
                alt="${filme.title}">
            <span>${filme.title}</span>
        </div>
        `).join("");

    const biografia = pessoa.biography
        ? `<p class="bio">${pessoa.biography}</p>`
        : `<p class="sem-trailer">Biografia não disponivel.</p>`;

    detalhes.innerHTML = `
        <div class="pessoa-topo">
            <img class="pessoa-foto" 
                src="${pessoa.profile_path
                    ? `https://image.tmdb.org/t/p/w185${pessoa.profile_path}`
                    : 'https://via.placeholder.com/100x100?text=?'}"
                alt="${pessoa.name}">
            <div class="pessoa-info">
                <h2>${pessoa.name}</h2>
                <p class="pessoa-detalhe">${pessoa.birthday
                    ? new Date(pessoa.birthday).toLocaleDateString("pt-BR")
                    : "N/A"}</p>
                <p class="pessoa-detalhe">${pessoa.place_of_birth || "N/A"}</p>
                <p class="pessoa-detalhe">${pessoa.known_for_department || "N/A"}</p>
            </div>
        </div>

        <div class="bio-secao">
            <h3 class="elenco-titulo">Biografia</h3>
            ${biografia}
        </div>

        <div class="filmes-pessoa">
            <h3 class="elenco-titulo">Filmes</h3>
            <div class="filmes-mini-grid">
                ${filmesHtml}
            </div>
        </div>
    `;
}

async function abrirModalPorId(id){
    const resposta = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=pt-BR`);
    const filme = await resposta.json();
    abrirModal(filme);
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

document.getElementById("search").addEventListener("keypress", function(e){
    if (e.key === "Enter") {
        buscarFilmes();
    }
});

let timeout;

document.getElementById("search").addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        buscarFilmes();
    }, 500);
})