# QUIZHUB_MASTER.md
**Documentação Conceitual e Operacional para IAs - QuizHub**

---

## 1. Visão Geral da Plataforma
O **QuizHub** é um Progressive Web App (PWA) de **gestão pedagógica, acompanhamento contínuo de proficiência oral (CEFR) e geração autônoma de quizzes interativos para aulas individuais de inglês.**
- **Proposta Central:** Automatizar o ciclo pedagógico pós-aula de sessões particulares de conversação. A partir da transcrição de cada aula no Google Meet, o ecossistema afere o nível oral real do aluno, sintetiza áreas cirúrgicas de foco gramatical, gera um quiz interativo de 10 questões, consolida lições de casa acordadas em aula (*Homework*), estrutura o briefing metodológico docente e alimenta o dossiê evolutivo do aluno (*S-Dossier*) e do professor (*T-Dossier*).
- **Entrada de Dados:** Transcrições geradas pelo Google Meet armazenadas como documentos no Google Drive (aba `Transcript`), além de anotações pedagógicas manuais e comandos de unificação de perfis inseridos via campo *Brain Dump* na interface web.
- **Processamento:** O sistema orquestra um backend serverless no Google Apps Script acionado por gatilho temporal autônomo (time-driven) ou disparo pontual via painel web. Uma chamada única à cascata oficial do Google Gemini (3.5-flash -> 3-flash-preview -> 2.5-flash) analisa a transcrição, extrai os blocos didáticos e persiste os dados no banco relacional Supabase, que alimenta o frontend SPA em React, Vite e Tailwind.

---

## 2. Ambiente de Desenvolvimento e Governança para IAs

### A. Ambiente Operacional e Execução Técnica
- **Ambiente & Terminal:** Windows. Terminal padrão: Git Bash integrado ao VSCode.
- **Compatibilidade de Sintaxe:** Todos os comandos de terminal sugeridos devem ser estritamente compatíveis com a sintaxe do Git Bash / Bash no ambiente Windows.
- **Proibição de Comandos Inline (Node.js):** É estritamente proibido o uso de comandos `node -e` inline no terminal. Toda automação, rotina ou migração em Node.js deve ser estruturada exclusivamente em arquivos de script criados via `cat << 'EOF'` e executados em seguida, prevenindo falhas de interpretação ou escape de aspas no Git Bash do Windows.

### B. Protocolo de Blindagem e Não-Inferência (Mandatório para IAs)
- **Regra Pétrea de Não-Inferência:** É sempre expressamente proibido inferir. A IA não pode supor, deduzir ou agir por estimativa. Ao receber qualquer instrução, deve obrigatoriamente apurar o estado real ("como está") e delimitar a meta exata ("como tem que ser") antes de propor ou realizar qualquer modificação.
- **Ciclo Fechado ("Como Está vs. Como Tem que Ser"):** Antes de gerar qualquer linha de comando ou alteração em arquivos, a IA deve transcrever o trecho original exato e a proposta de substituição, aguardando aprovação explícita do usuário.
- **Regra de 1 Ação por Turno:** A IA é estritamente proibida de planejar e executar ao mesmo tempo, ou de propor "etapas seguintes" antes que a etapa atual seja testada e validada pelo usuário.
- **Amostra Prévia Obrigatória (Teto de 1 Registro):** Fica proibido qualquer script que altere múltiplos registros de uma vez. Toda e qualquer alteração de dados deve rodar primeiro em **exatamente 1 registro de teste**, exibindo o antes e o depois na tela. A expansão para outros registros depende de ordem explícita do usuário.
- **Trava de Infraestrutura e Cotas:** Proibição de scripts locais que consumam APIs com cota diária ou que façam chamadas em série sem checagem prévia documentada das restrições de serviço.

---

## 3. Infraestrutura e Serviços Externos (Invisíveis no Código Local)
Esta seção documenta as dependências que residem fora do repositório local e que o código-fonte por si só não explica completamente:

