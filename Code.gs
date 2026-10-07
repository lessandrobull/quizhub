/**
 * SISTEMA AUTÔNOMO QUIZHUB — MOTOR DEFINITIVO (ETAPA 3)
 * Title Case -> Horário Truncado para Baixo -> Fusão de Aulas Reiniciadas (Opção 1) -> 2 Exemplos Obrigatórios
 */

const CONFIG = {
  GEMINI_API_KEY: "SUA_GEMINI_API_KEY",
  GEMINI_MODEL: "gemini-2.5-flash",
  
  SUPABASE_URL: "https://xttzilpuuqjbztjkeadd.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "SUA_SUPABASE_SERVICE_ROLE_KEY",
  
  MEET_FOLDER_NAME: "Google Meet",
  PROCESSED_FOLDER_NAME: "Google Meet - Processadas",
  TEACHER_ID: "lessandro-bull",
  TEACHER_NAME: "Lessandro Büll"
};

/**
 * ENDPOINT DE EMERGÊNCIA: Disparado pelo botão no painel web
 */
function doGet(e) {
  try {
    processarAulasPendentes();
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Processed." }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * PONTO PRINCIPAL DE EXECUÇÃO
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
  const file = pendingFiles[0];

  Logger.log(`\n======================================================`);
  Logger.log(`Processando arquivo: ${file.getName()}`);

  let allSuccess = true;

  try {
    const doc = DocumentApp.openById(file.getId());
    const transcriptText = extractTranscriptTabOnly(doc);

    if (!transcriptText || transcriptText.trim().length === 0) {
      Logger.log("[AVISO] Transcrição vazia. Movendo para pasta de processadas.");
      file.moveTo(processedFolder);
      return;
    }

    let baseDate = "";
    let baseHour = 0;
    let baseMinute = 0;
    const nameMatch = file.getName().match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (nameMatch) {
      const monthIdx = parseInt(nameMatch[2], 10) - 1;
      const dayNum = parseInt(nameMatch[3], 10);
      baseDate = `${months[monthIdx]} ${dayNum}`;
      baseHour = parseInt(nameMatch[4], 10);
      baseMinute = parseInt(nameMatch[5], 10);
    } else {
      const fileDate = file.getDateCreated();
      baseDate = `${months[fileDate.getMonth()]} ${fileDate.getDate()}`;
      baseHour = fileDate.getHours();
      baseMinute = fileDate.getMinutes();
    }

    const detectedStudents = resolveParticipants(transcriptText);

    if (detectedStudents.length === 0) {
      Logger.log("[AVISO] Nenhum aluno reconhecido na aba Transcript.");
      return;
    }

    Logger.log(`Alunos identificados: ${detectedStudents.map(s => s.name).join(", ")}`);

    for (let i = 0; i < detectedStudents.length; i++) {
      const student = detectedStudents[i];

      const roundedClassTime = calculateTruncatedClassTime(transcriptText, student.name, baseHour, baseMinute);
      const currentSegment = extractStudentSegment(transcriptText, student.name, detectedStudents);
      const studentDossier = getDossierFromSupabase(student.id);
      const existingSession = getExistingSession(student.id, baseDate, roundedClassTime);

      let analysis = null;

      if (existingSession) {
        Logger.log(`\n[FUSÃO DE AULA] Queda/Reconexão detectada para ${student.name} em ${baseDate} às ${roundedClassTime}.`);
        Logger.log(`Reanalisando a aula completa de forma consolidada...`);

        const priorQuiz = getExistingQuiz(existingSession.id);
        const priorBriefing = getExistingBriefing(existingSession.id);

        analysis = runDualPedagogicalAnalysis(
          currentSegment,
          studentDossier,
          student.name,
          baseDate,
          { priorQuiz: priorQuiz, priorBriefing: priorBriefing }
        );

        if (!analysis) {
          Logger.log(`[ERRO] Falha na reanálise consolidada de ${student.name}.`);
          allSuccess = false;
          continue;
        }

        updateStudentSession(existingSession.id, student.id, analysis.studentEvaluation);
        updateTeacherSelfSession(baseDate, roundedClassTime, student.name, analysis.teacherEvaluation);

      } else {
        Logger.log(`\n--- Processando sessão de: ${student.name} (${baseDate} às ${roundedClassTime}) ---`);

        analysis = runDualPedagogicalAnalysis(currentSegment, studentDossier, student.name, baseDate, null);

        if (!analysis) {
          Logger.log(`[ERRO] Falha na análise pedagógica de ${student.name}.`);
          allSuccess = false;
          continue;
        }

        saveStudentSession(student.id, baseDate, roundedClassTime, analysis.studentEvaluation);
        saveTeacherSelfSession(baseDate, roundedClassTime, student.name, analysis.teacherEvaluation);
      }
    }

    if (allSuccess) {
      file.moveTo(processedFolder);
      Logger.log(`\n[SUCESSO] ${file.getName()} concluído e movido para '${CONFIG.PROCESSED_FOLDER_NAME}'.`);
    } else {
      Logger.log(`\n[REMANESCENTE] Arquivo ${file.getName()} mantido na fila para concluir os alunos pendentes.`);
    }

  } catch (err) {
    Logger.log(`[FALHA GERAL] Erro em ${file.getName()}: ${err.message}`);
  }
}

function calculateTruncatedClassTime(fullText, studentName, startHour, startMinute) {
  const firstName = studentName.split(" ")[0].toLowerCase();
  const lines = fullText.split("\n");
  let elapsedMinutes = 0;
  let currentElapsed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const timeMatch = line.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      currentElapsed = (h * 60) + m;
    }

    if (line.toLowerCase().includes(firstName + ":")) {
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

  let capture = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    if (lineLower.includes(":")) {
      const spk = lineLower.split(":")[0].trim();
      capture = spk.includes(firstName) || spk.includes(teacherFirstName);
    }
    if (capture) filtered.push(line);
  }

  const res = filtered.join("\n");
  return res.length > 300 ? res : fullText;
}

