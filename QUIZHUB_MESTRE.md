# QUIZHUB — MANUAL MESTRE DE ARQUITETURA, REGRAS DE NEGÓCIO E DIRETRIZES TÉCNICAS

Este documento é a fonte suprema da verdade para o desenvolvimento, manutenção e execução autônoma do ecossistema QuizHub. Qualquer desenvolvedor ou Inteligência Artificial que atuar neste projeto deve seguir rigorosamente estas diretrizes, sendo terminantemente proibido inferir, supor comportamentos não documentados ou alterar lógicas estabelecidas.

---

## 1. AMBIENTES E INFRAESTRUTURA CONFIGURADA

* **Repositório GitHub:** `https://github.com/lessandrobull/quizhub` (Branch principal: `main`)
* **Deploy Frontend (Vercel):** `https://quizhub-ochre.vercel.app`
* **Banco de Dados Relacional (Supabase):** `https://xttzilpuuqjbztjkeadd.supabase.co`
* **Gatilho Autônomo Google Apps Script (Web App):**
  `https://script.google.com/macros/s/AKfycbwYMojtkvPqteY6ZNvnmqqqxA8gmKvsoC7HLyHWAQvjqkOawTq9X4kcFKilHmdhu9c/exec`
* **Stack Tecnológica do Frontend:**
  * React 19 (`19.2.8`)
  * Vite 8 (`8.3.2`)
  * TypeScript (`~6.0.2`)
  * React Router DOM 7 (`7.18.4`)
  * Supabase JS Client (`^2.117.2`)
  * Suporte a SPA via `vercel.json` com regra de rewrite para `/index.html`
* **Segurança e Blindagem Local (`.gitignore`):**
  * O arquivo `Code.gs` é estritamente ignorado no Git para proteção de credenciais e chaves de nuvem (GCP Push Protection).
  * O código do backend roda exclusivamente no Google Apps Script; qualquer atualização exige a criação de uma **Nova versão** em *Gerenciar implantações* para entrar em vigor no Web App.

---

## 2. ROTAS E COMPONENTES DA APLICAÇÃO (SPA)

* **`/`** &rarr; Redirecionamento automático para `/teacher`.
* **`/:studentId`** &rarr; `StudentHub.tsx` (Dashboard do aluno com histórico de aulas, status e card azul de `Homework for next class` posicionado acima da lista de quizzes).
* **`/quiz/:sessionId`** &rarr; `QuizView.tsx` (Interface interativa do aluno e painel editorial do professor).
  * Possui botão de retorno discreto **`HUB`** no topo esquerdo do card de título (fundo verde `#71c499`, texto `#27427f`), direcionando para `/:studentId`.
* **`/teacher` e `/teacher/:studentId`** &rarr; `TeacherHub.tsx` (Painel mestre do professor, histórico de sessões, auditoria e disparos).
  * Seletor de alunos com `<input>` e `<datalist>` nativo: permite escolher alunos cadastrados ou digitar novos nomes livremente.
  * Cronômetro sincronizado de processamento pontual (65 segundos) ajustado ao tempo real da esteira de IA.
* **`/teacher/briefing/:sessionId`** &rarr; `BriefingView.tsx` (Briefing pedagógico da sessão e edição de conduta).
* **`/teacher/dossier/:studentId`** &rarr; `DossierView.tsx` (Dossiê evolutivo contínuo e gestão de staging do aluno).

---

## 3. BANCO DE DADOS (SUPABASE SCHEMA)

1. **`students`**
   * `id` (text, PK): Slug normalizado (ex.: `camilly-carmo`, `amanda-cardoso`, `lessandro-bull`).
   * `name` (text): Nome completo formatado em Title Case estrito (ex.: `Amanda Cardoso`).
2. **`class_sessions`**
   * `id` (uuid, PK): Identificador único da aula (`gen_random_uuid()`).
   * `student_id` (text, FK &rarr; `students.id`).
   * `class_date` (text): Data formatada (ex.: `Sep 30`, `Aug 31`).
   * `class_time` (text): Hora cheia truncada para baixo (ex.: `13h`, `17h`, `20h`).
   * `is_verified` (boolean): Flag de auditoria e imutabilidade (padrão `false`).
   * `created_at` (timestamp com fuso horário).
