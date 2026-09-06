import React, { useState } from 'react';
import { Phone, Utensils, Clock, MapPin, ShoppingBag, Star, CheckCircle, ArrowRight, MessageCircle, ChevronDown, Leaf, Flame, Award } from 'lucide-react';

const heroFoodImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=85';
const itemImages = [
  'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
];

const galleryImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
];

const menuItems = [
  { img: itemImages[0], title: 'Cento de Salgados Sortidos', price: 'R$ 65,00', tag: 'Mais Pedido', desc: 'Coxinhas, kibe, bolinha de queijo e risoles fritos na hora. Ingredientes frescos selecionados.' },
  { img: itemImages[1], title: 'Combo Família Especial', price: 'R$ 89,90', tag: 'Economize 15%', desc: '50 salgados + Guaraná 2L + Doce artesanal de brinde. Perfeito para reunir a família.' },
  { img: itemImages[2], title: 'Lanche da Casa Gourmet', price: 'R$ 28,00', tag: '', desc: 'Pão artesanal, hambúrguer 180g, queijo derretido e molho da casa. Irresistível.' },
  { img: itemImages[3], title: 'Salada Tropical Premium', price: 'R$ 32,00', tag: 'Saudável', desc: 'Folhas verdes, frutas tropicais, nozes caramelizadas e molho de maracujá.' },
  { img: itemImages[4], title: 'Pizza Artesanal Margherita', price: 'R$ 54,00', tag: '', desc: 'Massa fermentada 48h, molho San Marzano, muzzarela de búfala e manjericão fresco.' },
  { img: itemImages[5], title: 'Petisco da Casa', price: 'R$ 42,00', tag: 'Novidade', desc: 'Porção generosa com ingredientes da estação. Acompanha molho especial da casa.' },
];

