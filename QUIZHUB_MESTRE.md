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
* **`/:studentId`** &rarr; `StudentHub.tsx` (Dashboard do aluno com histórico de aulas ordenado por data real decrescente e card azul de `Homework for next class` posicionado acima da lista de quizzes).
* **`/quiz/:sessionId`** &rarr; `QuizView.tsx` (Interface interativa de resolução do quiz para o aluno).
  * Possui botão de retorno discreto **`HUB`** no topo esquerdo do card de título (fundo verde `#71c499`, texto `#27427f`), direcionando para `/:studentId`.
* **`/teacher/quiz/:sessionId`** &rarr; `QuizView.tsx` (Painel editorial docente do quiz, permitindo auditoria e edição de questões, alternativas, áreas de foco e avaliações).
* **`/teacher` e `/teacher/:studentId`** &rarr; `TeacherHub.tsx` (Painel mestre do professor, histórico de sessões ordenado cronologicamente, auditoria e disparos).
  * Seletor de alunos com `<input>` e `<datalist>` nativo: permite escolher alunos cadastrados ou digitar novos nomes livremente.
  * Botão de disparo pontual com largura mínima fixa e animação CSS de pontos pulsantes durante o envio (`triggering`).
  * Cronômetro sincronizado de processamento pontual (65 segundos) ajustado ao tempo real da esteira de IA.
* **`/teacher/briefing/:sessionId`** &rarr; `BriefingView.tsx` (Briefing pedagógico da sessão, edição de conduta, sincronização automática de `nextTasks` com `student_quizzes.homework` e exibição centralizada do nível avaliado na aula).
* **`/teacher/dossier/:studentId`** &rarr; `DossierView.tsx` (Dossiê evolutivo contínuo e gestão de staging do aluno; média móvel de 10 aulas centralizada no S-Dossier; Card 4 oculto no T-Dossier).

---

## 3. BANCO DE DADOS (SUPABASE SCHEMA)

1. **`students`**
   * `id` (text, PK): Slug normalizado (ex.: `camilly-carmo`, `amanda-cardoso`, `lessandro-bull`).
   * `name` (text): Nome completo formatado em Title Case estrito (ex.: `Amanda Cardoso`).
2. **`class_sessions`**
   * `id` (uuid, PK): Identificador único da aula (`gen_random_uuid()`).
   * `student_id` (text, FK &rarr; `students.id`).
   * `class_date` (text): Data formatada (ex.: `Sep 30`, `Aug 31`, `Oct 1`).
   * `class_time` (text): Hora cheia truncada para baixo (ex.: `13h`, `17h`, `20h`).
   * `is_verified` (boolean): Flag de auditoria e imutabilidade (padrão `false`).
   * `created_at` (timestamp com fuso horário).
3. **`student_quizzes`**
   * `id` (uuid, PK).
   * `session_id` (uuid, FK &rarr; `class_sessions.id`).
   * `level` (text): Nível CEFR avaliado na sessão (ex.: `A1 (Iniciante)`, `A2 (Waystage)`, `B2 (Vantage)`).
   * `level_description` (text): Avaliação de fluência com exatamente 4 frases.
   * `focus_areas` (jsonb): Array com exatamente 5 itens de foco (`studentSaid`, `betterWay`, `explanation`, `examples`).
   * `questions` (jsonb): Array com exatamente 10 questões de múltipla escolha (A a E) com gabarito e explicação didática.
   * `homework` (text, nullable): Lista itemizada com as tarefas acordadas (`agreedHomework`).
4. **`teacher_briefings`**
   * `id` (uuid, PK).
   * `session_id` (uuid, FK &rarr; `class_sessions.id`).
   * `activities_done` (jsonb / text[]): Lista com 2 a 3 tópicos praticados.
   * `conversation_assessment` (text): Parágrafo único contínuo de exatamente 4 frases de avaliação da aula.
   * `focus_areas` (jsonb): Array com exatamente 5 itens de foco docente (`studentSaid`, `betterWay`, `explanation`).
   * `next_tasks` (text): Espelho idêntico de `student_quizzes.homework` (`agreedHomework`), separado por marcadores `•` e quebras simples `\n`.
   * `diagnostic_focus` (text): Espelho de `conversation_assessment` para compatibilidade retroativa.
