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

---

## 2. ROTAS E INTERFACE DA APLICAÇÃO (SPA)

* **`/`** &rarr; Redirecionamento automático para `/teacher`.
* **`/:studentId`** &rarr; `StudentHub.tsx` (Dashboard do aluno com histórico de aulas e status).
* **`/quiz/:sessionId`** &rarr; `QuizView.tsx` (Interface interativa do aluno e painel editorial do professor).
* **`/teacher` e `/teacher/:studentId`** &rarr; `TeacherHub.tsx` (Painel mestre do professor, histórico de sessões, auditoria e disparos).
* **`/teacher/briefing/:sessionId`** &rarr; `BriefingView.tsx` (Briefing pedagógico da sessão e edição de conduta).
* **`/teacher/dossier/:studentId`** &rarr; `DossierView.tsx` (Dossiê evolutivo contínuo e gestão de staging do aluno).

---

## 3. BANCO DE DADOS (SUPABASE SCHEMA)

1. **`students`**
   * `id` (text, PK): Identificador no formato slug (ex.: `camilly-carmo`, `mari-lucena`, `lessandro-bull`).
   * `name` (text): Nome completo formatado em Title Case estrito (ex.: `Camilly Carmo`).
2. **`class_sessions`**
   * `id` (uuid, PK): Identificador único da aula (`gen_random_uuid()`).
   * `student_id` (text, FK &rarr; `students.id`): Vínculo do aluno ou do professor.
   * `class_date` (text): Data formatada (ex.: `Sep 10`, `Aug 31`).
   * `class_time` (text): Hora cheia truncada para baixo (ex.: `12h`, `18h`, `20h`).
   * `is_verified` (boolean): Flag de auditoria e imutabilidade (padrão `false`).
   * `created_at` (timestamp com fuso horário).
3. **`student_quizzes`**
   * `id` (uuid, PK).
   * `session_id` (uuid, FK &rarr; `class_sessions.id`).
   * `level` (text): Nível CEFR ou rótulo de calibração pedagógica.
   * `level_description` (text): Avaliação de fluência com exatamente 4 frases.
   * `focus_areas` (jsonb): Array com exatamente 5 itens de foco (`studentSaid`, `betterWay`, `explanation`, `examples`).
   * `questions` (jsonb): Array com exatamente 10 questões de múltipla escolha (A a E) com gabarito e explicação.
4. **`teacher_briefings`**
   * `id` (uuid, PK).
   * `session_id` (uuid, FK &rarr; `class_sessions.id`).
   * `diagnostic_focus` (text): Diagnóstico prioritário em inglês conciso.
   * `activities_done` (jsonb / text[]): Lista de tópicos praticados.
   * `next_tasks` (text): Tarefas ou compromissos combinados para a próxima aula.
   * `teaching_tip_didactic` (text): Estratégia didática de condução.
   * `teaching_tip_behavioral` (text): Manejo comportamental e de confiança.
5. **`dossiers`**
   * `id` (uuid, PK).
   * `student_id` (text, FK &rarr; `students.id`).
   * `personal_context` (text): Fatos biográficos e pessoais do aluno.
   * `routine` (text): Rotina diária e profissional.
   * `learning_profile` (text): Padrões de retenção e comportamento.
   * `class_history` (text): Histórico cronológico das aulas.
   * `pending_suggestions` (jsonb): Staging com novas sugestões aguardando revisão.
   * `updated_at` (timestamp).

---

## 4. POLÍTICA DE COTAS E ARQUITETURA DE IA

* **Modelo Oficial:** `gemini-2.5-flash` via Google AI Studio API.
* **Cota Diária Estrita:** 20 requisições diárias gratuitas. A cota renova pontualmente às **21:00 BRT** (00:00 UTC).
* **Consumo Rígido por Aula:** **1 Aluno em uma aula = Rigorosamente 1 Requisição à API**.
  * A chamada única ao Gemini retorna simultaneamente:
    1. Avaliação completa do aluno (Nível, Descrição de 4 frases, 5 Áreas de Foco, Quiz de 10 Questões).
    2. Teacher Briefing (Diagnóstico, Atividades, Tarefas, Dicas didática e comportamental).
    3. Sugestões de Dossiê do aluno (Staging).
    4. Autoavaliação do professor (Nível de calibração, Descrição docente de 4 frases, 5 Áreas de Foco docente, Quiz pedagógico de 10 Questões, Briefing e Staging docente).
* **Limites de Processamento:**
  * **Gatilho Autônomo (Time-driven a cada 30 min):** Processa gravações novas com teto de **no máximo 2 aulas por ciclo**.
  * **Lote Histórico Manual:** Executado manualmente pelo professor com teto máximo rígido de **8 aulas por pacote**.
  * **Disparo Pontual na Interface:** O professor seleciona `[Aluno]` + `[Data]` no `TeacherHub.tsx` e aciona `Process This Class Only` (chamada direta via query parameters à URL do Apps Script, consumindo 1 requisição).
