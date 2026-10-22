# 🖨️ QUIZHUB_DUMPER.md
Snapshot técnico gerado automaticamente com a estrutura e código da plataforma.

## 1. ÁRVORE DE DIRETÓRIOS
./.gitignore
./.oxlintrc.json
./Code.gs
./index.html
./package.json
./package-lock.json
./public/favicon.svg
./public/icon-180.png
./public/icon-192.png
./public/icon-512.png
./public/icon-64.png
./public/icons.svg
./public/manifest.json
./public/sw.js
./QUIZHUB_MASTER.md
./README.md
./src/App.tsx
./src/assets/hero.png
./src/assets/react.svg
./src/assets/vite.svg
./src/components/TeacherGuard.tsx
./src/index.css
./src/lib/supabase.ts
./src/main.tsx
./src/pages/BriefingView.tsx
./src/pages/DossierView.tsx
./src/pages/QuizView.tsx
./src/pages/StudentHub.tsx
./src/pages/TeacherHub.tsx
./tsconfig.app.json
./tsconfig.json
./tsconfig.node.json
./vercel.json
./vite.config.ts

## 2. CÓDIGO FONTE INTEGRAL


### 📄 ARQUIVO: ./.gitignore
# Dependências
node_modules
.pnp
.pnp.js

# Build de produção
dist
dist-ssr
*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Variáveis de ambiente
.env
.env.local
.env.production

# Editores
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
Code.gs

# Backups locais
backup_target_classes.json

# Scripts utilitarios locais
scripts/


### 📄 ARQUIVO: ./.oxlintrc.json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}


### 📄 ARQUIVO: ./Code.gs
/**
 * SISTEMA AUTÔNOMO QUIZHUB — MOTOR UNIFICADO DEFINITIVO
 * Cascata Oficial Gemini (3.5 -> 3-preview -> 2.5)
 * Matriz Cumulativa CEFR (A1 até o Nível Operacional do Aluno via Supabase)
 * 4 Tiers Operacionais Independentes (A1 | A2 | B1 | B2/C1/C2)
 * Tom Universal Informal de Bilhete de Amigo (Sem Jargões Gramaticais Pesados)
 * Varredura Completa da Transcrição & Prioridade Máxima por Repetições Ativas do Professor
 * Blindagem Contra Avaliação de Pontuação e Caixa Alta (Foco Exclusivo em Fala Oral)
 * Filtro de Ruído Acústico do STT (Evidência Sintática Real)
 * Fronteira Estrita no betterWay (Sem Ler Pensamentos ou Inventar Frases Novas)
 * Proporção 70/30 (Tema da Aula / Dossiê) e Veto à Repetição de Sujeitos
 * Teto de Vocabulário Ativo (Máximo de 2 Itens por Aula se Drilados)
 * Lição de Casa Unificada (agreedHomework) com Regra de Idioma por Tier
 * Blindagem Estrita do T-Dossier (lessandro-bull)
 * Processamento Semântico do Brain Dump & Unificação de Perfis com Alias
 */

const CONFIG = {
  GEMINI_API_KEY: "SUA_CHAVE_GEMINI_AQUI",
  
  // Cascata oficial restrita às 3 versões validadas na sua chave
  GEMINI_MODELS: [
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash"
  ],
  
  SUPABASE_URL: "https://xttzilpuuqjbztjkeadd.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "SUA_CHAVE_SUPABASE_SERVICE_ROLE_AQUI",
  
  MEET_FOLDER_NAME: "Google Meet",
  PROCESSED_FOLDER_NAME: "Google Meet - Processadas",
  TEACHER_ID: "lessandro-bull",
  TEACHER_NAME: "Lessandro Büll"
};

/**
 * 1. ENDPOINT WEB EXCLUSIVO DO BOTÃO DA PLATAFORMA
 */
function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action;

    // Rota A: Processamento do Brain Dump (Dossiê e Fusão de Perfis)
    if (action === "processBrainDump") {
      const studentId = e.parameter.studentId;
      const note = e.parameter.note;
      const resultado = processBrainDump(studentId, note);
      return ContentService.createTextOutput(JSON.stringify(resultado))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Rota B: Disparo pontual de aula via botão do painel
    const studentName = e && e.parameter && e.parameter.studentName;
    const targetDate = e && e.parameter && e.parameter.targetDate;

    if (studentName) {
      Logger.log(`[DISPARO PONTUAL] Buscando aula para: ${studentName} na data: ${targetDate || "Qualquer"}`);
      const resultado = processarAulaDirecionada(studentName, targetDate);
      return ContentService.createTextOutput(JSON.stringify(resultado))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "ignored", 
      message: "Nenhum aluno ou ação especificada. Fila geral não executada." 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log(`[ERRO DOGET] ${err.message}`);
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 2. PROCESSAMENTO DIRECIONADO (ACIONADO PELO BOTÃO DA PLATAFORMA)
 */
function processarAulaDirecionada(targetStudentName, targetDate) {
  const meetFolder = getFolderByName(CONFIG.MEET_FOLDER_NAME);
  const processedFolder = getOrCreateFolder(CONFIG.PROCESSED_FOLDER_NAME);

  let candidateFiles = [];
  if (meetFolder) {
    candidateFiles = candidateFiles.concat(getAllDocsRecursively(meetFolder, CONFIG.PROCESSED_FOLDER_NAME));
  }
  if (processedFolder) {
    candidateFiles = candidateFiles.concat(getAllDocsInFolderOnly(processedFolder));
  }

  const targetFirst = targetStudentName.split(" ")[0].trim();
  const speakerRegex = new RegExp("(^|\\n)\\s*" + targetFirst + "[^:\\n]*:", "i");

  for (let i = 0; i < candidateFiles.length; i++) {
    const file = candidateFiles[i];
    const doc = DocumentApp.openById(file.getId());
    const transcriptText = extractTranscriptTabOnly(doc);

    if (!transcriptText || transcriptText.trim().length === 0) continue;

    const fileDateInfo = extractDateFromFileNameOrDoc(file);

    if (targetDate && fileDateInfo.baseDate !== targetDate) {
      continue;
    }

    if (speakerRegex.test(transcriptText)) {
      Logger.log(`[LOCALIZADO] Arquivo encontrado: ${file.getName()} para ${targetStudentName} (${fileDateInfo.baseDate})`);
      
      const sucesso = processarDocumentoEspecifico(file, transcriptText, fileDateInfo, targetStudentName);
      
      if (sucesso) {
        const parents = file.getParents();
        if (parents.hasNext() && parents.next().getName() === CONFIG.MEET_FOLDER_NAME) {
          file.moveTo(processedFolder);
        }
        return {
          status: "success",
          message: `Aula de ${targetStudentName} (${fileDateInfo.baseDate}) processada com sucesso.`
        };
      }
    }
  }

  return {
    status: "not_found",
    message: `Nenhum documento encontrado para ${targetStudentName}${targetDate ? " na data " + targetDate : ""}.`
  };
}

/**
 * 3. PROCESSAMENTO GERAL DA FILA (EXECUÇÃO MANUAL NO APPS SCRIPT)
 */
function processarAulasPendentes() {
  const meetFolder = getFolderByName(CONFIG.MEET_FOLDER_NAME);
  if (!meetFolder) {
    Logger.log(`[ERRO] Pasta raiz '${CONFIG.MEET_FOLDER_NAME}' não encontrada.`);
    return;
  }

  const processedFolder = getOrCreateFolder(CONFIG.PROCESSED_FOLDER_NAME);
  const pendingFiles = getAllDocsRecursively(meetFolder, CONFIG.PROCESSED_FOLDER_NAME);

  if (pendingFiles.length === 0) {
    Logger.log("[INFO] Nenhum arquivo pendente para processamento.");
    return;
  }

  pendingFiles.sort((a, b) => a.getDateCreated() - b.getDateCreated());
  
  // Limita o processamento a 1 arquivo por execução para prevenir timeout de 360s do Apps Script
  const maxToProcess = Math.min(1, pendingFiles.length);

  for (let i = 0; i < maxToProcess; i++) {
    const file = pendingFiles[i];

    Logger.log(`\n======================================================`);
    Logger.log(`Processando arquivo da fila (${i + 1}/${maxToProcess}): ${file.getName()}`);

    try {
      const doc = DocumentApp.openById(file.getId());
      const transcriptText = extractTranscriptTabOnly(doc);

      if (!transcriptText || transcriptText.trim().length === 0) {
        Logger.log("[AVISO] Transcrição vazia. Movendo para pasta de processadas.");
        file.moveTo(processedFolder);
        continue;
      }

      const fileDateInfo = extractDateFromFileNameOrDoc(file);
      const sucesso = processarDocumentoEspecifico(file, transcriptText, fileDateInfo, null);
      
      if (sucesso) {
        file.moveTo(processedFolder);
        Logger.log(`[SUCESSO] ${file.getName()} concluído e movido para '${CONFIG.PROCESSED_FOLDER_NAME}'.`);
      } else {
        Logger.log(`[AVISO] Falha ao processar ${file.getName()}. Arquivo mantido na fila.`);
      }
    } catch (err) {
      Logger.log(`[FALHA GERAL] Erro em ${file.getName()}: ${err.message}`);
    }
  }
}

/**
 * 4. NÚCLEO DE EXECUÇÃO PEDAGÓGICA POR DOCUMENTO
 */
function processarDocumentoEspecifico(file, transcriptText, fileDateInfo, filterOnlyStudentName) {
  const detectedStudents = resolveParticipants(transcriptText);

  if (detectedStudents.length === 0) {
    Logger.log("[AVISO] Nenhum aluno reconhecido na aba Transcript.");
    return false;
  }

  const studentsToProcess = filterOnlyStudentName
    ? detectedStudents.filter(s => s.name.toLowerCase().includes(filterOnlyStudentName.split(" ")[0].toLowerCase()))
    : detectedStudents;

  if (studentsToProcess.length === 0) {
    Logger.log(`[AVISO] Aluno ${filterOnlyStudentName} não identificado formalmente entre os participantes.`);
    return false;
  }

  let allSaved = true;

  for (let i = 0; i < studentsToProcess.length; i++) {
    const student = studentsToProcess[i];
    const roundedClassTime = calculateTruncatedClassTime(transcriptText, student.name, fileDateInfo.baseHour, fileDateInfo.baseMinute);
    const currentSegment = extractStudentSegment(transcriptText, student.name, detectedStudents);
    const studentDossier = getDossierFromSupabase(student.id);
    const rollingLevel = getStudentRollingLevel(student.id);
    const existingSession = getExistingSession(student.id, fileDateInfo.baseDate, roundedClassTime);

    let analysis = null;

    if (existingSession) {
      Logger.log(`\n[FUSÃO DE AULA] Reconexão detectada para ${student.name} em ${fileDateInfo.baseDate} às ${roundedClassTime}.`);
      const priorQuiz = getExistingQuiz(existingSession.id);
      const priorBriefing = getExistingBriefing(existingSession.id);

      analysis = runUnifiedPedagogicalAnalysis(
        currentSegment,
        studentDossier,
        student.name,
        fileDateInfo.baseDate,
        { priorQuiz: priorQuiz, priorBriefing: priorBriefing },
        fileDateInfo.dateStamp,
        rollingLevel
      );

      if (analysis) {
        updateStudentSession(existingSession.id, student.id, analysis);
      } else {
        allSaved = false;
      }
    } else {
      Logger.log(`\n--- Processando sessão de: ${student.name} (${fileDateInfo.baseDate} às ${roundedClassTime}) [Nível Base: ${rollingLevel || "Novo"}] ---`);
      analysis = runUnifiedPedagogicalAnalysis(
        currentSegment,
        studentDossier,
        student.name,
        fileDateInfo.baseDate,
        null,
        fileDateInfo.dateStamp,
        rollingLevel
      );

      if (analysis) {
        saveStudentSession(student.id, fileDateInfo.baseDate, roundedClassTime, analysis);
      } else {
        allSaved = false;
      }
    }
  }

  return allSaved;
}

/**
 * 5. CÁLCULO DA MÉDIA MÓVEL DE NÍVEL (ÚLTIMAS 10 AULAS)
 */
function getStudentRollingLevel(studentId) {
  if (!studentId || studentId === CONFIG.TEACHER_ID) return null;
  try {
    const query = `class_sessions?student_id=eq.${encodeURIComponent(studentId)}&select=id,created_at,student_quizzes(level)&order=created_at.desc&limit=10`;
    const sessions = supabaseRequest(query, "get") || [];
    const levelMap = { "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6 };
    const numToLevel = { 1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C2" };
    const values = [];

    sessions.forEach(s => {
      const sq = Array.isArray(s.student_quizzes) ? s.student_quizzes[0] : s.student_quizzes;
      if (sq && sq.level) {
        const match = sq.level.match(/\b([ABC][12])\b/i);
        if (match) {
          const code = match[1].toUpperCase();
          if (levelMap[code]) values.push(levelMap[code]);
        }
      }
    });

    if (values.length === 0) return null;
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const clamped = Math.max(1, Math.min(6, avg));
    return numToLevel[clamped] || null;
  } catch (e) {
    Logger.log(`[AVISO] Erro ao calcular média do nível: ${e.message}`);
    return null;
  }
}

/**
 * 5B. RECUPERAÇÃO CUMULATIVA DA MATRIZ CEFR (A1 ATÉ O NÍVEL OPERACIONAL DO ALUNO)
 */
function getCefrMatrixForLevel(studentRollingLevel) {
  const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const targetLevel = (studentRollingLevel || "A1").toUpperCase();
  const targetIdx = levelOrder.indexOf(targetLevel);
  
  // Se for aluno novo ou sem histórico, carrega A1 e A2 como régua base de acolhimento
  const activeLevels = targetIdx === -1 
    ? ["A1", "A2"] 
    : levelOrder.slice(0, targetIdx + 1);

  // Consulta limpa REST no Supabase na tabela cefr_matrix
  const query = `cefr_matrix?level=in.(${activeLevels.join(',')})&select=level,content`;
  const records = supabaseRequest(query, "get") || [];

  if (records.length === 0) {
    Logger.log("[AVISO] Matriz CEFR não retornou registros do Supabase.");
    return "No CEFR descriptors loaded.";
  }

  // Ordena rigorosamente na ordem pedagógica crescente: A1 -> A2 -> B1 -> B2...
  records.sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));

  // Concatena os blocos com cabeçalhos bem identificados para a IA
  return records.map(r => `--- CEFR LEVEL BENCHMARK: ${r.level} ---\n${r.content}`).join("\n\n");
}

function extractDateFromFileNameOrDoc(file) {
  let baseDate = "";
  let baseHour = 0;
  let baseMinute = 0;
  let dateStamp = "";
  const nameMatch = file.getName().match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (nameMatch) {
    const year = nameMatch[1];
    const monthStr = nameMatch[2];
    const dayStr = nameMatch[3];
    const monthIdx = parseInt(monthStr, 10) - 1;
    const dayNum = parseInt(dayStr, 10);
    
    baseDate = `${months[monthIdx]} ${dayNum}`;
    baseHour = parseInt(nameMatch[4], 10);
    baseMinute = parseInt(nameMatch[5], 10);
    dateStamp = `${dayStr}/${monthStr}/${year.slice(2)}`;
  } else {
    const fileDate = file.getDateCreated();
    baseDate = `${months[fileDate.getMonth()]} ${fileDate.getDate()}`;
    baseHour = fileDate.getHours();
    baseMinute = fileDate.getMinutes();
    
    const d = String(fileDate.getDate()).padStart(2, '0');
    const m = String(fileDate.getMonth() + 1).padStart(2, '0');
    const y = String(fileDate.getFullYear()).slice(2);
    dateStamp = `${d}/${m}/${y}`;
  }

  return { baseDate, baseHour, baseMinute, dateStamp };
}

function calculateTruncatedClassTime(fullText, studentName, startHour, startMinute) {
  const firstName = studentName.split(" ")[0].trim();
  const cleanFirst = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const speakerRegex = new RegExp("(^|\\n|\\*\\*)\\s*" + cleanFirst + "[^:\\n]*:", "i");

  const lines = fullText.split("\n");
  let elapsedMinutes = 0;
  let currentElapsed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const timeMatch = line.match(/(?:^|\b|\*{2})(\d{1,2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      currentElapsed = (h * 60) + m;
    }

    const cleanLine = line.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (speakerRegex.test(cleanLine)) {
      elapsedMinutes = currentElapsed;
      break;
    }
  }

  const totalMinutes = (startHour * 60) + startMinute + elapsedMinutes;
  const hour = Math.floor(totalMinutes / 60) % 24;
  return `${hour}h`;
}

function getExistingSession(studentId, classDate, classTime) {
  const query = `class_sessions?student_id=eq.${encodeURIComponent(studentId)}&class_date=eq.${encodeURIComponent(classDate)}&class_time=eq.${encodeURIComponent(classTime)}&select=id`;
  const res = supabaseRequest(query, "get");
  return (res && res.length > 0) ? res[0] : null;
}

function getExistingQuiz(sessionId) {
  const res = supabaseRequest(`student_quizzes?session_id=eq.${encodeURIComponent(sessionId)}&select=*`, "get");
  return (res && res.length > 0) ? res[0] : null;
}

function getExistingBriefing(sessionId) {
  const res = supabaseRequest(`teacher_briefings?session_id=eq.${encodeURIComponent(sessionId)}&select=*`, "get");
  return (res && res.length > 0) ? res[0] : null;
}

function extractTranscriptTabOnly(doc) {
  if (doc.getTabs) {
    const tabs = doc.getTabs();
    function searchTranscriptTab(tabList) {
      for (let i = 0; i < tabList.length; i++) {
        const tab = tabList[i];
        const title = (tab.getTitle() || "").toLowerCase();
        if (title.includes("transcript") || title.includes("transcrição")) {
          if (tab.asDocumentTab) return tab.asDocumentTab().getBody().getText();
        }
        if (tab.getChildTabs) {
          const childText = searchTranscriptTab(tab.getChildTabs());
          if (childText) return childText;
        }
      }
      return null;
    }
    const transcriptContent = searchTranscriptTab(tabs);
    if (transcriptContent && transcriptContent.trim().length > 0) return transcriptContent;
  }
  return doc.getBody().getText();
}

function resolveParticipants(transcriptText) {
  const existingStudents = supabaseRequest("students?select=id,name", "get") || [];
  const registeredMap = {};
  existingStudents.forEach(s => {
    registeredMap[s.name.toLowerCase()] = s;
  });

  try {
    const allDossiers = supabaseRequest("dossiers?select=student_id,personal_context", "get") || [];
    allDossiers.forEach(d => {
      if (d.personal_context) {
        const aliasMatch = d.personal_context.match(/[-•]?\s*Meet Aliases:\s*([^\n]+)/i);
        if (aliasMatch && aliasMatch[1]) {
          const studentObj = existingStudents.find(s => s.id === d.student_id);
          if (studentObj) {
            aliasMatch[1].split(',').forEach(alias => {
              const cleanAlias = alias.trim().toLowerCase();
              if (cleanAlias.length > 0) {
                registeredMap[cleanAlias] = studentObj;
              }
            });
          }
        }
      }
    });
  } catch (err) {
    Logger.log(`[AVISO] Erro ao carregar aliases: ${err.message}`);
  }

  const detectedMap = {};
  const lines = transcriptText.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const colonIndex = line.indexOf(":");

    if (colonIndex >= 3 && colonIndex <= 45) {
      const candidate = line.substring(0, colonIndex).trim();

      if (/\d/.test(candidate)) continue;
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(candidate)) continue;

      const lower = candidate.toLowerCase();
      if (
        lower.includes("lessandro") || lower.includes("bull") || lower.includes("büll") ||
        lower.includes("gemini") || lower.includes("meeting") || lower.includes("notes") ||
        lower.includes("transcript") || lower.includes("quick") || lower.includes("full")
      ) {
        continue;
      }

      const formattedName = extractFirstAndLastName(candidate);
      if (formattedName && formattedName.length >= 3 && !detectedMap[formattedName.toLowerCase()]) {
        detectedMap[formattedName.toLowerCase()] = formattedName;
      }
    }
  }

  const finalStudents = [];

  for (let lowerName in detectedMap) {
    const displayName = detectedMap[lowerName];

    if (registeredMap[lowerName]) {
      finalStudents.push(registeredMap[lowerName]);
    } else {
      const newId = generateSlug(displayName);
      Logger.log(`[NOVO ALUNO DETECTADO] Cadastrando: ${displayName} (${newId})`);

      const created = supabaseRequest("students", "post", { id: newId, name: displayName }, true);
      if (created && created.length > 0) {
        supabaseRequest("dossiers", "post", {
          student_id: newId,
          personal_context: "No personal data recorded yet.",
          routine: "No routine data recorded yet.",
          learning_profile: "No learning profile recorded yet.",
          class_history: "",
          pending_suggestions: null
        });

        const newStudent = { id: newId, name: displayName };
        registeredMap[lowerName] = newStudent;
        finalStudents.push(newStudent);
      }
    }
  }

  return finalStudents;
}

function extractFirstAndLastName(rawName) {
  const clean = rawName.replace(/[\(\)\[\]0-9]/g, "").trim();
  const words = clean.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return null;

  function toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  if (words.length === 1) return toTitleCase(words[0]);
  return `${toTitleCase(words[0])} ${toTitleCase(words[words.length - 1])}`;
}

function generateSlug(text) {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractStudentSegment(fullText, currentStudentName, allDetected) {
  if (allDetected.length <= 1) return fullText;

  const lines = fullText.split("\n");
  const filtered = [];
  const firstName = currentStudentName.split(" ")[0].toLowerCase();
  const teacherFirstName = CONFIG.TEACHER_NAME.split(" ")[0].toLowerCase();

  let firstTurnIdx = -1;
  let lastTurnIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes(":")) {
      const spk = lineLower.split(":")[0].trim();
      if (spk.includes(firstName)) {
        if (firstTurnIdx === -1) firstTurnIdx = i;
        lastTurnIdx = i;
      }
    }
  }

  if (firstTurnIdx === -1 || lastTurnIdx === -1) return fullText;

  let capture = false;
  for (let i = firstTurnIdx; i <= lastTurnIdx; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    if (lineLower.includes(":")) {
      const spk = lineLower.split(":")[0].trim();
      capture = spk.includes(firstName) || spk.includes(teacherFirstName);
    }

    if (capture) {
      filtered.push(line);
    }
  }

  let capturingLateDirective = false;
  for (let i = lastTurnIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    if (lineLower.includes(":")) {
      const spk = lineLower.split(":")[0].trim();
      const isTeacher = spk.includes(teacherFirstName);
      const isDirectiveForStudent = isTeacher && lineLower.includes("gemini") && lineLower.includes(firstName);

      capturingLateDirective = isDirectiveForStudent;
    }

    if (capturingLateDirective) {
      filtered.push(line);
    }
  }

  const res = filtered.join("\n");
  return res.length > 300 ? res : fullText;
}

