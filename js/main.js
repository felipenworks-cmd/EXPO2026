// ============================================================
// main.js — comportamento comum a todas as páginas
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const botaoMenu = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-menu');

  if (botaoMenu && menu) {
    botaoMenu.addEventListener('click', () => {
      menu.classList.toggle('aberto');
    });
    // Fecha o menu ao clicar em um link (útil no celular)
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => menu.classList.remove('aberto'));
    });
  }
});

/** Formata um valor de CPF enquanto o usuário digita: 000.000.000-00 */
function formatarCpfInput(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
  });
}

/** Formata telefone: (00) 00000-0000 */
function formatarTelefoneInput(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) {
      v = v.replace(/(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    input.value = v;
  });
}

/** Escapa texto simples antes de inserir em innerHTML, evitando XSS básico. */
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

/** Formata data ISO do SQLite para dd/mm/aaaa hh:mm */
function formatarData(dataIso) {
  if (!dataIso) return '';
  const d = new Date(dataIso.replace(' ', 'T') + 'Z');
  if (isNaN(d.getTime())) return dataIso;
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
