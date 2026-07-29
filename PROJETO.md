# Promotec — Site

Iniciado em: 2026-07-28
Cliente: Promotec Engenharia e Construções (Sorocaba/SP)
Segmento: Construção industrial, manutenção industrial e predial, construção de galpões (B2B)
Pasta do Drive: https://drive.google.com/drive/u/0/folders/1qXVZGh0Jcdxnmv_200jIW868yn3lGu1a

## Inventário do material

- `Marca/`: 1 arquivo (PROMOTEC-LOGO2026.png — único ativo de marca disponível; não
  há brandbook/manual de marca, paleta ou tipografia formalizados — paleta derivada
  por amostragem de pixel do próprio logo)
- `Copys/`: 4 arquivos estruturados (institucional.md, servicos.md, portfolio.md,
  estrategia-notas.md) + `Copys/_fonte/` com os 3 PDFs originais preservados
  (apresentação antiga, apresentação 2026 v2, quadro de estratégia/Miro)
- `imagens/logos-clientes/`: 18 logos de clientes reais (Sakura Tech, Adimax, Toyota
  Ramires, Assa Abloy, CBA, AB Brasil, Trane, Voith, Peron Administradora, BM
  Administradora, BQL, Gerdau, Guiguel Plastic, Fulwood, Pasifer Aços Especiais,
  Tertecman, TPR, WEC) — todos conferidos visualmente, nenhum descartado
- `imagens/FOTOS/`: 6 projetos com fotos reais de obra
  - `galpao-peron/` — 55 fotos aéreas/drone + 1 vídeo
  - `galpao-avk/` — 8 fotos + 1 vídeo institucional
  - `lsvb-aparecidinha/` — 22 fotos
  - `vidrak/` — 3 fotos (fachada Av. General Motors)
  - `toyota-ramires/` — 14 fotos (redes sociais)
  - `tpr-porto-feliz/` — 13 fotos + 1 vídeo WhatsApp
- Pendente em `_raw/` (não classificado, mantido só local — não versionar):
  - `01. Promotec Aprofundamento.csv` — planilha BuildV **não preenchida** pelo
    cliente (só tem o template genérico de exemplo fictício) — descartada como fonte
    de copy.
  - `01. Promotec- Automático Leads Pré Qualificação.csv` — rastreador automático de
    leads (ClickUp), não é copy do site.
  - Pastas vazias no Drive (sem conteúdo para baixar): `02. Promotec - Criativos/`,
    `03.01. Site (Copy + Backup Site Antigo)/`, `03.02. Revisões e Criações/`,
    `Obras em andamento/Biolub/`, `Obras em andamento/UHE Porto Colombo/` — **não há
    site antigo para migrar/minerar**.

## Discrepâncias no material (ver `Copys/institucional.md` para detalhe)
- Ano de fundação diverge entre as duas apresentações (2014 vs. 2018) — usamos 2018
  (fonte mais recente), a confirmar com o cliente.
- Telefone/WhatsApp comercial **indefinido** — o próprio cliente registrou no quadro
  de estratégia que ainda vai comprar uma linha nova. Site construído com placeholder
  `5511999999999` em todos os CTAs.

## Checklist do pipeline
- [x] 1. Material extraído do Drive (rclone, pasta completa ~1,4GB)
- [x] 2. Pastas organizadas (scaffold-projeto)
- [x] 2b. Repositório GitHub (dev-buildv/promotec-site, privado) — https://github.com/dev-buildv/promotec-site
- [x] 3. Design system (paleta/tipografia da marca real + direção de estilo via ui-ux-pro-max)
- [x] 4. Copy estruturada — feito via apresentações institucionais + quadro de
      estratégia (não havia wireframes desenhados nem site antigo no Drive)
- [x] 5. Front-end criado — 7 páginas em `Site/` (Home, 4 serviços, Sobre, Portfólio),
      sistema de movimento aplicado, portfólio com lightbox de 6 obras reais
- [x] 6. Ajustes finais — imagens tratadas para `.webp` (~899MB → ~16MB, -98%),
      responsividade auditada por medição (320/360/375/768/1440px, overflow zero)
- [x] 7. Módulos LGPD instalados (cookie banner + política de privacidade + páginas
      de Fornecedores/Trabalhe Conosco + backend PHP) — tags GTM/Merlin puladas
      (sem IDs do cliente)
- [~] 8. Revisão humana — em andamento. **Rodada 1 (29/jul/2026) aplicada:**
      fontes trocadas para Inter (headings) + Krub (corpo) com hierarquia por peso
      (800/700/600/400); botões com cantos quase retos (4px, sem pill); hover do
      CTA vermelho invertido (fundo branco/texto vermelho) e texto de botões nunca
      escurece no hover (neutralizado o `a:hover` preto herdado do motion.css);
      traço decorativo do eyebrow removido; recortes diagonais (`--cut`) entre o
      hero e as seções escuras. Reauditado: zero overflow 320px/1280px.
- [ ] 9. Deploy (bloqueado — hospedagem/domínio/secrets pendentes do usuário)

## Auditoria adversarial (revisar-frontend) — achados corrigidos nesta passada
- **Bloqueante corrigido:** `js/motion.js` ignorava `prefers-reduced-motion` (linha
  hardcoded `reduce = false`, apesar do brief-pack afirmar que isso já tinha sido
  corrigido) — corrigido para respeitar a preferência do sistema, conforme WCAG e
  padrão BuildV.
- **Bloqueante corrigido:** `portfolio.html` pulava de H1 direto para H3 nos cards
  (sem H2 na seção) — adicionado heading da seção.
- **Ajuste de qualidade:** grid de logos de clientes em `sobre.html` usava 6 colunas
  fixas (ficaria ilegível em telas pequenas, embora sem causar overflow) — trocado
  para `auto-fit`/`minmax`, responsivo sem precisar de media query dedicada.
- **Verificado e confirmado correto** (não é achado): transparência real do logo
  (`logo-color.webp`/`logo-white.png`), lightbox (abrir/fechar/setas/Esc/contador/
  scroll travado), menu mobile, dropdown de serviços, modal de privacidade, banner
  de cookies com evento no `dataLayer`, zero overflow horizontal em 320/360/375/
  768/1440px nas 9 páginas do site.

## Pendências do usuário (ver report final para lista completa)
- Hospedagem (Vercel ou Hostinger/WordPress) — indefinida, site construído como
  HTML estático (default quando indefinido)
- WhatsApp comercial definitivo (placeholder em uso: `5511999999999`, constante
  única em `Site/js/app.js`)
- Confirmar ano de fundação (2014 ou 2018)
- IDs de GTM/GA4/Meta Pixel/Google Ads (se quiser instalar tags)
- ID do Merlin Popup (se quiser)
- Domínio final
- Secrets de deploy (FTP ou Vercel) quando a hospedagem for decidida
- Criar banco MySQL + preencher `db-config.php` a partir do `db-config.example.php`
  (o backend funciona em modo degradado sem banco: valida e grava em log local)
- Trocar a senha de admin (`PROJETO_ADMIN_PASS` em `db-config.php`) antes de publicar
- PHP não testado em execução real (sem runtime PHP nesta máquina de dev) — validar
  no servidor antes de publicar
