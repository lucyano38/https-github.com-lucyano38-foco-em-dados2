import React, { useRef } from 'react';
import { X, Download, Send, FileText } from 'lucide-react';

interface ContratoData {
  id: string;
  empresa: string;
  tipo: string;
  valor: number;
  status: string;
}

interface ContractModalProps {
  contrato: ContratoData | null;
  onClose: () => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ contrato, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!contrato) return null;

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const valorFormatado = `R$ ${contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const mesalidade = contrato.tipo.includes('SaaS') ? valorFormatado : 'R$ 39,90';

  const handleDownload = () => {
    const content = printRef.current?.innerHTML || '';
    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Contrato - ${contrato.empresa}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.6; }
  h1 { font-size: 18px; text-align: center; border-bottom: 2px solid #d4a574; padding-bottom: 12px; }
  h2 { font-size: 14px; margin-top: 24px; color: #d4a574; }
  .header { text-align: center; margin-bottom: 32px; }
  .header .logo { font-size: 24px; font-weight: 800; color: #d4a574; }
  .header .sub { font-size: 11px; color: #666; }
  .clausula { margin: 12px 0; padding: 12px; background: #f9f9f9; border-left: 3px solid #d4a574; font-size: 12px; }
  .valor-box { text-align: center; padding: 20px; background: #fef3e2; border-radius: 8px; margin: 20px 0; }
  .valor-box .valor { font-size: 28px; font-weight: 800; color: #d4a574; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
  .assinatura { margin-top: 48px; display: flex; justify-content: space-between; }
  .assinatura .line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 8px; font-size: 11px; }
  @media print { body { padding: 20px; } }
</style></head><body>
${content}
</body></html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrato_${contrato.empresa.replace(/\s+/g, '_')}_${contrato.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`📄 Contrato Foco em Dados\n\nEmpresa: ${contrato.empresa}\nTipo: ${contrato.tipo}\nValor: ${valorFormatado}\n\nPor favor, revise e assine o contrato em anexo.`);
    window.open(`https://wa.me/5511994411307?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-sm">Contrato — {contrato.empresa}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg flex items-center gap-1 cursor-pointer">
              <Download className="w-3 h-3" /> Download HTML
            </button>
            <button onClick={handleWhatsApp} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg flex items-center gap-1 cursor-pointer">
              <Send className="w-3 h-3" /> Enviar WhatsApp
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contract Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef} className="max-w-xl mx-auto">
            {/* Logo / Header */}
            <div className="header">
              <div className="logo">FOCO EM DADOS</div>
              <div className="sub">Soluções Digitais para Empresas Locais</div>
            </div>

            <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>

            <p style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>
              Contrato nº {contrato.id.toUpperCase()} • Celebrado em {hoje}
            </p>

            <div className="clausula">
              <strong>CLÁUSULA 1ª — PARTES</strong><br />
              <strong>CONTRATANTE:</strong> Foco em Dados LTDA, CNPJ: 00.000.000/0001-00<br />
              <strong>CONTRATADO(A):</strong> {contrato.empresa}
            </div>

            <div className="clausula">
              <strong>CLÁUSULA 2ª — OBJETO</strong><br />
              Prestação de serviços de {contrato.tipo}, incluindo:
              <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 12 }}>
                <li>Criação/redesign de site profissional otimizado para SEO</li>
                <li>Integração com WhatsApp Business para atendimento automatizado</li>
                <li>Agente de IA para atendimento 24/7</li>
                <li>Hospedagem, manutenção e suporte técnico contínuo</li>
                <li>Painel de métricas e analytics em tempo real</li>
              </ul>
            </div>

            <div className="valor-box">
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>VALOR TOTAL DO CONTRATO</div>
              <div className="valor">{valorFormatado}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                {contrato.tipo.includes('SaaS')
                  ? 'Mensalidade recorrente'
                  : `Implantação: ${valorFormatado} + Mensalidade: ${mesalidade}/mês`}
              </div>
            </div>

            <div className="clausula">
              <strong>CLÁUSULA 3ª — ATENDIMENTO POR IA</strong><br />
              O CONTRATANTE declara que utilizará agentes de inteligência artificial (Agente Hermes / OpenSquad) para
              otimizar processos internos, incluindo prospecção, atendimento ao cliente e geração de conteúdo.
              O uso da IA é complementar e não substitui o atendimento humano profissional.
            </div>

            <div className="clausula">
              <strong>CLÁUSULA 4ª — VIGÊNCIA</strong><br />
              O presente contrato terá vigência de 12 (doze) meses, contados a partir da data de assinatura,
              com renovação automática por períodos iguais, salvo manifestação contrária de qualquer das partes
              com antecedência mínima de 30 (trinta) dias.
            </div>

            <div className="clausula">
              <strong>CLÁUSULA 5ª — GARANTIA</strong><br />
              O CONTRATANTE oferece garantia de 30 (trinta) dias para ajustes e correções no site entregue,
              sem custo adicional. Após este período, alterações estarão sujeitas a orçamento aparte.
            </div>

            {/* Signatures */}
            <div className="assinatura">
              <div className="line">
                Foco em Dados<br /><span style={{ fontSize: 10, color: '#999' }}>Contratante</span>
              </div>
              <div className="line">
                {contrato.empresa}<br /><span style={{ fontSize: 10, color: '#999' }}>Contratado(a)</span>
              </div>
            </div>

            <div className="footer">
              Foco em Dados • atendimento@focoemdados.com.br • (11) 99441-1307<br />
              Este documento foi gerado automaticamente pelo sistema Foco em Dados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
