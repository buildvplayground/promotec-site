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
- [ ] 2b. Repositório GitHub (dev-buildv/promotec-site, privado)
- [ ] 3. Design system (skill: design-system)
- [ ] 4. Copy dos wireframes extraída (skill: extrair-copy) — feito via apresentações
      institucionais + quadro de estratégia (não havia wireframes desenhados)
- [ ] 5. Front-end criado (gerar-frontend + revisar-frontend)
- [ ] 6. Ajustes finais (responsivo, imagens tratadas, animações)
- [ ] 7. Tags instaladas (skill: instalar-tags) + módulos LGPD
- [ ] 8. Revisão humana (preview local, aguardando domínio/hospedagem do usuário)
- [ ] 9. Deploy (bloqueado — hospedagem/domínio/secrets pendentes do usuário)

## Pendências do usuário (ver report final para lista completa)
- Hospedagem (Vercel ou Hostinger/WordPress) — indefinida, site sendo construído
  como HTML estático (default quando indefinido)
- WhatsApp comercial definitivo (placeholder em uso: `5511999999999`)
- Confirmar ano de fundação (2014 ou 2018)
- IDs de GTM/GA4/Meta Pixel/Google Ads (se quiser instalar tags)
- ID do Merlin Popup (se quiser)
- Domínio final
- Secrets de deploy (FTP ou Vercel) quando a hospedagem for decidida
