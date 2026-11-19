export type LanguageCode = "en" | "fr" | "ru";

export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  location: string;
  highlights: string[];
}

export interface EducationItem {
  period: string;
  institution: string;
  degree: string;
  location: string;
}

export interface LocalizedContent {
  code: LanguageCode;
  label: string;
  nav: {
    assistant: string;
    profile: string;
    experience: string;
    curriculum: string;
    cta: string;
    ctaActive: string;
  };
  hero: {
    kicker: string;
    headline: string;
    lead: string;
    startVoice: string;
    endVoice: string;
    connecting: string;
    languageLabel: string;
    suggestedHeading: string;
    suggestions: string[];
  };
  console: {
    ready: string;
    connecting: string;
    listening: string;
    speaking: string;
    muted: string;
    mute: string;
    unmute: string;
    end: string;
    placeholder: string;
    send: string;
    emptyTranscript: string;
    visitorLabel: string;
    assistantLabel: string;
    voiceNote: string;
  };
  highlights: {
    value: string;
    label: string;
  }[];
  profile: {
    heading: string;
    summary: string;
    spokenByDilashLabel: string;
    spokenByDilash: string;
    interestsLabel: string;
    interests: string;
  };
  experienceSection: {
    heading: string;
    items: ExperienceItem[];
  };
  educationSection: {
    heading: string;
    items: EducationItem[];
    skillsHeading: string;
    skills: string[];
  };
  curriculumSection: {
    heading: string;
    lead: string;
    downloadLabel: string;
    previewLabel: string;
    hidePreviewLabel: string;
    contactHeading: string;
    location: string;
    rhythm: string;
  };
  footer: {
    rights: string;
    backToTop: string;
  };
}

export const CV_PDF_PATH = "/assets/aistudio/Dilash_Muhammed_CV_53645635.pdf";

export const CONTACT_INFO = {
  name: "Dilash Muhammed",
  phone: "+33 7 44 95 65 44",
  phoneHref: "tel:+33744956544",
  email: "dilashmuhammed@gmail.com",
  emailHref: "mailto:dilashmuhammed@gmail.com",
  city: "Paris, France",
};

