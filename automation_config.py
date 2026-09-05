"""
Configuration for Facebook Automation - Foco em Dados
Posting strategy: 1 post/day, 5 days/week (Mon-Fri)
"""

import os
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime, timedelta

@dataclass
class Config:
    # Facebook credentials (use environment variables in production)
    FB_EMAIL: str = os.getenv("FB_EMAIL", "")
    FB_PASSWORD: str = os.getenv("FB_PASSWORD", "")
    
    # Affiliate link
    AFFILIATE_LINK: str = "https://s.shopee.com.br/1Vyx5pR4XY"
    
    # Coupons
    COUPONS = {
        "AFBRIL5": "R$5 OFF (mín. R$10)",
        "4ABRILOFF10": "R$10 OFF (mín. R$30)"
    }
    
    # Posting limits - 1 post/day, 5 days/week (Mon-Fri)
    POSTS_PER_DAY: int = 1                    # 1 post per day
    POSTS_PER_WEEK: int = 5                   # 5 posts per week (Mon-Fri)
    MIN_DELAY_BETWEEN_GROUPS: int = 1800      # Not needed for 1/day
    MAX_DELAY_BETWEEN_GROUPS: int = 300       # Not needed for 1/day
    GROUP_COOLDOWN_HOURS: int = 48             # 48h before same group
    
    # Schedule: Monday to Friday only
    POSTING_DAYS: List[int] = [0, 1, 2, 3, 4]  # Mon=0, Tue=1, Wed=2, Thu=3, Fri=4 (Mon-Fri)
    POST_TIME_HOUR: int = 9  # 9 AM
    POST_TIME_MINUTE: int = 30  # 9:30 AM
    
    # Search keywords for finding groups
    SEARCH_KEYWORDS: List[str] = [
        "marketing digital",
        "renda extra",
        "empreendedorismo",
        "vendas online",
        "trabalhe em casa",
        "ofertas",
        "ganhar dinheiro online",
        "marketing de afiliados",
        "vendas online",
        "negócio próprio"
    ]
    
    # Group filters
    MIN_MEMBERS: int = 5000
    MAX_POST_AGE_HOURS: int = 1
    EXCLUDE_KEYWORDS: List[str] = ["anti-spam", "proibido divulgar", "sem divulgação", "não divulgar", "proibido postar"]
    
    # Post templates (rotate daily)
    POST_TEMPLATES = [
        """🔥 Super oferta que o time de afiliados preparou para hoje!

Comprei esse produto na Shopee e a qualidade é incrível. Além do preço especial, você ainda pode usar os SUPER CUPONS que estão valendo HOJE:

🎁 AFBRIL5 → R$5 OFF em compras acima de R$10
🎁 4ABRILOFF10 → R$10 OFF em compras acima de R$30

👉 Link direto: {affiliate_link}

Corre, porque cupom assim acaba rápido e o estoque também.""",
        
        """🚀 Oferta relâmpago + cupons exclusivos!

Encontrei esse produto na Shopee e me surpreendi com a qualidade. Aproveita que o time de afiliados liberou cupons incríveis para usar HOJE:

✅ AFBRIL5 (R$5 off - min. R$10)
✅ 4ABRILOFF10 (R$10 OFF - min. R$30)

Link: {affiliate_link}

Quem comprar agora ainda pega frete grátis e usa os cupons. Não perde essa!""",
        
        """💰 Indicação de ouro + R$ em desconto!

Comprei esse produto e chegou super rápido. Vale cada centavo. E o melhor: você ainda pode usar os super cupons que o time de afiliados preparou para HOJE:

🔹 AFBRIL5 → R$5 OFF (mínimo R$10)
🔹 4ABRILOFF10 → R$10 OFF (mínimo R$30)

👉 {affiliate_link}

Se tiver dúvida, me chama que eu explico melhor. Aproveita enquanto os cupons estão ativos!""",
        
        """🔥 Desconto imperdível que achei hoje!

Comprei esse produto na Shopee e me surpreendi. Qualidade top e preço que cabe no bolso. E o melhor: tem cupom de desconto!

🎁 AFBRIL5 → R$5 OFF (mín. R$10)
🎁 4ABRILOFF10 → R$10 OFF (mín. R$30)

👉 Link: {affiliate_link}

Aproveita antes que acabe!""",
        
        """💎 Achado do dia: qualidade + desconto!

Encontrei esse produto na Shopee e fiquei impressionado. Qualidade top e preço que cabe no bolso. E tem cupom!

🎁 AFBRIL5 → R$5 OFF (mín. R$10)
🎁 4ABRILOFF10 → R$10 OFF (mín. R$30)

👉 Link: {affiliate_link}

Aproveita antes que acabe!""",
        
        """💡 Dica de ouro: economize agora!

Encontrei esse produto na Shopee e não resisti. Qualidade top, preço justo e ainda tem cupom de desconto!

🎁 AFBRIL5 → R$5 OFF (mín. R$10)
🔹 4ABRILOFF10 → R$10 OFF (mín. R$30)

👉 Link: {affiliate_link}

Aproveita antes que o cupom expire!""",
        
        """⚡ Oferta relâmpago antes que acabe!

Encontrei essa oferta na Shopee e não resisti. Produto top, preço justo e cupom de desconto!

🎁 AFBRIL5 → R$5 OFF (mín. R$10)
🔹 4ABRILOFF10 → R$10 OFF (mín. R$30)

👉 Link: {affiliate_link}

Aproveita antes que acabe!""",
        
        """⚡ Oferta relâmpago + cupons exclusivos!

Encontrei esse produto na Shopee e não resisti. Qualidade top, preço justo e cupom de desconto!

🎁 AFBRIL5 → R$5 OFF (mín. R$10)
🔹 4ABRILOFF10 → R$10 OFF (mín. R$30)

👉 Link: {affiliate_link}

Aproveita antes que acabe!""",
        
        """💎 Achado do dia: qualidade + desconto!

Encontrei esse produto na Shopee e fiquei impressionado. Qualidade top, preço justo e cupom de desconto!

🎁 AFBRIL5 → R$5 OFF (mín. R$10)
🔹 4ABRILOFF10 → R$10 OFF (mín. R$30)

👉 Link: {affiliate_link}

Aproveita antes que acabe!"""
    ]
    
    EMOJIS = ["🔥", "🚀", "💰", "📦", "⭐", "👀", "🎁", "⚡", "💎", "⚡"]
    
    # Engagement responses
    REPLY_TEMPLATES = [
        "Usei os cupons e ainda veio frete grátis! 🔥",
        "Recomendo demais, valeu cada centavo! 💰",
        "Chegou super rápido, qualidade top! 📦",
        "Cupons funcionaram perfeitos! 🎁",
        "Melhor compra do mês, recomendo! ⭐",
        "Frete grátis + cupom = vitória! 🎉",
        "Qualidade surpreendeu, indico! ⭐",
        "Já fiz meu pedido, chegou rápido! 📦"
    ]
    
    # Engagement responses
    REPLY_TEMPLATES = [
        "Usei os cupons e ainda veio frete grátis! 🔥",
        "Recomendo demais, valeu cada centavo! 💰",
        "Chegou super rápido, qualidade top! 📦",
        "Cupons funcionaram perfeitos! 🎁",
        "Melhor compra do mês, recomendo! ⭐",
        "Frete grátis + cupom = vitória! 🎉",
        "Qualidade surpreendeu, indico! ⭐",
        "Já fiz meu pedido, chegou rápido! 📦"
    ]
    
    # Scheduling
    POSTING_DAYS: List[int] = [0, 1, 2, 3, 4]  # Mon-Fri (0=Mon, 6=Sun)
    POST_TIME_HOUR: int = 9
    POST_TIME_MINUTE: int = 30
    POSTS_PER_WEEK: int = 5
    POSTS_PER_DAY: int = 1
    GROUP_COOLDOWN_HOURS: int = 48
    
    # Search keywords for finding groups
    SEARCH_KEYWORDS: List[str] = [
        "marketing digital",
        "renda extra",
        "empreendedorismo",
        "vendas online",
        "trabalhe em casa",
        "ofertas",
        "ganhar dinheiro online",
        "marketing de afiliados",
        "vendas online",
        "negócio próprio"
    ]
    
    # Group filters
    MIN_MEMBERS: int = 5000
    MAX_POST_AGE_HOURS: int = 1
    EXCLUDE_KEYWORDS: List[str] = ["anti-spam", "proibido divulgar", "sem divulgação", "não divulgar", "proibido postar"]
    
    # Affiliate
    AFFILIATE_LINK: str = "https://s.shopee.com.br/1Vyx5pR4XY"
    COUPONS = {
        "AFBRIL5": "R$5 OFF (mín. R$10)",
        "4ABRILOFF10": "R$10 OFF (mín. R$30)"
    }

# Singleton instance
config = Config()