3. **`student_quizzes`**
   * `id` (uuid, PK).
   * `session_id` (uuid, FK &rarr; `class_sessions.id`).
   * `level` (text): Nível CEFR ou calibração pedagógica.
   * `level_description` (text): Avaliação de fluência com exatamente 4 frases.
   * `focus_areas` (jsonb): Array com exatamente 5 itens de foco (`studentSaid`, `betterWay`, `explanation`, `examples`).
   * `questions` (jsonb): Array com exatamente 10 questões de múltipla escolha (A a E) com gabarito e explicação didática.
   * `homework` (text, nullable): Lista itemizada com tarefas de fixação e compromissos acordados.
4. **`teacher_briefings`**
   * `id` (uuid, PK).
   * `session_id` (uuid, FK &rarr; `class_sessions.id`).
   * `diagnostic_focus` (text): Parágrafo único contínuo de exatamente 4 frases.
   * `activities_done` (jsonb / text[]): Lista de tópicos praticados.
   * `next_tasks` (text): Lista itemizada com marcadores `•` e quebras duplas `\n\n`.
   * `teaching_tip_didactic` (text): Estratégia didática de condução.
   * `teaching_tip_behavioral` (text): Manejo comportamental e de confiança.
5. **`dossiers`**
   * `id` (uuid, PK).
   * `student_id` (text, FK &rarr; `students.id`).
   * `personal_context` (text): Card 1 — Ficha cadastral estática por tópicos.
   * `routine` (text): Card 2 — Linha do tempo com marcações `[DD/MM/YY]`.
   * `learning_profile` (text): Card 3 — Dimensões pedagógicas separadas por `•` e `\n\n`.
   * `class_history` (text): Histórico cronológico das aulas.
   * `pending_suggestions` (jsonb): Staging com novas sugestões aguardando revisão.
   * `updated_at` (timestamp).

---

## 4. POLÍTICA DE COTAS E ARQUITETURA DE IA

* **Cascata Oficial Gemini (Multi-Model Fallback):**
  A esteira consome estritamente os endpoints da API oficial na seguinte ordem de prioridade:
  1. `gemini-3.5-flash` (Modelo principal de alta performance)
  2. `gemini-3-flash-preview` (Primeiro fallback para estabilidade de cotas)
  3. `gemini-2.5-flash` (Segundo fallback de contingência)
* **Cota Diária Estrita:** 20 requisições diárias gratuitas (renovação pontual às **21:00 BRT** / 00:00 UTC).
* **Consumo Rígido por Aula:** **1 Aluno em uma aula = Rigorosamente 1 Requisição à API**.
  * A chamada única ao Gemini retorna simultaneamente:
    1. Avaliação completa do aluno (Nível CEFR, Descrição de 4 frases, 5 Áreas de Foco, Quiz de 10 Questões, Homework).
    2. Teacher Briefing (Diagnóstico contínuo de 4 frases, Atividades, Próximas Tarefas com `\n\n`, Dicas didática e comportamental).
    3. Sugestões de Dossiê do aluno (Staging com Cards 1, 2 e 3 formatados).
    4. Autoavaliação do professor (Nível de calibração, Descrição docente de 4 frases, 5 Áreas de Foco docente, Quiz de 10 Questões, Briefing e Staging docente).
* **Limites de Processamento:**
  * **Gatilho Autônomo (Time-driven a cada 30 min):** Processa com teto de **no máximo 2 aulas por ciclo**.
  * **Lote Histórico Manual:** Teto máximo de **8 aulas por pacote**.
  * **Disparo Pontual na Interface:** O professor seleciona `[Aluno]` + `[Data]` e aciona `Process This Class Only` (chamada via Web App, consumindo exatamente 1 requisição).
* **Blindagem de Arquivos Pendentes:** Se qualquer aluno de uma gravação falhar ou ainda houver outro aluno pendente de processamento no mesmo arquivo, o Google Docs **NÃO pode ser movido** para `Google Meet - Processadas`.

---

## 5. REGRAS DE FORMATAÇÃO E ESTRUTURAÇÃO DOS CARDS

### Card 1 — Personal Data & Context (Ficha Cadastral Estática)
* Formato estrito de tópicos cadastrais: `• Categoria: Termo / Entidade`.
* **Proibições Rigorosas:**
  * Proibida qualquer narrativa contínua ou estilo biográfico discursivo.
  * Proibida a repetição de categorias ou rótulos (ex.: não repetir `Família:` ou `Profissão:`).
  * Proibida a inclusão de sintomas passageiros de saúde (gripes, resfriados, indisposições temporárias).
  * Proibida a inclusão de exames ou provas escolares pontuais (devem constar exclusivamente no Card 2).

