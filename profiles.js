const EMOJIS = ['🎬','🎥','🍿','🦁','🐙','🌙','⚡','🎭','🦊','🐯','🌊','🚀','🎸','👾','🌸','🦋'];

const COLORS = ['#e50914','#1a6ef5','#2db87c','#f5a623','#a855f7','#ec4899'];

const DEFAULT_PROFILES = [
    { 
        id: 1, 
        name: 'Meu Perfil', 
        emoji: '🎬', 
        color: '#e50914' 
    }
];

let profiles = JSON.parse(localStorage.getItem('cs_profiles') || 'null') || DEFAULT_PROFILES;

let manageMode = false;
let editTarget = null;

const grid = document.getElementById('profilesGrid');
const overlay = document.getElementById('modalOverlay');
const modal = document.getElementById('csModal');
const limitMsg = document.getElementById('limitMsg');
const manageBtn = document.getElementById('manageBtn');

function save(){
    localStorage.setItem('cs_profiles', JSON.stringify(profiles));
}

function render(){
    grid.innerHTML = '';

    profiles.forEach(p => {
        const card = document.createElement('div');
        card.className = 'cs-profile-card ' + (manageMode ? 'manage-mode' : '');

        card.innerHTML = `
           <div class="cs-avatar" style="background: ${p.color}22;">
                <span>${p.emoji}</span>
                <div class="cs-edit-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </div>
            </div>
            <span class="cs-profile-name">${p.name}</span>
        `;

            card.addEventListener('click', () => {
                if(manageMode){
                    openEdit(p);
                } else {
                    selectProfile(p);
                }
            });

            grid.appendChild(card);
    });

    if (profiles.length < 5){
        const addBtn = document.createElement('div');
        addBtn.className = 'cs-add-btn';
        addBtn.innerHTML = `
            <div class="cs-add-avatar">
                <svg viewBox="0 0 24 24" stroke-linecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </div>
            <span class="cs-add-name">Adicionar</span>
        `;
            addBtn.addEventListener('click', openCreate);
            grid.appendChild(addBtn);
    }

    limitMsg.style.display = profiles.length >= 5 ? 'block' : 'none';
    manageBtn.textContent = manageMode ? 'Concluir' : 'Gerenciar Perfis';
}

function selectProfile(p){
    localStorage.setItem('cs_active_profile', JSON.stringify(p));
    window.location.href = 'index.html';
}

function openCreate(){
    editTarget = null;
    showModal({ 
        title: 'Novo Perfil',
        name: '',
        emoji: EMOJIS[0],
        color: COLORS[0],
        isEdit: false
    });
}

function openEdit(p){
    editTarget = p;
    showModal({
        title: 'Editar Perfil',
        name: p.name,
        emoji: p.emoji,
        color: p.color,
        isEdit: true
    });
}

function showModal({ title, name, emoji, color, isEdit}){
    let selEmoji = emoji;
    let selColor = color;

    modal.innerHTML = `
        <div class="cs-modal-title">${title}</div>

        <label>Nome</label>
        <input type="text" id="pName" maxlength="20" value="${name}" placeholder="Digite um nome..." />

        <label>Avatar</label>
        <div class="cs-emoji-pick">
            ${EMOJIS.map(e => `
                <div class="cs-emoji-opt ${e === emoji ? 'selected' : ''}" data-e="${e}">${e}</div>
            `).join('')}
        </div>

        <label>Cor</label>
        <div class="cs-color-row">
            ${COLORS.map(c => `
                <div class="cs-color-dot ${c === color ? 'selected' : ''}" data-c="${c}" style="background:${c}"></div>
            `).join('')}
        </div>

        <div class="cs-modal-actions">
            ${isEdit ? `<button class="cs-btn-danger" id="deleteBtn">Excluir</button>` : ''}
            <button class="cs-btn-secondary" id="cancelBtn">Cancelar</button>
            <button class="cs-btn-primary" id="saveBtn">${isEdit ? 'Salvar' : 'Criar'}</button>
        </div>
    `;

    modal.querySelectorAll('.cs-emoji-opt').forEach(el => {
        el.addEventListener('click', () => {
            modal.querySelectorAll('.cs-emoji-opt').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            selEmoji = el.dataset.e;
        });
    });

    modal.querySelectorAll('.cs-color-dot').forEach(el => {
        el.addEventListener('click', () => {
            modal.querySelectorAll('.cs-color-dot').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            selColor = el.dataset.c;
        });
    });

    modal.querySelector('#cancelBtn').addEventListener('click', closeModal);

    modal.querySelector('#saveBtn').addEventListener('click', () => {
        const nm = modal.querySelector('#pName').value.trim();
        if(!nm){
            modal.querySelector('#pName').focus();
            return;
        }

        if(editTarget){
            editTarget.name = nm;
            editTarget.emoji = selEmoji;
            editTarget.color = selColor;
        } else{
            profiles.push({
                id: Date.now(),
                name: nm,
                emoji: selEmoji,
                color: selColor,
            });
        }

        save();
        closeModal();
        render();
    });

    if(isEdit){
        modal.querySelector('#deleteBtn').addEventListener('click', () => {
            profiles = profiles.filter(p => p.id !== editTarget.id);
            save();
            closeModal();
            render();
        });
    }

    overlay.classList.add('active');
    setTimeout(() => modal.querySelector('#pName').focus(), 100);
}

function closeModal(){
    overlay.classList.remove('active');
    modal.innerHTML = '';
    editTarget = null;
}

overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
});

manageBtn.addEventListener('click', () => {
    manageMode = !manageMode;
    render();
});

render();
