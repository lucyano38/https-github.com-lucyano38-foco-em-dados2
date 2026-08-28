import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, Download, FileText, CheckCircle2, Shield, Mail, Copy, Check } from 'lucide-react';
import { Lead, ContratanteConfig } from '../types';

interface ContractModalProps {
  lead: Lead | null;
  contratante: ContratanteConfig;
  onClose: () => void;
  onUpdateStatus?: (status: 'pendente' | 'enviado' | 'assinado') => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  lead,
  contratante,
  onClose,
  onUpdateStatus,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showEmailDraft, setShowEmailDraft] = useState(false);

  if (!lead) return null;

  const contractUrl = `/api/contract-preview/${lead.slug}`;
  const docxUrl = `/api/contract-docx/${lead.slug}`;

  const emailDraft = `Olá ${lead.nome}, tudo bem?

É um prazer avançarmos com o nosso projeto! Segue em anexo a minuta do Contrato de Prestação de Serviços (em formato Word .docx e A4) referente à criação e publicação da sua nova página profissional no valor total de R$ ${lead.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '750,00'}.

Pedimos que revise os dados cadastrais (em destaque amarelo), preencha as informações solicitadas (caso necessário), assine e nos envie de volta por aqui ou por e-mail.

Ficamos à disposição para qualquer dúvida.

Atenciosamente,
${contratante.nome || 'Equipe Foco Completo'}
${contratante.cidadeUf || ''}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailDraft);
    setCopiedEmail(true);
    if (onUpdateStatus && lead.contratoStatus === 'pendente') {
      onUpdateStatus('enviado');
    }
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900/80 backdrop-blur-sm">
        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-neutral-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-100">
                  Contrato de Prestação de Serviços
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-neutral-800 text-amber-300 border border-neutral-700">
                  {lead.nome}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Minuta A4 e Word (.docx travado) gerados automaticamente
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onUpdateStatus && (
              <div className="flex items-center gap-1.5 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700">
                <span className="text-xs text-neutral-400 pl-2 font-medium">Status:</span>
                {(['pendente', 'enviado', 'assinado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(st)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition capitalize cursor-pointer ${
                      lead.contratoStatus === st
                        ? st === 'assinado'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : st === 'enviado'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-neutral-700 text-white shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowEmailDraft(!showEmailDraft)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                showEmailDraft ? 'bg-amber-500 text-neutral-950 border-amber-400' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              {showEmailDraft ? 'Ocultar E-mail' : 'Rascunho de E-mail'}
            </button>

            <a
              href={docxUrl}
              onClick={() => {
                if (onUpdateStatus && lead.contratoStatus === 'pendente') {
                  onUpdateStatus('enviado');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
              title="Baixar versão Word (.docx) com campos editáveis"
            >
              <Download className="w-4 h-4" />
              Baixar .DOCX
            </a>

            <button
              onClick={() => {
                const frame = document.getElementById('contract-iframe') as HTMLIFrameElement;
                if (frame && frame.contentWindow) {
                  frame.contentWindow.focus();
                  frame.contentWindow.print();
                } else {
                  window.open(contractUrl, '_blank');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Email Draft Drawer */}
        {showEmailDraft && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-950 border-b border-neutral-800 px-6 py-4"
          >
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Rascunho para Envio ao Cliente (WhatsApp / E-mail)
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEmail ? 'Copiado!' : 'Copiar Texto'}
                </button>
              </div>
              <textarea
                readOnly
                value={emailDraft}
                rows={6}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 font-mono resize-none focus:outline-hidden"
              />
            </div>
          </motion.div>
        )}

        {/* Contract Preview Frame */}
        <div className="flex-1 bg-neutral-900/60 p-4 sm:p-6 overflow-hidden flex justify-center items-center">
          <div className="w-full max-w-4xl h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-300">
            <iframe
              id="contract-iframe"
              src={contractUrl}
              className="w-full h-full border-0"
              title={`Contrato ${lead.nome}`}
            />
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