export default function PreviewRedesign() {
  const params = new URLSearchParams(window.location.search);
  const nomeEmpresa = params.get('nome') || 'Piaia Salgados';
  const cidadeEmpresa = params.get('cidade') || 'Itupeva';
  const [activeMenuCategory, setActiveMenuCategory] = useState('destaques');

  const waEmpresa = `https://wa.me/5511994411307?text=${encodeURIComponent(`Olá! Vi o novo site modelo para o ${nomeEmpresa} e gostaria de ativá-lo.`)}`;
  const waPedido = `https://wa.me/5511994411307?text=${encodeURIComponent(`Olá ${nomeEmpresa}, gostaria de fazer um pedido!`)}`;
  const waReserva = `https://wa.me/5511994411307?text=${encodeURIComponent(`Olá! Gostaria de fazer uma reserva no ${nomeEmpresa}.`)}`;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-100">

      {/* ===== BARRA DE APROVAÇÃO R$ 39,90/mês ===== */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 px-4 py-3 font-bold text-xs md:text-sm flex flex-col sm:flex-row justify-between items-center shadow-2xl gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="bg-stone-950 text-amber-400 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-widest font-black">
            Demonstração
          </span>
          <span className="font-semibold">Modelo de site comercial para <strong className="font-black">{nomeEmpresa}</strong></span>
        </div>
        <a
          href={waEmpresa}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-stone-950 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Aprovar Este Site — R$ 39,90/mês</span>
        </a>
      </div>

      {/* ===== HERO COM IMAGEM DE FUNDO ===== */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroFoodImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/30" />
        <div className="absolute inset-0 bg-stone-950/20" />

        <div className="relative z-10 max-w-3xl mx-auto pt-16 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold mb-8 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>O sabor mais tradicional de {cidadeEmpresa}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-5 leading-[1.05]">
            {nomeEmpresa}
          </h1>

          <p className="text-stone-300 text-base md:text-lg max-w-xl mx-auto mb-10 font-medium leading-relaxed">
            Salgados artesanais, porções crocantes e receitas exclusivas feitas com ingredientes selecionados todos os dias.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#cardapio"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ver Cardápio & Fazer Pedido</span>
            </a>

            <a
              href={waReserva}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 text-white font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 backdrop-blur-sm transition-all hover:border-stone-600"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>Reservar Mesa</span>
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> Ingredientes Frescos</span>
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" /> Fritos na Hora</span>
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" /> Desde 2015</span>
          </div>
        </div>

        <a
          href="#cardapio"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"
        >
          <ChevronDown className="w-6 h-6 text-stone-400" />
        </a>
      </section>

      {/* ===== CARDÁPIO ===== */}
      <section id="cardapio" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Destaques do Cardápio</h2>
          <p className="text-stone-400 text-sm max-w-md mx-auto">Escolha seus favoritos e faça seu pedido direto pelo WhatsApp</p>
        </div>

        {/* Filtros */}
        <div className="flex justify-center gap-2 mb-12">
          {['destaques', 'salgados', 'combos'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveMenuCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMenuCategory === cat
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <div key={idx} className="group bg-stone-900/60 border border-stone-800/80 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/40 transition-all duration-300 hover:shadow-amber-500/5">
              <div className="relative overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {item.tag && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-stone-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                    {item.tag}
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="font-bold text-base text-white leading-snug">{item.title}</h3>
                  <span className="text-amber-400 font-black text-sm bg-amber-500/10 px-3 py-1 rounded-xl whitespace-nowrap border border-amber-500/20">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mb-5 leading-relaxed">{item.desc}</p>
                <a
                  href={waPedido}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-stone-800/80 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs rounded-xl text-stone-200 transition-all flex items-center justify-center gap-2 border border-stone-700/50 hover:border-amber-500"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedir pelo WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== GALERIA ===== */}
      <section className="py-20 px-4 bg-stone-900/30 border-y border-stone-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Nosso Ambiente</h2>
            <p className="text-stone-400 text-sm">Um espaço acolhedor para todas as ocasiões</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden aspect-[4/3] border border-stone-800/50">
                <img src={img} alt={`Ambiente ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">O Que Nossos Clientes Dizem</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { name: 'Maria Clara', text: 'Os salgados são incríveis! Sempre peço para as festas da família. Qualidade e sabor incomparáveis.', rating: 5 },
            { name: 'João Paulo', text: 'Melhor restaurante da região. O atendimento é excepcional e a comida sempre fresca e deliciosa.', rating: 5 },
          ].map((dep, idx) => (
            <div key={idx} className="bg-stone-900/60 border border-stone-800/60 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: dep.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-stone-300 leading-relaxed mb-4">"{dep.text}"</p>
              <span className="text-xs font-bold text-stone-500">— {dep.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== INFORMAÇÕES PRÁTICAS ===== */}
      <section className="py-16 bg-stone-900/40 border-t border-b border-stone-800/50 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-0.5">Horário de Funcionamento</h4>
              <p className="text-xs text-stone-400">Terça a Domingo: 10h às 22h</p>
              <p className="text-[10px] text-stone-500">Segunda: Fechado</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-0.5">Localização</h4>
              <p className="text-xs text-stone-400">{cidadeEmpresa} - SP</p>
              <p className="text-[10px] text-stone-500">Estacionamento gratuito</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-0.5">Opções</h4>
              <p className="text-xs text-stone-400">Entrega / Retirada no Local</p>
              <p className="text-[10px] text-stone-500">Aceitamos pix e cartão</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-24 px-4 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Pronto Para Pedir?</h2>
        <p className="text-stone-400 text-sm mb-10 max-w-md mx-auto">
          Faça seu pedido pelo WhatsApp e receba em casa ou retire no local. Atendimento rápido e simpático.
        </p>
        <a
          href={waPedido}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all hover:scale-[1.03] active:scale-[0.97]"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Fazer Pedido pelo WhatsApp</span>
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-[10px] text-stone-600 mt-4">Resposta em até 5 minutos</p>
      </section>

      {/* ===== WHATSAPP FLUTUANTE ===== */}
      <a
        href={waPedido}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
        aria-label="Pedir pelo WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-stone-800/50 py-8 px-6 text-center">
        <p className="text-[11px] text-stone-600">
          © {new Date().getFullYear()} {nomeEmpresa}. Todos os direitos reservados.
        </p>
        <p className="text-[10px] text-stone-700 mt-1">
          Site desenvolvido por Foco em Dados
        </p>
      </footer>
    </div>
  );
}
