document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('AdicionarMusica__formulario');
    const musicList = document.getElementById('musicList');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const musicName = document.getElementById('musicName').value;
        const musicImage = document.getElementById('musicImage').files[0];

        if (musicName && musicImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newMusicItem = createMusicItem(musicName, e.target.result);
                musicList.appendChild(newMusicItem);
                form.reset();
            }
            reader.readAsDataURL(musicImage);
        }
    });

    function createMusicItem(name, imageSrc) {
        const musicItem = document.createElement('div');
        musicItem.classList.add('visualizarMusica__gerenciar');

        musicItem.innerHTML = `
            <h4 class="visualizarMusica__gerenciar--nomeDaMusica">${name}</h4>
            <div class="visualizarMusica__gerenciar--divisao">
                <div class="visualizarMusica__gerenciar--divisao--esquerda">
                    <img src="${imageSrc}" alt="${name}" style="width: 50px; height: 50px; margin-right: 10px;">
                    <p class="visualizarMusica__gerenciar--div--DataDaMusica">Data: ${new Date().toLocaleDateString()}</p>
                    <div class="visualizarMusica__gerenciar--div--linha"></div>
                    <div class="visualizarMusica__gerenciar--div--circulo"></div>
                    <p class="visualizarMusica__gerenciar--div--VerificarMusica">Publicado</p>
                    <div class="visualizarMusica__gerenciar--div--linha"></div>
                    <a class="visualizarMusica__gerenciar--div--link" href="#" target="">
                        Visualizar
                    </a>
                </div>
                <div class="visualizarMusica__gerenciar--divisao--direita">
                    <button class="visualizarMusica__gerenciar--div--Botao editarMusica">Editar música</button>
                    <div class="visualizarMusica__gerenciar--div--linha"></div>
                    <button class="visualizarMusica__gerenciar--div--Botao excluirMusica">Excluir música</button>
                </div>
            </div>
        `;

        musicItem.querySelector('.editarMusica').addEventListener('click', () => {
            const newName = prompt("Editar nome da música:", name);
            if (newName) {
                musicItem.querySelector('.visualizarMusica__gerenciar--nomeDaMusica').textContent = newName;
            }
        });

        musicItem.querySelector('.excluirMusica').addEventListener('click', () => {
            musicList.removeChild(musicItem);
        });

        return musicItem;
    }
});