/**
 * 6. MOTOR DE ANÁLISE PEDAGÓGICA (PROMPT ESTRITAMENTE CALIBRADO)
 */
function runUnifiedPedagogicalAnalysis(transcriptText, studentDossier, studentName, classDate, mergeContext, dateStamp, studentRollingLevel) {
  const studentFirstName = studentName.split(" ")[0].trim();
  const cefrMatrixInjected = getCefrMatrixForLevel(studentRollingLevel);

  const dossierSummary = studentDossier
    ? `PERSONAL DATA: ${studentDossier.personal_context}\nROUTINE: ${studentDossier.routine}\nLEARNING PROFILE: ${studentDossier.learning_profile}\nCLASS HISTORY: ${studentDossier.class_history}`
    : "No prior records.";

  let reconnectionInstructions = "";
  if (mergeContext && mergeContext.priorQuiz) {
    reconnectionInstructions = `
CRITICAL INSTRUCTION - RECONNECTED SESSION (SAME CLASS):
This session had a connection drop. We are processing the continuation of the SAME class.
Prior Part Student Focus: ${JSON.stringify(mergeContext.priorQuiz.focus_areas || [])}
Prior Part Activities: ${JSON.stringify((mergeContext.priorBriefing && mergeContext.priorBriefing.activities_done) || [])}
TASK: Merge both parts into ONE single cohesive assessment.
`;
  }

  const prompt = `
You are the Lead Pedagogical AI for Quizhub, an English teaching platform.
Teacher: "${CONFIG.TEACHER_NAME}"
Student: "${studentName}"
Class Date: "${classDate}"
SESSION DATE STAMP: "[${dateStamp}]"
STUDENT 10-SESSION ROLLING AVERAGE (OPERATIONAL LEVEL): "${studentRollingLevel || "First Session / Diagnostic"}"

CRITICAL LEVEL DUALITY RULE:
1. SESSION DIAGNOSED LEVEL (CLASS GRADE): Evaluate the student's oral proficiency in this specific lesson and report it in the "level" output field. This represents the student's specific performance grade in this session.
2. OPERATIONAL LEVEL GOVERNANCE (TIER ACTIVATION): Content generation (Operational Tiers in Section 3, explanations language, grammatical ceiling of Focus Areas examples, and Quiz distractors) MUST be governed by the student's 10-Session Rolling Average ("${studentRollingLevel || "Diagnosed Level"}"). If no rolling average exists (first session), use the session diagnosed level.

PRIOR DOSSIER CONTENT:
${dossierSummary}
${reconnectionInstructions}

STRICT TONE RULES:
- Voice: Constructive, sober, direct, respectful, and pedagogically encouraging. Always validate the student's active practice and frame learning points as positive, achievable steps forward.
- FORBIDDEN DEFICIT LANGUAGE: You are strictly forbidden from using patronizing, clinical, or deficit-focused phrases (e.g., "forte dependência", "depende fortemente", "suporte constante", "incapaz de", "não consegue", "estágio rudimentar", "heavy reliance", "unable to"). Never define the student by their limitations; define them by what they practiced and the immediate skill to build next.
- PROHIBITED WORDS: "incrível", "maravilhoso", "fantástico", "excelente", "parabéns", "amazing", "wonderful", "great job".
- PROHIBITED CHARACTERS: No exclamation marks (!) anywhere in the output.

================================================================================
SECTION 1: THE 4 TRANSCRIPTION INPUT MODES & ORAL TRANSCRIPT NATURE
================================================================================
The transcript contains 4 distinct speech modes:
MODE 1 (Formal Text Reading): Reading aloud shared texts, articles, news, or dialogues.
MODE 2 (Active Drills & Repetition): Repeating words, pronunciation minimal pairs, or patterns after the teacher.
MODE 3 (Coherent Dialogue): Meaningful Q&A exchanges logically linked to the topic or homework.
MODE 4 (Intentional Student Discourse): Spontaneous narratives, explanations, opinions, or structured arguments.

CRITICAL ORAL PROFICIENCY RULE:
- MODES 1 & 2 DO NOT REFLECT ORAL PROFICIENCY: Text reading and mechanical drills have ZERO diagnostic weight for CEFR classification. An A1 student can read a B2 text or repeat an advanced sentence.
- ONLY MODES 3 & 4 DETERMINE THE REAL LEVEL: The student's proficiency classification is determined EXCLUSIVELY by their syntactic mechanics, cognitive load management, and communicative autonomy during Mode 3 (Dialogue) and Mode 4 (Discourse).

ORAL TRANSCRIPT NATURE (ZERO PUNCTUATION OR CAPITALIZATION AUDITING):
- The input is a raw speech-to-text transcript of an ORAL conversation, NOT a written composition or essay.
- STRICT PROHIBITION: You are strictly forbidden from evaluating, correcting, or mentioning punctuation (commas, periods, question marks), capitalization (capital letters vs. lowercase, capitalizing proper nouns, brand names, or titles), or spacing.
- Focus exclusively on spoken morphosyntax: word order, verb forms, auxiliaries, spoken prepositions, and structural agreement. Never penalize a student for punctuation or lowercase text introduced by the transcription software.

SYNTACTIC INTENT REQUIREMENT (FILTERING STT ACOUSTIC ARTIFACTS):
- An utterance only qualifies for Focus Areas or Quiz remediation if there is a clear, identifiable communicative and syntactic intent from the student.
- STRICT PROHIBITION: Do NOT treat isolated acoustic glitches, phantom words, or nonsensical speech-to-text hallucinations as grammatical errors made by the student.
- If a random, disconnected word appears in the transcript with zero syntactic link to the conversation, and was not actively addressed as a specific grammatical issue by the teacher in the dialogue, discard it as transcription noise. Never invent grammar corrections for speech-to-text distortion.
- Discard candidate utterances lacking immediate pedagogical echo/reaction/correction from the teacher in the following turns, as English STT hallucinates bizarre English words when Portuguese is spoken.

================================================================================
SECTION 2: CEFR ORAL PROFICIENCY DIAGNOSTIC MATRIX (TOP-DOWN EVALUATION)
================================================================================
CRITICAL EVALUATION MANDATE:
Ignore quantity of speech or turn length; evaluate exclusively syntactic mechanics, cognitive load management, and discourse accuracy.

Evaluate exclusively the student's interaction in MODES 3 & 4 (Dialogue & Discourse). Classify into the highest matching level:

LEVEL C2 (Mastery):
- Modes 1 & 2 may occur, but Modes 3 & 4 show:
  1. Absolute Automation: 100% automatic access to rules and lexicon. Pauses/self-corrections serve solely to refine arguments or nuance ideas, never to hunt for words or fix grammar.
  2. Organic Syntactic Flexibility: Inserts parentheses, concessions, and reduced clauses mid-turn without breaking grammar line or rhythm; no heavy written connectors needed.
  3. Native Collocations & Connotative Precision: Effortless, precise collocations and dependent prepositions. Phrasing is indistinguishable from an educated native speaker.

LEVEL C1 (Effective Operational Proficiency):
- Modes 1 & 2 may occur, but Modes 3 & 4 show:
  1. Monitoring Friction: Highly fluent with sophisticated vocabulary, but exhibits perceptible pauses or self-corrections to monitor verb endings or retrieve forgotten words.
  2. Linear Construction of Complex Ideas: Sustains long abstract arguments correctly, but structure is modular/linear, relying on explicit connectors to link ideas.
  3. Subtle Structural Transfer (Residual L1): Sound grammar, but occasional phrasing betrays subtle mental translation of native language patterns (clear, but unidiomatic).

LEVEL B2 (Vantage):
- Modes 1 & 2 may occur, but Modes 3 & 4 show:
  1. Lexical Blocks & Resonance Circumlocution: Sustains abstract conversations and long turns, but hesitates/loses rhythm (word-hunting) when lacking specific terms, resorting to repeated intensifiers ('really really') or generic fillers.
  2. Syntactic Instability under Pressure: Builds compound sentences, but makes performance slips in simple/irregular tenses (e.g., 'didn't went') or loses control when attempting complex hypothetical structures (e.g., 3rd conditional).
  3. Direct L1 Interference: Systematic preposition errors due to direct translation ('pay attention in', 'depend of') and occasional false friends.

LEVEL B1 (Threshold):
- Modes 1 & 2 may occur, but Modes 3 & 4 show:
  1. Functional Circumlocution: Defines unknown concrete nouns with simple relative clauses ('a machine that...', 'a person who...') and connects past actions combining tenses ('while I was doing X, Y happened').
  2. Justification with Simple Compound Sentences: Explains causes and effects using basic connectors ('because', 'so', 'although'), staying cohesive while topics remain concrete/factual.
  3. Thematic Dependence & Reactivity: Autonomous in routine and factual work topics, but turns passive, monosyllabic, or reactive once dialogue enters abstractions, philosophy, or hypotheses.

LEVEL A2 (Waystage):
- Modes 1 & 2 may occur, but Modes 3 & 4 show:
  1. Linear Paratactic Syntax: Speaks in strictly short [Subject + Verb + Object] clauses linked chronologically almost solely by 'and' or 'and then', with no functional subordination.
  2. Inability to Circumlocute: When lacking a word, cannot define the object/action; relies on empty wildcards ('this thing', 'stuff'), severely simplifies, or abandons the turn.
  3. Circular Justifications & Concrete Focus: Expresses opinions solely with basic adjectives ('good', 'bad', 'nice') without unpacking causes; frequent slips outside present simple.

LEVEL A1 (Breakthrough):
- English appears ONLY in Mode 1 (reading) or Mode 2 (drills/repetition). Modes 3 & 4 are virtually absent, or consist solely of:
  1. Pre-Phrasal Production: Isolated words, numbers, or disconnected nouns; unable to articulate spontaneous subject + verb clauses.
  2. Memorized Formulas & Echolalia: Limited to memorized greetings/survival chunks ('hello', 'fine thank you') or mechanically echoing the teacher's words.
  3. Zero Communicative Autonomy: Communication collapses without direct Portuguese translation or visual crutches. Conversation in English dies in under 5 minutes.

================================================================================
SECTION 2B: CUMULATIVE CEFR BENCHMARKS & CAN-DO DESCRIPTORS (A1 UP TO ${studentRollingLevel || "DIAGNOSED LEVEL"})
================================================================================
Below is the official CEFR functional descriptor matrix and grammar inventory covering all levels cumulatively from A1 up to this student's operational level (${studentRollingLevel || "A1"}):

${cefrMatrixInjected}

MANDATORY RULES FOR MATRIX APPLICATION:
1. DESCRIPTOR GROUNDING: Every grammatical structure and usage remediated in Focus Areas or tested in the Quiz MUST map directly to the functional Can-Dos and grammar points of these active levels.
2. CUMULATIVE ANCHOR: The student has access to descriptors from their operational level and ALL foundational levels below it. If an advanced student (B1, B2, C1) made a persistent foundational error (A1 or A2) that was actively drilled by the teacher, you have full authority to remediate it using the A1/A2 descriptors above.
3. FORBIDDEN CEILING BREACH: You are strictly forbidden from testing or explaining grammar structures that belong to levels ABOVE the student's operational level (${studentRollingLevel || "A1"}).

================================================================================
SECTION 3: FOUR OPERATIONAL TIERS FOR CONTENT GENERATION
================================================================================
Content generation (Language Assessment, Focus Areas, and Quiz) is governed by the student's 10-Session Rolling Average ("${studentRollingLevel || "Diagnosed Level"}") across 4 OPERATIONAL TIERS:

UNIVERSAL EXPLANATION TONE MANDATE (ALL TIERS - A1 TO C2):
- ZERO ACADEMIC OR METALINGUISTIC JARGON: Across all 4 tiers, you are strictly forbidden from using heavy grammatical terminology (e.g., "third-person singular present tense inflection", "subordinating conjunction", "auxiliary inversion", "past participle", "relative pronoun").
- TONE: Always write explanations as an informal, friendly teacher note or practical advice from a friend. Focus strictly on immediate usage (e.g., instead of "Use the auxiliary does for third-person singular", write "When talking about he, she, or a friend, use 'does'"). Only the language of the note changes according to the tier.

TIER 1 (A1 - Breakthrough / Beginner):
- Active when student's operational level is A1.
- Ceiling: Exclusively A1 content. Zero abstraction. Grounded in active A1 Can-Dos.
- Language: 100% Brazilian Portuguese for levelDescription and focusAreas explanations.
- Focus Examples: STRICTLY BILINGUAL (English sentence first, Brazilian Portuguese translation second). Format: "<English sentence>. <Tradução em português brasileiro>.".
- Distractors: Student's real slip + classic A1 interlanguage traps (omitted auxiliary, pronoun confusion, missing 'to be', basic word order).

TIER 2 (A2 - Waystage / Basic Autonomy):
- Active when student's operational level is A2.
- Ceiling: Strictly A2 structures grounded in active A1 and A2 Can-Dos.
- Language: 100% ultra-simple, minimalist English for levelDescription, explanations, and agreedHomework. Use short, direct sentences, basic daily words, and zero complex subordination.
- Focus Examples: STRICTLY BILINGUAL (English sentence first, Brazilian Portuguese translation second). Format: "<English sentence>. <Tradução em português brasileiro>.".
- Distractors: Student's real slips + typical A2 interlanguage traps (auxiliary drops in past/questions, irregular past confusion, everyday prepositions, simple tense mismatches). Strictly forbidden: Do not test complex theoretical grammar contrasts.

TIER 3 (B1 - Threshold / Developing Autonomy):
- Active when student's operational level is B1.
- Ceiling: Content up to B1 grounded in active A1, A2, and B1 Can-Dos.
- Language: 100% simple, clear, accessible English for levelDescription, explanations, and agreedHomework. Friendly, direct tone without academic jargon.
- Focus Examples: 100% English only without translations.
- Distractors: Functional tense contrasts (Past Simple vs. Present Perfect, Past Continuous in narrative, will vs. going to), prepositions in context, and real student slips.

TIER 4 (B2 / C1 / C2 - Independent & Advanced Refinement):
- Active when student's operational level is B2, C1, or C2.
- Ceiling: Content grounded in active cumulative Can-Dos (A1 up to the student's level).
- Language: 100% fluent, standard, natural idiomatic English, maintained in a practical, informal coaching tone without academic textbook jargon.
- Focus Examples: 100% English only without translations.
- Distractors: Structural precision, dependent prepositions, collocations, discourse markers, subtle tense aspects, and real student slips.

================================================================================
SECTION 4: ENTITY GROUNDING (DOSSIER GROUND TRUTH)
================================================================================
The student's Dossier contains TRUE established entities: apps (e.g., "Duolingo"), cities (e.g., "Capelinha", "Itamarandiba"), professions, workplaces, schools, and family.
- If the student says something phonetically transcribed as "dual lingo", "do lingo", or "wolingo", NORMALIZE it silently to "Duolingo".
- It is STRICTLY FORBIDDEN to penalize brand names, apps, cities, or proper nouns as grammar, pronunciation, or vocabulary slips.

================================================================================
SECTION 5: STRICT REMEDIATION BOUNDARY (NO MIND-READING OR INVENTED SENTENCES)
================================================================================
The purpose of 'betterWay' is SURGICAL GRAMMATICAL REMEDIATION, NEVER stylistic rewriting, mind-reading, or emotional reinterpretation:
1. STRICT REMEDIATION BOUNDARY (NO MIND-READING OR INVENTED SENTENCES):
   - 'betterWay' is strictly a surgical grammatical correction of the EXACT sentence or clause the student attempted to speak.
   - STRICT PROHIBITION: You are strictly forbidden from mind-reading, inferring unstated thoughts, or inventing completely new sentences that the student never attempted to say in that turn.
   - If the student uttered a natural, grammatically sound reaction or interjection (e.g., "Oh my god.", "Really?", "I see."), if that utterance contains NO grammar error it MUST NOT be assigned as a Focus Area, nor replaced with an invented narrative sentence.
   - Remediate ONLY the words actually verbalized: preserve the student's original vocabulary, structure, and communicative intent, fixing strictly the grammar, tense, or preposition slips present in that specific utterance.
2. VALENCE & EMOTIONAL INVARIANCE:
   - You MUST strictly preserve the exact emotional valence, intention, and mood of the student's statement.
   - If the student expresses satisfaction or positive evaluation (e.g. "good", "happy", "fine", "productive"), you are STRICTLY FORBIDDEN from replacing it with stress, fatigue, or corporate burden terms (e.g., "busy", "exhausting", "heavy workload").
   - If the student said "My day is good. Very much work.", the remediation MUST be: "My day was good. I had a lot of work." (Fixing the tense 'is' -> 'was' and the quantifier 'very much work' -> 'a lot of work', keeping 'good' 100% intact).
3. SURGICAL INTERVENTION ONLY:
   - Change ONLY the specific words containing grammar, tense, or collocation errors.
   - Leave grammatically sound words untouched.
   - FORBIDDEN: Imposing corporate cliches, idioms, or office jargon (e.g. "heavy workload", "hectic schedule") on casual remarks.
4. ABSOLUTE GRAMMATICAL FLAWLESSNESS (ZERO AI SLIPS):
   - The remediated sentence in 'betterWay' must be 100% grammatically flawless, natural, and idiomatic standard English.
   - The AI is strictly prohibited from introducing missing auxiliaries, incorrect prepositions, or artificial phrasing into the remediation.

================================================================================
SECTION 6: PEDAGOGICAL PRIORITY & FULL-TRANSCRIPT SCAN MANDATE
================================================================================
When selecting the 5 Focus Areas and 10 Quiz Questions, apply this priority ranking:

1. FULL TRANSCRIPT SCAN FIRST (VETO TO SEQUENTIAL ALLOCATION):
   - You are strictly forbidden from allocating Focus Areas or Quiz slots sequentially as you read from top to bottom.
   - You MUST read the entire transcript from start to finish before selecting any remediation item.

2. TEACHER-DIRECTED DRILLS & ACTIVE REPETITIONS (TOP PRIORITY):
   - The primary indicator of pedagogical priority is the teacher's active intervention during the lesson.
   - Scan for moments where Teacher Lessandro actively stopped conversational flow to correct a phrase and demanded that the student repeat the corrected structure two or more times.
   - Priority is ranked strictly by the intensity of teacher intervention: structures that the teacher required the student to repeat most frequently MUST occupy the first positions of Focus Areas and Quiz.

3. FOUNDATIONAL GAPS OVER INCIDENTAL SLIPS:
   - Prioritize recurring structural barriers grounded in the active Can-Do matrix (including foundational A1/A2 structures if drilled by the teacher) over isolated slips in advanced structures.
   - If an error was merely an incidental slip in a single turn while the student used the structure correctly throughout the rest of the class, do NOT prioritize it over structures that caused recurring communicative friction.

4. WARM-UP & SINGLE-PASS REVISION EXCLUSION:
   - In many sessions, Teacher Lessandro and the student read aloud examples or questions from prior quizzes at the beginning of the class for rhythm or warm-up.
   - Reading aloud an existing example or repeating a sentence just once during warm-up does NOT constitute an error or an active drill.
   - You are strictly forbidden from assigning Focus Areas or Quiz questions to sentences that were simply read or reviewed in a single pass without teacher correction and multiple repetitions.

================================================================================
SECTION 7: 70/30 CONTEXT COEXISTENCE & SUBJECT VARIETY
================================================================================
1. The Class Topic (the article read, Duolingo text, video, news) is the PRIMARY background scenario (approx. 70% of focus examples and quiz scenarios).
2. The Student's Dossier (profession, residence, hobbies, routine) is the PERSONAL SEASONING (approx. 30% of focus examples and quiz scenarios).
- Prohibited: Do NOT invent generic airport, corporate executive, or international flight contexts for students who do not have that profile. Balance class theme (70%) and student identity (30%).

STRICT PROHIBITION ON REPETITIVE SUBJECTS & STUDENT NAME:
- Across all 3 examples of EVERY focus area, and across ALL questions and answer options of the Quiz, you MUST vary the grammatical subjects and pronouns.
- Strictly forbidden: Do NOT use the same subject pronoun (e.g., repeatedly using "I", "She", or "They") across examples or questions.
- STUDENT NAME RESTRICTION: The student's name (or possessive form, e.g., "${studentFirstName}", "${studentFirstName}'s") is STRICTLY PROHIBITED from being used repeatedly. Across the entire Quiz (all 10 questions), the student's name may appear at most ONCE (maximum 1 question), or be completely omitted in favor of generic third-person subjects (e.g., "A traveler", "My friend", "The teacher", "Her nephew", "They", "We").
- Always distribute diverse subjects: combine third-person singular (he, she, my friend, the visitor), plural subjects (we, they, the students), and situational noun phrases.

================================================================================
SECTION 8: ACTIVE VOCABULARY TRIGGER & CEILING
================================================================================
- An isolated vocabulary word ONLY enters Focus Areas or Quiz if Teacher Lessandro ACTIVELY drilled it (demanded repeated pronunciation, asked for definition, or drilled it repeatedly in class).
- STRICT CEILING: A maximum of TWO (2) vocabulary items may be included across the 5 Focus Areas in a single session.
- Default Rule: All remaining slots (at least 3 of 5 Focus Areas, and 100% of the Quiz unless a vocabulary item was heavily drilled) must target SYNTAX, TENSES, GRAMMATICAL STRUCTURES, and USAGE grounded in the active CEFR Can-Dos. Do not waste slots testing words that merely passed through the text without active teacher drill.

================================================================================
SECTION 8B: LIVE TEACHER DIRECTIVES (EXPLICIT GEMINI COMMAND OVERRIDE)
================================================================================
If Teacher Lessandro gives an explicit verbal directive during class addressing 'Gemini' (in English or Portuguese, e.g. 'Gemini, we need this point in Focus Area', 'Gemini, coloque essa estrutura no Quiz', 'Gemini, a lição de casa é...'):
1. MANDATORY OVERRIDE PRIORITY: Treat this verbal command as the highest pedagogical priority, superseding automated diagnostic selection.
2. SLOT ALLOCATION:
   - Focus Area directive: The targeted point MUST occupy Focus Area #1 (Slot 1).
   - Quiz directive: The requested grammar/usage point MUST occupy Quiz Question #1 (Slot 1).
   - Homework directive: The specified assignment MUST occupy the first position of 'agreedHomework'.

================================================================================
SECTION 9: PEDAGOGICAL QUIZ INTEGRITY & DISTRACTOR ENGINEERING (10 QUESTIONS)
================================================================================
The 10 multiple-choice questions must test the real structures, syntax, and slips from the lesson.
Varied question formats are fully permitted and encouraged (sentence completion, error identification, pragmatic conversational response, or structural transformation).

STRICT INTEGRITY RULES FOR EVERY QUESTION:
1. QUESTION-TYPE CONGRUENCE:
   - If using sentence completion: the prompt must use '_____' to mark the exact syntactic omission. Every option (A to E) must fit that exact slot without requiring extra words omitted from the prompt.
   - If using error identification, conversational reply, or equivalence: the question prompt must be unambiguous and clear.
2. UNAMBIGUOUS ANSWER KEY: Exactly 1 option must be completely correct, and exactly 4 options must be plausible distractors. No question may have two valid answers or zero valid answers. The correctAnswer must fit syntactically and logically with 100% precision.
3. FLAWLESS STANDARD ENGLISH: The question prompt, all options, and the didactic explanation must be 100% grammatically correct in natural standard English (zero AI typographical or grammatical slips).
4. DISTRACTOR COMPOSITION:
   - 1 Correct answer.
   - 1 The exact slip made by the student (if relevant to the tested point).
   - 3 Realistic interlanguage traps typical of the student's level (L1 transfer, incorrect auxiliary, common preposition confusion).
   - STRICT PROHIBITION: NO accidental phonetic/rhyming puns (e.g. raining vs. training, chicken vs. kitchen) unless explicitly drilled in the lesson.
5. MANDATORY BALANCED & RANDOMIZED ANSWER KEY (A, B, C, D, E):
   - The correct answer MUST be randomly and evenly distributed across all 5 letters across the 10 questions (approximately 2 questions for each letter: A, B, C, D, and E).
   - STRICT PROHIBITION: You are strictly forbidden from placing the correct answer in the same letter option (such as all or mostly 'A') across questions.
   - For every question, you MUST shuffle the order of the options so that the position of the correct answer varies unpredictably across A, B, C, D, and E.
6. STRICT PROHIBITION ON REPEATING STUDENT NAME IN QUIZ:
   - Do NOT frame multiple questions around the student's name (e.g., "${studentFirstName} did...", "${studentFirstName}'s family...").
   - Maximum 1 occurrence of the student's name across all 10 questions combined. Frame scenarios using diverse subjects and general contexts.

================================================================================
SECTION 10: AGREED HOMEWORK (STRICT EXTRACTION ONLY)
================================================================================
Generate a SINGLE field 'agreedHomework' representing the official tasks:
1. STRICT EXTRACTION ONLY (NO SYNTHETIC TASKS): Extract EXCLUSIVELY the specific study tasks, videos, exercises, or texts that the teacher and student explicitly agreed upon aloud during the session (e.g. 'watch the 14 videos on Instagram and comment on each one').
2. PROHIBITION OF HALLUCINATED TASKS: It is STRICTLY FORBIDDEN to invent, imagine, or synthesize tasks (such as 'Read the Duolingo article aloud', 'Complete the next unit on your platform', or 'Write sentences about your routine') if they were not explicitly assigned by the teacher in the conversation.
3. QUANTITY: If only 1 task was assigned aloud, return ONLY that 1 task. If 2 were assigned, return 2. Never exceed 3. If NO study task was explicitly assigned aloud during the lesson, return null.
4. ANTI-ADVICE FILTER: Strictly English pedagogical study tasks. Discard health advice, medical reminders, or farewell pleasantries.
5. FORMAT & LANGUAGE: Itemized list using bullets (•) and single line breaks (\n). 100% in Portuguese for Tier 1 (A1); 100% in ultra-simple English for Tier 2 (A2); 100% in simple English for Tier 3 (B1); 100% in natural English for Tier 4 (B2/C1/C2).

================================================================================
SECTION 11: TEACHER DOSSIER STAGING (CONFIG.TEACHER_ID: "lessandro-bull")
================================================================================
The teacher's dossier represents TEACHER LESSANDRO BÜLL HIMSELF, NOT THE STUDENT:
1. 'personal_data': Static biographical facts, academic background, university monographs, artistic projects, or technology setups EXCLUSIVELY about Teacher Lessandro mentioned by him aloud (e.g. ethnographic photography project in Peru, Titicaca Lake research). Format: '- Label: Value'. Return null if none mentioned.
2. 'routine': Experiences, travels, home projects, routines, or anecdotes EXCLUSIVELY about Teacher Lessandro mentioned by him aloud (e.g. home painting project interrupted by rain, weather episodes). Format: '[${dateStamp}] [Description]'. Return null if none mentioned.
3. 'class_history': MUST BE null (teacher dossier does not track student class histories).
4. 'learning_profile' (PEDAGOGICAL APPROACH & STYLE):
   - Suggest an entry ONLY IF Teacher Lessandro explicitly demonstrated a new teaching method, didactic adaptation, or communicative scaffolding during the class.
   - Return null if no new didactic methodology was demonstrated.
STRICT PROHIBITION: Under NO circumstances should any student personal info, student exams, student fatigue, or student names appear in teacherDossierSuggestions.

================================================================================
OUTPUT REQUIREMENTS:
================================================================================
1. levelDescription (EXACTLY 4 SENTENCES):
   - Sentence 1 (Greeting & Session Anchor): Begins strictly with "Olá, ${studentFirstName}." (Tier 1) or "Hi, ${studentFirstName}." (Tiers 2 to 4). Use ONLY the first name. Directly mentions the main conversation topic, routine story, or reading article actually worked in this lesson. Forbidden to start with evaluations or diagnostics.
   - Sentence 2 (Positive Practice Recognition - 2 Key Highlights):
     * Full-Transcript Scan Mandate: You MUST scan the entire transcript to identify the TWO most significant oral achievements of the lesson before writing this sentence.
     * Scenario A (When Drills or Repetitions Occurred): Select the TWO specific phrases or structures where Teacher Lessandro stopped to coach pronunciation or syntax and the student successfully repeated and adjusted them with noticeable improvement in rhythm, pronunciation, and confidence (e.g., in Portuguese: "Você se dedicou muito e mostrou uma evolução nítida ao acertar a estrutura de '[Phrase 1]' e ao pronunciar '[Phrase 2]' com muito mais segurança."; in English: "You showed great dedication and clear progress when you mastered the structure of '[Phrase 1]' and spoke '[Phrase 2]' with much smoother confidence.").
     * Scenario B (Autonomous Flow / No Repeated Drills Needed): If the student maintained high communicative flow without requiring intensive teacher drills, select TWO grammatically sound, natural phrases actually verbalized by the student that reflect solid command of their CEFR level, praising their spontaneous accuracy and clear discourse (e.g., in Portuguese: "Sua fala fluiu com muita naturalidade, destacando-se pelo uso correto de '[Phrase 1]' e pela clareza ao expressar '[Phrase 2]'."; in English: "Your speech flowed very naturally, especially when you accurately used '[Phrase 1]' and clearly expressed '[Phrase 2]'.").
     * Strict Prohibition: You are strictly forbidden from mentioning dependence, hesitation, lack of autonomy, or reliance on teacher support. Always celebrate these two specific verbalized achievements.
   - Sentence 3 (Target Reinforcement - 2 Focus Points): Points the student forward by highlighting exactly two grammatical or structural patterns that need ongoing attention (which MUST match items in the Focus Areas below). Always provide at least two concrete, short examples in parentheses:
     * In Portuguese (Tier 1): (e.g. "como em 'I am ready' e 'in the cup'").
     * In English (Tiers 2 to 4): (e.g. "such as 'I am ready' and 'in the cup'"). STRICT PROHIBITION: Never insert Portuguese words (like "como em" or "e") inside English level descriptions.
   - Sentence 4 (Bridge to Focus Areas): Concludes with a practical, welcoming bridge that directs the student directly to review the Focus Areas right below (e.g. in Portuguese: "Para dar o próximo passo com tranquilidade, dê uma olhada agora nos 5 pontos mais importantes que separamos logo abaixo da nossa aula."; in English: "To take your next step with confidence, check out the 5 key focus areas we selected right below from our class.").
   - Strict Prohibitions: Do NOT mention CEFR codes (A1, B1, etc.) anywhere in this text. No exclamation marks (!). No patronizing or deficit-based vocabulary.

2. focusAreas (EXACTLY 5 ITEMS):
   - studentSaid: exact quote from the student. NO prefixes.
   - betterWay: surgical grammatical remediation of the verbalized words in 100% flawless standard English, strictly preserving communicative intent and emotional valence without inventing unstated thoughts. NO prefixes.
   - explanation: practical, friendly note without academic jargon or metalinguistic terms (100% Brazilian Portuguese for Tier 1; 100% ultra-simple English for Tier 2; 100% simple English for Tier 3; 100% natural, informal English for Tier 4).
   - examples: exactly 3 complete, natural, and syntactically flawless sentences (reflecting 70/30 topic/dossier coexistence, with strict variety of subjects across all 3 sentences).
     * MANDATORY FORMAT FOR A1 AND A2 STUDENTS: Every single example MUST be bilingual, strictly in this order: English sentence first, followed immediately by its accurate Brazilian Portuguese translation. Format: "<English sentence>. <Tradução em português brasileiro>." (e.g., "I need to study now. Eu preciso estudar agora.").
     * MANDATORY FORMAT FOR B1, B2, C1, C2 STUDENTS: 100% in English only without any translation.
     * MANDATORY CEILING: The grammatical structures used in all 3 examples must strictly respect the student's operational level ceiling.

3. quiz (EXACTLY 10 QUESTIONS):
   - 10 multiple-choice questions (1 to 10), 5 options (A to E) following varied pedagogic formats.
   - question: Clear, complete, and grammatically flawless prompt (if using fill-in-the-blank, use '_____' matching the tested slot).
   - correctAnswer: Single uppercase letter (A, B, C, D, or E) perfectly congruent with the prompt. MANDATORY: Distribute correct answers evenly across all 5 letters (approximately 2 of each: A, B, C, D, E) and randomize their positions throughout the 10 questions.
   - explanation: Concise and accurate didactic explanation of the targeted rule and distractor traps in calibrated language.

4. agreedHomework (MAXIMUM 3 ITEMS OR NULL):
   - Formatted with bullets (•) and single line breaks (\n).
   - MANDATORY LANGUAGE BY LEVEL: 100% in Portuguese ONLY if student's operational level is A1 (Tier 1). If student's operational level is A2 (Tier 2), it MUST be in ultra-simple English. If B1, B2, C1, or C2 (Tier 3 and Tier 4), in simple and natural English (e.g. '• Listen to podcast episode 258 again.'). Return null if no tasks were assigned aloud.

5. studentDossierSuggestions:
   - class_history: "- ${classDate}: [Summary of topics and slips]"
   - personal_data: Static cadastre bullet points (or null).
   - routine: MANDATORY CAPTURE of school exams, mock tests, university deadlines, work projects, trips, or specific routine events mentioned by the student. Format line with the exact [${dateStamp}] prefix. Return null ONLY if absolutely no routine events, exams, or plans were mentioned.
   - learning_profile: Sensory channels, study dynamics, emotional triggers (or null).

6. unifiedBriefing (TEACHER MENTORING & DIDACTIC EVALUATION - 100% IN ENGLISH):
   - activitiesDone: 2-3 bullets of practiced topics.
   - conversationAssessment: EXACTLY 4 SENTENCES in ONE continuous paragraph evaluating TEACHER LESSANDRO'S performance and tailoring to this student:
     * Sentence 1 (Teacher Calibration): Evaluates whether the spoken level maintained by Teacher Lessandro in class was well-pitched, too advanced, or appropriate for the student's diagnosed CEFR level. Begins with: "For a student at level [tier], the conversational level maintained during the class [evaluate teacher's pitch, speed, and vocabulary complexity]..."
     * Sentence 2 (Pedagogical Directive): Mentors Teacher Lessandro on how to adapt his speech and scaffolding to this specific level. Begins with: "At this level, students need [direct instruction on speech pacing, syntactic simplification, and cognitive load management]..."
     * Sentence 3 (Student Priority Gaps): Identifies the student's two immediate priority gaps that Teacher Lessandro must target. Begins strictly with: "${studentFirstName} needs [two specific priority linguistic/structural focus areas]...". MANDATORY: Use ONLY the student's first name. NEVER use the last name or full name here.
     * Sentence 4 (Classroom Action Tip): Concrete teaching tip for Teacher Lessandro during class. Gives a clear directive on how to work on those priorities in upcoming sessions.

   - teacherFocusAreas: EXACTLY 5 ITEMS (MANDATORY TEACHER LEVEL-CALIBRATION):
     * STRICT PROHIBITION: You are STRICTLY FORBIDDEN from using student utterances or student errors here. Every item must be what TEACHER LESSANDRO said.
     * PURPOSE: This is NOT a grammatical correction of the teacher. It is a DIDACTIC LEVEL-ADJUSTMENT to make Teacher Lessandro's speech more accessible to this student's level.
     * teacherSaid: Exact quote spoken aloud by TEACHER LESSANDRO during the class.
     * betterWay: A calibrated version of that exact teacher statement, simplified or adjusted to be more comprehensible and appropriate for the student's diagnosed CEFR level.
     * explanation: Concise explanation of why this calibrated phrasing reduces cognitive load or aids comprehension for a student at this level.

Output STRICTLY a valid JSON object matching the schema below without markdown fences or code blocks:
{
  "studentEvaluation": {
    "level": "[Diagnosed CEFR Level from Section 2, e.g. A1, A2, B1, B2, C1, or C2]",
    "levelDescription": "...",
    "focusAreas": [
      { "studentSaid": "...", "betterWay": "...", "explanation": "...", "examples": ["...", "...", "..."] }
    ],
    "quiz": [
      { "number": 1, "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "correctAnswer": "A", "explanation": "..." }
    ],
    "agreedHomework": "• ...\n• ...",
    "dossierSuggestions": {
      "class_history": "...",
      "personal_data": null,
      "routine": null,
      "learning_profile": null
    }
  },
  "unifiedBriefing": {
    "activitiesDone": ["...", "..."],
    "conversationAssessment": "...",
    "teacherFocusAreas": [
      { "teacherSaid": "...", "betterWay": "...", "explanation": "..." }
    ],
    "teacherDossierSuggestions": {
      "personal_data": null,
      "routine": null,
      "learning_profile": null
    }
  }
}
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { text: "TRANSCRIPT CONTENT:\n" + transcriptText }
        ]
      }
    ],
    generationConfig: { responseMimeType: "application/json" }
  };

  // CASCATA DE MODELOS OFICIAIS: 3.5 -> 3-preview -> 2.5
  for (let m = 0; m < CONFIG.GEMINI_MODELS.length; m++) {
    const modelCandidate = CONFIG.GEMINI_MODELS[m];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${encodeURIComponent(CONFIG.GEMINI_API_KEY)}`;

    Logger.log(`[GEMINI] Tentando modelo: ${modelCandidate}...`);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = UrlFetchApp.fetch(url, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });

        const code = response.getResponseCode();
        if (code === 200) {
          const json = JSON.parse(response.getContentText());
          let rawText = json.candidates[0].content.parts[0].text.trim();
          rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
          Logger.log(`[GEMINI SUCESSO] Resposta gerada via ${modelCandidate}.`);
          return JSON.parse(rawText);
        } else {
          Logger.log(`[GEMINI] ${modelCandidate} retornou HTTP ${code}.`);
        }
      } catch (e) {
        Logger.log(`[GEMINI] Falha no ${modelCandidate} (Tentativa ${attempt}): ${e.message}`);
      }
      Utilities.sleep(1500);
    }
    
    Logger.log(`[GEMINI FALLBACK] ${modelCandidate} indisponível. Tentando próximo modelo...`);
  }

  Logger.log(`[GEMINI ERRO CRÍTICO] Nenhum modelo da cascata respondeu.`);
  return null;
}

