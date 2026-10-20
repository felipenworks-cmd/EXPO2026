// ============================================================
// assistencia.js — painel administrativo de assistência jurídica
// ============================================================

let solicitacaoSelecionadaId = null;

// -------------------- Abas --------------------
document.querySelectorAll('.aba-botao').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('.aba-botao').forEach((b) => b.classList.remove('ativa'));
    document.querySelectorAll('.aba-painel').forEach((p) => p.classList.remove('ativa'));
    botao.classList.add('ativa');
    document.querySelector(`.aba-painel[data-aba="${botao.dataset.aba}"]`).classList.add('ativa');
  });
});

// -------------------- Tabela de solicitações --------------------
const corpoTabela = document.getElementById('corpo-tabela-solicitacoes');
const painelDetalhe = document.getElementById('detalhe-solicitacao');

function badgeStatus(status) {
  const classe = status === 'Concluído' ? 'badge-sucesso'
    : status === 'Aguardando informações' ? 'badge-alerta' : 'badge';
  return `<span class="badge ${classe}">${escaparHtml(status)}</span>`;
}

async function carregarSolicitacoes() {
  const status = document.getElementById('filtro-status').value;
  const busca = document.getElementById('filtro-busca').value.trim();

  corpoTabela.innerHTML = '<tr><td colspan="5" class="texto-suave">Carregando...</td></tr>';
  try {
    const lista = await Api.listarSolicitacoesMei({ status, busca });
    if (lista.length === 0) {
      corpoTabela.innerHTML = '<tr><td colspan="5" class="texto-suave">Nenhuma solicitação encontrada.</td></tr>';
      return;
    }
    corpoTabela.innerHTML = lista.map((s) => `
      <tr class="linha-clicavel" data-id="${s.id}">
        <td>#${s.id}</td>
        <td>${escaparHtml(s.empreendedor)}</td>
        <td>${escaparHtml(s.negocio_nome || '—')}</td>
        <td>${badgeStatus(s.status)}</td>
        <td>${formatarData(s.updated_at)}</td>
      </tr>
    `).join('');

    corpoTabela.querySelectorAll('tr[data-id]').forEach((linha) => {
      linha.addEventListener('click', () => abrirDetalhe(linha.dataset.id));
    });
  } catch (err) {
    corpoTabela.innerHTML = `<tr><td colspan="5" class="texto-suave">Erro ao carregar: ${escaparHtml(err.message)}</td></tr>`;
  }
}