### Card 2 — Routine, Experiences & Plans (Linha do Tempo)
* Cada evento, viagem, relato de rotina ou prova escolar deve ocupar sua própria linha isolada.
* **Formatação Mandatória:** Separado por quebra de linha simples (`\n`) com carimbo temporal no formato `[DD/MM/YY]` no início da linha:
  * Exemplo: `[30/09/26] Concluiu apresentação do projeto final no trabalho.`

### Card 3 — Learning Style & Pedagogical Style
* Dimensões analíticas separadas por marcadores `•` e quebras de linha duplas (`\n\n`).
* No dossiê do professor (T-Dossier), deve registrar apenas novas condutas, técnicas e adaptações observadas na aula.

### Teacher Briefing — Diagnostic Focus / Conversation Assessment
* Exatamente **um parágrafo contínuo de 4 frases**, sem linhas em branco no meio.
* As tarefas seguintes (*Next Tasks*) devem vir separadas por marcadores `•` e quebras de linha duplas (`\n\n`).

### Seção Homework (Student Hub)
* Exibida no Student Hub (`/:studentId`), posicionada abaixo do card do aluno e acima da lista de quizzes, em card azul com título estrito em inglês para todos os níveis: `Homework for next class`.
* Lista itemizada com marcadores `•` e quebras de linha simples (`\n`).
* **Regra de Extração e Preenchimento (Até 3 atividades):** Registra estritamente lições combinadas em voz alta durante a aula. Caso não tenham sido combinadas 3 atividades, a IA avalia a necessidade mais relevante para o aluno (com base no nível e nas atividades desenvolvidas na aula) e completa até 3 tarefas. Limite estrito: no máximo 3 atividades, nunca mais do que 3.
* **Filtro Estrito Anti-Conselho de Vida:** Proibido registrar conselhos cotidianos (segurança no trânsito, cuidados com gripe, conversas de despedida). Extrai exclusivamente deveres pedagógicos de estudo de inglês.
* **Idioma do Conteúdo:** Português para alunos A1; Inglês para alunos A2 e superiores.

## 6. REGRAS DE NEGÓCIO E PADRONIZAÇÃO DE DADOS

### A. Nomes e Identificadores
* **Title Case Mandatório:** Nomes padronizados em Title Case estrito (ex.: `Amanda Cardoso`).
* **Regra de Dois Nomes:** Armazenam-se exclusivamente o Primeiro Nome e o Último Sobrenome.
* **Reconhecimento de Speaker na Transcrição:** O motor do Apps Script utiliza expressão regular com suporte a nomes simples e compostos antes dos dois-pontos:
  `new RegExp("(^|\\n)\\s*" + targetFirst + "[^:\\n]*:", "i")` (reconhece `Amanda:`, `Amanda Cardoso:`, etc.).
* **Saudação na Avaliação (Frase 1):** Deve conter **estritamente o primeiro nome** do aluno (ex.: `Hi, Amanda.`).

### B. Cálculo de Horários
* Calculado somando o início da reunião no Meet com o primeiro minuto em que o aluno falou na aba `Transcript`.
* **Truncamento para Baixo (`Math.floor`):** Sempre no formato `[Hora]h` (ex.: `13h`, `17h`, `20h`).

### C. Reconexão e Fusão de Aulas
* Se a conexão cair e uma nova gravação for gerada com o mesmo aluno na mesma data e mesma hora truncada, o sistema recupera a sessão anterior e realiza uma reanálise pedagógica consolidada via `PATCH`.

---

## 7. CALIBRAÇÃO PEDAGÓGICA E IDIOMAS

### A. Idioma por Área
* **Área Docente (100% Inglês):** `TeacherHub`, `BriefingView`, `DossierView` e o painel editorial de `QuizView`.
* **Área do Aluno (`QuizView` e `StudentHub`):**
  * **A1 ou A2 Inicial:** Avaliações, explicações e títulos em **português**.
  * **A2 Comunicativo em diante:** Títulos, descrições e explicações em **inglês direto e simples**.
  * **B1+ em diante:** 100% em **inglês fluente padrão**.