* **Blindagem de Arquivos Pendentes:** Se qualquer aluno de uma gravação falhar (por rede, cota 429 ou erro de parsing), o arquivo do Google Docs **NÃO pode ser movido** para a pasta `Google Meet - Processadas`. Ele permanece na pasta raiz `Google Meet` para conclusão no ciclo seguinte.

---

## 5. REGRAS DE NEGÓCIO E PADRONIZAÇÃO DE DADOS

### A. Nomes e Identificadores
* **Title Case Mandatório:** Nomes de alunos devem ser extraídos e padronizados em Title Case estrito (ex.: `CAMILLY CARMO` &rarr; `Camilly Carmo`).
* **Regra de Dois Nomes:** Armazenam-se exclusivamente o Primeiro Nome e o Último Sobrenome (ex.: `Gabrielle Vieira`).
* **Saudação na Avaliação (Frase 1):** Deve conter **estritamente o primeiro nome** do aluno (ex.: `Hi, Camilly.`, `Hi, Daiane.`). Sobrenomes na saudação são proibidos.

### B. Cálculo de Horários
* O horário da aula é determinado somando o horário de início da reunião no Meet com o minuto exato em que o aluno começou a falar na aba `Transcript`.
* **Truncamento para Baixo (`Math.floor`):** O horário final é obrigatoriamente truncado para baixo, no formato `[Hora]h`:
  * `20:48` &rarr; **`20h`**
  * `21:10` &rarr; **`21h`**
  * `18:35` &rarr; **`18h`**

### C. Reconexão e Fusão de Aulas (Opção 1)
* Se uma conexão cair e for gerado um novo documento do Meet para o mesmo aluno na mesma data e mesma hora truncada, o sistema não cria uma sessão duplicada.
* O motor recupera a sessão existente, funde as transcrições e executa uma **reanálise consolidada** via `PATCH`, atualizando o Quiz, o Briefing e a autoavaliação docente em um único registro.

---

## 6. CALIBRAÇÃO PEDAGÓGICA E IDIOMAS

### A. Idioma por Área
* **Área Docente (100% Inglês):** `TeacherHub`, `BriefingView`, `DossierView` e o painel editorial de `QuizView` devem operar estritamente em inglês.
* **Área do Aluno (`QuizView` e `StudentHub`):**
  * **A1 ou A2 Inicial:** Avaliações, explicações e títulos em **português** (aluno sem fluência para sustentar 2 minutos de conversa contínua).
  * **A2 Comunicativo em diante:** Títulos, descrições e explicações em **inglês direto e simples** (nível comunicativo A2/B1).
  * **B1+ em diante:** 100% em **inglês fluente padrão**.

### B. A Regra Mandatória da Frase 3
* A descrição de nível do aluno possui **exatamente 4 frases** (sem citar siglas CEFR no texto).
* **Frase 3:** Ao mencionar qualquer estrutura gramatical ou termo formal (ex.: dependência preposicional, advérbios de suficiência, tempos verbais, conectores), é **obrigatório incluir no mínimo 2 exemplos práticos entre parênteses** imediatamente após o termo:
  * Exemplo: `pay close attention to dependent prepositions (such as 'rely on' and 'interested in') and sufficiency adverbs (such as 'warm enough' and 'too crowded').`

### C. Restrições Vocabulares e Tom
* Tom sóbrio, factual, construtivo e formal.
* **Palavras Terminantemente Proibidas:** Elogios vazios ("incrível", "maravilhoso", "fantástico", "excelente", "parabéns", "amazing", "wonderful", "great job").
* **Pontuação Proibida:** É proibido o uso de pontos de exclamação (`!`).

---

## 7. AUDITORIA, IMUTABILIDADE E EXCLUSÃO

* **Localização dos Controles:** Exclusivamente no painel docente *Class History & Briefings* (`TeacherHub.tsx`), à esquerda do título de cada sessão. O aluno nunca visualiza esses botões.
* **Identidade Visual Camuflada:** Botões minúsculos com fundo idêntico ao card (`#ffffff`) e texto na cor `#a6b1ca` (mesma cor de fundo da página), mantendo discrição absoluta.
* **Comportamento do Botão `x`:** Exclui definitivamente em cascata os registros da aula no Supabase (`student_quizzes`, `teacher_briefings` e `class_sessions`), removendo-a das visões docente e discente.
* **Comportamento do Botão `ok`:**
  * Atualiza o registro no Supabase para `is_verified = true`.
  * Oculta o botão `x` da linha e desativa a ação de `ok`.
  * **Imutabilidade Absoluta:** Sessões com `is_verified = true` ficam permanentemente travadas contra regravações ou sobrescritas por qualquer rotina autônoma do Apps Script.
