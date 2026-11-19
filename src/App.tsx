import { useState } from "react";
import { ArrowUpRight, Download, FileText, Mic, Square } from "lucide-react";
import {
  CONTACT_INFO,
  CV_PDF_PATH,
  LOCALIZED_CONTENT,
  type LanguageCode,
} from "./data/profile";
import { useLiveVoice } from "./hooks/useLiveVoice";
import { VoiceConsole } from "./components/VoiceConsole";

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ru", label: "Русский" },
];

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [showCvPreview, setShowCvPreview] = useState(false);

  const copy = LOCALIZED_CONTENT[language];
  const voice = useLiveVoice(language);

  const handlePrimaryVoiceToggle = () => {
    if (voice.status === "idle") {
      void voice.startSession();
    } else {
      voice.stopSession();
    }
  };

  const handleHeaderCta = () => {
    const assistantSection = document.getElementById("assistant");
    assistantSection?.scrollIntoView({ behavior: "smooth" });
    if (voice.status === "idle") {
      void voice.startSession();
    } else {
      voice.stopSession();
    }
  };

  return (
    <div id="top" className="min-h-screen bg-white text-zinc-900">
      {/* Top Navigation — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-editorial text-2xl font-medium tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
          >
            Bordeaux
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm text-zinc-600"
          >
            <a
              href="#assistant"
              className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.assistant}
            </a>
            <a
              href="#profile"
              className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.profile}
            </a>
            <a
              href="#experience"
              className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.experience}
            </a>
            <a
              href="#curriculum"
              className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.curriculum}
            </a>
          </nav>

          <button
            type="button"
            onClick={handleHeaderCta}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs sm:text-sm font-medium hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {voice.status === "idle" ? copy.nav.cta : copy.nav.ctaActive}
          </button>
        </div>
      </header>

      <main>
        {/* Hero Split — Editorial Introduction + Live Voice Console */}
        <section
          id="assistant"
          className="max-w-6xl mx-auto px-6 sm:px-10 pt-12 pb-16 lg:pt-20 lg:pb-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            {/* Left Column: Editorial Hierarchy & Language Selector */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-10">
              <div className="space-y-6">
                <p className="text-xs sm:text-sm text-zinc-500 tracking-wide">
                  {copy.hero.kicker}
                </p>

                <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.5rem] font-normal tracking-tight text-zinc-900 leading-[1.06] text-balance">
                  {copy.hero.headline}
                </h1>

                <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
                  {copy.hero.lead}
                </p>

                {/* Language Segmented Selector */}
                <div className="pt-2 space-y-2.5">
                  <span className="block text-xs text-zinc-500">
                    {copy.hero.languageLabel}
                  </span>
                  <div
                    role="group"
                    aria-label={copy.hero.languageLabel}
                    className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 border border-zinc-200/70"
                  >
                    {LANGUAGES.map((item) => {
                      const active = language === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => setLanguage(item.code)}
                          aria-pressed={active}
                          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            active
                              ? "bg-white text-zinc-900 shadow-xs"
                              : "text-zinc-600 hover:text-zinc-900"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Voice Action */}
                <div className="pt-2 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={handlePrimaryVoiceToggle}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {voice.status === "idle" ? (
                      <>
                        <Mic className="w-4 h-4" aria-hidden="true" />
                        <span>{copy.hero.startVoice}</span>
                      </>
                    ) : voice.status === "connecting" ? (
                      <span>{copy.hero.connecting}</span>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        <span>{copy.hero.endVoice}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={CV_PDF_PATH}
                    download="Dilash_Muhammed_CV.pdf"
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{copy.curriculumSection.downloadLabel}</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Suggested Voice Inquiries */}
              <div className="pt-6 border-t border-zinc-200/80 space-y-3">
                <p className="text-xs text-zinc-500">{copy.hero.suggestedHeading}</p>
                <div className="divide-y divide-zinc-200/70">
                  {copy.hero.suggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void voice.sendTextPrompt(prompt)}
                      className="w-full py-2.5 flex items-center justify-between gap-4 text-left text-sm text-zinc-700 hover:text-zinc-950 transition-colors group cursor-pointer"
                    >
                      <span className="leading-snug">{prompt}</span>
                      <ArrowUpRight
                        className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Voice Console */}
            <div className="lg:col-span-6">
              <VoiceConsole
                copy={copy.console}
                startLabel={copy.hero.startVoice}
                status={voice.status}
                isSpeaking={voice.isSpeaking}
                isMuted={voice.isMuted}
                micAvailable={voice.micAvailable}
                error={voice.error}
                durationSeconds={voice.durationSeconds}
                transcript={voice.transcript}
                inputAnalyserRef={voice.inputAnalyserRef}
                outputAnalyserRef={voice.outputAnalyserRef}
                onStart={() => void voice.startSession()}
                onStop={voice.stopSession}
                onToggleMute={voice.toggleMute}
                onSendText={(text) => void voice.sendTextPrompt(text)}
                onClearError={voice.clearError}
              />
            </div>
          </div>
        </section>

        {/* Full-Width Key Highlights Strip */}
        <section className="bg-[#FAFAFB] border-y border-zinc-200/80">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {copy.highlights.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <p className="font-editorial text-2xl sm:text-[1.75rem] font-medium text-zinc-900 tracking-tight tabular-nums">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 01. Profile */}
        <section
          id="profile"
          className="max-w-6xl mx-auto px-6 sm:px-10 py-16 lg:py-24 border-b border-zinc-200/80"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-900 tracking-tight">
                {copy.profile.heading}
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl">
                {copy.profile.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-200/70">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">
                    {copy.profile.spokenByDilashLabel}
                  </p>
                  <p className="text-sm font-medium text-zinc-900">
                    {copy.profile.spokenByDilash}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">{copy.profile.interestsLabel}</p>
                  <p className="text-sm font-medium text-zinc-900">
                    {copy.profile.interests}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02. Experience */}
        <section
          id="experience"
          className="max-w-6xl mx-auto px-6 sm:px-10 py-16 lg:py-24 border-b border-zinc-200/80"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-900 tracking-tight">
                {copy.experienceSection.heading}
              </h2>
            </div>

            <div className="lg:col-span-8 divide-y divide-zinc-200/80">
              {copy.experienceSection.items.map((exp, idx) => (
                <article
                  key={exp.role}
                  className={idx === 0 ? "pb-10" : "pt-10"}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <h3 className="font-editorial text-2xl font-medium text-zinc-900">
                      {exp.role}
                    </h3>
                    <span className="text-sm text-zinc-500 tabular-nums shrink-0">
                      {exp.period}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-500 mt-1">
                    {exp.organization}
                    <span className="mx-2" aria-hidden="true">
                      ·
                    </span>
                    {exp.location}
                  </p>

                  <ul className="mt-5 space-y-2.5 text-sm sm:text-[15px] text-zinc-700 leading-relaxed">
                    {exp.highlights.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="text-zinc-400 select-none shrink-0"
                        >
                          —
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 03. Education & Competencies */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 lg:py-24 border-b border-zinc-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-900 tracking-tight">
                {copy.educationSection.heading}
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-12">
              <div className="divide-y divide-zinc-200/80">
                {copy.educationSection.items.map((edu, idx) => (
                  <div
                    key={edu.institution}
                    className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 ${
                      idx === 0 ? "pb-6" : "pt-6"
                    }`}
                  >
                    <div>
                      <h3 className="font-editorial text-2xl font-medium text-zinc-900">
                        {edu.institution}
                      </h3>
                      <p className="text-sm text-zinc-600 mt-0.5">
                        {edu.degree}
                        <span className="mx-2 text-zinc-400" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-zinc-500">{edu.location}</span>
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500 tabular-nums shrink-0">
                      {edu.period}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-zinc-200/80 space-y-3">
                <p className="text-xs text-zinc-500">
                  {copy.educationSection.skillsHeading}
                </p>
                <p className="text-sm sm:text-[15px] text-zinc-800 leading-loose">
                  {copy.educationSection.skills.map((skill, index) => (
                    <span key={skill}>
                      {skill}
                      {index < copy.educationSection.skills.length - 1 && (
                        <span className="mx-2.5 text-zinc-300" aria-hidden="true">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 04. Curriculum Vitae & Direct Contact */}
        <section
          id="curriculum"
          className="bg-[#FAFAFB] border-b border-zinc-200/80"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-4 space-y-4">
                <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-900 tracking-tight">
                  {copy.curriculumSection.heading}
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {copy.curriculumSection.lead}
                </p>
              </div>

              <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-8 border-b border-zinc-200/80">
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500">
                      {copy.curriculumSection.contactHeading}
                    </p>
                    <p className="font-editorial text-2xl font-medium text-zinc-900">
                      {CONTACT_INFO.name}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {copy.curriculumSection.rhythm}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {copy.curriculumSection.location}
                    </p>
                  </div>

                  <div className="flex flex-col justify-end space-y-2 text-sm">
                    <a
                      href={CONTACT_INFO.emailHref}
                      className="text-zinc-900 hover:underline underline-offset-4"
                    >
                      {CONTACT_INFO.email}
                    </a>
                    <a
                      href={CONTACT_INFO.phoneHref}
                      className="text-zinc-700 hover:text-zinc-900 tabular-nums"
                    >
                      {CONTACT_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={CV_PDF_PATH}
                    download="Dilash_Muhammed_CV.pdf"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>{copy.curriculumSection.downloadLabel}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowCvPreview((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-800 text-sm font-medium hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {showCvPreview
                        ? copy.curriculumSection.hidePreviewLabel
                        : copy.curriculumSection.previewLabel}
                    </span>
                  </button>
                </div>

                {showCvPreview && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white">
                    <iframe
                      src={CV_PDF_PATH}
                      title="Dilash Muhammed Curriculum Vitae"
                      className="w-full h-[680px]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{copy.footer.rights}</p>
          <a
            href="#top"
            className="hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0"
          >
            {copy.footer.backToTop}
          </a>
        </div>
      </footer>
    </div>
  );
}
