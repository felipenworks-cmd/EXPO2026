// ============================================================
// cadastro.js — formulário de cadastro em 5 etapas
// ============================================================

const TOTAL_ETAPAS = 5;
let etapaAtual = 1;

const form = document.getElementById('form-cadastro');
const btnAvancar = document.getElementById('btn-avancar');
const btnVoltar = document.getElementById('btn-voltar');
const btnEnviar = document.getElementById('btn-enviar');

formatarCpfInput(document.getElementById('cpf'));
formatarTelefoneInput(document.getElementById('telefone_pessoal'));
formatarTelefoneInput(document.getElementById('telefone_negocio'));

// Campos obrigatórios de cada etapa (para validação)
const CAMPOS_POR_ETAPA = {
  1: ['nome_empreendedor', 'cpf', 'telefone_pessoal', 'email_pessoal'],
  2: ['nome_negocio', 'categoria', 'endereco', 'bairro', 'cidade', 'estado'],
  3: ['atividade_principal'],
  4: [],
  5: []
};

// Regras específicas de validação por campo
const VALIDADORES = {
  nome_empreendedor: (v) => v.trim().length >= 3,
  cpf: (v) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v.trim()),
  telefone_pessoal: (v) => v.replace(/\D/g, '').length >= 10,
  email_pessoal: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  nome_negocio: (v) => v.trim().length >= 2,
  categoria: (v) => v.trim().length > 0,
  endereco: (v) => v.trim().length > 0,
  bairro: (v) => v.trim().length > 0,
  cidade: (v) => v.trim().length > 0,
  estado: (v) => /^[A-Za-z]{2}$/.test(v.trim()),
  atividade_principal: (v) => v.trim().length > 0
};

function validarCampo(nome) {
  const campo = form.elements[nome];
  const grupo = campo.closest('.form-grupo');
  const mensagemErro = grupo ? grupo.querySelector('.mensagem-erro') : null;
  const valido = VALIDADORES[nome] ? VALIDADORES[nome](campo.value) : true;

  campo.classList.toggle('campo-invalido', !valido);
  if (mensagemErro) mensagemErro.classList.toggle('visivel', !valido);
  return valido;
}

function validarEtapa(numero) {
  const campos = CAMPOS_POR_ETAPA[numero] || [];
  let todosValidos = true;
  campos.forEach((nome) => {
    if (!validarCampo(nome)) todosValidos = false;
  });
  return todosValidos;
}

// Valida em tempo real (ao sair do campo) para feedback imediato
Object.keys(VALIDADORES).forEach((nome) => {
  const campo = form.elements[nome];
  if (campo) campo.addEventListener('blur', () => validarCampo(nome));
});

function mostrarEtapa(numero) {
  document.querySelectorAll('.etapa-painel').forEach((painel) => {
    painel.classList.toggle('ativa', Number(painel.dataset.etapa) === numero);
  });
  document.querySelectorAll('.etapa-bolha').forEach((bolha) => {
    const n = Number(bolha.dataset.etapa);
    bolha.classList.toggle('ativa', n === numero);
    bolha.classList.toggle('concluida', n < numero);
  });

  btnVoltar.disabled = numero === 1;
  btnAvancar.classList.toggle('oculto', numero === TOTAL_ETAPAS);
  btnEnviar.classList.toggle('oculto', numero !== TOTAL_ETAPAS);

  if (numero === 4) montarRevisao();
}

btnAvancar.addEventListener('click', () => {
  if (!validarEtapa(etapaAtual)) return; // não avança com campos inválidos
  if (etapaAtual < TOTAL_ETAPAS) {
    etapaAtual++;
    mostrarEtapa(etapaAtual);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

btnVoltar.addEventListener('click', () => {
  if (etapaAtual > 1) {
    etapaAtual--;
    mostrarEtapa(etapaAtual);
  }
});

function montarRevisao() {
  const dados = new FormData(form);
  const area = document.getElementById('area-revisao');
  area.innerHTML = `
    <div class="revisao-bloco">
      <h4>Dados pessoais</h4>
      <div class="revisao-linha"><span>Nome</span><span>${escaparHtml(dados.get('nome_empreendedor'))}</span></div>
      <div class="revisao-linha"><span>CPF</span><span>${escaparHtml(dados.get('cpf'))}</span></div>
      <div class="revisao-linha"><span>Telefone</span><span>${escaparHtml(dados.get('telefone_pessoal'))}</span></div>
      <div class="revisao-linha"><span>E-mail</span><span>${escaparHtml(dados.get('email_pessoal'))}</span></div>
    </div>
    <div class="revisao-bloco">
      <h4>Negócio</h4>
      <div class="revisao-linha"><span>Nome</span><span>${escaparHtml(dados.get('nome_negocio'))}</span></div>
      <div class="revisao-linha"><span>Categoria</span><span>${escaparHtml(dados.get('categoria'))}</span></div>
      <div class="revisao-linha"><span>Endereço</span><span>${escaparHtml(dados.get('endereco'))}, ${escaparHtml(dados.get('numero') || 's/n')} — ${escaparHtml(dados.get('bairro'))}</span></div>
      <div class="revisao-linha"><span>Cidade/UF</span><span>${escaparHtml(dados.get('cidade'))}/${escaparHtml(dados.get('estado'))}</span></div>
    </div>
    <div class="revisao-bloco">
      <h4>Atividade econômica</h4>
      <div class="revisao-linha"><span>Atividade principal</span><span>${escaparHtml(dados.get('atividade_principal'))}</span></div>
      <div class="revisao-linha"><span>Funcionamento</span><span>${escaparHtml(dados.get('funcionamento') || 'Não informado')}</span></div>
    </div>
    <p class="texto-suave">Se algo estiver incorreto, use o botão "Voltar" para corrigir antes de enviar.</p>
  `;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validarEtapa(1) || !validarEtapa(2) || !validarEtapa(3)) {
    document.getElementById('alerta-envio').innerHTML =
      '<div class="alerta alerta-erro">Há campos obrigatórios não preenchidos corretamente. Revise as etapas anteriores.</div>';
    return;
  }

  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  const dados = Object.fromEntries(new FormData(form).entries());

  // Coordenadas ilustrativas geradas no navegador (demonstração):
  // em um cenário real, viriam de um serviço de geocodificação a
  // partir do endereço informado.
  dados.latitude = -23.5620 + (Math.random() - 0.5) * 0.02;
  dados.longitude = -46.6560 + (Math.random() - 0.5) * 0.02;

  try {
    const resultado = await Api.cadastrarNegocio(dados);
    document.getElementById('alerta-envio').innerHTML = `
      <div class="alerta alerta-sucesso">
        ✅ Cadastro enviado com sucesso! Seu número de protocolo de formalização é
        <strong>#${resultado.mei_application_id}</strong>. Guarde este número — você pode consultá-lo
        na página <a href="formalizacao.html">Formalização</a>.
      </div>`;
    form.reset();
    etapaAtual = 1;
    mostrarEtapa(1);
    btnEnviar.classList.add('oculto');
    btnAvancar.classList.remove('oculto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    document.getElementById('alerta-envio').innerHTML =
      `<div class="alerta alerta-erro">Não foi possível concluir o cadastro: ${escaparHtml(err.message)}</div>`;
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Cadastro enviado com sucesso ✓';
  }
});

mostrarEtapa(1);
