import { Document, Paragraph, TextRun, Packer, HeadingLevel, AlignmentType } from "docx";
import { ContractOptions } from "./contractGenerator.ts";

export async function generateContractDocxBuffer(opts: ContractOptions): Promise<Buffer> {
  const { lead, contratante } = opts;
  const valor = lead.valor || 750;
  const valorFormatado = valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const temManutencao = !!(lead.manutencao && lead.manutencao > 0);
  const valorManutencao = lead.manutencao || 0;
  const formaPagamento = opts.formaPagamento || "50% de entrada no início do projeto e 50% após a aprovação e publicação final";
  const prazoEntrega = opts.prazoEntrega || "7 (sete) dias úteis";
  const rodadasAjustes = opts.rodadasAjustes || "2 (duas)";
  const cidadeAssinatura = contratante.cidadeUf || "São Paulo / SP";

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Criação, Redesign e Publicação de Página na Internet",
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "CONTRATANTE: ", bold: true }),
              new TextRun({ text: `${lead.nome}, ${lead.docCliente ? 'CPF/CNPJ ' + lead.docCliente : '[CPF/CNPJ a preencher]'}, com endereço em ${lead.endCliente || '[Endereço a preencher]'}, ${lead.cidade || 'Brasil'}.` }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "CONTRATADO(A): ", bold: true }),
              new TextRun({ text: `${contratante.nome || 'Prestador'}, CPF/CNPJ ${contratante.cpfCnpj || '00.000.000/0001-00'}, com sede em ${contratante.endereco || 'Endereço'}, ${contratante.cidadeUf || 'São Paulo / SP'}.` }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "As partes acima identificadas celebram o presente contrato de prestação de serviços de desenvolvimento digital, que se regerá pelas cláusulas seguintes.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Cláusula 1ª — Do objeto",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: `O presente contrato tem por objeto o redesign, modernização e publicação da página na internet do CONTRATANTE${lead.siteAntigo ? ` (versão anterior: ${lead.siteAntigo})` : ''}, compreendendo arquitetura de informação, design responsivo para smartphones e desktops, e publicação oficial no endereço ${lead.urlNova || 'https://site.cliente.com.br'}.`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Cláusula 2ª — Do valor e forma de pagamento",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: `Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO(A) o valor total de R$ ${valorFormatado}, conforme as seguintes condições: ${formaPagamento}.`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Cláusula 3ª — Do prazo de entrega",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: `A versão completa da página será disponibilizada para validação em até ${prazoEntrega}, contados a partir da assinatura. Estão inclusas ${rodadasAjustes} rodadas de ajustes.`,
            spacing: { after: 200 },
          }),
          ...(temManutencao ? [
            new Paragraph({
              text: "Cláusula 4ª — Da manutenção mensal",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: `O CONTRATANTE contrata adicionalmente a manutenção e hospedagem contínua, pelo valor de R$ ${valorManutencao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} mensais.`,
              spacing: { after: 200 },
            })
          ] : []),
          new Paragraph({
            text: `${cidadeAssinatura}, Data da Assinatura.`,
            spacing: { before: 400, after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "_____________________________________\n", bold: true }),
              new TextRun({ text: `${lead.nome}\nCONTRATANTE` }),
            ],
            spacing: { before: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "_____________________________________\n", bold: true }),
              new TextRun({ text: `${contratante.nome}\nCONTRATADO(A)` }),
            ],
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