### A. Banco de Dados Relacional (Supabase BaaS)
- **Instância:** `[https://xttzilpuuqjbztjkeadd.supabase.co](https://xttzilpuuqjbztjkeadd.supabase.co)`
- **Schema e Tabelas:**
  - `students`: Cadastro de alunos por slug normalizado (`id`) e nome completo em Title Case estrito (`name`).
  - `class_sessions`: Registro de cada aula associada ao aluno, contendo data formatada (`class_date`), horário de início truncado (`class_time`), flag de auditoria/imutabilidade (`is_verified`) e carimbo de criação (`created_at`).
  - `student_quizzes`: Avaliação do aluno com nível CEFR (`level`), diagnóstico de fluência em 4 frases (`level_description`), 5 áreas de foco com exemplos contextualizados (`focus_areas`), 10 questões de múltipla escolha com gabarito didático (`questions`) e tarefas itemizadas (`homework`).
  - `teacher_briefings`: Briefing pedagógico da sessão para o docente com tópicos praticados (`activities_done`), avaliação contínua em parágrafo único de 4 frases (`conversation_assessment`), 5 áreas de calibração da fala do professor (`focus_areas`) e lições espelhadas (`next_tasks`).
  - `dossiers`: Dossiê evolutivo estruturado em 4 cards: `personal_context` (Card 1: Ficha cadastral estática por tópicos), `routine` (Card 2: Linha do tempo com marcações `[DD/MM/YY]`), `learning_profile` (Card 3: Dimensões pedagógicas e estilo de aprendizagem) e `class_history` (Card 4: Histórico cumulativo de aulas exclusivo para alunos; oculto no perfil docente `lessandro-bull`), além da área de staging para aprovação manual (`pending_suggestions`).
  - `cefr_matrix`: Matriz de referência pedagógica oficial dos descritores funcionais (*Can-Dos*) e inventário morfossintático do CEFR/EGP por nível (`level`, `level_name`, `content`, `updated_at`). Armazena os níveis A1 a C2 em blocos estruturados e alimenta cumulativamente o motor do Apps Script.

### B. Backend Serverless e Motor de IA (Google Apps Script Web App)
- **Endpoint Web App (`Code.gs`):**
  `[https://script.google.com/macros/s/AKfycbwYMojtkvPqteY6ZNvnmqqqxA8gmKvsoC7HLyHWAQvjqkOawTq9X4kcFKilHmdhu9c/exec](https://script.google.com/macros/s/AKfycbwYMojtkvPqteY6ZNvnmqqqxA8gmKvsoC7HLyHWAQvjqkOawTq9X4kcFKilHmdhu9c/exec)`
- **Blindagem e Governança:** O arquivo `Code.gs` roda na nuvem do Google e é mantido no `.gitignore` para proteção contra vazamento de credenciais GCP e Supabase. Toda e qualquer alteração no código do Apps Script exige a publicação de uma **Nova versão** em *Gerenciar implantações* para ter efeito no Web App.
- **Rotas do Endpoint (`doGet`):**
  1. `action=processBrainDump`: Processa semanticamente notas do professor para atualizar os cards do dossiê ou executar comandos de fusão de perfis e registro de aliases (`- Meet Aliases:`).
  2. Parâmetros `studentName` & `targetDate`: Disparo pontual executado pelo botão *Process This Class Only* no painel do professor (`TeacherHub`), com temporizador sincronizado de 65s.
  3. Fila Geral / Execução Autônoma (`processarAulasPendentes`): Acionada por gatilho de tempo (a cada 30 min), processando no teto seguro de 1 arquivo por ciclo para prevenir timeout de execução de 360s do Apps Script.

### C. Repositório de Arquivos & Gravações (Google Drive & Google Meet)
- **Pasta Raiz de Monitoramento:** `Google Meet` (varrida recursivamente à procura de novas transcrições).
- **Pasta de Concluídas:** `Google Meet - Processadas`.
- **Regra de Movimentação e Blindagem:** Um documento só pode ser movido para `Google Meet - Processadas` se todos os alunos identificados na transcrição forem processados e salvos com sucesso no Supabase. Havendo falha ou aluno pendente, o arquivo permanece intacto na pasta raiz.
- **Extração da Transcrição:** Leitura isolada da aba `Transcript` (ou `Transcrição`) do Google Docs gerado pelo Meet, descartando abas secundárias.
- **Fusão de Reconexões:** Quedas de conexão na mesma data e mesma hora truncada disparam a recuperação da sessão existente e reanálise unificada via `PATCH`, sem duplicar aulas no histórico.

### D. Pipeline de Inteligência Artificial (Cascata Google Gemini)
- **Cascata Multi-Model Fallback:** Endpoints oficiais consumidos na ordem estrita:
  1. `gemini-3.5-flash` (Modelo principal de alta performance)
  2. `gemini-3-flash-preview` (Primeiro fallback para estabilidade de cota)
  3. `gemini-2.5-flash` (Segundo fallback de contingência)