async function abrirDetalhe(id) {
  solicitacaoSelecionadaId = id;
  painelDetalhe.innerHTML = '<p class="texto-suave">Carregando detalhes...</p>';
  try {
    const app = await Api.buscarSolicitacaoMei(id);
    const comentarios = (app.comentarios || []).map((c) => `
      <div class="comentario">
        <div class="meta">${escaparHtml(c.autor)} · ${formatarData(c.created_at)}</div>
        ${escaparHtml(c.comentario)}
      </div>
    `).join('') || '<p class="texto-suave">Nenhum comentário ainda.</p>';

    painelDetalhe.innerHTML = `
      <h3 class="mt-0">Solicitação #${app.id}</h3>
      <p><strong>Empreendedor:</strong> ${escaparHtml(app.empreendedor)}</p>
      <p><strong>CPF:</strong> ${escaparHtml(app.cpf)}</p>
      <p><strong>Negócio:</strong> ${escaparHtml(app.negocio_nome || '—')} (${escaparHtml(app.negocio_categoria || '—')})</p>
      <p><strong>Bairro:</strong> ${escaparHtml(app.negocio_bairro || '—')}</p>

      <div class="form-grupo">
        <label for="select-status">Status da solicitação</label>
        <select id="select-status">
          ${['Recebido','Em análise','Aguardando informações','Em processamento','Concluído']
            .map((s) => `<option value="${s}" ${s === app.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primario btn-bloco btn-pequeno" id="btn-salvar-status">Atualizar status</button>

      <h4 style="margin-top:22px;">Comentários / pendências</h4>
      <div id="lista-comentarios">${comentarios}</div>

      <div class="form-grupo" style="margin-top:12px;">
        <label for="novo-comentario">Adicionar comentário</label>
        <textarea id="novo-comentario" rows="2" placeholder="Ex: Necessário confirmar atividade econômica principal."></textarea>
      </div>
      <button class="btn btn-outline btn-bloco btn-pequeno" id="btn-comentar">Registrar comentário</button>
      <div id="msg-detalhe"></div>
    `;

    document.getElementById('btn-salvar-status').addEventListener('click', async () => {
      const novoStatus = document.getElementById('select-status').value;
      try {
        await Api.atualizarStatusMei(app.id, novoStatus);
        document.getElementById('msg-detalhe').innerHTML = '<div class="alerta alerta-sucesso">Status atualizado.</div>';
        carregarSolicitacoes();
        abrirDetalhe(app.id);
      } catch (err) {
        document.getElementById('msg-detalhe').innerHTML = `<div class="alerta alerta-erro">${escaparHtml(err.message)}</div>`;
      }
    });

    document.getElementById('btn-comentar').addEventListener('click', async () => {
      const texto = document.getElementById('novo-comentario').value.trim();
      if (!texto) return;
      try {
        await Api.comentarMei(app.id, texto, 'Equipe de Assistência');
        abrirDetalhe(app.id); // recarrega com o novo comentário
      } catch (err) {
        document.getElementById('msg-detalhe').innerHTML = `<div class="alerta alerta-erro">${escaparHtml(err.message)}</div>`;
      }
    });
  } catch (err) {
    painelDetalhe.innerHTML = `<p class="alerta alerta-erro">${escaparHtml(err.message)}</p>`;
  }
}

document.getElementById('filtro-status').addEventListener('change', carregarSolicitacoes);
document.getElementById('filtro-busca').addEventListener('input', () => {
  clearTimeout(window._debounceBusca);
  window._debounceBusca = setTimeout(carregarSolicitacoes, 300);
});

// -------------------- Tabela de sugestões --------------------
const corpoSugestoes = document.getElementById('corpo-tabela-sugestoes');

async function carregarSugestoes() {
  corpoSugestoes.innerHTML = '<tr><td colspan="6" class="texto-suave">Carregando...</td></tr>';
  try {
    const lista = await Api.listarSugestoes();
    if (lista.length === 0) {
      corpoSugestoes.innerHTML = '<tr><td colspan="6" class="texto-suave">Nenhuma sugestão recebida ainda.</td></tr>';
      return;
    }
    corpoSugestoes.innerHTML = lista.map((s) => `
      <tr>
        <td>${escaparHtml(s.nome)}</td>
        <td>${escaparHtml(s.categoria)}</td>
        <td>${escaparHtml(s.bairro || '—')}</td>
        <td>${escaparHtml(s.contato || '—')}</td>
        <td>${badgeStatus(s.status)}</td>
        <td>
          <select data-id="${s.id}" class="select-status-sugestao">
            ${['Novo','Em avaliação','Adicionado ao mapa','Descartado']
              .map((st) => `<option value="${st}" ${st === s.status ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');

    corpoSugestoes.querySelectorAll('.select-status-sugestao').forEach((select) => {
      select.addEventListener('change', async () => {
        try {
          await Api.atualizarStatusSugestao(select.dataset.id, select.value);
        } catch (err) {
          alert('Erro ao atualizar: ' + err.message);
        }
      });
    });
  } catch (err) {
    corpoSugestoes.innerHTML = `<tr><td colspan="6" class="texto-suave">Erro: ${escaparHtml(err.message)}</td></tr>`;
  }
}

carregarSolicitacoes();
carregarSugestoes();
