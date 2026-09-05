import React from 'react';
import { Phone, Utensils, Clock, MapPin, ShoppingBag, Star, CheckCircle } from 'lucide-react';

const heroFoodImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
const itemImages = [
  'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
];

export default function PreviewRedesign() {
  const params = new URLSearchParams(window.location.search);
  const nomeEmpresa = params.get('nome') || 'Piaia Salgados';
  const nichoEmpresa = params.get('nicho') || 'Restaurantes & Gastronomia';
  const cidadeEmpresa = params.get('cidade') || 'Itupeva';

  const waEmpresa = `https://wa.me/5511994411307?text=${encodeURIComponent(
    `Olá! Vi o novo site modelo para o ${nomeEmpresa} e gostaria de ativá-lo.`
  )}`;
  const waPedido = `https://wa.me/5511994411307?text=${encodeURIComponent(
    `Olá ${nomeEmpresa}, gostaria de fazer um pedido!`
  )}`;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Topo Flutuante — Proposta Comercial */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 px-4 py-3 font-bold text-xs md:text-sm flex flex-col md:flex-row justify-between items-center shadow-2xl gap-2">
        <div className="flex items-center gap-2 text-center md:text-left">
          <span className="bg-stone-950 text-amber-400 px-2 py-1 rounded text-xs uppercase tracking-wider">
            Demonstração de Redesign
          </span>
          <span>Modelo de Site Comercial gerado para <strong>{nomeEmpresa}</strong></span>
        </div>
        <a
          href={waEmpresa}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-stone-950 hover:bg-stone-900 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Aprovar Este Site por R$ 39,90/mês</span>
        </a>
      </div>

      {/* Hero com Imagem de Fundo */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('${heroFoodImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />

        <div className="relative z-10 max-w-3xl mx-auto pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full text-xs font-semibold mb-6 backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>O sabor mais tradicional de {cidadeEmpresa}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
            {nomeEmpresa}
          </h1>

          <p className="text-stone-300 text-base md:text-lg max-w-xl mx-auto mb-8 font-medium">
            Salgados artesanais, porções crocantes e receitas exclusivas feitas com ingredientes selecionados todos os dias.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#cardapio"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-8 py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ver Cardápio & Fazer Pedido</span>
            </a>
            
            <a
              href={waPedido}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-white font-bold px-8 py-4 rounded-xl text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>Pedir pelo WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Cardápio Destaque */}
      <section id="cardapio" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Destaques do Cardápio</h2>
          <p className="text-stone-400 text-sm">Escolha seus favoritos e faça seu pedido direto pelo WhatsApp</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { img: itemImages[0], title: 'Cento de Salgados Sortidos', price: 'R$ 65,00', desc: 'Coxinhas, kibe, bolinha de queijo e risoles fritos na hora.' },
            { img: itemImages[1], title: 'Combo Família Especial', price: 'R$ 89,90', desc: '50 salgados + Guaraná 2L + Doce artesanal de brinde.' },
            { img: itemImages[2], title: 'Lanche da Casa Gourmet', price: 'R$ 28,00', desc: 'Pão artesanal, hambúrguer 180g, queijo derretido e molho especial.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/50 transition-all">
              <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                  <span className="text-amber-400 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg">{item.price}</span>
                </div>
                <p className="text-xs text-stone-400 mb-6">{item.desc}</p>
                <a
                  href={waPedido}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs rounded-xl text-stone-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedir pelo WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Informações Práticas */}
      <section className="py-12 bg-stone-900/50 border-t border-b border-stone-800 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Horário de Atendimento</h4>
              <p className="text-xs text-stone-400">Terça a Domingo: 10h às 22h</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Localização</h4>
              <p className="text-xs text-stone-400">{cidadeEmpresa} - SP</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Opções de Atendimento</h4>
              <p className="text-xs text-stone-400">Entrega / Retirada no Local</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