- **Política de Cotas:** 20 requisições diárias gratuitas (renovação pontual às 21:00 BRT / 00:00 UTC).
- **TRAVA ANTI-BLOQUEIO DE COTA (PROIBIÇÃO DE LOOPS LOCAIS):** É terminantemente proibido criar ou rodar scripts automatizados em lote (batch loops) consumindo a `GEMINI_API_KEY`. Disparar chamadas em série esgota a cota diária de 20 requisições quase instantaneamente e bloqueia toda a plataforma com erro HTTP 429 pelo restante do dia. Qualquer migração, tradução ou manutenção retroativa no Supabase DEVE ser executada sem consumir a API do Gemini.
- **Diretriz de Exemplos Bilíngues (A1 e A2):** Para alunos com nível operacional A1 ou A2, todos os exemplos práticos de `focusAreas` devem ser estritamente bilíngues (L2 + L1): primeiro a frase em inglês e em seguida a tradução fiel em português brasileiro. Níveis B1 a C2 permanecem 100% em inglês.
- **Consumo Rígido por Aula:** **1 Aluno em uma aula = Rigorosamente 1 Requisição à API**, gerando em payload JSON único a avaliação do aluno, quiz, briefing docente, lição acordada e sugestões de dossiê.
- **Estrutura de 4 Tiers Operacionais:**
  - **Tier 1 (A1):** Conteúdo restrito a A1. Explicações e diagnóstico em português brasileiro. Exemplos bilíngues (L2 + L1).
  - **Tier 2 (A2):** Conteúdo restrito a A2 (Can-Dos A1/A2). Explicações e lições em inglês ultra-simples, minimalista e direto. Exemplos bilíngues (L2 + L1).
  - **Tier 3 (B1):** Conteúdo até B1 (Can-Dos A1 a B1). Explicações em inglês simples e acessível. Exemplos 100% em inglês.
  - **Tier 4 (B2 / C1 / C2):** Conteúdo cumulativo avançado. Explicações em inglês natural e nativo. Exemplos 100% em inglês.
- **Tom Universal de Explicação (A1 a C2):** Proibição estrita de jargões acadêmicos ou metalinguagem gramatical pesada em todos os níveis. O tom deve ser sempre o de um bilhete informal de professor/amigo explicando o uso prático imediato, mudando apenas o idioma conforme o Tier.
  - **Diagnóstico Positivo e Construtivo em 4 Frases (`levelDescription`):** Estrutura rígida de 4 frases: 1) Saudação e tema real trabalhado na aula; 2) Reconhecimento positivo de 2 conquistas reais da transcrição (drills bem-sucedidos ou fala autônoma correta); 3) Direcionamento construtivo de 2 pontos de reforço com microexemplos entre parênteses (alinhados às Focus Areas); 4) Ponte direta convidando o aluno a olhar as Focus Areas logo abaixo. Veto total a linguagem de déficit (*"forte dependência"*, *"suporte constante"*, *"incapaz de"*).
  - **Gabarito Equilibrado e Aleatório no Quiz (A, B, C, D, E):** As respostas corretas devem ser distribuídas uniformemente e de forma imprevisível entre as alternativas A, B, C, D e E ao longo das 10 questões (aprox. 2 de cada letra), com veto absoluto à concentração mecânica na letra A.