### B. Regra Mandatória da Frase 3
* A descrição de nível do aluno possui **exatamente 4 frases** (sem citar siglas CEFR no texto).
* **Frase 3:** Ao mencionar qualquer estrutura gramatical ou termo formal, é **obrigatório incluir no mínimo 2 exemplos práticos entre parênteses**:
  * Exemplo: `pay close attention to dependent prepositions (such as 'rely on' and 'interested in') and sufficiency adverbs (such as 'warm enough' and 'too crowded').`

### C. Restrições Vocabulares e Tom
* Tom sóbrio, factual, construtivo e formal.
* **Palavras Terminantemente Proibidas:** Elogios vazios ("incrível", "maravilhoso", "fantástico", "excelente", "parabéns", "amazing", "wonderful", "great job").
* **Pontuação Proibida:** É proibido o uso de pontos de exclamação (`!`).

---

## 8. AUDITORIA, IMUTABILIDADE E EXCLUSÃO

* **Localização dos Controles:** Exclusivamente no painel docente *Class History & Briefings* (`TeacherHub.tsx`), à esquerda do título de cada sessão.
* **Identidade Visual Camuflada:** Botões minúsculos com fundo `#ffffff` e texto `#a6b1ca`.
* **Botão `x`:** Exclui definitivamente em cascata os registros da aula no Supabase (`student_quizzes`, `teacher_briefings` e `class_sessions`).
* **Botão `ok`:**
  * Atualiza o registro no Supabase para `is_verified = true`.
  * Oculta o botão `x` da linha e desativa a ação de `ok`.
  * **Imutabilidade Absoluta:** Sessões auditadas ficam permanentemente travadas contra qualquer sobrescrita por rotinas autônomas.

  ---

## 9. MOTOR DO BRAIN DUMP & FUSÃO DE PERFIS (APPS SCRIPT + DOSSIER)

### 9.1. Arquitetura e Rota
- **Origem:** Campo de entrada *Brain Dump* na base do S-Dossier e T-Dossier (`src/pages/DossierView.tsx`).
- **Endpoint:** Google Apps Script Web App (`Code.gs`) via `action=processBrainDump&studentId=[ID]&note=[TEXTO]`.
- **Motor de Inteligência:** Cascata oficial do Gemini (`CONFIG.GEMINI_MODELS`: 3.5 -> 3-preview -> 2.5) com payload JSON restrito.

### 9.2. Regras de Processamento Semântico
1. **Triagem de Atualização de Conteúdo (Cards 1 a 4):**
   - **Card 1 (`personal_context`):** Profissão, local de residência, interesses culturais, tecnologia, hobbies, saúde clínica crónica.
   - **Card 2 (`routine`):** Viagens, rotina de estudos/trabalho, acontecimentos com datas ou planos futuros.
   - **Card 3 (`learning_profile`):** Canais sensoriais, dinâmica e métodos de estudo, gatilhos emocionais/atitudinais.
   - **Card 4 (`class_history`):** Notas históricas ou acontecimentos pedagógicos isolados de aulas.
   - **Dado Inédito:** A IA formata no padrão visual (`- Label: Value`) e adiciona à secção correta.
   - **Dado Incorreto / Atualização:** A IA localiza a linha desatualizada ou incorreta existente e faz a substituição pontual, mantendo todas as restantes informações do card intactas.
   - **Padronização:** Termos informais ou em português são calibrados para o padrão formal pedagógico do ecossistema em inglês (ex.: *"ela é dentista"* -> `- Profession: Dentist`).

2. **Fusão de Perfis & Reconhecimento de Contas Alternativas (Google Meet):**
   - **Gatilho:** Notas contendo comandos como *"este perfil pertence a [Nome]"*, *"mesmo aluno que [Nome]"*, *"unir ao perfil de [Nome]"*.
   - **Gravação de Alias:** O nome da conta temporária é gravado no Card 1 do aluno oficial como `- Meet Aliases: [Nome Alternativo]`.
   - **Migração de Aulas:** Todas as linhas em `class_sessions` vinculadas ao ID temporário são transferidas via `PATCH` para o ID do aluno oficial.
   - **Mesclagem de Dossiê:** O histórico de aulas do dossiê temporário é concatenado ao histórico oficial.
   - **Expurgo do Duplicado:** As linhas do aluno temporário em `dossiers` e `students` são eliminadas.
   - **Reconhecimento Futuro no Meet:** A rotina `resolveParticipants` do `Code.gs` consulta os aliases registados nos dossiês. Se o aluno entrar novamente em futuras aulas com essa conta, o script vincula-o diretamente ao perfil oficial, impedindo nova duplicação.