5. **`dossiers`**
   * `id` (uuid, PK).
   * `student_id` (text, FK &rarr; `students.id`).
   * `personal_context` (text): Card 1 — Ficha cadastral estática por tópicos (`• Categoria: Termo / Entidade`).
   * `routine` (text): Card 2 — Linha do tempo com marcações cronológicas `[DD/MM/YY]`.
   * `learning_profile` (text): Card 3 — Dimensões pedagógicas separadas por `•` e `\n\n`.
   * `class_history` (text): Card 4 — Histórico cumulativo de aulas (exclusivo para alunos).
   * `pending_suggestions` (jsonb): Staging com novas sugestões acumuladas via `appendPending` aguardando revisão.
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
    1. Avaliação completa do aluno (Nível CEFR, Descrição de 4 frases, 5 Áreas de Foco, Quiz de 10 Questões, Lição Unificada).
    2. Teacher Briefing (Atividades, Avaliação contínua de 4 frases, 5 Áreas de Foco docente).
    3. Sugestões de Dossiê do aluno (Staging com Cards 1, 2, 3 e 4 com acúmulo contínuo).
    4. Sugestões docentes restritas (Apenas metodologia inédita para o Card 3 do professor, quando houver; demais cards sempre nulos).
* **Limites de Processamento:**
  * **Gatilho Autônomo (Time-driven a cada 30 min):** Processa com teto de **no máximo 1 aula por ciclo**.
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
* Cada evento, viagem, relato de rotina, prova escolar, simulado ou exame acadêmico deve ocupar sua própria linha isolada.
* **Formatação Mandatória:** Separado por quebra de linha simples (`\n`) com carimbo temporal no formato `[DD/MM/YY]` no início da linha:
  * Exemplo: `[31/08/26] Upcoming mock exam scheduled for Thursday; recently completed difficult Chemistry exam (sections A and B).`

### Card 3 — Learning Style & Pedagogical Style
* Dimensões analíticas separadas por marcadores `•` e quebras de linha duplas (`\n\n`).
* No dossiê do professor (T-Dossier), deve registrar estritamente novas condutas, técnicas e adaptações metodológicas adotadas pelo docente. Fica proibido incluir observações sobre cansaço, sono, humor ou rotina dos alunos.

### Card 4 — Cumulative Class History (Exclusivo do Aluno)
* Renderizado exclusivamente para perfis de alunos (`!isTeacherSelf`).
* É **completamente ocultado e inativado no T-Dossier (`lessandro-bull`)**, tanto na interface quanto nas sugestões de staging da IA.

### Teacher Briefing & Exibição de Nível
* **Nível Avaliado na Sessão:** Exibido em destaque no card superior de navegação (`BriefingView.tsx`), centralizado entre o link de retorno e o botão de edição, em negrito e azul escuro (`#27427f`), mantendo a mesma identidade visual do S-Dossier.
* **Conversation Assessment:** Exatamente **um parágrafo contínuo de 4 frases**, sem linhas em branco no meio.
* **Teacher Focus Areas:** Exatamente 5 itens destacando pontos de lapidação da fala do professor.
* **Agreed Next Tasks:** Espelho idêntico da lição de casa do aluno (`agreedHomework`). Qualquer edição manual no briefing atualiza automaticamente `student_quizzes.homework`.