export const LOCALIZED_CONTENT: Record<LanguageCode, LocalizedContent> = {
  en: {
    code: "en",
    label: "English",
    nav: {
      assistant: "Assistant",
      profile: "Profile",
      experience: "Experience",
      curriculum: "Curriculum",
      cta: "Speak with Bordeaux",
      ctaActive: "End Session",
    },
    hero: {
      kicker: "Dilash Muhammed · Paris · Voice Concierge",
      headline: "Meet Bordeaux, Dilash’s voice assistant.",
      lead: "Converse naturally in English, French, or Russian. Bordeaux presents Dilash Muhammed’s background in e-commerce analytics, digital performance, and Paris 2024 Olympic coordination.",
      startVoice: "Start Conversation",
      endVoice: "End Conversation",
      connecting: "Connecting…",
      languageLabel: "Conversation language",
      suggestedHeading: "Suggested inquiries",
      suggestions: [
        "Summarize Dilash’s e-commerce and KPI analytics experience",
        "Tell me about his operational role during the Paris 2024 Olympic Games",
        "What is his apprenticeship rhythm and availability in Paris?",
      ],
    },
    console: {
      ready: "Ready to speak",
      connecting: "Connecting to Bordeaux",
      listening: "Listening",
      speaking: "Bordeaux is speaking",
      muted: "Microphone muted",
      mute: "Mute",
      unmute: "Unmute",
      end: "End",
      placeholder: "Or write a question for Bordeaux to answer aloud…",
      send: "Ask",
      emptyTranscript:
        "Select Start Conversation to speak directly with Bordeaux in English, French, or Russian, or choose an inquiry to begin.",
      visitorLabel: "You",
      assistantLabel: "Bordeaux",
      voiceNote: "Male professional voice · English · Français · Русский",
    },
    highlights: [
      { value: "3 Weeks / 1 Week", label: "Company / School Apprenticeship Rhythm" },
      { value: "Sup de Pub Paris", label: "Master in Communication Strategy (2026–2028)" },
      { value: "JO Paris 2024", label: "International Olympic Committee Coordination" },
      { value: "EN · FR · RU", label: "Bordeaux Real-Time Spoken Languages" },
    ],
    profile: {
      heading: "01. Profile",
      summary:
        "Combining e-commerce performance analysis with digital asset creation and SEO/AI optimization to accelerate web conversion. A Master’s student at Sup de Pub Paris holding a Bachelor of Commerce, Dilash pairs budgetary and analytical rigor with hands-on content production, bilingual English fluency, and multi-project coordination.",
      spokenByDilashLabel: "Languages spoken by Dilash",
      spokenByDilash: "French · English (C1) · Malayalam · Spanish",
      interestsLabel: "Interests",
      interests: "Video editing · Football",
    },
    experienceSection: {
      heading: "02. Experience",
      items: [
        {
          period: "2025 – 2026",
          role: "Data, Competitive Intelligence & Digital Officer",
          organization: "Markit Internationale",
          location: "India",
          highlights: [
            "Daily analysis of e-commerce performance indicators (traffic, conversion, KPIs) and dashboard maintenance in advanced Excel and Looker Studio.",
            "Active competitive intelligence covering market positioning, promotional offers, and price parity monitoring to guide marketing decisions.",
            "Acquisition budget tracking and analytical syntheses supporting commercial decision-making.",
          ],
        },
        {
          period: "2024",
          role: "Operational Coordination, Paris 2024 Olympic Games",
          organization: "International Olympic Committee",
          location: "Paris",
          highlights: [
            "Operational coordination in a high-pressure environment, ensuring seamless liaison across field teams, service providers, and client support.",
            "Priority management under strict deadlines and swift resolution of operational incidents.",
            "Daily practice of fluent English (C1) within an international operational context.",
          ],
        },
      ],
    },
    educationSection: {
      heading: "03. Education & Competencies",
      items: [
        {
          period: "2026 – 2028",
          institution: "Sup de Pub Paris",
          degree: "Master in Communication Strategy",
          location: "Paris, France",
        },
        {
          period: "2019 – 2022",
          institution: "Mahatma Gandhi University",
          degree: "Bachelor of Commerce (B.Com)",
          location: "Kottayam, India",
        },
      ],
      skillsHeading: "Core Competencies",
      skills: [
        "Excel & KPIs",
        "Looker Studio",
        "SEA / SMA / Display",
        "SEO & GEO",
        "A/B Testing & CRO",
        "CMS Webmastering",
        "Price Intelligence",
        "AI & Content Tools",
        "Canva & Adobe Suite",
        "Budget Tracking",
      ],
    },
    curriculumSection: {
      heading: "04. Curriculum Vitae & Contact",
      lead: "Review Dilash Muhammed’s complete curriculum vitae directly below or download the original PDF document.",
      downloadLabel: "Download CV (PDF)",
      previewLabel: "Preview Document",
      hidePreviewLabel: "Hide Preview",
      contactHeading: "Direct Contact",
      location: "Paris, France",
      rhythm: "Apprenticeship · 3 weeks company / 1 week school",
    },
    footer: {
      rights: "Bordeaux · Voice Assistant for Dilash Muhammed",
      backToTop: "Back to top",
    },
  },
  fr: {
    code: "fr",
    label: "Français",
    nav: {
      assistant: "Assistant",
      profile: "Profil",
      experience: "Expérience",
      curriculum: "CV",
      cta: "Parler à Bordeaux",
      ctaActive: "Terminer",
    },
    hero: {
      kicker: "Dilash Muhammed · Paris · Assistant Vocal",
      headline: "Parlez avec Bordeaux, l’assistant de Dilash.",
      lead: "Échangez naturellement en français, anglais ou russe. Bordeaux présente le parcours de Dilash Muhammed en analyse e-commerce, webmarketing et coordination opérationnelle aux JO de Paris 2024.",
      startVoice: "Démarrer la conversation",
      endVoice: "Terminer la session",
      connecting: "Connexion…",
      languageLabel: "Langue de conversation",
      suggestedHeading: "Questions suggérées",
      suggestions: [
        "Résumez l’expérience de Dilash en analyse de données et KPIs e-commerce",
        "Parlez-moi de son rôle lors des Jeux Olympiques de Paris 2024",
        "Quel est son rythme d’alternance et sa formation à Sup de Pub ?",
      ],
    },
    console: {
      ready: "Prêt à converser",
      connecting: "Connexion à Bordeaux",
      listening: "À l’écoute",
      speaking: "Bordeaux parle",
      muted: "Micro coupé",
      mute: "Couper",
      unmute: "Réactiver",
      end: "Quitter",
      placeholder: "Ou écrivez une question pour une réponse vocale…",
      send: "Envoyer",
      emptyTranscript:
        "Cliquez sur Démarrer la conversation pour parler directement avec Bordeaux en français, anglais ou russe, ou sélectionnez une question.",
      visitorLabel: "Vous",
      assistantLabel: "Bordeaux",
      voiceNote: "Voix masculine professionnelle · Français · English · Русский",
    },
    highlights: [
      { value: "3 Sem. / 1 Sem.", label: "Rythme Alternance Entreprise / École" },
      { value: "Sup de Pub Paris", label: "Master Stratégie de Communication (2026–2028)" },
      { value: "JO Paris 2024", label: "Coordination Opérationnelle · CIO" },
      { value: "FR · EN · RU", label: "Langues parlées par Bordeaux" },
    ],
    profile: {
      heading: "01. Profil",
      summary:
        "Allier l’analyse de performance e-commerce à la création d’assets digitaux et l’optimisation SEO/IA pour accélérer la conversion web. Étudiant en Mastère à Sup de Pub Paris et titulaire d’une Licence en Commerce, Dilash associe rigueur budgétaire et analytique à une maîtrise opérationnelle de la production de contenus.",
      spokenByDilashLabel: "Langues pratiquées par Dilash",
      spokenByDilash: "Français · Anglais (C1) · Malayalam · Espagnol",
      interestsLabel: "Centres d’intérêt",
      interests: "Montage vidéo · Football",
    },
    experienceSection: {
      heading: "02. Expérience professionnelle",
      items: [
        {
          period: "2025 – 2026",
          role: "Chargé de Veille, Données & Digitale",
          organization: "Markit Internationale",
          location: "Inde",
          highlights: [
            "Analyse quotidienne des indicateurs de performance (trafic, conversion, KPIs) et mise à jour de tableaux de bord sous Excel avancé et Looker Studio.",
            "Veille concurrentielle active (positionnement, offres promotionnelles, suivi de parité tarifaire) pour orienter les décisions marketing.",
            "Suivi des budgets d’acquisition et rédaction de synthèses analytiques d’aide à la décision commerciale.",
          ],
        },
        {
          period: "2024",
          role: "Coordination Opérationnelle, JO Paris 2024",
          organization: "Comité international olympique",
          location: "Paris",
          highlights: [
            "Coordination opérationnelle en environnement exigeant, assurant la liaison fluide entre équipes terrain, prestataires et support client.",
            "Gestion des priorités sous contrainte de délais stricts et résolution rapide des incidents opérationnels.",
            "Pratique quotidienne de l’anglais courant (C1) en contexte international.",
          ],
        },
      ],
    },
    educationSection: {
      heading: "03. Formation & Compétences",
      items: [
        {
          period: "2026 – 2028",
          institution: "Sup de Pub Paris",
          degree: "Master en stratégie de communication",
          location: "Paris, France",
        },
        {
          period: "2019 – 2022",
          institution: "Université Mahatma Gandhi",
          degree: "Licence en Commerce (B.Com)",
          location: "Kottayam, Inde",
        },
      ],
      skillsHeading: "Compétences clés",
      skills: [
        "Excel & KPIs",
        "Looker Studio",
        "SEA / SMA / Display",
        "SEO & GEO",
        "Tests A/B & CRO",
        "Webmastering CMS",
        "Veille tarifaire",
        "Outils IA & Contenu",
        "Canva & Suite Adobe",
        "Suivi budgétaire",
      ],
    },
    curriculumSection: {
      heading: "04. Curriculum Vitae & Contact",
      lead: "Consultez le curriculum vitae complet de Dilash Muhammed ci-dessous ou téléchargez le document PDF original.",
      downloadLabel: "Télécharger le CV (PDF)",
      previewLabel: "Afficher l’aperçu",
      hidePreviewLabel: "Masquer l’aperçu",
      contactHeading: "Contact direct",
      location: "Paris, France",
      rhythm: "Alternance · 3 sem. entreprise / 1 sem. école",
    },
    footer: {
      rights: "Bordeaux · Assistant vocal de Dilash Muhammed",
      backToTop: "Haut de page",
    },
  },
  ru: {
    code: "ru",
    label: "Русский",
    nav: {
      assistant: "Ассистент",
      profile: "Профиль",
      experience: "Опыт",
      curriculum: "Резюме",
      cta: "Поговорить с Бордо",
      ctaActive: "Завершить",
    },
    hero: {
      kicker: "Дилаш Мухаммед · Париж · Голосовой ассистент",
      headline: "Бордо — голосовой ассистент Дилаша.",
      lead: "Общайтесь свободно на русском, английском или французском. Бордо расскажет об опыте Дилаша Мухаммеда в e-commerce аналитике, цифровом маркетинге и координации Олимпийских игр Париж-2024.",
      startVoice: "Начать разговор",
      endVoice: "Завершить сеанс",
      connecting: "Подключение…",
      languageLabel: "Язык общения",
      suggestedHeading: "Примеры вопросов",
      suggestions: [
        "Расскажите об опыте Дилаша в e-commerce аналитике и KPI",
        "Какова была его роль на Олимпийских играх в Париже 2024?",
        "Какой у него график стажировки и программа обучения в Париже?",
      ],
    },
    console: {
      ready: "Готов к разговору",
      connecting: "Подключение к Бордо",
      listening: "Слушаю вас",
      speaking: "Бордо говорит",
      muted: "Микрофон выключен",
      mute: "Выкл. звук",
      unmute: "Вкл. звук",
      end: "Завершить",
      placeholder: "Или введите вопрос, чтобы услышать голосовой ответ…",
      send: "Спросить",
      emptyTranscript:
        "Нажмите «Начать разговор», чтобы общаться с Бордо голосом на русском, английском или французском, или выберите один из вопросов.",
      visitorLabel: "Вы",
      assistantLabel: "Бордо",
      voiceNote: "Профессиональный мужской голос · Русский · English · Français",
    },
    highlights: [
      { value: "3 нед. / 1 нед.", label: "График стажировки: компания / учёба" },
      { value: "Sup de Pub Paris", label: "Магистратура по стратегии коммуникаций (2026–2028)" },
      { value: "Париж 2024", label: "Операционная координация · МОК" },
      { value: "RU · EN · FR", label: "Языки голосового ассистента Бордо" },
    ],
    profile: {
      heading: "01. Профиль",
      summary:
        "Сочетание аналитики эффективности e-commerce с созданием цифрового контента и SEO/AI-оптимизацией для роста веб-конверсии. Студент магистратуры Sup de Pub Paris и бакалавр коммерции, Дилаш объединяет финансовую дисциплину, аналитический подход и свободное владение английским языком.",
      spokenByDilashLabel: "Языки Дилаша",
      spokenByDilash: "Французский · Английский (C1) · Малаялам · Испанский",
      interestsLabel: "Интересы",
      interests: "Видеомонтаж · Футбол",
    },
    experienceSection: {
      heading: "02. Профессиональный опыт",
      items: [
        {
          period: "2025 – 2026",
          role: "Специалист по аналитике данных и цифровому мониторингу",
          organization: "Markit Internationale",
          location: "Индия",
          highlights: [
            "Ежедневный анализ ключевых показателей эффективности (трафик, конверсия, KPI) и обновление дашбордов в продвинутом Excel и Looker Studio.",
            "Активный конкурентный мониторинг (позиционирование, промо-предложения, контроль ценового паритета) для принятия маркетинговых решений.",
            "Контроль бюджетов привлечения и подготовка аналитических отчётов для коммерческой стратегии.",
          ],
        },
        {
          period: "2024",
          role: "Операционная координация, Олимпийские игры Париж 2024",
          organization: "Международный олимпийский комитет",
          location: "Париж",
          highlights: [
            "Операционная координация в динамичной международной среде, взаимодействие между полевыми командами, подрядчиками и клиентской поддержкой.",
            "Управление приоритетами в условиях жёстких сроков и оперативное решение инцидентов.",
            "Ежедневное использование свободного английского языка (C1) в международном контексте.",
          ],
        },
      ],
    },
    educationSection: {
      heading: "03. Образование и компетенции",
      items: [
        {
          period: "2026 – 2028",
          institution: "Sup de Pub Paris",
          degree: "Магистратура по стратегии коммуникаций",
          location: "Париж, Франция",
        },
        {
          period: "2019 – 2022",
          institution: "Университет Махатмы Ганди",
          degree: "Бакалавр коммерции (B.Com)",
          location: "Коттаям, Индия",
        },
      ],
      skillsHeading: "Ключевые навыки",
      skills: [
        "Excel и KPI",
        "Looker Studio",
        "SEA / SMA / Display",
        "SEO и GEO",
        "A/B-тестирование и CRO",
        "CMS-вебмастеринг",
        "Ценовой мониторинг",
        "ИИ-инструменты и контент",
        "Canva и Adobe Suite",
        "Контроль бюджета",
      ],
    },
    curriculumSection: {
      heading: "04. Резюме и контакты",
      lead: "Ознакомьтесь с полным резюме Дилаша Мухаммеда ниже или скачайте оригинальный PDF-документ.",
      downloadLabel: "Скачать резюме (PDF)",
      previewLabel: "Показать документ",
      hidePreviewLabel: "Скрыть документ",
      contactHeading: "Прямые контакты",
      location: "Париж, Франция",
      rhythm: "Альтернанс · 3 недели в компании / 1 неделя учёбы",
    },
    footer: {
      rights: "Бордо · Голосовой ассистент Дилаша Мухаммеда",
      backToTop: "Наверх",
    },
  },
};