- **Diretrizes Pedagógicas e Blindagens Centrais:**
  - **Injeção Cumulativa da Matriz CEFR:** A IA recebe os descritores e pontos gramaticais da tabela `cefr_matrix` partindo sempre de A1 até o nível operacional do aluno, permitindo respaldar correções de estruturas de base para qualquer nível.
  - **Diagnóstico Oral nos Modos 3 e 4:** O nível CEFR da sessão é avaliado exclusivamente no diálogo espontâneo (Modo 3) e discurso estruturado (Modo 4). Leitura de textos (Modo 1) e repetições mecânicas (Modo 2) possuem peso diagnóstico zero.
  - **Varredura Completa e Priorização por Repetição Ativa:** A IA é proibida de alocar slots sequencialmente de cima para baixo. Ela deve varrer a transcrição inteira primeiro e ranquear a prioridade pela quantidade de vezes que o professor exigiu a repetição de uma correção na aula. Leituras de passagem única para ritmo ou aquecimento não constituem erro.
  - **Zero Auditoria de Pontuação ou Caixa Alta:** Tratamento estrito do texto como transcrição de fala oral. Veto total a avaliar, corrigir ou citar pontuação (vírgulas, pontos) ou capitalização (letras maiúsculas/minúsculas) inseridas pelo software transcritor.
  - **Filtro de Ruído Acústico e Alucinações do STT:** Palavras isoladas sem ligação sintática e sem intervenção gramatical do professor em aula devem ser descartadas como artefato técnico do transcritor.
  - **Fronteira Estrita no `betterWay` (Sem Adivinhação de Pensamentos):** O `betterWay` limita-se à correção cirúrgica do que o aluno verbalizou. É proibido inferir intenções não ditas ou inventar frases novas. Interjeições naturais e corretas (ex.: *"Oh my god."*) não constituem erro e não podem ser substituídas por frases narrativas.
  - **Proporção de Contexto 70/30:** 70% Cenário da Aula (tema primário) e 30% Dossiê (tempero pessoal). Veto a inventar contextos corporativos fora do perfil do aluno.
  - **Proibição de Sujeitos Repetidos:** Veto absoluto a repetir o mesmo pronome sujeito ou nome do aluno nas 3 frases de exemplo das Focus Areas e nas questões do Quiz.
  - **Teto de Vocabulário Ativo:** Máximo de 2 itens de vocabulário isolado por aula, exigindo que o professor tenha drilado ativamente a palavra em aula.
  - **Extração Estrita de Lição de Casa (`agreedHomework`):** Captura exclusivamente tarefas acordadas verbalmente na gravação. No front-end (`BriefingView` e `StudentHub`), a edição é 100% livre pelo docente, sem frases estáticas prefixadas no código.
  - **Teacher Directives Override:** Comandos verbais ao vivo iniciados por *"Gemini, ..."* têm prioridade máxima absoluta (Slot #1).

---

## 4. Protocolo de Inicialização para IAs (Geração do Dumper)
**Ação Obrigatória:** Ao iniciar uma nova conversa técnica, a IA deve primeiro orientar o usuário a executar o comando abaixo no Git Bash. Este script varre a estrutura do projeto e consolida a árvore de arquivos e o código-fonte atualizado no arquivo `QUIZHUB_DUMPER.md`, mascarando credenciais sensíveis do `Code.gs`.

```bash
OUTPUT="QUIZHUB_DUMPER.md"
echo "Gerando Snapshot Técnico do QuizHub..."
echo "# 🖨️ QUIZHUB_DUMPER.md" > "$OUTPUT"
echo "Snapshot técnico gerado automaticamente com a estrutura e código da plataforma." >> "$OUTPUT"
echo -e "\n## 1. ÁRVORE DE DIRETÓRIOS" >> "$OUTPUT"
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/dev-dist/*" -not -path "*/build/*" -not -path "*/scripts/*" -not -name "*.env*" -not -name "backup*" -not -name "$OUTPUT" | sort >> "$OUTPUT"
echo -e "\n## 2. CÓDIGO FONTE INTEGRAL" >> "$OUTPUT"
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/dev-dist/*" -not -path "*/build/*" -not -path "*/scripts/*" -not -name "*.env*" -not -name "backup*" -not -name "$OUTPUT" -not -name "*.png" -not -name "*.jpg" -not -name "*.svg" -not -name "*.ico" -not -name "package-lock.json" | sort | while read -r file; do
  echo -e "\n\n### 📄 ARQUIVO: $file" >> "$OUTPUT"
  sed -e 's/GEMINI_API_KEY: "[^"]*"/GEMINI_API_KEY: "SUA_CHAVE_GEMINI_AQUI"/' \
      -e 's/SUPABASE_SERVICE_ROLE_KEY: "[^"]*"/SUPABASE_SERVICE_ROLE_KEY: "SUA_CHAVE_SUPABASE_SERVICE_ROLE_AQUI"/' \
      "$file" >> "$OUTPUT"
done
echo "Concluído! Arquivo $OUTPUT pronto para leitura."
```

*Instrução para a IA:* Somente após o usuário rodar o comando e disponibilizar o conteúdo do `QUIZHUB_DUMPER.md`, inicie as análises e edições solicitadas.

---

## 5. Protocolo de Autoatualização (Encerramento da Sessão)
**Ação Obrigatória:** Antes de dar como finalizado qualquer atendimento que altere a arquitetura, estrutura ou escopo da plataforma, a IA deve:
1. Avaliar se as alterações realizadas modificaram integrações externas (Supabase, Google Calendar, etc), dependências estruturais ou fluxos de trabalho descritos neste documento.
2. Caso identifique divergências, fornecer explicitamente ao usuário a versão revisada e atualizada do `QUIZHUB_MASTER.md`.
3. Instruir o usuário a gerar uma nova versão do `QUIZHUB_DUMPER.md` caso arquivos tenham sido criados, movidos ou excluídos.