### Seção Homework (Student Hub & Teacher Briefing Unificados)
* Exibida no Student Hub (`/:studentId`), posicionada abaixo do card do aluno e acima da lista de quizzes, em card azul com título estrito em inglês para todos os níveis: `Homework for next class`.
* No Briefing do professor, é exibida sob o título `AGREED NEXT TASKS`. O conteúdo é **100% idêntico em ambos os locais**.
* Lista itemizada com marcadores `•` e quebras de linha simples (`\n`).
* **Extração Estrita Real (Zero Tarefas Sintéticas):** A IA extrai exclusivamente tarefas de estudo de inglês que foram explicitamente combinadas em voz alta durante a sessão. É terminantemente proibido inventar tarefas não atribuídas pelo professor (ex.: ler textos que não foram passados). Se 1 tarefa foi combinada, retorna 1; se 2 foram combinadas, retorna 2; máximo de 3. Se nenhuma tarefa foi combinada em aula, o campo deve retornar `null` (deixando espaço limpo para preenchimento manual pelo professor via painel).
* **Filtro Estrito Anti-Conselho de Vida:** Proibido registrar conselhos cotidianos (segurança no trânsito, cuidados com gripe, despedidas). Extrai exclusivamente deveres pedagógicos de estudo de inglês.
* **Idioma do Conteúdo:** Português para alunos A1; Inglês direto para alunos A2 e superiores.

---

## 6. REGRAS DE NEGÓCIO, ORDENAÇÃO E PADRONIZAÇÃO DE DADOS

### A. Ordenação Cronológica Real das Aulas
* Em todas as listagens da plataforma (`TeacherHub.tsx` e `StudentHub.tsx`), as aulas são ordenadas de forma decrescente pela **data e hora real da aula** (`class_date` + `class_time`), garantindo que as sessões mais recentes fiquem sempre no topo, independentemente do timestamp técnico de gravação no banco (`created_at`).
* No `StudentHub.tsx`, o card de `Homework for next class` consome sempre a lição da aula cronologicamente mais recente.

### B. Nomes e Identificadores
* **Title Case Mandatório:** Nomes padronizados em Title Case estrito (ex.: `Amanda Cardoso`).
* **Regra de Dois Nomes:** Armazenam-se exclusivamente o Primeiro Nome e o Último Sobrenome.
* **Reconhecimento de Speaker na Transcrição:** O motor do Apps Script utiliza expressão regular com suporte a nomes simples e compostos antes dos dois-pontos:
  `new RegExp("(^|\\n)\\s*" + targetFirst + "[^:\\n]*:", "i")` (reconhece `Amanda:`, `Amanda Cardoso:`, etc.).
* **Saudação na Avaliação (Frase 1):** Deve conter **estritamente o primeiro nome** do aluno. Se o nível diagnosticado for A1, inicia-se obrigatoriamente com `Olá, [Nome].`; se for A2 em diante, inicia-se com `Hi, [Nome].`

### C. Cálculo de Horários
* Calculado somando o início da reunião no Meet com o primeiro minuto em que o aluno falou na aba `Transcript`.
* **Truncamento para Baixo (`Math.floor`):** Sempre no formato `[Hora]h` (ex.: `13h`, `17h`, `20h`).

### D. Reconexão e Fusão de Aulas
* Se a conexão cair e uma nova gravação for gerada com o mesmo aluno na mesma data e mesma hora truncada, o sistema recupera a sessão anterior e realiza uma reanálise pedagógica consolidada via `PATCH`.

---

## 7. CALIBRAÇÃO PEDAGÓGICA E IDIOMAS

### A. Idioma por Área
* **Área Docente (100% Inglês):** `TeacherHub`, `BriefingView`, `DossierView` e o painel editorial de `QuizView`.
* **Área do Aluno (`QuizView` e `StudentHub`):**
  * **A1:** Avaliações, explicações, lição de casa e títulos em **português**.
  * **A2 em diante:** Títulos, lição de casa, descrições e explicações em **inglês direto e simples**.
  * **B1+ em diante:** 100% em **inglês fluente padrão**.