function runDualPedagogicalAnalysis(transcriptText, studentDossier, studentName, classDate, mergeContext) {
  const dossierSummary = studentDossier
    ? `PERSONAL DATA: ${studentDossier.personal_context}\nROUTINE: ${studentDossier.routine}\nLEARNING PROFILE: ${studentDossier.learning_profile}\nCLASS HISTORY: ${studentDossier.class_history}`
    : "No prior records.";

  let reconnectionInstructions = "";
  if (mergeContext && mergeContext.priorQuiz) {
    reconnectionInstructions = `
CRITICAL INSTRUCTION - RECONNECTED SESSION (SAME CLASS):
This session had a connection drop. We are now processing the continuation of the SAME class.
Prior Part Focus Points: ${JSON.stringify(mergeContext.priorQuiz.focus_areas || [])}
Prior Part Activities: ${JSON.stringify((mergeContext.priorBriefing && mergeContext.priorBriefing.activities_done) || [])}
TASK: Merge both parts into ONE single cohesive, definitive assessment covering the entire session seamlessly. Do not repeat items if they are already mastered.
`;
  }

  const prompt = `
You are an expert pedagogical supervisor evaluating a 1-on-1 English conversation session transcribed from Google Meet.
Teacher: "${CONFIG.TEACHER_NAME}"
Student: "${studentName}"
Class Date: "${classDate}"

PRIOR DOSSIER / CONTEXT:
${dossierSummary}
${reconnectionInstructions}

STRICT TONE RULES:
- Voice: Constructive, sober, direct, and factual.
- PROHIBITED WORDS: "incrível", "maravilhoso", "fantástico", "excelente", "parabéns", "amazing", "wonderful", "great job".
- PROHIBITED CHARACTERS: No exclamation marks (!) anywhere.

PART 1: STUDENT EVALUATION
1. CEFR Level & Language Calibration:
   - Identify real CEFR level of student.
   - If level is A1 or Initial A2 (frequent A1 errors, unable to sustain more than 2 minutes of continuous conversation): level must be set to "A1 (Beginner)" or "A2 (Initial)". levelDescription and explanations must be in Portuguese.
   - If level is Communicative A2 (sustains dialogue for several minutes with mostly complete sentences, slips on A2/A1 and occasional B1): level must be set strictly to "A2 (Communicative)". levelDescription and explanations must be in simple, clear, direct English (A2/B1 register).
   - If level is B1+ onwards: levelDescription and explanations must be in fluent standard English.
2. levelDescription (EXACTLY 4 SENTENCES):
   - Sentence 1: Strictly begins with "Hi, ${studentName}." and makes a slightly formal reference to the session.
   - Sentence 2: Spoken fluency assessment calibrated to the identified level.
   - Sentence 3: Direct structural points to improve. MANDATORY RULE: Whenever mentioning any grammatical or structural term (e.g. prepositions, verb forms, connectors, relative clauses, adverbs), you MUST provide AT LEAST 2 CONCRETE EXAMPLES in parentheses immediately following the term (e.g. "dependent prepositions (such as 'rely on' and 'interested in')" or "sufficiency adverbs (such as 'warm enough' and 'too crowded')").
   - Sentence 4: Practical tips and directives to improve, friendly tone.
   - MANDATORY: DO NOT mention any CEFR code in this text.
3. focusAreas (EXACTLY 5 ITEMS):
   - studentSaid: exact verbatim slip from the student. NO prefixes.
   - betterWay: natural idiomatic phrasing. NO prefixes.
   - explanation: short, complete, friendly grammatical explanation in calibrated language.
   - examples: exactly 3 usage examples.
4. quiz (EXACTLY 10 QUESTIONS):
   - 10 multiple-choice questions (1 to 10).
   - 5 options per question (A to E).
   - correctAnswer: single uppercase letter (A to E).
   - explanation: friendly, concise explanation of the grammar rule and distractor nuances.
5. teacherBriefing (100% IN CONCISE ENGLISH):
   - diagnosticFocus: CEFR code and priority focus points. DO NOT use terms like "core bottleneck".
   - activitiesDone: 2 to 3 bullet points listing practiced topics.
   - nextTasks: homework or agreed commitments.
   - teachingTips: { didactic: "...", behavioral: "..." }
6. dossierSuggestions (STAGING IN ENGLISH):
   - class_history: "- ${classDate}: [Summary of topics and performance slips in English]"
   - personal_data: any new biographical facts mentioned (or null)
   - routine: any new routine/work facts mentioned (or null)
   - learning_profile: any notable retention or behavioral patterns observed (or null)

PART 2: TEACHER SELF-ASSESSMENT (LESSANDRO BÜLL) — 100% IN ENGLISH
1. levelDescription (EXACTLY 4 SENTENCES IN ENGLISH):
   - Sentence 1: Strictly begins with "Hi, Lessandro." and formally references the session conducted.
   - Sentence 2: Evaluation of teacher's fluency and adaptability relative to ${studentName}'s level.
   - Sentence 3: Direct points to calibrate in teacher's speech, friendly tone.
   - Sentence 4: Practical tips on how to better communicate with students at this level.
   - MANDATORY: DO NOT mention any CEFR code in this text.
2. focusAreas (EXACTLY 5 ITEMS IN ENGLISH):
   - studentSaid: exact quote spoken by the teacher during class. NO prefixes.
   - betterWay: phrasing better calibrated to student's level. NO prefixes.
   - explanation: short friendly explanation in English.
   - examples: exactly 3 usage examples in English.
3. quiz (EXACTLY 10 QUESTIONS IN ENGLISH):
   - 10 multiple-choice questions (A to E) testing pedagogical conduct and simplification techniques.
4. teacherBriefing (100% IN ENGLISH):
   - diagnosticFocus: student's target level and evaluation of teacher calibration.
   - activitiesDone: same activities as student session.
   - nextTasks: same agreed commitments.
   - teachingTips: { didactic: "...", behavioral: "..." }
5. dossierSuggestions (STAGING FOR TEACHER IN ENGLISH):
   - class_history: "- ${classDate} (Session with ${studentName}): [Concise summary of teacher's pedagogical conduct]"
   - personal_data: null
   - routine: null
   - learning_profile: null

OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this schema without markdown or backticks:
{
  "studentEvaluation": {
    "level": "A2 (Communicative)",
    "levelDescription": "...",
    "focusAreas": [
      { "studentSaid": "...", "betterWay": "...", "explanation": "...", "examples": ["...", "...", "..."] }
    ],
    "quiz": [
      { "number": 1, "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "correctAnswer": "A", "explanation": "..." }
    ],
    "teacherBriefing": {
      "diagnosticFocus": "...",
      "activitiesDone": ["...", "..."],
      "nextTasks": "...",
      "teachingTips": { "didactic": "...", "behavioral": "..." }
    },
    "dossierSuggestions": {
      "class_history": "...",
      "personal_data": null,
      "routine": null,
      "learning_profile": null
    }
  },
  "teacherEvaluation": {
    "levelDescription": "...",
    "focusAreas": [
      { "studentSaid": "...", "betterWay": "...", "explanation": "...", "examples": ["...", "...", "..."] }
    ],
    "quiz": [
      { "number": 1, "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "correctAnswer": "A", "explanation": "..." }
    ],
    "teacherBriefing": {
      "diagnosticFocus": "...",
      "activitiesDone": ["...", "..."],
      "nextTasks": "...",
      "teachingTips": { "didactic": "...", "behavioral": "..." }
    },
    "dossierSuggestions": {
      "class_history": "...",
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(CONFIG.GEMINI_API_KEY)}`;

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
        return JSON.parse(rawText);
      } else {
        Logger.log(`[GEMINI] HTTP ${code}: ${response.getContentText()}`);
      }
    } catch (e) {
      Logger.log(`[GEMINI ERRO] Tentativa ${attempt}: ${e.message}`);
    }
    Utilities.sleep(3000);
  }

  return null;
}