function saveStudentSession(studentId, classDate, classTime, analysis) {
  const evalData = analysis.studentEvaluation;
  const briefingData = analysis.unifiedBriefing;
  const unifiedHomework = evalData.agreedHomework || evalData.homework || null;

  const sessionRes = supabaseRequest("class_sessions", "post", {
    student_id: studentId,
    class_date: classDate,
    class_time: classTime
  }, true);
  if (!sessionRes || sessionRes.length === 0) return;
  const sessionId = sessionRes[0].id;

  supabaseRequest("student_quizzes", "post", {
    session_id: sessionId,
    level: evalData.level,
    level_description: evalData.levelDescription,
    focus_areas: evalData.focusAreas,
    questions: evalData.quiz,
    homework: unifiedHomework
  });

  // Normaliza teacherFocusAreas para garantir compatibilidade com o frontend
  const normalizedTeacherAreas = (briefingData.teacherFocusAreas || []).map(fa => ({
    studentSaid: fa.teacherSaid || fa.studentSaid || "",
    betterWay: fa.betterWay || "",
    explanation: fa.explanation || ""
  }));

  supabaseRequest("teacher_briefings", "post", {
    session_id: sessionId,
    activities_done: briefingData.activitiesDone,
    conversation_assessment: briefingData.conversationAssessment,
    focus_areas: normalizedTeacherAreas,
    next_tasks: unifiedHomework,
    diagnostic_focus: briefingData.conversationAssessment
  });

  if (evalData.dossierSuggestions) {
    updateDossierPendingSuggestions(studentId, evalData.dossierSuggestions);
  }

  if (briefingData.teacherDossierSuggestions) {
    updateDossierPendingSuggestions(CONFIG.TEACHER_ID, briefingData.teacherDossierSuggestions);
  }

  Logger.log(`[SUPABASE] Sessão única salva com sucesso: ${sessionId}.`);
}