### B. Regra Mandatória da Frase 3
* A descrição de nível do aluno possui **exatamente 4 frases** (sem citar siglas CEFR no texto).
* **Frase 3:** Ao mencionar qualquer estrutura gramatical ou termo formal, é **obrigatório incluir no mínimo 2 exemplos práticos entre parênteses**:
  * Exemplo: `pay close attention to past tense auxiliaries (such as 'didn't go' and 'did you see') and subject-verb agreement (such as 'nobody has' and 'it has').`

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
   - **Card 1 (`personal_context`):** Profissão, local de residência, interesses culturais, tecnologia, hobbies, saúde clínica crônica.
   - **Card 2 (`routine`):** Viagens, rotina de estudos/trabalho, acontecimentos com datas ou planos futuros.
   - **Card 3 (`learning_profile`):** Canais sensoriais, dinâmica e métodos de estudo, gatilhos emocionais/atitudinais.
   - **Card 4 (`class_history`):** Notas históricas ou acontecimentos pedagógicos isolados de aulas (apenas para alunos).
   - **Dado Inédito:** A IA formata no padrão visual (`- Label: Value`) e adiciona à seção correta.
   - **Dado Incorreto / Atualização:** A IA localiza a linha desatualizada ou incorreta existente e faz a substituição pontual, mantendo todas as restantes informações do card intactas.
   - **Padronização:** Termos informais ou em português são calibrados para o padrão formal pedagógico do ecossistema em inglês.

2. **Fusão de Perfis & Reconhecimento de Contas Alternativas (Google Meet):**
   - **Gatilho:** Notas contendo comandos como *"este perfil pertence a [Nome]"*, *"mesmo aluno que [Nome]"*, *"unir ao perfil de [Nome]"*.
   - **Gravação de Alias:** O nome da conta temporária é gravado no Card 1 do aluno oficial como `- Meet Aliases: [Nome Alternativo]`.
   - **Migração de Aulas:** Todas as linhas em `class_sessions` vinculadas ao ID temporário são transferidas via `PATCH` para o ID do aluno oficial.
   - **Mesclagem de Dossiê:** O histórico de aulas do dossiê temporário é concatenado ao histórico oficial.
   - **Expurgo do Duplicado:** As linhas do aluno temporário em `dossiers` e `students` são eliminadas.
   - **Reconhecimento Futuro no Meet:** A rotina `resolveParticipants` do `Code.gs` consulta os aliases registrados nos dossiês, impedindo novas duplicações.

---

## 10. MATRIZ DE PROFICIÊNCIA CEFR, SANEAMENTO DE BASE E FILTROS DE TRANSCRIÇÃO

### 10.1. Cálculo Dinâmico de Nível (Média Móvel de 10 Aulas)
- **Fórmula de Cálculo:** O nível de proficiência é a média aritmética arredondada das avaliações das últimas sessões registradas em `class_sessions` / `student_quizzes` (mapeadas numericamente de 1 a 6: A1=1, A2=2, B1=3, B2=4, C1=5, C2=6).
- **Janela Restrita:** Ao atingir 10 ou mais aulas, descarta-se o histórico anterior além da 10ª aula mais recente (cálculo fixo nas últimas 10 sessões).
- **Exibição Visual (S-Dossier):** Exibido exclusivamente no dossiê de alunos (`!isTeacherSelf`), centralizado no card branco superior entre os botões `← Back to Classes` e `EDIT CONTENT`, em negrito e azul escuro (`#27427f`).
- **Injeção no Backend:** O nível consolidado é passado como parâmetro balizador (`STUDENT 10-SESSION ROLLING AVERAGE (OPERATIONAL LEVEL)`) no prompt de análise pedagógica do Gemini.