function saveStudentSession(studentId, classDate, classTime, evalData) {
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
    questions: evalData.quiz
  });

  supabaseRequest("teacher_briefings", "post", {
    session_id: sessionId,
    diagnostic_focus: evalData.teacherBriefing.diagnosticFocus,
    activities_done: evalData.teacherBriefing.activitiesDone,
    next_tasks: evalData.teacherBriefing.nextTasks,
    teaching_tip_didactic: evalData.teacherBriefing.teachingTips.didactic,
    teaching_tip_behavioral: evalData.teacherBriefing.teachingTips.behavioral
  });

  updateDossierPendingSuggestions(studentId, evalData.dossierSuggestions);
  Logger.log(`[SUPABASE] Sessão do aluno salva: ${sessionId}.`);
}

function saveTeacherSelfSession(classDate, classTime, studentName, evalData) {
  const sessionRes = supabaseRequest("class_sessions", "post", {
    student_id: CONFIG.TEACHER_ID,
    class_date: classDate,
    class_time: classTime
  }, true);
  if (!sessionRes || sessionRes.length === 0) return;
  const sessionId = sessionRes[0].id;

  supabaseRequest("student_quizzes", "post", {
    session_id: sessionId,
    level: `Pedagogical Calibration (${studentName})`,
    level_description: evalData.levelDescription,
    focus_areas: evalData.focusAreas,
    questions: evalData.quiz
  });

  supabaseRequest("teacher_briefings", "post", {
    session_id: sessionId,
    diagnostic_focus: evalData.teacherBriefing.diagnosticFocus,
    activities_done: evalData.teacherBriefing.activitiesDone,
    next_tasks: evalData.teacherBriefing.nextTasks,
    teaching_tip_didactic: evalData.teacherBriefing.teachingTips.didactic,
    teaching_tip_behavioral: evalData.teacherBriefing.teachingTips.behavioral
  });

  updateDossierPendingSuggestions(CONFIG.TEACHER_ID, evalData.dossierSuggestions);
  Logger.log(`[SUPABASE] Autoavaliação docente salva: ${sessionId}.`);
}