function updateStudentSession(sessionId, studentId, analysis) {
  const evalData = analysis.studentEvaluation;
  const briefingData = analysis.unifiedBriefing;
  const unifiedHomework = evalData.agreedHomework || evalData.homework || null;

  supabaseRequest(`student_quizzes?session_id=eq.${encodeURIComponent(sessionId)}`, "patch", {
    level: evalData.level,
    level_description: evalData.levelDescription,
    focus_areas: evalData.focusAreas,
    questions: evalData.quiz,
    homework: unifiedHomework
  });

  // Normaliza teacherFocusAreas para garantir compatibilidade com o frontend
  const normalizedTeacherAreas = (briefingData.teacherFocusAreas || []).map(fa => ({
    studentSaid: fa.teacherSaid || fa.studentSaid || "",
    betterWay: fa.betterWay || "",
    explanation: fa.explanation || ""
  }));

  supabaseRequest(`teacher_briefings?session_id=eq.${encodeURIComponent(sessionId)}`, "patch", {
    activities_done: briefingData.activitiesDone,
    conversation_assessment: briefingData.conversationAssessment,
    focus_areas: normalizedTeacherAreas,
    next_tasks: unifiedHomework,
    diagnostic_focus: briefingData.conversationAssessment
  });

  if (evalData.dossierSuggestions) {
    updateDossierPendingSuggestions(studentId, evalData.dossierSuggestions);
  }

  if (briefingData.teacherDossierSuggestions) {
    updateDossierPendingSuggestions(CONFIG.TEACHER_ID, briefingData.teacherDossierSuggestions);
  }

  Logger.log(`[SUPABASE] Sessão ${sessionId} atualizada com análise consolidada.`);
}

function updateDossierPendingSuggestions(targetStudentId, suggestions) {
  if (!suggestions) return;

  // Filtragem e blindagem seletiva do perfil docente (Lessandro Büll)
  if (targetStudentId === CONFIG.TEACHER_ID) {
    const existingStudents = supabaseRequest("students?select=name", "get") || [];

    const hasStudentMention = (text) => {
      if (!text || typeof text !== "string") return false;
      const lower = text.toLowerCase();
      return existingStudents.some(s => {
        const firstName = s.name.split(" ")[0].toLowerCase();
        return firstName.length > 2 && lower.includes(firstName);
      });
    };

    let validPersonal = suggestions.personal_data || null;
    if (validPersonal && hasStudentMention(validPersonal)) {
      Logger.log("[BLINDAGEM DOCENTE] personal_data descartado por citar aluno: " + validPersonal);
      validPersonal = null;
    }

    let validRoutine = suggestions.routine || null;
    if (validRoutine && hasStudentMention(validRoutine)) {
      Logger.log("[BLINDAGEM DOCENTE] routine descartado por citar aluno: " + validRoutine);
      validRoutine = null;
    }

    let validLearning = suggestions.learning_profile || null;
    if (validLearning && hasStudentMention(validLearning)) {
      Logger.log("[BLINDAGEM DOCENTE] learning_profile descartado por citar aluno: " + validLearning);
      validLearning = null;
    }

    if (!validPersonal && !validRoutine && !validLearning) return;

    suggestions = {
      personal_data: validPersonal,
      routine: validRoutine,
      class_history: null,
      learning_profile: validLearning
    };
  }

  const existing = getDossierFromSupabase(targetStudentId);
  const currentPending = (existing && existing.pending_suggestions) ? existing.pending_suggestions : {};

  function appendPending(existingText, newText) {
    if (!newText || !newText.trim()) return existingText || null;
    const cleanNew = newText.trim();
    if (!existingText || !existingText.trim()) return cleanNew;
    const cleanExisting = existingText.trim();
    if (cleanExisting.includes(cleanNew)) return cleanExisting;
    return `${cleanExisting}\n\n${cleanNew}`;
  }

  const merged = { ...currentPending };
  if (suggestions.class_history) {
    merged.class_history = appendPending(currentPending.class_history, suggestions.class_history);
  }
  if (suggestions.personal_data) {
    merged.personal_data = appendPending(currentPending.personal_data, suggestions.personal_data);
  }
  if (suggestions.routine) {
    merged.routine = appendPending(currentPending.routine, suggestions.routine);
  }
  if (suggestions.learning_profile) {
    merged.learning_profile = appendPending(currentPending.learning_profile, suggestions.learning_profile);
  }

  supabaseRequest(`dossiers?student_id=eq.${encodeURIComponent(targetStudentId)}`, "patch", {
    pending_suggestions: merged,
    updated_at: new Date().toISOString()
  });
}

/**
 * 7. PROCESSAMENTO SEMÂNTICO DO BRAIN DUMP VIA IA
 */