### 10.2. Os 4 Modos de Fala da Transcrição
A análise divide o texto da sessão em 4 modalidades distintas:
1. **Modo 1 (Leitura Formal de Texto):** Leitura em voz alta de artigos (*News in Levels*), posts, notícias ou diálogos compartilhados na tela.
2. **Modo 2 (Drills & Repetição Ativa):** Treinos de repetição mecânica após o professor, pronúncia isolada ou pares mínimos.
3. **Modo 3 (Diálogo Coerente):** Perguntas e respostas contextualizadas com nexo lógico imediato dentro da aula.
4. **Modo 4 (Discurso / Narrativa Intencional):** Relatos, histórias, justificativas conceituais, opiniões críticas ou sínteses estruturadas espontaneamente pelo aluno.

*Regra de Peso Diagnóstico:*
- **Modos 1 e 2 possuem peso diagnóstico ZERO:** A capacidade de ler um texto complexo ou repetir frases após o professor não afere proficiência oral autônoma.
- **Apenas os Modos 3 e 4 determinam o nível CEFR:** O diagnóstico de proficiência da sessão é determinado exclusivamente pela mecânica sintática, gestão de carga cognitiva e autonomia discursiva comprovadas na conversação espontânea.

### 10.3. Filtro Rígido de Ruído Fonético (Acoustic Noise / STT)
- Falas em português captadas pelo motor de reconhecimento em inglês produzem alucinações sonoras desconexas (*"devil cooper"*, *"fresh supreme"*, *"driving"*).
- Candidatas a falas do aluno sem eco, reação pedagógica ou correção explícita do professor no turno seguinte são **sumariamente descartadas**.
- Proibido selecionar fragmentos que não apresentem estrutura oracional completa ou que representem salada de palavras sintática.

### 10.4. Âncora de Entidades (Dossiê como Ground Truth)
- O Card 1 do Dossiê estabelece os nomes verdadeiros de aplicativos (Duolingo), cidades (Capelinha, Itamarandiba), profissões, escolas e locais de rotina.
- Transcrições fonéticas aproximadas (*"dual lingo"*, *"do lingo"*, *"wolingo"*) devem ser normalizadas silenciosamente para o nome real (*Duolingo*).
- **Proibição Estrita:** É terminantemente proibido apontar nomes próprios, marcas, cidades ou entidades como erros de pronúncia, gramática ou vocabulário do aluno.

### 10.5. Matriz Top-Down de Diagnóstico Oral CEFR (Exclusiva em Modos 3 e 4)

* **Mandato de Avaliação Crítica:** É estritamente obrigatório ignorar a quantidade de fala ou a duração do turno do aluno. A avaliação deve recair exclusivamente sobre a mecânica sintática, gestão de carga cognitiva e precisão discursiva.

* **NÍVEL C2 (Mastery):**
  1. *Automação Absoluta:* Acesso a regras gramaticais e léxico 100% automático. Pausas servem apenas para refinar ideias, nunca para resgatar vocabulário ou corrigir sintaxe.
  2. *Flexibilidade Sintática Orgânica:* Insere parênteses e orações reduzidas sem quebrar ritmo ou coesão.
  3. *Precisão Conotativa e Colocações Nativas:* Fraseologia e colocações idiomáticas indistinguíveis de um falante nativo culto.

* **NÍVEL C1 (Effective Operational Proficiency):**
  1. *Fricção de Monitoramento:* Alta fluência e léxico sofisticado, mas com pausas perceptíveis para monitorar desinências gramaticais ou resgatar termos.
  2. *Construção Linear em Ideias Complexas:* Sustenta raciocínios abstratos longos de forma modular/linear, dependendo de conectivos explícitos.
  3. *Decalque Estrutural Sutil (L1 Residual):* Sintaxe correta, mas com fraseados que denunciam tradução mental sutil de estruturas da língua materna.