function updateStudentSession(sessionId, studentId, evalData) {
  supabaseRequest(`student_quizzes?session_id=eq.${encodeURIComponent(sessionId)}`, "patch", {
    level: evalData.level,
    level_description: evalData.levelDescription,
    focus_areas: evalData.focusAreas,
    questions: evalData.quiz
  });

  supabaseRequest(`teacher_briefings?session_id=eq.${encodeURIComponent(sessionId)}`, "patch", {
    diagnostic_focus: evalData.teacherBriefing.diagnosticFocus,
    activities_done: evalData.teacherBriefing.activitiesDone,
    next_tasks: evalData.teacherBriefing.nextTasks,
    teaching_tip_didactic: evalData.teacherBriefing.teachingTips.didactic,
    teaching_tip_behavioral: evalData.teacherBriefing.teachingTips.behavioral
  });

  updateDossierPendingSuggestions(studentId, evalData.dossierSuggestions);
  Logger.log(`[SUPABASE] Sessão do aluno ${sessionId} atualizada com análise consolidada.`);
}

function updateTeacherSelfSession(classDate, classTime, studentName, evalData) {
  const teacherSessions = supabaseRequest(
    `class_sessions?student_id=eq.${encodeURIComponent(CONFIG.TEACHER_ID)}&class_date=eq.${encodeURIComponent(classDate)}&class_time=eq.${encodeURIComponent(classTime)}&select=id`,
    "get"
  );

  if (teacherSessions && teacherSessions.length > 0) {
    const tSessionId = teacherSessions[0].id;

    supabaseRequest(`student_quizzes?session_id=eq.${encodeURIComponent(tSessionId)}`, "patch", {
      level: `Pedagogical Calibration (${studentName})`,
      level_description: evalData.levelDescription,
      focus_areas: evalData.focusAreas,
      questions: evalData.quiz
    });

    supabaseRequest(`teacher_briefings?session_id=eq.${encodeURIComponent(tSessionId)}`, "patch", {
      diagnostic_focus: evalData.teacherBriefing.diagnosticFocus,
      activities_done: evalData.teacherBriefing.activitiesDone,
      next_tasks: evalData.teacherBriefing.nextTasks,
      teaching_tip_didactic: evalData.teacherBriefing.teachingTips.didactic,
      teaching_tip_behavioral: evalData.teacherBriefing.teachingTips.behavioral
    });

    updateDossierPendingSuggestions(CONFIG.TEACHER_ID, evalData.dossierSuggestions);
    Logger.log(`[SUPABASE] Autoavaliação docente ${tSessionId} atualizada com análise consolidada.`);
  }
}

function updateDossierPendingSuggestions(targetStudentId, suggestions) {
  const existing = getDossierFromSupabase(targetStudentId);
  const currentPending = (existing && existing.pending_suggestions) ? existing.pending_suggestions : {};

  const merged = { ...currentPending };
  if (suggestions.class_history) merged.class_history = suggestions.class_history;
  if (suggestions.personal_data) merged.personal_data = suggestions.personal_data;
  if (suggestions.routine) merged.routine = suggestions.routine;
  if (suggestions.learning_profile) merged.learning_profile = suggestions.learning_profile;

  supabaseRequest(`dossiers?student_id=eq.${encodeURIComponent(targetStudentId)}`, "patch", {
    pending_suggestions: merged,
    updated_at: new Date().toISOString()
  });
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
