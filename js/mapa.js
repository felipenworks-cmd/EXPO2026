// ============================================================
// mapa.js — lógica da página "Mapa de Comércios"
// ============================================================

// Ícones diferentes por categoria deixam o mapa mais fácil de ler
const CORES_CATEGORIA = {
  'Alimentação': '#e67e22', 'Beleza': '#e84393', 'Vestuário': '#6c5ce7',
  'Serviços': '#0984e3', 'Artesanato': '#8e5b3a', 'Tecnologia': '#00b894',
  'Educação': '#2d3436', 'Construção': '#d35400', 'Outros': '#636e72'
};

function criarIconeCategoria(categoria) {
  const cor = CORES_CATEGORIA[categoria] || '#1f7a4d';
  return L.divIcon({
    className: '',
    html: `<div style="background:${cor};width:26px;height:26px;border-radius:50% 50% 50% 0;
                 transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26]
  });
}

// Centro inicial do mapa (mesma região "fictícia" usada nos dados demo)
const mapa = L.map('mapa').setView([-23.5620, -46.6540], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapa);

let camadaMarcadores = L.layerGroup().addTo(mapa);
let todosNegocios = [];
let categoriaAtiva = '';
let termoBusca = '';

const elListaNegocios = document.getElementById('lista-negocios');
const elContador = document.getElementById('contador-resultados');

function popupHtml(n) {
  return `
    <div class="popup-negocio">
      <h4>${escaparHtml(n.nome)}</h4>
      <p><strong>${escaparHtml(n.categoria)}</strong></p>
      <p>${escaparHtml(n.descricao || 'Sem descrição informada.')}</p>
      <p>📍 ${escaparHtml(n.endereco || '')}${n.numero ? ', ' + escaparHtml(n.numero) : ''} — ${escaparHtml(n.bairro || '')}</p>
      ${n.telefone ? `<p>📞 ${escaparHtml(n.telefone)}</p>` : ''}
      ${n.funcionamento ? `<p>🕒 ${escaparHtml(n.funcionamento)}</p>` : ''}
    </div>
  `;
}

function desenharMarcadores(lista) {
  camadaMarcadores.clearLayers();
  lista.forEach((n) => {
    const marcador = L.marker([n.latitude, n.longitude], { icon: criarIconeCategoria(n.categoria) });
    marcador.bindPopup(popupHtml(n));
    marcador.addTo(camadaMarcadores);
    marcador._negocioId = n.id;
  });
}

function desenharLista(lista) {
  if (lista.length === 0) {
    elListaNegocios.innerHTML = '<p class="texto-suave">Nenhum negócio encontrado com esses filtros.</p>';
    return;
  }
  elListaNegocios.innerHTML = lista.map((n) => `
    <div class="item-negocio" data-id="${n.id}">
      <h4>${escaparHtml(n.nome)}</h4>
      <p>${escaparHtml(n.categoria)} · ${escaparHtml(n.bairro || '')}</p>
    </div>
  `).join('');

  elListaNegocios.querySelectorAll('.item-negocio').forEach((item) => {
    item.addEventListener('click', () => {
      const negocio = todosNegocios.find((n) => String(n.id) === item.dataset.id);
      if (!negocio) return;
      mapa.setView([negocio.latitude, negocio.longitude], 17);
      camadaMarcadores.eachLayer((camada) => {
        if (camada._negocioId === negocio.id) camada.openPopup();
      });
    });
  });
}

function aplicarFiltros() {
  const filtrados = todosNegocios.filter((n) => {
    const bateCategoria = !categoriaAtiva || n.categoria === categoriaAtiva;
    const bateBusca = !termoBusca ||
      n.nome.toLowerCase().includes(termoBusca) ||
      n.categoria.toLowerCase().includes(termoBusca) ||
      (n.bairro || '').toLowerCase().includes(termoBusca);
    return bateCategoria && bateBusca;
  });
  desenharMarcadores(filtrados);
  desenharLista(filtrados);
  elContador.textContent = `${filtrados.length} negócio(s) encontrado(s)`;
}

async function carregarNegocios() {
  try {
    todosNegocios = await Api.listarNegocios();
    aplicarFiltros();
  } catch (e) {
    elContador.textContent = 'Não foi possível carregar os negócios agora.';
  }
}

// -------------------- Eventos de filtro --------------------
document.getElementById('campo-busca').addEventListener('input', (e) => {
  termoBusca = e.target.value.trim().toLowerCase();
  aplicarFiltros();
});

document.getElementById('filtros-categoria').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip-categoria');
  if (!chip) return;
  document.querySelectorAll('.chip-categoria').forEach((c) => c.classList.remove('ativo'));
  chip.classList.add('ativo');
  categoriaAtiva = chip.dataset.categoria;
  aplicarFiltros();
});

// -------------------- Alternar mapa / lista (útil no celular) --------------------
document.getElementById('btn-vista-lista').addEventListener('click', () => {
  elListaNegocios.classList.add('visivel');
  document.getElementById('mapa').style.display = 'none';
});
document.getElementById('btn-vista-mapa').addEventListener('click', () => {
  elListaNegocios.classList.remove('visivel');
  document.getElementById('mapa').style.display = 'block';
  setTimeout(() => mapa.invalidateSize(), 100);
});

carregarNegocios();
