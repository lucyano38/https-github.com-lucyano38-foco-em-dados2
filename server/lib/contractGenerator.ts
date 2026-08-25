import { Lead, ContratanteConfig } from "./crmStore.ts";

export interface ContractOptions {
  lead: Lead;
  contratante: ContratanteConfig;
  formaPagamento?: string;
  prazoEntrega?: string;
  rodadasAjustes?: string;
}

function extenso(valor: number): string {
  // Conversão básica ou formatada em reais
  return `${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} reais`;
}

function dataPorExtenso(dataStr?: string): string {
  const data = dataStr ? new Date(dataStr + "T12:00:00") : new Date();
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
}

export function generateContractHtml(opts: ContractOptions): string {
  const { lead, contratante } = opts;
  const valor = lead.valor || 750;
  const valorExtenso = extenso(valor);
  const temManutencao = !!(lead.manutencao && lead.manutencao > 0);
  const valorManutencao = lead.manutencao || 0;
  const formaPagamento = opts.formaPagamento || "50% de entrada no início do projeto e 50% após a aprovação e publicação final";
  const prazoEntrega = opts.prazoEntrega || "7 (sete) dias úteis";
  const rodadasAjustes = opts.rodadasAjustes || "2 (duas)";
  const cidadeAssinatura = contratante.cidadeUf || "São Paulo / SP";
  const dataExtenso = dataPorExtenso(lead.contratoEm || lead.dataProposta);

  const docClienteLabel = lead.docCliente && lead.docCliente.length > 14 ? "inscrita no CNPJ" : "inscrito(a) no CPF";
  const docContratanteLabel = contratante.cpfCnpj && contratante.cpfCnpj.length > 14 ? "inscrita no CNPJ" : "inscrito(a) no CPF";

  const clausulaManutencao = temManutencao
    ? `<h2>Cláusula 4ª — Da manutenção mensal e hospedagem</h2>
<p>O CONTRATANTE contrata adicionalmente o serviço contínuo de manutenção, segurança e hospedagem da página (incluindo pequenas atualizações de texto, contatos, fotos e suporte técnico prioritário), pelo valor recorrente de <b>R$ ${valorManutencao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} mensais</b>, com vigência a partir da publicação e renovação automática a cada 30 (trinta) dias.</p>`
    : "";

  const nConteudo = temManutencao ? 5 : 4;
  const nHospedagem = temManutencao ? 6 : 5;
  const nRescisao = temManutencao ? 7 : 6;
  const nForo = temManutencao ? 8 : 7;

  const textoHospedagem = temManutencao
    ? "A página permanecerá hospedada em infraestrutura de alta performance e disponibilidade administrada pelo CONTRATADO(A) enquanto vigorar o serviço de manutenção mensal contratado."
    : "A página será entregue publicada no ambiente acordado. A contratação e renovação de domínio e hospedagem próprios são de responsabilidade do CONTRATANTE, contando com o suporte técnico do CONTRATADO(A) durante o processo de migração e ativação.";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Contrato de Prestação de Serviços — ${lead.nome}</title>
<style>
@page{size:A4;margin:2.2cm}
body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;line-height:1.65;font-size:12pt;margin:0;background:#F4F1EA;padding:40px 16px}
.folha{background:#fff;max-width:21cm;margin:0 auto;padding:2.2cm;box-shadow:0 12px 40px rgba(0,0,0,.12);border-radius:6px}
.print-bar{position:fixed;top:16px;right:20px;display:flex;gap:10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;z-index:9999}
.print-bar button{border:0;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;background:#4285F4;color:#fff;box-shadow:0 4px 12px rgba(66,133,244,0.3);transition:all .15s}
.print-bar button:hover{background:#3367D6;transform:translateY(-1px)}
.print-bar .btn-secondary{background:#333;box-shadow:none}
.print-bar .btn-secondary:hover{background:#111}
h1{font-size:14pt;text-align:center;text-transform:uppercase;letter-spacing:.06em;margin:0 0 24px;color:#111}
h2{font-size:12pt;margin:20px 0 8px;color:#222;border-bottom:1px solid #eee;padding-bottom:4px}
p{margin:8px 0;text-align:justify;color:#2b2b2b}
.partes p{margin:6px 0;line-height:1.5}
.destaque{background:#FEF9C3;padding:1px 4px;border-radius:3px}
.assinaturas{margin-top:56px;display:flex;gap:40px;justify-content:space-between;page-break-inside:avoid}
.assinaturas div{flex:1;text-align:center}
.linha{border-top:1px solid #1a1a1a;margin-bottom:6px;padding-top:6px}
.aviso{margin-top:36px;font-size:8.5pt;color:#777;border-top:1px solid #ddd;padding-top:10px;font-family:-apple-system,sans-serif}
.local-data{margin-top:36px}
@media print{
  .aviso{position:fixed;bottom:0}
  body{background:#fff;padding:0}
  .folha{box-shadow:none;border-radius:0;max-width:none;padding:0}
  .print-bar{display:none}
}
</style>
</head>
<body>
<div class="print-bar">
  <button onclick="window.print()">🖨 Imprimir / Salvar em PDF</button>
  <button class="btn-secondary" onclick="window.close()">✕ Fechar</button>
</div>

<div class="folha">
<h1>Contrato de Prestação de Serviços<br><span style="font-size:11pt;color:#555">Criação, Redesign e Publicação de Página na Internet</span></h1>

<div class="partes">
<p><b>CONTRATANTE:</b> ${lead.nome}, ${docClienteLabel} sob o nº ${lead.docCliente || '<span class="destaque">[CPF/CNPJ a preencher]</span>'}, com endereço em ${lead.endCliente || '<span class="destaque">[Endereço a preencher]</span>'}, ${lead.cidade || 'Brasil'}.</p>
<p><b>CONTRATADO(A):</b> ${contratante.nome || 'Prestador de Serviços'}, ${docContratanteLabel} sob o nº ${contratante.cpfCnpj || '00.000.000/0001-00'}, com sede em ${contratante.endereco || 'Endereço'}, ${contratante.cidadeUf || 'São Paulo / SP'}.</p>
</div>

<p>As partes acima identificadas celebram o presente contrato de prestação de serviços de desenvolvimento e consultoria digital, que se regerá pelas cláusulas seguintes.</p>

<h2>Cláusula 1ª — Do objeto</h2>
<p>O presente contrato tem por objeto o redesign, modernização e publicação da página na internet do CONTRATANTE ${lead.siteAntigo ? `(versão anterior: ${lead.siteAntigo})` : ''}, compreendendo: arquitetura de informação otimizada, design visual responsivo adaptado para smartphones e desktops, otimização de velocidade de carregamento, integração com canais de atendimento direto via WhatsApp e publicação oficial no endereço ${lead.urlNova || 'https://site.cliente.com.br'}.</p>

<h2>Cláusula 2ª — Do valor e forma de pagamento</h2>
<p>Pelos serviços prestados e descritos na Cláusula 1ª, o CONTRATANTE pagará ao CONTRATADO(A) o valor total de <b>R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${valorExtenso})</b>, conforme as seguintes condições de pagamento: ${formaPagamento}.</p>

<h2>Cláusula 3ª — Do prazo de entrega e aprovação</h2>
<p>A versão completa da página será disponibilizada para validação em até ${prazoEntrega}, contados a partir da assinatura deste instrumento e do fornecimento dos materiais básicos necessários pelo CONTRATANTE. Estão inclusas ${rodadasAjustes} rodadas formais de ajustes de layout, textos e fotos antes da publicação final.</p>

${clausulaManutencao}

<h2>Cláusula ${nConteudo}ª — Do conteúdo e propriedade intelectual</h2>
<p>O CONTRATANTE declara ser o legítimo titular ou possuir autorização expressa para uso de logotipos, imagens, textos e marcas fornecidos para inclusão no projeto. O CONTRATADO(A) assegura a entrega do código-fonte limpo e estruturado para utilização pelo CONTRATANTE.</p>

<h2>Cláusula ${nHospedagem}ª — Da hospedagem e infraestrutura</h2>
<p>${textoHospedagem}</p>

<h2>Cláusula ${nRescisao}ª — Da rescisão</h2>
<p>O presente instrumento poderá ser rescindido por qualquer das partes mediante notificação por escrito com antecedência mínima de 15 (quinze) dias. Em caso de rescisão antecipada sem justa causa após o início do desenvolvimento, será devido o valor proporcional aos serviços já executados.</p>

<h2>Cláusula ${nForo}ª — Do foro</h2>
<p>Para dirimir quaisquer dúvidas ou litígios decorrentes da execução deste contrato, as partes elegem o foro da Comarca de ${cidadeAssinatura}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>

<p class="local-data">${cidadeAssinatura}, ${dataExtenso}.</p>

<div class="assinaturas">
  <div>
    <div class="linha"></div>
    <b>${lead.nome}</b><br>
    <span style="font-size:10pt;color:#555">CONTRATANTE</span>
  </div>
  <div>
    <div class="linha"></div>
    <b>${contratante.nome}</b><br>
    <span style="font-size:10pt;color:#555">CONTRATADO(A)</span>
  </div>
</div>

<p class="aviso">Documento gerado automaticamente pelo Ecossistema Integrado de Gestão e IA Gemini. Recomenda-se a conferência prévia dos dados antes da assinatura formal.</p>
</div>
</body>
</html>`;
}
