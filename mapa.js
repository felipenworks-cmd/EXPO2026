// ============================================================
// mapa.js — lógica da página "Mapa de Comércios"
// (o mapa interativo foi substituído por uma imagem ilustrativa;
//  aqui ficam apenas a busca, os filtros e a lista de negócios)
// ============================================================

let todosNegocios = [];
let categoriaAtiva = '';
let termoBusca = '';

const elListaNegocios = document.getElementById('lista-negocios');
const elContador = document.getElementById('contador-resultados');

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
});

carregarNegocios();