* **NÍVEL B2 (Vantage):**
  1. *Bloqueio Lexical e Circunlóquios de Ressonância:* Sustenta conversas abstratas e turnos longos sobre arte, metáforas, psicologia ou sociedade, mas trava (*word-hunting*) quando falta o termo exato, recorrendo a intensificadores repetitivos (*really really*) ou muletas.
  2. *Instabilidade Sintática sob Pressão Discursiva:* Constrói períodos compostos subordinados, mas comete lapsos em tempos simples/irregulares (ex.: *didn't went*) e perde o controle da frase em estruturas hipotéticas complexas.
  3. *Interferência Direta da L1:* Deslizes sistemáticos de regência preposicional por tradução direta (*pay attention in*, *depend of*).

* **NÍVEL B1 (Threshold):**
  1. *Circunlóquio Funcional:* Explica conceitos desconhecidos com orações relativas simples (*a machine that...*) e combina tempos verbais para narrar ações passadas.
  2. *Justificativa com Períodos Compostos Simples:* Explica causas e efeitos usando conectivos básicos (*because, so, although*), mantendo coesão enquanto o tema for concreto e factual.
  3. *Dependência Temática e Reatividade:* Autônomo em assuntos de rotina e trabalho factual, mas torna-se passivo, monossilábico ou reativo assim que o diálogo entra em abstrações, filosofia ou teorias.

* **NÍVEL A2 (Waystage):**
  1. *Sintaxe Paratática Linear:* Frases curtas no padrão [Sujeito + Verbo + Objeto], amarradas quase exclusivamente por *and* ou *and then*, sem subordinação funcional.
  2. *Incapacidade de Circunlóquio:* Quando falta um vocábulo, não consegue definir o objeto ou a ação; usa termos coringa (*this thing, stuff*) ou abandona a tentativa.
  3. *Justificativas Circulares e Foco Concreto:* Expressa opiniões apenas com adjetivos básicos (*good, bad, nice*); falhas frequentes fora do presente simples.

* **NÍVEL A1 (Breakthrough):**
  - O inglês só ocorre no Modo 1 (leitura) ou Modo 2 (drills/repetição). Nos Modos 3 e 4, a produção resume-se a:
  1. *Produção Pré-Frasal:* Palavras soltas, números ou substantivos desconexos, sem articular orações espontâneas completas.
  2. *Fórmulas Decoradas e Ecolalia:* Cumprimentos decorados em bloco (*hello, fine thank you*) ou eco mecânico das falas do professor.
  3. *Ausência de Autonomia:* A conversação espontânea morre em menos de 5 minutos sem tradução direta para o português.

### 10.6. As 3 Faixas Operacionais de Geração de Conteúdo
Após diagnosticar a aula em um dos 6 níveis, o sistema gera o Quiz, Focus Areas e explicações segundo a matriz operacional:
* **Faixa 1 (A1 - Iniciante):** Teto estrito em A1. Explicações e lições 100% em português. Distratores baseados em armadilhas de interlíngua básica.
* **Faixa 2 (A2 e B1 - Autonomia em Construção):** Conteúdo até B1. Idioma 100% em inglês simples e direto. Distratores focados em contrastes funcionais de tempos verbais e preposições.
* **Faixa 3 (B2, C1 e C2 - Refinamento e Independência):** Pode trabalhar qualquer ponto do básico ao avançado. Idioma 100% em inglês padrão fluente.

### 10.7. Ordem de Prioridade: Saneamento de Base (Bottom-Up)
1. **Degrau 1 (Base Elementar):** Falhas em *Present Simple* (3ª pessoa `-s`), auxiliares *do/does/did*, verbo *to be* e pronomes ocupam obrigatoriamente as primeiras vagas das *Focus Areas* e do *Quiz*.
2. **Degrau 2 (Autonomia):** Tempos compostos, modais funcionais, contrastes narrativos e preposições.
3. **Degrau 3 (Polimento Avançado):** Preposições dependentes, *collocations* e conectores discursivos.
- Proibido cobrar sutilezas avançadas enquanto alicerces estruturais básicos estiverem oscilando.

### 10.8. Fidelidade Semântica, Afetiva e Acurácia no `betterWay`
* **Invariância de Valência Emocional:** A correção preserva 100% o tom e a intenção do aluno. Se o aluno utilizou adjetivos positivos (*good, fine, happy*), é terminantemente proibido trocar por termos corporativos de cansaço ou sobrecarga (*busy, exhausting, heavy workload*).
* **Intervenção Mínima:** Apenas palavras com desvios gramaticais são alteradas. Termos corretos e a estrutura intencional do aluno devem ser mantidos.
* **Acurácia Gramatical (Zero AI Slips):** O `betterWay` deve ter gramática 100% impecável em inglês padrão nativo. Os 3 exemplos gerados (`examples`) devem ser orações completas e gramaticalmente perfeitas, respeitando o teto de nível do aluno.

### 10.9. Coexistência 50/50 e Gatilho de Vocabulário Ativo
* **Equilíbrio de Contexto:** O tema da aula é o cenário primário. O Dossiê do aluno equilibra cerca de 50% dos exemplos e itens do quiz, vinculando frases à profissão, cidade e rotina reais do aluno.
* **Gatilho de Vocabulário:** Vocabulário isolado só ocupa vaga no *Focus Area* ou no *Quiz* se o professor tiver exigido ativamente repetições, treino de pronúncia ou definições na aula.

### 10.10. Integridade Pedagógica e Engenharia de Distratores (Quiz)
- A IA é livre para usar múltiplos formatos pedagógicos (lacunas, identificação de erros, equivalência, resposta conversacional).
- **Regras Estritas de Integridade:**
  1. Se for preenchimento de lacuna, o `_____` deve marcar exatamente o termo testado, sendo proibido omitir palavras do enunciado que não constem nas alternativas.
  2. Cada questão deve ter 1 alternativa perfeitamente correta e 4 distratores plausíveis (baseados em interlíngua ou no erro real do aluno). É proibida a geração de questões ambíguas com duas ou zero alternativas válidas.
  3. Enunciado, alternativas e explicação didática devem ser 100% impecáveis gramaticalmente no idioma e nível correspondente à faixa do aluno.
- **Proibição Absoluta de Trocadilhos Fonéticos:** Banida qualquer alternativa baseada em semelhança sonora casual (*raining* vs. *training*, *kitchen* vs. *chicken*), exceto se o professor realizou um treino deliberado de pares mínimos com aqueles sons na aula.

### 10.11. Blindagem do T-Dossier (Perfil Docente)
* No perfil do professor (`lessandro-bull`), o Card 4 (histórico de aulas cumulativo) permanece permanentemente bloqueado e oculto.
* **Captura de Vivências do Professor:** O sistema captura ativamente e salva no Staging os dados biográficos estáticos (Card 1) e episódios datados de rotina e projetos (Card 2) contados exclusivamente por Lessandro Büll na aula.
* **Captura Metodológica:** O campo de abordagem pedagógica (Card 3) registra novas condutas e andaimes didáticos adotados pelo professor na sessão.
* **Filtro Absoluto Anti-Contaminação:** No Backend, antes do salvamento no Supabase, qualquer sugestão para os Cards 1, 2 ou 3 do professor que contiver o nome de algum aluno cadastrado no sistema é sumariamente descartada e vetada.

### 10.12. Comandos de Voz ao Vivo (Teacher Directives Override)
* **Gatilho na Transcrição:** Se o professor verbalizar comandos diretos chamando a IA pelo nome na aula (ex.: *"Gemini, we need this point in Focus Area"*, *"Gemini, coloque isso no Quiz"*, *"Gemini, a lição de casa é..."*).
* **Prioridade Máxima (Override):** A IA deve tratar esses comandos como mandato pedagógico absoluto, sobrescrevendo a seleção automatizada de diagnóstico.
* **Alocação de Slots:** O item solicitado ocupará obrigatoriamente a posição #1 (Slot 1) das *Focus Areas*, a *Questão 1* do Quiz, ou a primeira linha da lição de casa (`agreedHomework`).