function processBrainDump(studentId, rawNote) {
  Logger.log(`[BRAIN DUMP] Processando nota para aluno ID: ${studentId}`);
  if (!studentId || !rawNote || !rawNote.trim()) {
    return { status: "error", message: "Student ID and note are required." };
  }

  const allStudents = supabaseRequest("students?select=id,name", "get") || [];
  const currentStudent = allStudents.find(s => s.id === studentId);
  if (!currentStudent) {
    return { status: "error", message: "Student not found in database." };
  }

  const currentDossier = getDossierFromSupabase(studentId);
  if (!currentDossier) {
    return { status: "error", message: "Dossier not found." };
  }

  const studentListText = allStudents.map(s => `- ${s.name} (id: ${s.id})`).join("\n");

  const prompt = `
You are the Pedagogical Data Manager for Quizhub.
Evaluate this teacher's note for student "${currentStudent.name}" (id: "${studentId}").

ALL REGISTERED STUDENTS IN SYSTEM:
${studentListText}

CURRENT DOSSIER FOR THIS STUDENT:
--- CARD 1 (Personal Context) ---
${currentDossier.personal_context || "No personal data recorded."}

--- CARD 2 (Experiences, Activities & Plans) ---
${currentDossier.routine || "No routine data recorded."}

--- CARD 3 (Learning Style & Preferences) ---
${currentDossier.learning_profile || "No learning profile recorded."}

--- CARD 4 (Cumulative Class History) ---
${currentDossier.class_history || "No class history recorded."}

TEACHER'S NOTE:
"${rawNote.trim()}"

DECISION RULES:
1. PROFILE MERGE / ALIAS COMMAND:
   If the note indicates this profile belongs to another student (e.g. "este perfil pertence a...", "mesmo aluno que...", "unir ao perfil de..."):
   Identify the TARGET official student from the list above.
   Return JSON:
   {
     "actionType": "merge",
     "targetStudentId": "official-student-id",
     "aliasName": "${currentStudent.name}"
   }

2. UPDATE OR CORRECTION:
   If it is NOT a merge, it is an update/correction to the dossier:
   - Card 1: Profession, residence/city, hobbies, family, studies, language goals, tech, permanent clinical health.
   - Card 2: Trips, work routine schedules, plans with dates [DD/MM/YY] or recent episodes.
   - Card 3: Sensory channels, study dynamics, emotional & attitudinal triggers.
   - Card 4: Historical observations or notes from classes.
   - If BRAND NEW: Add formatted line (e.g. "- Label: Value").
   - If CORRECTION/INCORRECT: Replace the outdated line, keeping everything else intact.
   - Standardize informal phrases to clean English pedagogical format (e.g., "ela é veterinária" -> "- Profession: Veterinarian", "mora em Capelinha" -> "- Residence: Capelinha").
   Return JSON:
   {
     "actionType": "update",
     "personal_context": "full updated text for Card 1",
     "routine": "full updated text for Card 2",
     "learning_profile": "full updated text for Card 3",
     "class_history": "full updated text for Card 4"
   }

Output STRICTLY a JSON object without markdown fences or code blocks.
`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  let aiResult = null;
  for (let m = 0; m < CONFIG.GEMINI_MODELS.length; m++) {
    const modelCandidate = CONFIG.GEMINI_MODELS[m];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${encodeURIComponent(CONFIG.GEMINI_API_KEY)}`;
    try {
      const response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      if (response.getResponseCode() === 200) {
        const resJson = JSON.parse(response.getContentText());
        let rawText = resJson.candidates[0].content.parts[0].text.trim();
        rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        aiResult = JSON.parse(rawText);
        Logger.log(`[BRAIN DUMP] Gemini respondeu via ${modelCandidate}.`);
        break;
      }
    } catch (err) {
      Logger.log(`[BRAIN DUMP] Falha no modelo ${modelCandidate}: ${err.message}`);
    }
  }

  if (!aiResult) {
    return { status: "error", message: "AI failed to process the note." };
  }

  if (aiResult.actionType === "merge" && aiResult.targetStudentId) {
    const targetId = aiResult.targetStudentId;
    if (targetId === studentId) {
      return { status: "error", message: "Cannot merge profile into itself." };
    }

    const targetDossier = getDossierFromSupabase(targetId);
    if (!targetDossier) {
      return { status: "error", message: "Target student dossier not found." };
    }

    let targetPersonal = targetDossier.personal_context || "";
    const aliasName = currentStudent.name;
    if (!targetPersonal.toLowerCase().includes(aliasName.toLowerCase())) {
      if (/Meet Aliases:/i.test(targetPersonal)) {
        targetPersonal = targetPersonal.replace(/([-•]?\s*Meet Aliases:\s*)([^\n]+)/i, `$1$2, ${aliasName}`);
      } else {
        targetPersonal = (targetPersonal && !targetPersonal.startsWith("No "))
          ? `${targetPersonal}\n- Meet Aliases: ${aliasName}`
          : `- Meet Aliases: ${aliasName}`;
      }
    }

    let targetHistory = targetDossier.class_history || "";
    if (currentDossier.class_history && !currentDossier.class_history.startsWith("No ")) {
      targetHistory = (targetHistory && !targetHistory.startsWith("No "))
        ? `${targetHistory}\n\n${currentDossier.class_history}`
        : currentDossier.class_history;
    }

    supabaseRequest(`dossiers?student_id=eq.${encodeURIComponent(targetId)}`, "patch", {
      personal_context: targetPersonal,
      class_history: targetHistory,
      updated_at: new Date().toISOString()
    });

    supabaseRequest(`class_sessions?student_id=eq.${encodeURIComponent(studentId)}`, "patch", {
      student_id: targetId
    });

    supabaseRequest(`dossiers?student_id=eq.${encodeURIComponent(studentId)}`, "delete");
    supabaseRequest(`students?id=eq.${encodeURIComponent(studentId)}`, "delete");

    Logger.log(`[MERGE CONCLUÍDO] ${currentStudent.name} mesclado em ${targetId}.`);
    return {
      status: "success",
      action: "merged",
      targetStudentId: targetId,
      message: `Profile merged into official student (${targetId}). Alias registered.`
    };
  }

  if (aiResult.actionType === "update") {
    const updatePayload = {
      personal_context: aiResult.personal_context || currentDossier.personal_context,
      routine: aiResult.routine || currentDossier.routine,
      learning_profile: aiResult.learning_profile || currentDossier.learning_profile,
      class_history: aiResult.class_history || currentDossier.class_history,
      updated_at: new Date().toISOString()
    };

    supabaseRequest(`dossiers?student_id=eq.${encodeURIComponent(studentId)}`, "patch", updatePayload);
    Logger.log(`[UPDATE CONCLUÍDO] Dossiê de ${currentStudent.name} atualizado.`);
    return {
      status: "success",
      action: "updated",
      message: "Dossier updated successfully by AI."
    };
  }

  return { status: "error", message: "Invalid action received from AI." };
}

function supabaseRequest(endpoint, method, payload, preferRepresentation) {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    "apikey": CONFIG.SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${CONFIG.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json"
  };

  if (preferRepresentation) headers["Prefer"] = "return=representation";

  const options = { method: method, headers: headers, muteHttpExceptions: true };
  if (payload) options.payload = JSON.stringify(payload);

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();

  if (code >= 200 && code < 300) {
    const text = response.getContentText();
    return text ? JSON.parse(text) : true;
  } else {
    Logger.log(`[ERRO SUPABASE] HTTP ${code}: ${response.getContentText()}`);
    return null;
  }
}

function getDossierFromSupabase(studentId) {
  const res = supabaseRequest(`dossiers?student_id=eq.${encodeURIComponent(studentId)}&select=*`, "get");
  return (res && res.length > 0) ? res[0] : null;
}

function getFolderByName(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : null;
}

function getOrCreateFolder(name) {
  const existing = getFolderByName(name);
  if (existing) return existing;
  return DriveApp.createFolder(name);
}

function getAllDocsRecursively(folder, excludeFolderName) {
  let docFiles = [];
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (f.getMimeType() === MimeType.GOOGLE_DOCS) docFiles.push(f);
  }

  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const sub = subfolders.next();
    if (sub.getName() !== excludeFolderName) {
      docFiles = docFiles.concat(getAllDocsRecursively(sub, excludeFolderName));
    }
  }

  return docFiles;
}

function getAllDocsInFolderOnly(folder) {
  let docFiles = [];
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (f.getMimeType() === MimeType.GOOGLE_DOCS) docFiles.push(f);
  }
  return docFiles;
}

### 📄 ARQUIVO: ./index.html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QuizHub</title>

  <!-- Ícone da aba no computador -->
  <link rel="icon" type="image/png" href="/icon-64.png" />

  <!-- Ícone para tela de início no iOS / Safari -->
  <link rel="apple-touch-icon" href="/icon-180.png" />

  <!-- Manifesto e parâmetros PWA para Android / Chrome -->
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#27427f" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="QuizHub" />
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>

  <!-- Registro obrigatório do Service Worker para desbloquear o WebAPK / modo standalone -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  </script>
</body>

</html>

### 📄 ARQUIVO: ./package.json
{
  "name": "quizhub",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.117.2",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.4"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^18.0.8",
    "oxlint": "^1.81.0",
    "typescript": "~6.0.2",
    "vite": "^8.3.0"
  }
}


### 📄 ARQUIVO: ./public/manifest.json
{
  "name": "QuizHub",
  "short_name": "QuizHub",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#a6b1ca",
  "theme_color": "#27427f",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}

### 📄 ARQUIVO: ./public/sw.js
// Service Worker para validação de PWA no Chrome
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Permite que o tráfego passe normalmente
  event.respondWith(fetch(event.request));
});

### 📄 ARQUIVO: ./QUIZHUB_MASTER.md
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
- **Instância:** `https://xttzilpuuqjbztjkeadd.supabase.co`
- **Autenticação & Controle de Acesso:**
  - **Sessão Docente:** Proteção exclusiva das rotas docentes com o componente `TeacherGuard.tsx`. Sessão criptografada persistida no `localStorage` do navegador para evitar logins repetitivos.
  - **Acesso Público sem Fricção aos Alunos:** Rotas de alunos (`/:studentId` e `/quiz/:sessionId`) são externas ao guardião e não exigem login.
  - **Políticas de Row Level Security (RLS):**
    - Tabelas Privadas (`dossiers`, `teacher_briefings`): Acesso estritamente restrito a conexões com sessão de professor (`auth.role() = 'authenticated'`).
    - Tabelas Compartilhadas (`students`, `class_sessions`, `student_quizzes`): Leitura pública liberada (`SELECT` para `anon` e `authenticated`), garantindo que os alunos consigam carregar e responder seus quizzes sem autenticação. Gravação, edição e exclusão restritas ao professor (`authenticated`) e à chave mestre `service_role`.
- **Schema e Tabelas:**
  - `students`: Cadastro de alunos por slug normalizado (`id`) e nome completo em Title Case estrito (`name`).
  - `class_sessions`: Registro de cada aula associada ao aluno, contendo data formatada (`class_date`), horário de início truncado (`class_time`), flag de auditoria/imutabilidade (`is_verified`) e carimbo de criação (`created_at`).
  - `student_quizzes`: Avaliação do aluno com nível CEFR (`level`), diagnóstico de fluência em 4 frases (`level_description`), 5 áreas de foco com exemplos contextualizados (`focus_areas`), 10 questões de múltipla escolha com gabarito didático (`questions`) e tarefas itemizadas (`homework`).
  - `teacher_briefings`: Briefing pedagógico da sessão para o docente com tópicos praticados (`activities_done`), avaliação contínua em parágrafo único de 4 frases (`conversation_assessment`), 5 áreas de calibração da fala do professor (`focus_areas`) e lições espelhadas (`next_tasks`).
  - `dossiers`: Dossiê evolutivo estruturado em 4 cards: `personal_context` (Card 1: Ficha cadastral estática por tópicos), `routine` (Card 2: Linha do tempo com marcações `[DD/MM/YY]`), `learning_profile` (Card 3: Dimensões pedagógicas e estilo de aprendizagem) e `class_history` (Card 4: Histórico cumulativo de aulas exclusivo para alunos; oculto no perfil docente `lessandro-bull`), além da área de staging para aprovação manual (`pending_suggestions`).
  - `cefr_matrix`: Matriz de referência pedagógica oficial dos descritores funcionais (*Can-Dos*) e inventário morfossintático do CEFR/EGP por nível (`level`, `level_name`, `content`, `updated_at`). Armazena os níveis A1 a C2 em blocos estruturados e alimenta cumulativamente o motor do Apps Script.

### B. Backend Serverless e Motor de IA (Google Apps Script Web App)
- **Endpoint Web App (`Code.gs`):**
  `https://script.google.com/macros/s/AKfycbwYMojtkvPqteY6ZNvnmqqqxA8gmKvsoC7HLyHWAQvjqkOawTq9X4kcFKilHmdhu9c/exec`
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
  sed -e 's/GEMINI_API_KEY: "SUA_CHAVE_GEMINI_AQUI"]*"/GEMINI_API_KEY: "SUA_CHAVE_GEMINI_AQUI"/' \
      -e 's/SUPABASE_SERVICE_ROLE_KEY: "SUA_CHAVE_SUPABASE_SERVICE_ROLE_AQUI"]*"/SUPABASE_SERVICE_ROLE_KEY: "SUA_CHAVE_SUPABASE_SERVICE_ROLE_AQUI"/' \
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

### 📄 ARQUIVO: ./README.md
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.


### 📄 ARQUIVO: ./src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentHub from './pages/StudentHub';
import QuizView from './pages/QuizView';
import TeacherHub from './pages/TeacherHub';
import BriefingView from './pages/BriefingView';
import DossierView from './pages/DossierView';
import TeacherGuard from './components/TeacherGuard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher" replace />} />

        {/* Rotas Públicas dos Alunos (Acesso Livre sem Login) */}
        <Route path="/:studentId" element={<StudentHub />} />
        <Route path="/quiz/:sessionId" element={<QuizView />} />

        {/* Rotas Docentes Protegidas por Autenticação */}
        <Route element={<TeacherGuard />}>
          <Route path="/teacher" element={<TeacherHub />} />
          <Route path="/teacher/:studentId" element={<TeacherHub />} />
          <Route path="/teacher/quiz/:sessionId" element={<QuizView />} />
          <Route path="/teacher/briefing/:sessionId" element={<BriefingView />} />
          <Route path="/teacher/dossier/:studentId" element={<DossierView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


### 📄 ARQUIVO: ./src/components/TeacherGuard.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function TeacherGuard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('E-mail ou senha incorretos.');
        } else {
          setErrorMsg(error.message || 'Falha ao autenticar.');
        }
      }
    } catch {
      setErrorMsg('Erro de conexão ao autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Carregando painel docente...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '24px 16px 48px', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div
            style={{
              backgroundColor: '#27427f',
              borderRadius: 18,
              padding: '16px 20px',
              textAlign: 'center',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ color: '#71c499', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              QUIZHUB • TEACHER ACCESS
            </div>
            <div style={{ color: '#eaeffa', fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
              Acesso exclusivo do professor
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: '24px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderBottom: '4px solid #27427f'
            }}
          >
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  E-mail:
                </label>
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    color: '#1e293b',
                    backgroundColor: '#eaeffa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Senha:
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    color: '#1e293b',
                    backgroundColor: '#eaeffa',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim() || !password.trim()}
                style={{
                  backgroundColor: '#27427f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 20px',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: (submitting || !email.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginTop: 6
                }}
              >
                {submitting ? 'Entrando...' : 'Entrar no Painel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}


### 📄 ARQUIVO: ./src/index.css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #acc1d8;
}

### 📄 ARQUIVO: ./src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não encontradas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

### 📄 ARQUIVO: ./src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


### 📄 ARQUIVO: ./src/pages/BriefingView.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface TeacherFocusArea {
  studentSaid: string;
  betterWay: string;
  explanation: string;
}

interface BriefingData {
  studentName: string;
  studentId: string;
  date: string;
  time: string;
  activitiesDone: string[];
  conversationAssessment: string;
  focusAreas: TeacherFocusArea[];
  nextTasks: string;
  sessionLevel?: string | null;
}

function parseLevelCode(rawLevel?: string | null): string | null {
  if (!rawLevel) return null;
  const match = rawLevel.trim().match(/\b([ABC][12])\b/i);
  return match ? match[1].toUpperCase() : rawLevel.trim();
}

export default function BriefingView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Edição Editorial
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BriefingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; color: string } | null>(null);

  useEffect(() => {
    async function fetchBriefing() {
      if (!sessionId) return;
      setLoading(true);

      const { data: record, error } = await supabase
        .from('teacher_briefings')
        .select(`
          activities_done,
          next_tasks,
          conversation_assessment,
          focus_areas,
          diagnostic_focus,
          class_sessions (
            id,
            class_date,
            class_time,
            student_id,
            students (
              name
            )
          )
        `)
        .eq('session_id', sessionId)
        .single();

      if (!error && record) {
        const sessionInfo = record.class_sessions as any;
        let resolvedStudentName = sessionInfo?.students?.name || 'Student';
        let sessionLevel: string | null = null;

        // Recupera o nível avaliado da sessão em student_quizzes
        const { data: quizRecord } = await supabase
          .from('student_quizzes')
          .select('level')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (quizRecord?.level) {
          sessionLevel = parseLevelCode(quizRecord.level);
        }

        const parsed: BriefingData = {
          studentName: resolvedStudentName,
          studentId: sessionInfo?.student_id || '',
          date: sessionInfo?.class_date || '',
          time: sessionInfo?.class_time || '',
          activitiesDone: (record.activities_done as string[]) || [],
          conversationAssessment: record.conversation_assessment || record.diagnostic_focus || '',
          focusAreas: (record.focus_areas as TeacherFocusArea[]) || [],
          nextTasks: record.next_tasks || '',
          sessionLevel: sessionLevel
        };

        setData(parsed);
        setEditData(JSON.parse(JSON.stringify(parsed)));
      }
      setLoading(false);
    }

    fetchBriefing();
  }, [sessionId]);

  const handleToggleEdit = () => {
    if (!isEditing && data) {
      setEditData(JSON.parse(JSON.stringify(data)));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setStatusMsg(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!editData || !sessionId) return;
    setSaving(true);
    setStatusMsg({ text: 'Saving changes...', color: '#27427f' });

    try {
      // 1. Atualiza teacher_briefings (dados do briefing docente)
      const { error: briefingError } = await supabase
        .from('teacher_briefings')
        .update({
          activities_done: editData.activitiesDone,
          conversation_assessment: editData.conversationAssessment,
          focus_areas: editData.focusAreas,
          next_tasks: editData.nextTasks
        })
        .eq('session_id', sessionId);

      if (briefingError) throw briefingError;

      // 2. Sincroniza a lição na tabela student_quizzes (exibida no Student Hub)
      const { error: quizError } = await supabase
        .from('student_quizzes')
        .update({
          homework: editData.nextTasks
        })
        .eq('session_id', sessionId);

      if (quizError) throw quizError;

      // 3. Atualiza data e horário na tabela class_sessions
      const { error: sessionError } = await supabase
        .from('class_sessions')
        .update({
          class_date: editData.date,
          class_time: editData.time
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      setData(JSON.parse(JSON.stringify(editData)));
      setIsEditing(false);
      setStatusMsg({ text: 'Briefing saved successfully.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setSaving(false);
    }
  };

  // Funções de manipulação de Activities
  const updateActivity = (index: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.activitiesDone];
    updated[index] = value;
    setEditData({ ...editData, activitiesDone: updated });
  };

  const addActivity = () => {
    if (!editData) return;
    setEditData({ ...editData, activitiesDone: [...editData.activitiesDone, ''] });
  };

  const removeActivity = (index: number) => {
    if (!editData) return;
    const updated = editData.activitiesDone.filter((_, i) => i !== index);
    setEditData({ ...editData, activitiesDone: updated });
  };

  // Funções de manipulação de Teacher Focus Areas
  const updateFocusArea = (index: number, field: keyof TeacherFocusArea, value: string) => {
    if (!editData) return;
    const updated = [...editData.focusAreas];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, focusAreas: updated });
  };

  const addFocusArea = () => {
    if (!editData) return;
    setEditData({
      ...editData,
      focusAreas: [...editData.focusAreas, { studentSaid: '', betterWay: '', explanation: '' }]
    });
  };

  const removeFocusArea = (index: number) => {
    if (!editData) return;
    const updated = editData.focusAreas.filter((_, i) => i !== index);
    setEditData({ ...editData, focusAreas: updated });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading Briefing...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
        Briefing not found for this session.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '24px 16px 48px', color: '#1e293b' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* 1. Main Banner */}
        <div
          className="briefing-main-banner"
          style={{
            backgroundColor: '#27427f',
            borderRadius: 18,
            padding: '16px 20px',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <style>{`
            .briefing-banner-title {
              color: #71c499;
              font-size: 1.15rem;
              font-weight: 800;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              white-space: nowrap;
            }
            @media (max-width: 640px) {
              .briefing-main-banner {
                padding: 14px 10px !important;
              }
              .briefing-banner-title {
                font-size: 0.80rem !important;
                letter-spacing: 0.02em !important;
              }
            }
          `}</style>
          <div className="briefing-banner-title">
            PEDAGOGICAL DASHBOARD • BRIEFING
          </div>
        </div>

        {/* 2. Navigation & Editorial Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderBottom: '4px solid #27427f'
        }}>
          <Link
            to={data.studentId ? (data.studentId === 'lessandro-bull' ? '/teacher/lessandro-bull' : `/teacher/${data.studentId}`) : '/teacher'}
            style={{
              color: '#27427f',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            ← Back to Classes
          </Link>

          {data.sessionLevel && (
            <div style={{
              color: '#27427f',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '0.04em',
              textAlign: 'center'
            }}>
              {data.sessionLevel}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {statusMsg && (
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: statusMsg.color }}>
                {statusMsg.text}
              </span>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={handleToggleEdit}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#27427f',
                  border: '1px solid #27427f',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                EDIT CONTENT
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleToggleEdit}
                  style={{
                    backgroundColor: '#eaeffa',
                    color: '#27427f',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveChanges}
                  style={{
                    backgroundColor: saving ? '#94a3b8' : '#71c499',
                    color: '#27427f',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3. Session Info Card */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          {!isEditing ? (
            <span style={{ color: '#eaeffa', fontSize: '1.05rem', fontWeight: 700 }}>
              {data.studentName} &bull; {data.date}{data.time ? ` ${data.time}` : ''}
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#eaeffa', fontSize: '1.05rem', fontWeight: 700 }}>
                {editData?.studentName} &bull;
              </span>
              <input
                type="text"
                value={editData?.date || ''}
                onChange={(e) => setEditData(prev => prev ? { ...prev, date: e.target.value } : null)}
                placeholder="Date (e.g. Oct 6)"
                title="Class Date"
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  width: 95,
                  outline: 'none'
                }}
              />
              <input
                type="text"
                value={editData?.time || ''}
                onChange={(e) => setEditData(prev => prev ? { ...prev, time: e.target.value } : null)}
                placeholder="Time (e.g. 21h)"
                title="Class Time"
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  width: 65,
                  outline: 'none'
                }}
              />
            </div>
          )}
          <div>
            <Link
              to={`/teacher/quiz/${sessionId}`}
              style={{
                backgroundColor: '#71c499',
                color: '#27427f',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 800,
                textDecoration: 'none',
                textTransform: 'uppercase'
              }}
            >
              QUIZ
            </Link>
          </div>
        </div>

        {/* Section 1: Conversation Assessment (4 Sentences) */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          CONVERSATION ASSESSMENT
        </div>
        <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 14.5, lineHeight: 1.6 }}>
          {!isEditing ? (
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              textAlign: 'justify',
              textJustify: 'inter-word',
              hyphens: 'auto',
              WebkitHyphens: 'auto'
            }}>
              {data.conversationAssessment || 'No conversation assessment registered.'}
            </div>
          ) : (
            <textarea
              rows={6}
              value={editData?.conversationAssessment || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, conversationAssessment: e.target.value } : null)}
              placeholder="Sentence 1: Hi, Lessandro...&#10;Sentence 2: For a student at level...&#10;Sentence 3: Practical calibrating tips...&#10;Sentence 4: Behavioral & confidence tips..."
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', fontSize: 14.5, lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          )}
        </div>

        {/* Section 2: Activities & Concepts Practiced */}
        <div style={{
          backgroundColor: '#27427f',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 13,
          textAlign: 'center',
          padding: '8px 14px',
          borderRadius: 10,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.6px'
        }}>
          ACTIVITIES & CONCEPTS PRACTICED
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          fontSize: 14.5,
          lineHeight: 1.6
        }}>
          {!isEditing ? (
            data.activitiesDone.length > 0 ? (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {data.activitiesDone.map((act, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: i === data.activitiesDone.length - 1 ? 0 : 6,
                      lineHeight: 1.6
                    }}
                  >
                    {act}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#64748b', margin: 0 }}>No activities listed.</p>
            )
          ) : (
            <div>
              {(editData?.activitiesDone || []).map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={act}
                    onChange={(e) => updateActivity(i, e.target.value)}
                    placeholder={`Activity ${i + 1}`}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', fontSize: '0.92rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeActivity(i)}
                    style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '0 12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addActivity}
                style={{ backgroundColor: '#eaeffa', color: '#27427f', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', marginTop: 4 }}
              >
                + Add Activity
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Agreed Next Tasks */}
        <div style={{
          backgroundColor: '#27427f',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 13,
          textAlign: 'center',
          padding: '8px 14px',
          borderRadius: 10,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.6px'
        }}>
          AGREED NEXT TASKS
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          fontSize: 14.5,
          lineHeight: 1.6
        }}>
          {!isEditing ? (
            (() => {
              const tasks = data.nextTasks && data.nextTasks.trim()
                ? data.nextTasks.split('\n').map(t => t.trim()).filter(t => t.length > 0)
                : [];

              if (tasks.length === 0) {
                return <p style={{ color: '#64748b', margin: 0 }}>No tasks agreed.</p>;
              }

              return (
                <div>
                  {tasks.map((task, idx) => (
                    <div
                      key={idx}
                      style={{
                        lineHeight: 1.6,
                        marginBottom: idx === tasks.length - 1 ? 0 : 6
                      }}
                    >
                      {task}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            <textarea
              rows={3}
              value={editData?.nextTasks || ''}
              onChange={(e) => setEditData(prev => prev ? { ...prev, nextTasks: e.target.value } : null)}
              placeholder="Agreed tasks or commitments for the next class"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                backgroundColor: '#eaeffa',
                fontSize: 14.5,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>

        {/* Section 4: Teacher Focus Areas (5 Items) */}
        <div style={{ backgroundColor: '#27427f', borderRadius: 10, padding: '8px 14px', textAlign: 'center', marginBottom: 8, color: '#eaeffa', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          TEACHER FOCUS AREAS
        </div>
        <div style={{ marginBottom: 18 }}>
          {!isEditing ? (
            data.focusAreas.length > 0 ? (
              data.focusAreas.map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{fa.studentSaid}</div>
                  <div style={{ color: '#0b5394', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>{fa.betterWay}</div>
                  <div style={{
                    backgroundColor: '#eaeffa',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    hyphens: 'auto',
                    WebkitHyphens: 'auto'
                  }}>
                    <strong style={{ color: '#27427f' }}>Explanation:</strong> {fa.explanation}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ background: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '16px 20px', color: '#64748b', fontSize: '0.95rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                No teacher focus areas registered.
              </div>
            )
          ) : (
            <div>
              {(editData?.focusAreas || []).map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#27427f' }}>
                      FOCUS ITEM #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFocusArea(i)}
                      style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Delete Item
                    </button>
                  </div>

                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', marginBottom: 2 }}>TEACHER SAID (EXACT PHRASE):</label>
                  <input
                    type="text"
                    value={fa.studentSaid}
                    onChange={(e) => updateFocusArea(i, 'studentSaid', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', marginBottom: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />

                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0b5394', marginBottom: 2 }}>BETTER WAY (CALIBRATED PHRASE):</label>
                  <input
                    type="text"
                    value={fa.betterWay}
                    onChange={(e) => updateFocusArea(i, 'betterWay', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', marginBottom: 8, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />

                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#27427f', marginBottom: 2 }}>CONCISE EXPLANATION:</label>
                  <textarea
                    rows={2}
                    value={fa.explanation}
                    onChange={(e) => updateFocusArea(i, 'explanation', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#eaeffa', fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addFocusArea}
                style={{ backgroundColor: '#ffffff', color: '#27427f', border: '1px solid #27427f', padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Focus Item
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

### 📄 ARQUIVO: ./src/pages/DossierView.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const APPS_SCRIPT_TRIGGER_URL = "https://script.google.com/macros/s/AKfycbwYMojtkvPqteY6ZNvnmqqqxA8gmKvsoC7HLyHWAQvjqkOawTq9X4kcFKilHmdhu9c/exec";

interface PendingSuggestions {
  personal_data?: string | null;
  routine?: string | null;
  learning_profile?: string | null;
  class_history?: string | null;
}

interface DossierData {
  studentName: string;
  studentId: string;
  personalContext: string;
  routine: string;
  learningProfile: string;
  classHistory: string;
  pendingSuggestions: PendingSuggestions;
}

const LEVEL_MAP: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

const NUM_TO_LEVEL: Record<number, string> = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
  6: 'C2'
};

function parseLevelCode(rawLevel?: string | null): string | null {
  if (!rawLevel) return null;
  const match = rawLevel.trim().match(/\b([ABC][12])\b/i);
  return match ? match[1].toUpperCase() : null;
}

export default function DossierView() {
  const { studentId } = useParams<{ studentId: string }>();
  const [data, setData] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentLevel, setStudentLevel] = useState<string | null>(null);

  // Estados de Edição Editorial (Padrão QuizView)
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<DossierData | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; color: string } | null>(null);

  // Estados de Staging e Sugestões
  const [editingKey, setEditingKey] = useState<keyof PendingSuggestions | null>(null);
  const [editedText, setEditedText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Estados do Brain Dump Manual
  const [brainDumpText, setBrainDumpText] = useState('');
  const [savingDump, setSavingDump] = useState(false);

  function formatItemLabels(text: string) {
    if (!text) return null;
    if (text.startsWith('No ')) {
      return <div style={{ color: '#64748b', lineHeight: 1.6 }}>{text}</div>;
    }
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    return (
      <div>
        {lines.map((line, idx) => {
          const match = line.match(/^(\s*[-•]?\s*[^:\n]+:)(.*)$/);
          return (
            <div
              key={idx}
              style={{
                lineHeight: 1.6,
                marginBottom: idx === lines.length - 1 ? 0 : 6
              }}
            >
              {match ? (
                <>
                  <strong style={{ color: '#27427f', fontWeight: 700 }}>{match[1]}</strong>
                  {match[2]}
                </>
              ) : (
                line
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function formatDates(text: string) {
    if (!text) return null;
    if (text.startsWith('No ')) {
      return <div style={{ color: '#64748b', lineHeight: 1.6 }}>{text}</div>;
    }
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const dateRegex = /(\[[^\]\n]+\])/g;

    return (
      <div>
        {lines.map((line, idx) => {
          const parts = line.split(dateRegex);
          return (
            <div
              key={idx}
              style={{
                lineHeight: 1.6,
                marginBottom: idx === lines.length - 1 ? 0 : 6
              }}
            >
              {parts.map((part, pIdx) => {
                if (part.startsWith('[') && part.endsWith(']')) {
                  return (
                    <strong key={pIdx} style={{ color: '#27427f', fontWeight: 700 }}>
                      {part}
                    </strong>
                  );
                }
                return part;
              })}
            </div>
          );
        })}
      </div>
    );
  }

  const fetchStudentLevel = async (sId: string) => {
    if (sId === 'lessandro-bull') {
      setStudentLevel(null);
      return;
    }

    try {
      const { data: sessions, error } = await supabase
        .from('class_sessions')
        .select(`
          id,
          created_at,
          student_quizzes (
            level
          )
        `)
        .eq('student_id', sId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !sessions) {
        setStudentLevel(null);
        return;
      }

      const levels: number[] = [];
      sessions.forEach((s: any) => {
        const sq = Array.isArray(s.student_quizzes) ? s.student_quizzes[0] : s.student_quizzes;
        const code = parseLevelCode(sq?.level);
        if (code && LEVEL_MAP[code]) {
          levels.push(LEVEL_MAP[code]);
        }
      });

      if (levels.length > 0) {
        const sum = levels.reduce((acc, curr) => acc + curr, 0);
        const avg = Math.round(sum / levels.length);
        const clamped = Math.max(1, Math.min(6, avg));
        setStudentLevel(NUM_TO_LEVEL[clamped] || null);
      } else {
        setStudentLevel(null);
      }
    } catch {
      setStudentLevel(null);
    }
  };

  const fetchDossierData = async () => {
    if (!studentId) return;

    fetchStudentLevel(studentId);

    const { data: record, error } = await supabase
      .from('dossiers')
      .select(`
        personal_context,
        routine,
        learning_profile,
        class_history,
        pending_suggestions,
        students (
          name
        )
      `)
      .eq('student_id', studentId)
      .single();

    if (!error && record) {
      const studentInfo = record.students as any;
      const parsed: DossierData = {
        studentName: studentInfo?.name || 'Student',
        studentId: studentId,
        personalContext: record.personal_context || 'No personal data recorded.',
        routine: record.routine || 'No routine data recorded.',
        learningProfile: record.learning_profile || 'No learning profile recorded.',
        classHistory: record.class_history || 'No class history recorded.',
        pendingSuggestions: (record.pending_suggestions as PendingSuggestions) || {}
      };
      setData(parsed);
      setEditData(JSON.parse(JSON.stringify(parsed)));
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDossierData().finally(() => setLoading(false));
  }, [studentId]);

  // Alternância do Modo de Edição
  const handleToggleEdit = () => {
    if (!isEditing && data) {
      setEditData(JSON.parse(JSON.stringify(data)));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setStatusMsg(null);
    }
  };

  // Gravação no Supabase (Padrão QuizView)
  const handleSaveChanges = async () => {
    if (!editData || !studentId) return;
    setSaving(true);
    setStatusMsg({ text: 'Saving changes...', color: '#27427f' });

    try {
      const { error } = await supabase
        .from('dossiers')
        .update({
          personal_context: editData.personalContext,
          routine: editData.routine,
          learning_profile: editData.learningProfile,
          class_history: editData.classHistory,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (error) throw error;

      setData(JSON.parse(JSON.stringify(editData)));
      setIsEditing(false);
      setStatusMsg({ text: 'Changes saved successfully.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof DossierData, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleStartEdit = (key: keyof PendingSuggestions, currentSuggestionText: string) => {
    setEditingKey(key);
    setEditedText(currentSuggestionText);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditedText('');
  };

  // Gravação Direta de Sugestão de Staging no Supabase
  const handleApproveSuggestion = async (key: keyof PendingSuggestions, textToInsert: string) => {
    if (!data || !studentId || !textToInsert.trim()) return;
    setActionLoading(true);
    setStatusMsg({ text: 'Consolidating into permanent record...', color: '#27427f' });

    try {
      const dbFieldMap: Record<keyof PendingSuggestions, keyof DossierData> = {
        personal_data: 'personalContext',
        routine: 'routine',
        learning_profile: 'learningProfile',
        class_history: 'classHistory'
      };

      const tableColumnMap: Record<keyof PendingSuggestions, string> = {
        personal_data: 'personal_context',
        routine: 'routine',
        learning_profile: 'learning_profile',
        class_history: 'class_history'
      };

      const currentVal = data[dbFieldMap[key]] as string;
      const updatedVal = (currentVal && !currentVal.startsWith('No '))
        ? `${currentVal}\n\n${textToInsert.trim()}`
        : textToInsert.trim();

      const updatedSuggestions = { ...data.pendingSuggestions };
      delete updatedSuggestions[key];

      const { error } = await supabase
        .from('dossiers')
        .update({
          [tableColumnMap[key]]: updatedVal,
          pending_suggestions: updatedSuggestions,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (error) throw error;

      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [dbFieldMap[key]]: updatedVal,
          pendingSuggestions: updatedSuggestions
        };
      });

      setEditData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [dbFieldMap[key]]: updatedVal,
          pendingSuggestions: updatedSuggestions
        };
      });

      setEditingKey(null);
      setEditedText('');
      setStatusMsg({ text: 'Entry approved and permanently saved.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscardSuggestion = async (key: keyof PendingSuggestions) => {
    if (!data || !studentId) return;
    setActionLoading(true);

    try {
      const updatedSuggestions = { ...data.pendingSuggestions };
      delete updatedSuggestions[key];

      const { error } = await supabase
        .from('dossiers')
        .update({
          pending_suggestions: updatedSuggestions,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (error) throw error;

      setData(prev => prev ? { ...prev, pendingSuggestions: updatedSuggestions } : null);
      setEditData(prev => prev ? { ...prev, pendingSuggestions: updatedSuggestions } : null);
      if (editingKey === key) {
        setEditingKey(null);
        setEditedText('');
      }
      setStatusMsg({ text: 'Suggestion discarded.', color: '#475569' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error discarding: ' + (err.message || 'Failed'), color: '#b91c1c' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveBrainDump = async () => {
    if (!brainDumpText.trim() || !studentId || !data) return;
    setSavingDump(true);
    setStatusMsg({ text: 'Processing note with AI...', color: '#27427f' });

    try {
      const url = `${APPS_SCRIPT_TRIGGER_URL}?action=processBrainDump&studentId=${encodeURIComponent(studentId)}&note=${encodeURIComponent(brainDumpText.trim())}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result && result.status === 'error') {
        throw new Error(result.message || 'AI processing failed');
      }

      if (result && result.action === 'merged' && result.targetStudentId) {
        setStatusMsg({ text: 'Profile merged into official student. Redirecting...', color: '#15803d' });
        setBrainDumpText('');
        setTimeout(() => {
          window.location.href = `/teacher/dossier/${result.targetStudentId}`;
        }, 1500);
        return;
      }

      await fetchDossierData();
      setBrainDumpText('');
      setStatusMsg({ text: 'Dossier updated successfully by AI.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error processing note: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setSavingDump(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading Dossier...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
        Dossier not found.
      </div>
    );
  }

  const isTeacherSelf = data.studentId === 'lessandro-bull';

  const renderStagingCard = (key: keyof PendingSuggestions) => {
    const suggestionText = data.pendingSuggestions[key];
    if (!suggestionText) return null;

    const isCurrentlyEditing = editingKey === key;

    return (
      <div style={{
        marginTop: 12,
        backgroundColor: '#eaeffa',
        border: '2px dashed #27427f',
        borderRadius: 8,
        padding: '14px 16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#27427f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Suggestion (Pending Approval):
          </span>
          {statusMsg && (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusMsg.color }}>
              {statusMsg.text}
            </span>
          )}
        </div>

        {!isCurrentlyEditing ? (
          <div style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, marginBottom: 10 }}>
            {key === 'routine' ? formatDates(suggestionText) : formatItemLabels(suggestionText)}
          </div>
        ) : (
          <textarea
            rows={3}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              marginBottom: 10,
              backgroundColor: '#ffffff',
              boxSizing: 'border-box'
            }}
          />
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {!isCurrentlyEditing ? (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStartEdit(key, suggestionText)}
                style={{
                  backgroundColor: '#27427f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Edit
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApproveSuggestion(key, suggestionText)}
                style={{
                  backgroundColor: '#71c499',
                  color: '#27427f',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Insert
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDiscardSuggestion(key)}
                style={{
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Discard
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: '#cbd5e1',
                  color: '#1e293b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApproveSuggestion(key, editedText)}
                style={{
                  backgroundColor: '#71c499',
                  color: '#27427f',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Save & Insert
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#acc1d8',
      minHeight: '100vh',
      padding: '24px 16px 48px',
      color: '#1e293b',
      lineHeight: 1.6
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Main Banner */}
        <div
          className="dossier-main-banner"
          style={{
            backgroundColor: '#27427f',
            borderRadius: 18,
            padding: '16px 20px',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <style>{`
            .dossier-banner-title {
              color: #71c499;
              font-size: 1.15rem;
              font-weight: 800;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              white-space: nowrap;
            }
            @media (max-width: 640px) {
              .dossier-main-banner {
                padding: 14px 10px !important;
              }
              .dossier-banner-title {
                font-size: 0.80rem !important;
                letter-spacing: 0.02em !important;
              }
            }
          `}</style>
          <div className="dossier-banner-title">
            {isTeacherSelf ? 'PEDAGOGICAL DASHBOARD • T-DOSSIER' : 'PEDAGOGICAL DASHBOARD • S-DOSSIER'}
          </div>
          <div style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
            {isTeacherSelf ? 'Lessandro Büll' : data.studentName}
          </div>
        </div>

        {/* Navigation Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderBottom: '4px solid #27427f'
        }}>
          <Link
            to={isTeacherSelf ? '/teacher/lessandro-bull' : `/teacher/${data.studentId}`}
            style={{
              color: '#27427f',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            {isTeacherSelf ? '← Back to Classes' : '← Back to Classes'}
          </Link>

          {!isTeacherSelf && studentLevel && (
            <div style={{
              color: '#27427f',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '0.04em',
              textAlign: 'center'
            }}>
              {studentLevel}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {statusMsg && (
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: statusMsg.color }}>
                {statusMsg.text}
              </span>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={handleToggleEdit}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#27427f',
                  border: '1px solid #27427f',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                EDIT CONTENT
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleToggleEdit}
                  style={{
                    backgroundColor: '#eaeffa',
                    color: '#27427f',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveChanges}
                  style={{
                    backgroundColor: saving ? '#94a3b8' : '#71c499',
                    color: '#27427f',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1. PERSONAL DATA */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          1. PERSONAL DATA & CONTEXT
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.95rem',
          wordBreak: 'break-word'
        }}>
          {!isEditing ? (
            formatItemLabels(data.personalContext)
          ) : (
            <textarea
              rows={4}
              value={editData?.personalContext || ''}
              onChange={(e) => updateField('personalContext', e.target.value)}
              style={{
                width: '100%',
                minHeight: 100,
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: 12,
                fontSize: '0.95rem',
                color: '#1e293b',
                resize: 'vertical',
                backgroundColor: '#eaeffa',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5
              }}
            />
          )}
          {renderStagingCard('personal_data')}
        </div>

        {/* 2. EXPERIENCES, ACTIVITIES & PLANS */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          2. EXPERIENCES, ACTIVITIES & PLANS
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.95rem',
          wordBreak: 'break-word'
        }}>
          {!isEditing ? (
            formatDates(data.routine)
          ) : (
            <textarea
              rows={4}
              value={editData?.routine || ''}
              onChange={(e) => updateField('routine', e.target.value)}
              style={{
                width: '100%',
                minHeight: 100,
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: 12,
                fontSize: '0.95rem',
                color: '#1e293b',
                resize: 'vertical',
                backgroundColor: '#eaeffa',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5
              }}
            />
          )}
          {renderStagingCard('routine')}
        </div>

        {/* 3. LEARNING STYLE & PREFERENCES (STUDENT) / PEDAGOGICAL APPROACH & STYLE (TEACHER) */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          {isTeacherSelf ? '3. PEDAGOGICAL APPROACH & STYLE' : '3. LEARNING STYLE & PREFERENCES'}
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '0.95rem',
          wordBreak: 'break-word'
        }}>
          {!isEditing ? (
            formatItemLabels(data.learningProfile)
          ) : (
            <textarea
              rows={4}
              value={editData?.learningProfile || ''}
              onChange={(e) => updateField('learningProfile', e.target.value)}
              style={{
                width: '100%',
                minHeight: 100,
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: 12,
                fontSize: '0.95rem',
                color: '#1e293b',
                resize: 'vertical',
                backgroundColor: '#eaeffa',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5
              }}
            />
          )}
          {renderStagingCard('learning_profile')}
        </div>

        {/* 4. CUMULATIVE CLASS HISTORY (EXCLUSIVO PARA ALUNOS - OCULTO NO T-DOSSIER) */}
        {!isTeacherSelf && (
          <>
            <div style={{
              backgroundColor: '#27427f',
              borderRadius: 10,
              padding: '8px 14px',
              textAlign: 'center',
              marginBottom: 8,
              color: '#eaeffa',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              4. CUMULATIVE CLASS HISTORY
            </div>
            <div style={{
              background: '#ffffff',
              borderRadius: 10,
              borderBottom: '4px solid #27427f',
              padding: '16px 20px',
              marginBottom: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: '0.95rem',
              wordBreak: 'break-word'
            }}>
              {!isEditing ? (
                formatItemLabels(data.classHistory)
              ) : (
                <textarea
                  rows={8}
                  value={editData?.classHistory || ''}
                  onChange={(e) => updateField('classHistory', e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 180,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: '0.95rem',
                    color: '#1e293b',
                    resize: 'vertical',
                    backgroundColor: '#eaeffa',
                    outline: 'none',
                    boxSizing: 'border-box',
                    lineHeight: 1.5
                  }}
                />
              )}
              {renderStagingCard('class_history')}
            </div>
          </>
        )}

        {/* 5. BRAIN DUMP */}
        <div style={{
          backgroundColor: '#27427f',
          borderRadius: 10,
          padding: '8px 14px',
          textAlign: 'center',
          marginBottom: 8,
          color: '#eaeffa',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          BRAIN DUMP • TEACHER MANUAL NOTES
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          borderBottom: '4px solid #27427f',
          padding: '16px 20px',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <textarea
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 100,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: 12,
              fontSize: '0.95rem',
              color: '#1e293b',
              resize: 'vertical',
              backgroundColor: '#eaeffa',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="button"
              disabled={savingDump || !brainDumpText.trim()}
              onClick={handleSaveBrainDump}
              style={{
                backgroundColor: '#27427f',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: (savingDump || !brainDumpText.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {savingDump ? 'Processing...' : 'Save to History'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

### 📄 ARQUIVO: ./src/pages/QuizView.tsx
import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface FocusArea {
  studentSaid: string;
  betterWay: string;
  explanation: string;
  examples: string[];
}

interface Question {
  number: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  studentId?: string;
  studentName: string;
  date: string;
  level: string;
  levelDescription: string;
  focusAreas: FocusArea[];
  quiz: Question[];
  homework?: string;
}

export default function QuizView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const isTeacherRoute = location.pathname.startsWith('/teacher');

  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  // Student Interactivity States (View Mode)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  // Teacher Editorial States (Edit Mode)
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<QuizData | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; color: string } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      if (!sessionId) return;
      setLoading(true);

      const { data: quizRecord, error } = await supabase
        .from('student_quizzes')
        .select(`
          level,
          level_description,
          focus_areas,
          questions,
          homework,
          class_sessions (
            class_date,
            student_id,
            students (
              name
            )
          )
        `)
        .eq('session_id', sessionId)
        .single();

      if (!error && quizRecord) {
        const sessionInfo = quizRecord.class_sessions as any;
        const parsedData: QuizData = {
          studentId: sessionInfo?.student_id || '',
          studentName: sessionInfo?.students?.name || 'Student',
          date: sessionInfo?.class_date || '',
          level: quizRecord.level || 'B2 (Upper-Intermediate)',
          levelDescription: quizRecord.level_description || '',
          focusAreas: (quizRecord.focus_areas as FocusArea[]) || [],
          quiz: (quizRecord.questions as Question[]) || [],
          homework: quizRecord.homework || ''
        };
        setData(parsedData);
        setEditData(JSON.parse(JSON.stringify(parsedData)));
      }
      setLoading(false);
    }

    loadQuiz();
  }, [sessionId]);

  // Student Answer Selection
  const handleSelectOption = (qIndex: number, selectedLetter: string, correctLetter: string) => {
    if (userAnswers[qIndex]) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: selectedLetter }));
    if (selectedLetter.toUpperCase() === correctLetter.toUpperCase()) {
      setScore(prev => prev + 1);
    }
  };

  // Toggle Edit Mode
  const handleToggleEdit = () => {
    if (!isEditing && data) {
      setEditData(JSON.parse(JSON.stringify(data)));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setStatusMsg(null);
    }
  };

  // Save Changes to Supabase
  const handleSaveChanges = async () => {
    if (!editData || !sessionId) return;
    setSaving(true);
    setStatusMsg({ text: 'Saving changes...', color: '#27427f' });

    try {
      const { error } = await supabase
        .from('student_quizzes')
        .update({
          level: editData.level,
          level_description: editData.levelDescription,
          focus_areas: editData.focusAreas,
          questions: editData.quiz,
          homework: editData.homework || null
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      setData(JSON.parse(JSON.stringify(editData)));
      setIsEditing(false);
      setStatusMsg({ text: 'Changes saved successfully.', color: '#15803d' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ text: 'Error saving: ' + (err.message || 'Connection failed'), color: '#b91c1c' });
    } finally {
      setSaving(false);
    }
  };

  // Edit State Modifiers
  const updateFocusArea = (index: number, field: keyof FocusArea, value: any) => {
    if (!editData) return;
    const updated = [...editData.focusAreas];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, focusAreas: updated });
  };

  const updateFocusExample = (areaIndex: number, exampleIndex: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.focusAreas];
    const examples = [...(updated[areaIndex].examples || [])];
    examples[exampleIndex] = value;
    updated[areaIndex] = { ...updated[areaIndex], examples };
    setEditData({ ...editData, focusAreas: updated });
  };

  const updateQuestion = (qIndex: number, field: keyof Question, value: any) => {
    if (!editData) return;
    const updated = [...editData.quiz];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setEditData({ ...editData, quiz: updated });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.quiz];
    const options = [...updated[qIndex].options];
    options[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setEditData({ ...editData, quiz: updated });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading assessment...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
        Quiz not found for this session.
      </div>
    );
  }

  const currentLevel = (isEditing && editData ? editData.level : data.level).toUpperCase();
  const isPt = currentLevel.includes('A1');

  let levelLabel = isEditing && editData ? editData.level : data.level;
  if (isPt && levelLabel.includes('A1')) {
    levelLabel = 'A1 (Iniciante)';
  }

  const focusTitle = isPt ? 'Área de Foco' : 'Focus Areas';
  const quizTitle = isPt ? 'Praticar o Quiz' : 'Practice Quiz';
  const expLabel = isPt ? 'Explicação:' : 'Explanation:';
  const totalQuestions = data.quiz.length;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div style={{
      backgroundColor: '#acc1d8',
      minHeight: '100vh',
      padding: isTeacherRoute ? '24px 16px 48px' : '24px 16px 40px 14px',
      color: '#1e293b'
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ADMIN ONLY: Card 1 - Main Banner */}
        {isTeacherRoute && (
          <div
            className="quiz-admin-main-banner"
            style={{
              backgroundColor: '#27427f',
              borderRadius: 18,
              padding: '16px 20px',
              textAlign: 'center',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <style>{`
              .quiz-admin-banner-title {
                color: #71c499;
                font-size: 1.15rem;
                font-weight: 800;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                white-space: nowrap;
              }
              @media (max-width: 640px) {
                .quiz-admin-main-banner {
                  padding: 14px 10px !important;
                }
                .quiz-admin-banner-title {
                  font-size: 0.80rem !important;
                  letter-spacing: 0.02em !important;
                }
              }
            `}</style>
            <div className="quiz-admin-banner-title">
              PEDAGOGICAL DASHBOARD • QUIZ
            </div>
          </div>
        )}

        {/* ADMIN ONLY: Card 2 - Navigation & Editorial Card */}
        {isTeacherRoute && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: '12px 18px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderBottom: '4px solid #27427f'
          }}>
            <Link
              to={`/teacher/briefing/${sessionId}`}
              style={{
                color: '#27427f',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              ← Back to Briefing
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {statusMsg && (
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: statusMsg.color }}>
                  {statusMsg.text}
                </span>
              )}

              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleToggleEdit}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#27427f',
                    border: '1px solid #27427f',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  EDIT CONTENT
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleToggleEdit}
                    style={{
                      backgroundColor: '#eaeffa',
                      color: '#27427f',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveChanges}
                    style={{
                      backgroundColor: saving ? '#94a3b8' : '#71c499',
                      color: '#27427f',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Student View Starts Here (Header) */}
        <header
          className="quiz-header"
          style={{
            backgroundColor: '#27427f',
            borderRadius: 18,
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            position: 'relative'
          }}
        >
          <style>{`
            .quiz-header {
              padding: 16px;
            }
            .quiz-hub-btn-desktop {
              display: inline-flex;
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              background-color: #71c499;
              color: #27427f;
              padding: 6px 14px;
              border-radius: 8px;
              font-size: 0.82rem;
              font-weight: 800;
              text-decoration: none;
              letter-spacing: 0.04em;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
              align-items: center;
              justify-content: center;
            }
            .quiz-info-desktop {
              display: block;
              font-size: 15px;
              font-weight: 700;
              color: #eaeffa;
              margin-top: 4px;
            }
            .quiz-mobile-row {
              display: none;
            }
            @media (max-width: 640px) {
              .quiz-header {
                padding: 14px 16px !important;
                text-align: center;
              }
              .quiz-hub-btn-desktop {
                display: none !important;
              }
              .quiz-info-desktop {
                display: none !important;
              }
              .quiz-mobile-row {
                display: flex !important;
                align-items: center;
                justify-content: center !important;
                gap: 10px;
                margin-top: 8px;
              }
            }
          `}</style>

          {data.studentId && (
            <Link to={`/${data.studentId}`} className="quiz-hub-btn-desktop">
              HUB
            </Link>
          )}

          <h1 style={{ fontSize: 14, fontWeight: 800, color: '#71c499', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Conversation Assessment
          </h1>

          <div className="quiz-info-desktop">
            {data.studentName} • {data.date}
          </div>

          <div className="quiz-mobile-row">
            {data.studentId && (
              <Link
                to={`/${data.studentId}`}
                style={{
                  backgroundColor: '#71c499',
                  color: '#27427f',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                HUB
              </Link>
            )}
            <div style={{ fontSize: 16, fontWeight: 700, color: '#eaeffa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {data.studentName} • {data.date}
            </div>
          </div>
        </header>

        {/* 1. Level & Fluency Assessment (4 Sentences) */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ backgroundColor: '#27427f', color: '#eaeffa', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '8px 14px', borderRadius: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {levelLabel}
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: 16,
            borderRadius: 10,
            borderBottom: '4px solid #27427f',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: 14.5,
            lineHeight: 1.6,
            textAlign: 'justify',
            textJustify: 'inter-word',
            hyphens: 'auto',
            WebkitHyphens: 'auto'
          }}>
            {!isEditing ? (
              data.levelDescription
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase' }}>
                  CEFR Level:
                </label>
                <input
                  type="text"
                  value={editData?.level || ''}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, level: e.target.value } : null)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 12, fontSize: 14, outline: 'none' }}
                />

                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#27427f', marginBottom: 4, textTransform: 'uppercase' }}>
                  Fluency Assessment (Exactly 4 sentences - No CEFR code):
                </label>
                <textarea
                  rows={4}
                  value={editData?.levelDescription || ''}
                  onChange={(e) => setEditData(prev => prev ? { ...prev, levelDescription: e.target.value } : null)}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, lineHeight: 1.5, resize: 'vertical', outline: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. Focus Areas (5 Items) */}
        {((isEditing ? editData?.focusAreas : data.focusAreas) || []).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ backgroundColor: '#27427f', color: '#eaeffa', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '8px 14px', borderRadius: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {focusTitle}
            </div>

            {!isEditing ? (
              data.focusAreas.map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>{fa.studentSaid}</div>
                  <div style={{ color: '#0b5394', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{fa.betterWay}</div>
                  <div style={{ backgroundColor: '#eaeffa', borderRadius: 8, padding: '10px 12px', fontSize: 13.5, lineHeight: 1.5 }}>
                    <div style={{
                      marginBottom: 8,
                      textAlign: 'justify',
                      textJustify: 'inter-word',
                      hyphens: 'auto',
                      WebkitHyphens: 'auto'
                    }}>
                      <strong style={{ color: '#27427f' }}>{expLabel}</strong> {fa.explanation}
                    </div>
                    {fa.examples && fa.examples.length > 0 && (
                      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                        {fa.examples.map((ex, j) => (
                          <div key={j} style={{ color: '#334155', fontStyle: 'italic', fontSize: 13, marginTop: 3 }}>• {ex}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              editData?.focusAreas.map((fa, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#27427f', marginBottom: 8 }}>
                    FOCUS ITEM #{i + 1}
                  </div>

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#b91c1c', marginBottom: 2 }}>STUDENT SAID:</label>
                  <input
                    type="text"
                    value={fa.studentSaid}
                    onChange={(e) => updateFocusArea(i, 'studentSaid', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8, fontSize: 13.5 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0b5394', marginBottom: 2 }}>BETTER WAY:</label>
                  <input
                    type="text"
                    value={fa.betterWay}
                    onChange={(e) => updateFocusArea(i, 'betterWay', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8, fontSize: 13.5 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#27427f', marginBottom: 2 }}>CONCISE EXPLANATION:</label>
                  <textarea
                    rows={2}
                    value={fa.explanation}
                    onChange={(e) => updateFocusArea(i, 'explanation', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8, fontSize: 13 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 2 }}>3 USAGE EXAMPLES:</label>
                  {(fa.examples || ['', '', '']).map((ex, exIdx) => (
                    <input
                      key={exIdx}
                      type="text"
                      value={ex}
                      onChange={(e) => updateFocusExample(i, exIdx, e.target.value)}
                      placeholder={`Example ${exIdx + 1}`}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 4, fontSize: 13 }}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Practice Quiz (10 Multiple Choice Questions) */}
        {((isEditing ? editData?.quiz : data.quiz) || []).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ backgroundColor: '#27427f', color: '#eaeffa', fontWeight: 700, fontSize: 13, textAlign: 'center', padding: '8px 14px', borderRadius: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {quizTitle}
            </div>

            {!isEditing ? (
              data.quiz.map((item, q) => {
                const selected = userAnswers[q];
                const isAnswered = !!selected;

                return (
                  <div key={q} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: 16, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#27427f', marginBottom: 12 }}>
                      {item.number}. {item.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {item.options.map((optText, optIdx) => {
                        const optLetter = optText.charAt(0).toUpperCase();
                        const isCorrect = optLetter === item.correctAnswer.toUpperCase();
                        const isSelected = optLetter === selected?.toUpperCase();

                        let btnBg = '#eaeffa';
                        let btnBorder = 'transparent';
                        let btnColor = '#1e293b';

                        if (isAnswered) {
                          if (isCorrect) {
                            btnBg = '#dcfce7';
                            btnBorder = '#22c55e';
                            btnColor = '#15803d';
                          } else if (isSelected) {
                            btnBg = '#fee2e2';
                            btnBorder = '#ef4444';
                            btnColor = '#b91c1c';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(q, optLetter, item.correctAnswer)}
                            style={{
                              backgroundColor: btnBg,
                              border: `1px solid ${btnBorder}`,
                              borderRadius: 8,
                              padding: '10px 14px',
                              fontSize: 14,
                              textAlign: 'left',
                              cursor: isAnswered ? 'default' : 'pointer',
                              fontWeight: 600,
                              color: btnColor,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {optText}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div style={{
                        marginTop: 10,
                        padding: '10px 12px',
                        backgroundColor: '#eaeffa',
                        borderRadius: 8,
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        hyphens: 'auto',
                        WebkitHyphens: 'auto'
                      }}>
                        <strong style={{ color: '#27427f' }}>{expLabel}</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              editData?.quiz.map((item, q) => (
                <div key={q} style={{ backgroundColor: '#ffffff', borderRadius: 10, borderBottom: '4px solid #27427f', padding: 16, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', paddingBottom: 8, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#27427f' }}>
                      QUESTION #{item.number}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#27427f' }}>Answer Key:</span>
                      <select
                        value={item.correctAnswer}
                        onChange={(e) => updateQuestion(q, 'correctAnswer', e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontWeight: 800, color: '#27427f' }}
                      >
                        {['A', 'B', 'C', 'D', 'E'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2 }}>QUESTION PROMPT:</label>
                  <textarea
                    rows={2}
                    value={item.question}
                    onChange={(e) => updateQuestion(q, 'question', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 10, fontSize: 13.5 }}
                  />

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>OPTIONS (A to E):</label>
                  {item.options.map((opt, optIdx) => (
                    <input
                      key={optIdx}
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(q, optIdx, e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 6, fontSize: 13 }}
                    />
                  ))}

                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#27427f', marginTop: 6, marginBottom: 2 }}>DIDACTIC EXPLANATION:</label>
                  <textarea
                    rows={2}
                    value={item.explanation}
                    onChange={(e) => updateQuestion(q, 'explanation', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              ))
            )}

            {!isEditing && answeredCount === totalQuestions && (
              <div style={{ backgroundColor: '#27427f', color: '#ffffff', borderRadius: 10, padding: 14, textAlign: 'center', fontSize: 16, fontWeight: 800, marginTop: 16 }}>
                {isPt ? `Resultado: ${score} de ${totalQuestions} corretas!` : `Score: ${score} / ${totalQuestions}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

### 📄 ARQUIVO: ./src/pages/StudentHub.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SessionItem {
    id: string;
    class_date: string;
    class_time?: string;
    created_at?: string;
}

function parseSessionDateToTime(dateStr: string, classTime?: string, createdAt?: string): number {
    if (!dateStr) return createdAt ? new Date(createdAt).getTime() : 0;
    const trimmed = dateStr.trim();

    const monthMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    // 1. MMM D (ex: "Oct 6", "Sep 1")
    const mmmDMatch = trimmed.match(/^([a-zA-Z]{3})\s+(\d{1,2})$/i);
    if (mmmDMatch) {
        const mKey = mmmDMatch[1].toLowerCase();
        const mIndex = monthMap[mKey];
        const day = parseInt(mmmDMatch[2], 10);
        if (mIndex !== undefined) {
            let year = new Date().getFullYear();
            if (createdAt) {
                const cYear = new Date(createdAt).getFullYear();
                if (!isNaN(cYear)) year = cYear;
            }
            let hour = 12;
            if (classTime) {
                const hMatch = classTime.match(/(\d{1,2})/);
                if (hMatch) hour = parseInt(hMatch[1], 10);
            }
            return new Date(year, mIndex, day, hour).getTime();
        }
    }

    // 2. DD/MM
    const ddMmMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (ddMmMatch) {
        const day = parseInt(ddMmMatch[1], 10);
        const month = parseInt(ddMmMatch[2], 10) - 1;
        let year = new Date().getFullYear();
        if (createdAt) {
            const cYear = new Date(createdAt).getFullYear();
            if (!isNaN(cYear)) year = cYear;
        }
        let hour = 12;
        if (classTime) {
            const hMatch = classTime.match(/(\d{1,2})/);
            if (hMatch) hour = parseInt(hMatch[1], 10);
        }
        return new Date(year, month, day, hour).getTime();
    }

    // 3. YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
        return new Date(trimmed).getTime();
    }

    return createdAt ? new Date(createdAt).getTime() : 0;
}

export default function StudentHub() {
    const { studentId } = useParams<{ studentId: string }>();
    const [studentName, setStudentName] = useState<string>('');
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [homework, setHomework] = useState<string>('');
    const [isA1, setIsA1] = useState(false);
    const [rollingLevel, setRollingLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudentData() {
            if (!studentId) return;

            // 1. Busca dados do aluno
            const { data: student, error: studentErr } = await supabase
                .from('students')
                .select('name')
                .eq('id', studentId)
                .single();

            if (studentErr || !student) {
                setLoading(false);
                return;
            }

            setStudentName(student.name);

            // 2. Busca sessões que já possuem quiz gerado (incluindo level para verificar idioma)
            const { data: sessionList, error: sessErr } = await supabase
                .from('class_sessions')
                .select(`
                  id,
                  class_date,
                  class_time,
                  created_at,
                  student_quizzes!inner (
                    id,
                    homework,
                    level
                  )
                `)
                .eq('student_id', studentId);

            if (!sessErr && sessionList) {
                // Ordenação cronológica real decrescente
                const sorted = [...(sessionList as any[])].sort((a, b) => {
                    const timeB = parseSessionDateToTime(b.class_date, b.class_time, b.created_at);
                    const timeA = parseSessionDateToTime(a.class_date, a.class_time, a.created_at);
                    return timeB - timeA;
                });

                setSessions(sorted as unknown as SessionItem[]);

                if (sorted.length > 0) {
                    const latestQuizzes = sorted[0].student_quizzes;
                    const latestHomework = Array.isArray(latestQuizzes)
                        ? latestQuizzes[0]?.homework
                        : latestQuizzes?.homework;
                    if (latestHomework) {
                        setHomework(latestHomework);
                    }

                    const latestLevel = Array.isArray(latestQuizzes)
                        ? latestQuizzes[0]?.level
                        : latestQuizzes?.level;
                    setIsA1(Boolean(latestLevel && latestLevel.toUpperCase().includes('A1')));

                    // Calcula a média móvel oficial das últimas 10 aulas do aluno
                    const levelMap: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
                    const numToLevel: Record<number, string> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
                    const values: number[] = [];

                    sorted.slice(0, 10).forEach((s: any) => {
                        const sq = Array.isArray(s.student_quizzes) ? s.student_quizzes[0] : s.student_quizzes;
                        if (sq?.level) {
                            const match = sq.level.match(/\b([ABC][12])\b/i);
                            if (match) {
                                const code = match[1].toUpperCase();
                                if (levelMap[code]) values.push(levelMap[code]);
                            }
                        }
                    });

                    if (values.length > 0) {
                        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                        const clamped = Math.max(1, Math.min(6, avg));
                        const calculatedAvg = numToLevel[clamped] || null;
                        setRollingLevel(calculatedAvg);
                        setIsA1(Boolean(calculatedAvg && calculatedAvg.toUpperCase().includes('A1')));
                    }
                }
            }

            setLoading(false);
        }

        fetchStudentData();
    }, [studentId]);

    if (loading) {
        return (
            <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '40px 16px', textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
                Carregando quizzes...
            </div>
        );
    }

    if (!studentName) {
        return (
            <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '40px 16px', textAlign: 'center', color: '#b91c1c', fontWeight: 'bold' }}>
                Aluno não encontrado.
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: '24px 16px 48px', color: '#1e293b' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {/* Banner do Aluno - Padronizado com Student Sessions */}
                <div
                    className="student-main-banner"
                    style={{
                        backgroundColor: '#27427f',
                        borderRadius: 18,
                        padding: '16px 20px',
                        textAlign: 'center',
                        marginBottom: 16,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    <style>{`
                        .student-banner-title {
                            color: #71c499;
                            font-size: 1.15rem;
                            font-weight: 800;
                            letter-spacing: 0.06em;
                            text-transform: uppercase;
                            white-space: nowrap;
                        }
                        @media (max-width: 640px) {
                            .student-main-banner {
                                padding: 14px 10px !important;
                            }
                            .student-banner-title {
                                font-size: 1rem !important;
                                letter-spacing: 0.02em !important;
                            }
                        }
                    `}</style>
                    <div className="student-banner-title">
                        QUIZHUB
                    </div>
                    <div style={{ color: '#eaeffa', fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
                        {studentName}{rollingLevel ? ` • ${rollingLevel}` : ''}
                    </div>
                </div>

                {/* Card de Lição de Casa */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{
                        backgroundColor: '#27427f',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 13,
                        textAlign: 'center',
                        padding: '8px 14px',
                        borderRadius: 10,
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px'
                    }}>
                        Homework for next class
                    </div>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 10,
                        borderBottom: '4px solid #27427f',
                        padding: '16px 20px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        fontSize: 14.5,
                        lineHeight: 1.6
                    }}>
                        {(() => {
                            const tasks = homework && homework.trim().length > 0
                                ? homework.split('\n').map(t => t.trim()).filter(t => t.length > 0)
                                : [];

                            if (tasks.length === 0) {
                                return (
                                    <p style={{ color: '#64748b', margin: 0 }}>
                                        {isA1 ? 'Nenhuma lição atribuída para a próxima aula.' : 'No homework assigned for next class.'}
                                    </p>
                                );
                            }

                            return (
                                <div>
                                    {tasks.map((task, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                lineHeight: 1.6,
                                                marginBottom: idx === tasks.length - 1 ? 0 : 6
                                            }}
                                        >
                                            {task}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Subtítulo Quizzes */}
                <div style={{
                    backgroundColor: '#27427f',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: 'center',
                    padding: '8px 14px',
                    borderRadius: 10,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px'
                }}>
                    QUIZZES
                </div>

                {/* Lista de Aulas e Quizzes (Padronizado com TeacherHub Sessions) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <style>{`
                        .student-session-card {
                            padding: 16px 20px;
                        }
                        .student-session-title {
                            font-size: 1rem;
                        }
                        @media (max-width: 640px) {
                            .student-session-card {
                                padding: 12px 14px !important;
                            }
                            .student-session-title {
                                font-size: 0.92rem !important;
                            }
                        }
                    `}</style>

                    {sessions.length === 0 ? (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: 24,
                            borderRadius: 10,
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#475569',
                            borderBottom: '4px solid #27427f'
                        }}>
                            Nenhum quiz disponível no momento.
                        </div>
                    ) : (
                        sessions.map((sess) => (
                            <Link
                                key={sess.id}
                                to={`/quiz/${sess.id}`}
                                className="student-session-card"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: '#ffffff',
                                    borderRadius: 10,
                                    textDecoration: 'none',
                                    color: '#1e293b',
                                    fontWeight: 700,
                                    borderBottom: '4px solid #27427f',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    gap: 8,
                                    transition: 'transform 0.1s ease'
                                }}
                            >
                                <span className="student-session-title">
                                    Quiz • {sess.class_date}
                                </span>
                                <span style={{
                                    backgroundColor: '#71c499',
                                    color: '#27427f',
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}>
                                    Open
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

### 📄 ARQUIVO: ./src/pages/TeacherHub.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Substitua pela URL da sua implantação Web App do Apps Script
const APPS_SCRIPT_TRIGGER_URL = "https://script.google.com/macros/s/AKfycbwYMojtkvPqteY6ZNvnmqqqxA8gmKvsoC7HLyHWAQvjqkOawTq9X4kcFKilHmdhu9c/exec";

interface Student {
  id: string;
  name: string;
}

interface ClassSessionItem {
  id: string;
  class_date: string;
  class_time?: string;
  created_at: string;
  is_verified?: boolean;
  student_quizzes?: { level: string }[];
}

function parseSessionDateToTime(dateStr: string, classTime?: string, createdAt?: string): number {
  if (!dateStr) return createdAt ? new Date(createdAt).getTime() : 0;
  const trimmed = dateStr.trim();

  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  // 1. MMM D (ex: "Oct 6", "Sep 1")
  const mmmDMatch = trimmed.match(/^([a-zA-Z]{3})\s+(\d{1,2})$/i);
  if (mmmDMatch) {
    const mKey = mmmDMatch[1].toLowerCase();
    const mIndex = monthMap[mKey];
    const day = parseInt(mmmDMatch[2], 10);
    if (mIndex !== undefined) {
      let year = new Date().getFullYear();
      if (createdAt) {
        const cYear = new Date(createdAt).getFullYear();
        if (!isNaN(cYear)) year = cYear;
      }
      let hour = 12;
      if (classTime) {
        const hMatch = classTime.match(/(\d{1,2})/);
        if (hMatch) hour = parseInt(hMatch[1], 10);
      }
      return new Date(year, mIndex, day, hour).getTime();
    }
  }

  // 2. DD/MM
  const ddMmMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (ddMmMatch) {
    const day = parseInt(ddMmMatch[1], 10);
    const month = parseInt(ddMmMatch[2], 10) - 1;
    let year = new Date().getFullYear();
    if (createdAt) {
      const cYear = new Date(createdAt).getFullYear();
      if (!isNaN(cYear)) year = cYear;
    }
    let hour = 12;
    if (classTime) {
      const hMatch = classTime.match(/(\d{1,2})/);
      if (hMatch) hour = parseInt(hMatch[1], 10);
    }
    return new Date(year, month, day, hour).getTime();
  }

  // 3. YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    return new Date(trimmed).getTime();
  }

  return createdAt ? new Date(createdAt).getTime() : 0;
}

function formatSessionDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{2}\/\d{2}$/.test(trimmed)) return trimmed;

  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  const mmmDMatch = trimmed.match(/^([a-zA-Z]{3})\s+(\d{1,2})$/);
  if (mmmDMatch) {
    const monthKey = mmmDMatch[1].toLowerCase();
    const monthNum = monthMap[monthKey];
    if (monthNum) {
      const dayNum = mmmDMatch[2].padStart(2, '0');
      return `${dayNum}/${monthNum}`;
    }
  }

  const ymdMatch = trimmed.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    return `${ymdMatch[2]}/${ymdMatch[1]}`;
  }

  return trimmed;
}

function getStudentDisplayName(fullName: string, allNames: string[]): string {
  if (!fullName) return '';
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  const firstName = parts[0];
  if (parts.length === 1) return firstName;

  const hasDuplicateFirst = allNames.some(name => {
    const otherClean = name.trim();
    if (otherClean.toLowerCase() === clean.toLowerCase()) return false;
    const otherFirst = otherClean.split(/\s+/)[0];
    return otherFirst.toLowerCase() === firstName.toLowerCase();
  });

  if (hasDuplicateFirst) {
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  }

  return firstName;
}

export default function TeacherHub() {
  const { studentId } = useParams<{ studentId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<ClassSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Disparo Pontual
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState<{ text: string; color: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const { data: studentsList } = await supabase
          .from('students')
          .select('id, name')
          .order('name');

        if (studentsList) {
          setStudents(studentsList);
        }

        if (studentId) {
          const found = studentsList?.find(s => s.id === studentId);
          setCurrentStudent(found || null);

          let query = supabase
            .from('class_sessions')
            .select(`
              id,
              class_date,
              class_time,
              is_verified,
              created_at,
              students(name),
              student_quizzes(level),
              teacher_briefings!inner(id)
            `);

          if (studentId !== 'lessandro-bull') {
            query = query.eq('student_id', studentId);
          }

          const { data: sessionList } = await query;

          if (sessionList) {
            // Ordenação cronológica real decrescente
            const sorted = [...(sessionList as any[])].sort((a, b) => {
              const timeB = parseSessionDateToTime(b.class_date, b.class_time, b.created_at);
              const timeA = parseSessionDateToTime(a.class_date, a.class_time, a.created_at);
              return timeB - timeA;
            });
            setSessions(sorted as unknown as ClassSessionItem[]);
          }
        } else {
          setCurrentStudent(null);
          setSessions([]);
        }
      } catch (err) {
        console.error("Error loading TeacherHub:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId]);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await supabase.from('student_quizzes').delete().eq('session_id', sessionId);
      await supabase.from('teacher_briefings').delete().eq('session_id', sessionId);
      const { error } = await supabase.from('class_sessions').delete().eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      alert('Error deleting session: ' + (err.message || 'Failed'));
    }
  };

  const handleVerifySession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('class_sessions')
        .update({ is_verified: true })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, is_verified: true } : s));
    } catch (err: any) {
      alert('Error verifying session: ' + (err.message || 'Failed'));
    }
  };

  // Disparo pontual por aluno e data com contagem sincronizada
  const handleProcessSingleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentName || !selectedDate) {
      setTriggerMsg({ text: 'Please select both student and class date.', color: '#b91c1c' });
      return;
    }

    // Converte YYYY-MM-DD para "MMM D" (ex: "Sep 30")
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = selectedDate.split('-');
    const formattedDate = (parts.length === 3)
      ? `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`
      : selectedDate;

    setTriggering(true);

    try {
      const url = `${APPS_SCRIPT_TRIGGER_URL}?action=processSingle&studentName=${encodeURIComponent(selectedStudentName)}&targetDate=${encodeURIComponent(formattedDate)}`;
      await fetch(url, { mode: 'no-cors' });

      let secondsLeft = 65;
      setTriggerMsg({
        text: `Processing ${selectedStudentName} (${formattedDate}) with Gemini 3.5... updating in ${secondsLeft}s`,
        color: '#27427f'
      });

      const interval = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft > 0) {
          setTriggerMsg({
            text: `Processing ${selectedStudentName} (${formattedDate}) with Gemini 3.5... updating in ${secondsLeft}s`,
            color: '#27427f'
          });
        } else {
          clearInterval(interval);
          setTriggerMsg({ text: 'Session processed! Reloading dashboard...', color: '#15803d' });
          window.location.reload();
        }
      }, 1000);

    } catch (err: any) {
      setTriggerMsg({ text: 'Signal sent. Verify class list in a few moments.', color: '#475569' });
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#acc1d8', minHeight: '100vh', padding: 40, textAlign: 'center', color: '#27427f', fontWeight: 'bold' }}>
        Loading pedagogical dashboard...
      </div>
    );
  }

  const regularStudents = students.filter(s => s.id !== 'lessandro-bull');
  const isTeacherView = currentStudent?.id === 'lessandro-bull';

  return (
    <div style={{
      backgroundColor: '#acc1d8',
      minHeight: '100vh',
      padding: '24px 16px 48px',
      color: '#1e293b'
    }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Main Banner */}
        <div
          className="teacher-main-banner"
          style={{
            backgroundColor: '#27427f',
            borderRadius: 18,
            padding: '16px 20px',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <style>{`
            .teacher-banner-title {
              color: #71c499;
              font-size: 1.15rem;
              font-weight: 800;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              white-space: nowrap;
            }
            @media (max-width: 640px) {
              .teacher-main-banner {
                padding: 14px 10px !important;
              }
              .teacher-banner-title {
                font-size: 0.80rem !important;
                letter-spacing: 0.02em !important;
              }
            }
          `}</style>
          <div className="teacher-banner-title">
            {!studentId
              ? 'PEDAGOGICAL DASHBOARD • QUIZHUB'
              : (isTeacherView ? 'PEDAGOGICAL DASHBOARD • ALL SESSIONS' : 'PEDAGOGICAL DASHBOARD • STUDENT SESSIONS')}
          </div>
          {currentStudent && !isTeacherView && (
            <div style={{ color: '#eaeffa', fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
              {currentStudent.name}
            </div>
          )}
        </div>

        {/* OVERVIEW MODE */}
        {!studentId && (
          <div>
            {/* Teacher Self-Assessment Block */}
            <div
              className="teacher-area-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(39, 66, 127, 0.15)',
                borderBottom: '4px solid #27427f',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12
              }}
            >
              <style>{`
                .teacher-area-left {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  flex-wrap: wrap;
                }
                .teacher-area-tag {
                  font-size: 0.78rem;
                  font-weight: 800;
                  color: #27427f;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  line-height: 1;
                  position: relative;
                  top: 1px;
                }
                .teacher-area-sub {
                  font-size: 1.05rem;
                  font-weight: 800;
                  color: #1e293b;
                  line-height: 1.2;
                }
                @media (max-width: 640px) {
                  .teacher-area-card {
                    padding: 12px 14px !important;
                    gap: 8px !important;
                  }
                  .teacher-area-left {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 2px !important;
                  }
                  .teacher-area-tag {
                    top: 0 !important;
                  }
                  .teacher-area-sub {
                    font-size: 0.82rem !important;
                  }
                }
              `}</style>
              <div className="teacher-area-left">
                <span className="teacher-area-tag">
                  TEACHER AREA
                </span>
                <span className="teacher-area-sub">
                  Pedagogical Self-Assessment
                </span>
              </div>

              <div style={{ flexShrink: 0 }}>
                <Link
                  to="/teacher/lessandro-bull"
                  style={{
                    backgroundColor: '#27427f',
                    color: '#eaeffa',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ALL SESSIONS
                </Link>
              </div>
            </div>

            {/* PAINEL DE DISPARO DIRECIONADO (ALUNO + DATA) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              padding: '14px 12px',
              marginBottom: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderBottom: '4px solid #27427f'
            }}>
              <style>{`
                .process-form {
                  display: flex;
                  gap: 10px;
                  flex-wrap: wrap;
                  align-items: center;
                }
                .process-student-input {
                  flex: 1 1 200px;
                  padding: 8px 12px;
                  border-radius: 8px;
                  border: 1px solid #cbd5e1;
                  font-size: 0.88rem;
                  font-weight: 600;
                  color: #1e293b;
                  background-color: #eaeffa;
                  outline: none;
                }
                .process-date-input {
                  flex: 1 1 160px;
                  padding: 8px 12px;
                  border-radius: 8px;
                  border: 1px solid #cbd5e1;
                  font-size: 0.88rem;
                  font-weight: 600;
                  color: #1e293b;
                  background-color: #eaeffa;
                  outline: none;
                }
                .process-submit-btn {
                  min-width: 216px;
                }
                .process-btn-desktop {
                  display: inline;
                }
                .process-btn-mobile {
                  display: none;
                }
                .bouncing-dots {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  vertical-align: middle;
                }
                .bouncing-dots span {
                  width: 5px;
                  height: 5px;
                  background-color: #ffffff;
                  border-radius: 50%;
                  display: inline-block;
                  animation: bouncePulse 1.2s infinite ease-in-out both;
                }
                .bouncing-dots span:nth-child(1) {
                  animation-delay: -0.32s;
                }
                .bouncing-dots span:nth-child(2) {
                  animation-delay: -0.16s;
                }
                .bouncing-dots span:nth-child(3) {
                  animation-delay: 0s;
                }
                @keyframes bouncePulse {
                  0%, 80%, 100% {
                    transform: scale(0.6);
                    opacity: 0.4;
                  }
                  40% {
                    transform: scale(1.2);
                    opacity: 1;
                  }
                }
                @media (max-width: 640px) {
                  .process-form {
                    flex-wrap: nowrap !important;
                    gap: 6px !important;
                  }
                  .process-student-input {
                    flex: 1 1 0% !important;
                    min-width: 0 !important;
                    padding: 8px 6px !important;
                    font-size: 0.78rem !important;
                  }
                  .process-date-input {
                    flex: 0 0 94px !important;
                    width: 94px !important;
                    padding: 8px 4px !important;
                    font-size: 0.74rem !important;
                  }
                  .process-submit-btn {
                    min-width: 76px !important;
                    padding: 8px 10px !important;
                    font-size: 0.75rem !important;
                  }
                  .process-btn-desktop {
                    display: none !important;
                  }
                  .process-btn-mobile {
                    display: inline !important;
                  }
                }
              `}</style>
              <form onSubmit={handleProcessSingleClass} className="process-form">
                <input
                  list="registered-students-list"
                  type="text"
                  placeholder="Select or type student..."
                  value={selectedStudentName}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setSelectedStudentName(e.target.value)}
                  className="process-student-input"
                />
                <datalist id="registered-students-list">
                  {regularStudents.map(s => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="process-date-input"
                />

                <button
                  type="submit"
                  disabled={triggering || !selectedStudentName || !selectedDate}
                  className="process-submit-btn"
                  style={{
                    backgroundColor: '#27427f',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: (triggering || !selectedStudentName || !selectedDate) ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {triggering ? (
                    <span className="bouncing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  ) : (
                    <>
                      <span className="process-btn-desktop">Process This Class Only</span>
                      <span className="process-btn-mobile">Process</span>
                    </>
                  )}
                </button>
              </form>

              {triggerMsg && (
                <div style={{ marginTop: 10, fontSize: '0.82rem', fontWeight: 700, color: triggerMsg.color }}>
                  {triggerMsg.text}
                </div>
              )}
            </div>

            {/* Student Selector */}
            <div style={{
              backgroundColor: '#27427f',
              borderRadius: 10,
              padding: '8px 14px',
              textAlign: 'center',
              marginBottom: 14,
              color: '#eaeffa',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              STUDENTS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {regularStudents.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: 10, padding: 20, textAlign: 'center', color: '#64748b' }}>
                  No active students found in the database.
                </div>
              ) : (
                regularStudents.map((student) => (
                  <Link
                    key={student.id}
                    to={`/teacher/${student.id}`}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '16px 20px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      color: '#27427f',
                      fontWeight: 700,
                      fontSize: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderBottom: '4px solid #27427f'
                    }}
                  >
                    <span>{student.name}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>View Classes</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* SPECIFIC STUDENT / TEACHER SESSIONS */}
        {studentId && (
          <div>
            <div
              className="student-nav-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 10,
                padding: '12px 18px',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderBottom: '4px solid #27427f'
              }}
            >
              <style>{`
                .student-nav-card {
                  flex-wrap: wrap;
                  gap: 10px;
                }
                .student-nav-back {
                  color: #27427f;
                  text-decoration: none;
                  font-weight: 700;
                  font-size: 0.88rem;
                  white-space: nowrap;
                }
                .student-nav-actions {
                  display: flex;
                  gap: 8px;
                  flex-shrink: 0;
                }
                .student-nav-btn-dossier {
                  background-color: #27427f;
                  color: #eaeffa;
                  padding: 8px 16px;
                  border-radius: 8px;
                  font-size: 0.85rem;
                  font-weight: 700;
                  text-decoration: none;
                  text-transform: uppercase;
                  white-space: nowrap;
                }
                .student-nav-btn-hub {
                  background-color: #71c499;
                  color: #27427f;
                  padding: 8px 16px;
                  border-radius: 8px;
                  font-size: 0.85rem;
                  font-weight: 800;
                  text-decoration: none;
                  text-transform: uppercase;
                  white-space: nowrap;
                }
                @media (max-width: 640px) {
                  .student-nav-card {
                    padding: 10px 8px !important;
                    flex-wrap: nowrap !important;
                    gap: 6px !important;
                  }
                  .student-nav-back {
                    font-size: 0.72rem !important;
                  }
                  .student-nav-actions {
                    gap: 4px !important;
                  }
                  .student-nav-btn-dossier {
                    padding: 6px 8px !important;
                    font-size: 0.70rem !important;
                  }
                  .student-nav-btn-hub {
                    padding: 6px 8px !important;
                    font-size: 0.70rem !important;
                  }
                }
              `}</style>
              <Link
                to="/teacher"
                className="student-nav-back"
              >
                &larr; Back to Overview
              </Link>

              <div className="student-nav-actions">
                <Link
                  to={`/teacher/dossier/${studentId}`}
                  className="student-nav-btn-dossier"
                >
                  {isTeacherView ? 'T-DOSSIER' : 'S-DOSSIER'}
                </Link>
                {!isTeacherView && (
                  <Link
                    to={`/${studentId}`}
                    className="student-nav-btn-hub"
                  >
                    STUDENT HUB
                  </Link>
                )}
              </div>
            </div>

            <div style={{
              backgroundColor: '#27427f',
              borderRadius: 10,
              padding: '8px 14px',
              textAlign: 'center',
              marginBottom: 12,
              color: '#eaeffa',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              {isTeacherView ? 'ALL SESSIONS' : 'CLASS HISTORY & BRIEFINGS'}
            </div>

            {sessions.length === 0 ? (
              <div style={{
                background: '#ffffff',
                borderRadius: 10,
                padding: 24,
                textAlign: 'center',
                color: '#64748b',
                fontWeight: 600,
                borderBottom: '4px solid #27427f'
              }}>
                No sessions registered yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <style>{`
                  .session-card {
                    padding: 16px 20px;
                  }
                  .session-title-desktop {
                    display: inline;
                  }
                  .session-title-mobile {
                    display: none;
                  }
                  @media (max-width: 640px) {
                    .session-card {
                      padding: 12px 14px 12px 8px !important;
                    }
                    .session-title-desktop {
                      display: none !important;
                    }
                    .session-title-mobile {
                      display: inline !important;
                    }
                  }
                `}</style>
                {sessions.map((sess) => {
                  let desktopStudentLabel = '';
                  let mobileStudentLabel = '';

                  if (isTeacherView) {
                    let rawStudentName = (sess as any).students?.name || '';
                    // Extração do parênteses removida para evitar o bug do "Vantage"
                    if (rawStudentName) {
                      desktopStudentLabel = ` • ${rawStudentName}`;
                      const allNames = students.map(s => s.name);
                      const shortName = getStudentDisplayName(rawStudentName, allNames);
                      if (shortName) {
                        mobileStudentLabel = ` ${shortName}`;
                      }
                    }
                  }

                  const desktopTimeDisplay = sess.class_time ? ` at ${sess.class_time}` : '';
                  const mobileTimeDisplay = sess.class_time ? ` ${sess.class_time}` : '';
                  const formattedDate = formatSessionDate(sess.class_date);
                  const isVerified = Boolean(sess.is_verified);

                  return (
                    <div
                      key={sess.id}
                      className="session-card"
                      style={{
                        background: '#ffffff',
                        borderRadius: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        borderBottom: '4px solid #27427f',
                        gap: 8
                      }}
                    >
                      {/* Lado Esquerdo: ok / x e Título Responsivo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <button
                            type="button"
                            disabled={isVerified}
                            onClick={() => handleVerifySession(sess.id)}
                            title={isVerified ? "Audited and locked" : "Mark as audited and lock"}
                            style={{
                              backgroundColor: '#ffffff',
                              color: isVerified ? '#71c499' : '#acc1d8',
                              border: 'none',
                              padding: '2px 4px',
                              borderRadius: 4,
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: isVerified ? 'default' : 'pointer',
                              opacity: isVerified ? 1 : 0.85,
                              textTransform: 'lowercase',
                              outline: 'none'
                            }}
                          >
                            ok
                          </button>

                          {!isVerified && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSession(sess.id)}
                              title="Delete class session completely"
                              style={{
                                backgroundColor: '#ffffff',
                                color: '#acc1d8',
                                border: 'none',
                                padding: '2px 4px',
                                borderRadius: 4,
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                opacity: 0.85,
                                textTransform: 'lowercase',
                                outline: 'none'
                              }}
                            >
                              x
                            </button>
                          )}
                        </div>

                        {/* Versão Desktop (PC) */}
                        <strong className="session-title-desktop" style={{ fontSize: '1rem', color: '#1e293b' }}>
                          Session: {sess.class_date}{desktopTimeDisplay}{desktopStudentLabel}
                        </strong>

                        {/* Versão Mobile (Celular) */}
                        <span className="session-title-mobile" style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {formattedDate}{mobileTimeDisplay}{mobileStudentLabel}
                        </span>
                      </div>

                      {/* Lado Direito: Ações */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <Link
                          to={`/teacher/briefing/${sess.id}`}
                          style={{
                            backgroundColor: '#27427f',
                            color: '#eaeffa',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          BRIEFING
                        </Link>
                        <Link
                          to={`/teacher/quiz/${sess.id}`}
                          style={{
                            backgroundColor: '#71c499',
                            color: '#27427f',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          QUIZ
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

### 📄 ARQUIVO: ./tsconfig.app.json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}


### 📄 ARQUIVO: ./tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}


### 📄 ARQUIVO: ./tsconfig.node.json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}


### 📄 ARQUIVO: ./vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}


### 📄 ARQUIVO: ./vite.config.ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
