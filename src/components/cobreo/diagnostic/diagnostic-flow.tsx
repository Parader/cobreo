"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { DiagnosticShell } from "@/components/cobreo/diagnostic/diagnostic-shell";
import { IntroGate } from "@/components/cobreo/diagnostic/intro-gate";
import { ResumeGate } from "@/components/cobreo/diagnostic/resume-gate";
import {
    CompanyScreen,
    DeclaredAmbitionsScreen,
} from "@/components/cobreo/diagnostic/v7/company-ambition-screens";
import {
    ApplicableAreasScreen,
    AreaScanScreen,
    OptionalNotesScreen,
    ToolsFitScreen,
} from "@/components/cobreo/diagnostic/v7/coverage-screens";
import {
    ChooseTopicsScreen,
    SimplificationScreen,
} from "@/components/cobreo/diagnostic/v7/priority-screens";
import { ResultScreenV7 } from "@/components/cobreo/diagnostic/v7/result-screen";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { easeLuxury } from "@/components/cobreo/motion";
import { getProgressStages } from "@/content/diagnostic/v7/catalog";
import { resolveCapabilities } from "@/lib/diagnostic/v7/coverage";
import { buildPossibilityCandidates } from "@/lib/diagnostic/v7/possibilities";
import {
    buildTopicCandidates,
    resolvePossibilitiesFromTopics,
} from "@/lib/diagnostic/v7/topics";
import type {
    AmbitionsState,
    AreaAnswerValue,
    AreaId,
    AutomationInterest,
    CompanyContext,
    DiagnosticV7AnswersPayload,
    DiagnosticV7Phase,
    DiagnosticV7Result,
    FitCheckState,
    FlowStep,
    FreeTextState,
    TopicId,
} from "@/content/diagnostic/v7/types";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/posthog";
import {
    clearDiagnosticDraft,
    emptyDraft,
    hasDiagnosticProgress,
    loadDiagnosticDraft,
    saveDiagnosticDraft,
    type DiagnosticV7Draft,
} from "@/lib/diagnostic/v7/persistence";
import { buildFlowSteps, progressStageForStep, stepKey } from "@/lib/diagnostic/v7/sequence";
import { generateDiagnosticResult, summarizeResult } from "@/lib/diagnostic/v7/scoring";

function resetScroll() {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    html.scrollTop = 0;
    body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function DiagnosticFlow() {
    const [sessionKey, setSessionKey] = useState(0);

    return (
        <DiagnosticFlowSession
            key={sessionKey}
            onRestartSession={() => {
                clearDiagnosticDraft();
                setSessionKey((key) => key + 1);
            }}
        />
    );
}

function DiagnosticFlowSession({ onRestartSession }: { onRestartSession: () => void }) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const reduceMotion = useReducedMotion();
    const [hydrated, setHydrated] = useState(false);
    const [phase, setPhase] = useState<DiagnosticV7Phase>("intro");
    const [stepIndex, setStepIndex] = useState(0);
    const [companyContext, setCompanyContext] = useState<CompanyContext>({});
    const [ambitions, setAmbitions] = useState<AmbitionsState>({ declared: [] });
    const [applicableAreas, setApplicableAreas] = useState<AreaId[]>([]);
    const [areaAnswers, setAreaAnswers] = useState<Partial<Record<AreaId, AreaAnswerValue>>>({});
    const [automationInterest, setAutomationInterest] = useState<AutomationInterest>({});
    const [selectedTopics, setSelectedTopics] = useState<Array<TopicId | "none_selected">>([]);
    const [selectedPossibilities, setSelectedPossibilities] = useState<Array<string | "none_selected">>([]);
    const [fitChecks, setFitChecks] = useState<Record<string, FitCheckState>>({});
    const [prioritySections, setPrioritySections] = useState<Array<AreaId | "none_priority">>([]);
    const [freeText, setFreeText] = useState<FreeTextState>({});
    const [result, setResult] = useState<DiagnosticV7Result | undefined>();
    const [sessionStartedAt, setSessionStartedAt] = useState(() => Date.now());
    const [wasResumed, setWasResumed] = useState(false);
    const startedTracked = useRef(false);
    const completedTracked = useRef(false);

    useLayoutEffect(() => {
        const draft = loadDiagnosticDraft();
        if (!draft) {
            setSessionStartedAt(Date.now());
            setWasResumed(false);
            setHydrated(true);
            return;
        }
        setCompanyContext(draft.companyContext);
        setAmbitions(draft.ambitions);
        setApplicableAreas(draft.applicableAreas);
        setAreaAnswers(draft.areaAnswers);
        setAutomationInterest(draft.automationInterest);
        setSelectedTopics(draft.selectedTopics ?? []);
        setSelectedPossibilities(draft.selectedPossibilities ?? []);
        setFitChecks(draft.fitChecks ?? {});
        setPrioritySections(draft.prioritySections);
        setFreeText(draft.freeText);
        setStepIndex(draft.stepIndex);
        setResult(draft.result);
        setSessionStartedAt(draft.startedAt ?? draft.updatedAt ?? Date.now());
        setWasResumed(Boolean(draft.wasResumed));

        if (draft.status === "completed" && draft.result) {
            setPhase("result");
        } else if (hasDiagnosticProgress(draft)) {
            setPhase("resume");
        } else {
            clearDiagnosticDraft();
            setPhase("intro");
        }
        setHydrated(true);
    }, []);

    const steps = useMemo(
        () =>
            buildFlowSteps({
                companyContext,
                declared: ambitions.declared,
                applicableAreas,
                areaAnswers,
                automationInterest,
                selectedPossibilities,
            }),
        [companyContext, ambitions.declared, applicableAreas, areaAnswers, automationInterest, selectedPossibilities],
    );

    const possibilityCandidates = useMemo(
        () =>
            buildPossibilityCandidates({
                companyContext,
                declared: ambitions.declared,
                areaAnswers,
                automationInterest,
                locale,
            }),
        [companyContext, ambitions.declared, areaAnswers, automationInterest, locale],
    );

    const topicCandidates = useMemo(
        () =>
            buildTopicCandidates({
                companyContext,
                candidates: possibilityCandidates,
            }),
        [companyContext, possibilityCandidates],
    );

    const currentStep = steps[Math.min(stepIndex, Math.max(0, steps.length - 1))];
    const progressStage = progressStageForStep(
        phase === "result" || phase === "done" ? "result" : (currentStep?.type ?? "company"),
    );

    useEffect(() => {
        if (!hydrated || phase === "resume" || phase === "intro") return;

        const draft: DiagnosticV7Draft = {
            ...emptyDraft(),
            phase: phase === "done" ? "result" : phase,
            stepIndex,
            companyContext,
            ambitions,
            applicableAreas,
            areaAnswers,
            automationInterest,
            selectedTopics,
            selectedPossibilities,
            fitChecks,
            prioritySections,
            freeText,
            result,
            status: phase === "result" || phase === "done" ? "completed" : "in_progress",
            startedAt: sessionStartedAt,
            wasResumed,
        };

        if (draft.status !== "completed" && !hasDiagnosticProgress(draft)) {
            clearDiagnosticDraft();
            return;
        }

        saveDiagnosticDraft(draft);
    }, [
        hydrated,
        phase,
        stepIndex,
        companyContext,
        ambitions,
        applicableAreas,
        areaAnswers,
        automationInterest,
        selectedTopics,
        selectedPossibilities,
        fitChecks,
        prioritySections,
        freeText,
        result,
        sessionStartedAt,
        wasResumed,
    ]);

    useEffect(() => {
        if (!hydrated || phase === "resume") return;
        resetScroll();
    }, [hydrated, phase, stepIndex]);

    useEffect(() => {
        if (
            !hydrated ||
            phase === "resume" ||
            phase === "intro" ||
            phase === "result" ||
            phase === "done"
        ) {
            return;
        }
        if (!currentStep) return;
        trackEvent(AnalyticsEvents.diagnosticStepViewed, {
            locale,
            step_type: currentStep.type,
            step_index: stepIndex,
            question_id:
                "questionId" in currentStep
                    ? String(currentStep.questionId)
                    : "areaId" in currentStep
                      ? String(currentStep.areaId)
                      : undefined,
        });
    }, [hydrated, phase, stepIndex, currentStep, locale]);

    useEffect(() => {
        if (!hydrated || (phase !== "result" && phase !== "done")) return;
        if (completedTracked.current) return;
        completedTracked.current = true;
        const final =
            result ??
            generateDiagnosticResult({
                companyContext,
                ambitions,
                applicableAreas,
                areaAnswers,
                confirmationAnswers: {},
                fitChecks,
                automationInterest,
                prioritySections,
                selectedPossibilities,
                freeText,
                locale,
            });
        trackEvent(AnalyticsEvents.diagnosticCompleted, {
            locale,
            has_opportunity: final.hasCredibleOpportunity,
            opportunity_count: final.opportunities.length,
        });
    }, [
        hydrated,
        phase,
        result,
        companyContext,
        ambitions,
        applicableAreas,
        areaAnswers,
        fitChecks,
        automationInterest,
        prioritySections,
        selectedPossibilities,
        freeText,
        locale,
    ]);

    function scoreState(overrides?: {
        companyContext?: CompanyContext;
        ambitions?: AmbitionsState;
        applicableAreas?: AreaId[];
        areaAnswers?: Partial<Record<AreaId, AreaAnswerValue>>;
        automationInterest?: AutomationInterest;
        selectedPossibilities?: Array<string | "none_selected">;
        fitChecks?: Record<string, FitCheckState>;
        prioritySections?: Array<AreaId | "none_priority">;
        freeText?: FreeTextState;
    }) {
        return generateDiagnosticResult({
            companyContext: overrides?.companyContext ?? companyContext,
            ambitions: overrides?.ambitions ?? ambitions,
            applicableAreas: overrides?.applicableAreas ?? applicableAreas,
            areaAnswers: overrides?.areaAnswers ?? areaAnswers,
            confirmationAnswers: {},
            fitChecks: overrides?.fitChecks ?? fitChecks,
            automationInterest: overrides?.automationInterest ?? automationInterest,
            prioritySections: overrides?.prioritySections ?? prioritySections,
            selectedPossibilities: overrides?.selectedPossibilities ?? selectedPossibilities,
            freeText: overrides?.freeText ?? freeText,
            locale,
        });
    }

    function finishWith(overrides?: Parameters<typeof scoreState>[0]) {
        const generated = scoreState(overrides);
        setResult(generated);
        setPhase("result");
    }

    function advance(overrides?: {
        ambitions?: AmbitionsState;
        applicableAreas?: AreaId[];
        areaAnswers?: Partial<Record<AreaId, AreaAnswerValue>>;
        automationInterest?: AutomationInterest;
        selectedTopics?: Array<TopicId | "none_selected">;
        selectedPossibilities?: Array<string | "none_selected">;
        fitChecks?: Record<string, FitCheckState>;
        prioritySections?: Array<AreaId | "none_priority">;
    }) {
        const nextAmbitions = overrides?.ambitions ?? ambitions;
        const nextAreas = overrides?.applicableAreas ?? applicableAreas;
        const nextAnswers = overrides?.areaAnswers ?? areaAnswers;
        const nextAuto = overrides?.automationInterest ?? automationInterest;
        const nextTopics = overrides?.selectedTopics ?? selectedTopics;
        const nextPossibilities = overrides?.selectedPossibilities ?? selectedPossibilities;
        const nextFitChecks = overrides?.fitChecks ?? fitChecks;

        if (overrides?.selectedTopics) setSelectedTopics(nextTopics);
        if (overrides?.selectedPossibilities) setSelectedPossibilities(nextPossibilities);

        const nextSteps = buildFlowSteps({
            companyContext,
            declared: nextAmbitions.declared,
            applicableAreas: nextAreas,
            areaAnswers: nextAnswers,
            automationInterest: nextAuto,
            selectedPossibilities: nextPossibilities,
        });

        const current = steps[stepIndex] as FlowStep | undefined;
        const currentPos = current
            ? nextSteps.findIndex((s) => stepKey(s) === stepKey(current))
            : stepIndex;
        const nextIndex = (currentPos >= 0 ? currentPos : stepIndex) + 1;

        if (nextIndex >= nextSteps.length) {
            finishWith({
                ambitions: nextAmbitions,
                applicableAreas: nextAreas,
                areaAnswers: nextAnswers,
                automationInterest: nextAuto,
                selectedPossibilities: nextPossibilities,
                fitChecks: nextFitChecks,
                prioritySections: overrides?.prioritySections ?? prioritySections,
            });
            return;
        }
        setStepIndex(nextIndex);
        setPhase(phaseForStep(nextSteps[nextIndex].type));
    }

    function goBack() {
        if (stepIndex <= 0) {
            setPhase("intro");
            resetScroll();
            return;
        }
        const prev = stepIndex - 1;
        setStepIndex(prev);
        setPhase(phaseForStep(steps[prev].type));
        resetScroll();
    }

    function startFromIntro() {
        const now = Date.now();
        setSessionStartedAt(now);
        setWasResumed(false);
        setStepIndex(0);
        setPhase("company");
        if (!startedTracked.current) {
            startedTracked.current = true;
            trackEvent(AnalyticsEvents.diagnosticStarted, {
                locale,
                is_resume: false,
            });
        }
        resetScroll();
    }

    function restart() {
        trackEvent(AnalyticsEvents.diagnosticRestarted, { locale });
        onRestartSession();
    }

    function continueResume() {
        const draft = loadDiagnosticDraft();
        setWasResumed(true);
        trackEvent(AnalyticsEvents.diagnosticStarted, {
            locale,
            is_resume: true,
        });
        startedTracked.current = true;
        if (draft?.status === "completed" && draft.result) {
            setResult(draft.result);
            setPhase("result");
            resetScroll();
            return;
        }
        const step = steps[Math.min(stepIndex, Math.max(0, steps.length - 1))];
        setPhase(step ? phaseForStep(step.type) : "company");
        resetScroll();
    }

    if (!hydrated) {
        return <div className="mx-auto min-h-[40vh] max-w-2xl" aria-hidden />;
    }

    if (phase === "resume") {
        return (
            <DiagnosticShell>
                <ResumeGate onContinue={continueResume} onRestart={restart} />
            </DiagnosticShell>
        );
    }

    if (phase === "intro") {
        return (
            <DiagnosticShell>
                <IntroGate onStart={startFromIntro} />
            </DiagnosticShell>
        );
    }

    if (phase === "done") {
        return (
            <DiagnosticShell progressStage="results" stages={getProgressStages(locale)}>
                <div className="mx-auto flex max-w-xl flex-col gap-6 py-8">
                    <h2 className="font-display text-[28px] font-normal tracking-[-0.02em] text-[#171717] md:text-[36px]">
                        {t("doneTitle")}
                    </h2>
                    <p className="text-base leading-relaxed text-[#525252] md:text-lg">{t("doneBody")}</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <CobreoButton href="/" variant="primary" size="lg">
                            {t("doneHomeCta")}
                        </CobreoButton>
                        <CobreoButton variant="ghost" size="lg" onClick={restart}>
                            {t("restartCta")}
                        </CobreoButton>
                    </div>
                </div>
            </DiagnosticShell>
        );
    }

    if (phase === "result") {
        const finalResult = result ?? scoreState();
        const completedAt = Date.now();
        const startedAt = sessionStartedAt || completedAt;
        const payload: DiagnosticV7AnswersPayload = {
            version: 8,
            specVersion: "8.1",
            language: locale === "en" ? "en" : "fr",
            companyContext,
            ambitions,
            applicableAreas,
            areaAnswers,
            capabilities: resolveCapabilities({
                areaAnswers,
                confirmationAnswers: {},
                fitChecks,
            }),
            confirmationAnswers: {},
            fitChecks,
            automationInterest,
            selectedTopics,
            selectedPossibilities,
            prioritySections,
            freeText,
            result: finalResult,
            session: {
                started_at: new Date(startedAt).toISOString(),
                completed_at: new Date(completedAt).toISOString(),
                duration_ms: Math.max(0, completedAt - startedAt),
                steps_completed: Math.min(stepIndex + 1, steps.length),
                total_steps: steps.length,
                was_resume: wasResumed,
            },
        };
        return (
            <DiagnosticShell progressStage="results" stages={getProgressStages(locale)}>
                <ResultScreenV7
                    result={finalResult}
                    payload={payload}
                    summary={summarizeResult(finalResult, locale)}
                    onDone={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                        setPhase("done");
                    }}
                    onRestart={restart}
                />
            </DiagnosticShell>
        );
    }

    if (!currentStep) {
        return <div className="mx-auto min-h-[40vh] max-w-2xl" aria-hidden />;
    }

    const screen = (() => {
        switch (currentStep.type) {
            case "company":
                return (
                    <CompanyScreen
                        questionId={currentStep.questionId}
                        context={companyContext}
                        onChange={(patch) => setCompanyContext((prev) => ({ ...prev, ...patch }))}
                        onContinue={() => advance()}
                    />
                );
            case "declared_ambitions":
                return (
                    <DeclaredAmbitionsScreen
                        value={ambitions.declared}
                        companySize={companyContext.company_size}
                        onChange={(ids) => setAmbitions({ declared: ids })}
                        onContinue={() => advance()}
                    />
                );
            case "applicable_areas":
                return (
                    <ApplicableAreasScreen
                        companyContext={companyContext}
                        value={applicableAreas}
                        onChange={setApplicableAreas}
                        onContinue={() => advance({ applicableAreas })}
                    />
                );
            case "area_scan":
                return (
                    <AreaScanScreen
                        areaId={currentStep.areaId}
                        value={areaAnswers[currentStep.areaId] || []}
                        onChange={(next) =>
                            setAreaAnswers((prev) => ({ ...prev, [currentStep.areaId]: next }))
                        }
                        onContinue={() => advance()}
                        companyContext={companyContext}
                        declaredAmbitions={ambitions.declared}
                    />
                );
            case "simplification":
                return (
                    <SimplificationScreen
                        value={automationInterest}
                        onChange={setAutomationInterest}
                        onContinue={() => advance({ automationInterest })}
                    />
                );
            case "choose_topics":
                return (
                    <ChooseTopicsScreen
                        candidates={topicCandidates}
                        value={selectedTopics}
                        onChange={setSelectedTopics}
                        onContinue={() => {
                            const derivedPossibilities = resolvePossibilitiesFromTopics(
                                selectedTopics,
                                possibilityCandidates,
                            );
                            setSelectedPossibilities(derivedPossibilities);
                            const derived: Array<AreaId | "none_priority"> =
                                derivedPossibilities.includes("none_selected") ||
                                selectedTopics.includes("none_selected")
                                    ? ["none_priority"]
                                    : Array.from(
                                          new Set(
                                              topicCandidates
                                                  .filter((c) => selectedTopics.includes(c.id))
                                                  .flatMap((c) => c.sourceSections),
                                          ),
                                      );
                            setPrioritySections(derived);
                            advance({
                                selectedTopics,
                                selectedPossibilities: derivedPossibilities,
                                prioritySections: derived,
                            });
                        }}
                    />
                );
            case "possibility_followup":
                return (
                    <ToolsFitScreen
                        value={fitChecks.tools_fit}
                        onChange={(next) => setFitChecks((prev) => ({ ...prev, tools_fit: next }))}
                        onContinue={() => advance({ fitChecks })}
                    />
                );
            case "optional_notes":
                return (
                    <OptionalNotesScreen
                        value={freeText.final}
                        onChange={(next) => setFreeText((prev) => ({ ...prev, final: next }))}
                        onContinue={() => finishWith()}
                    />
                );
            default:
                return null;
        }
    })();

    return (
        <DiagnosticShell
            progressStage={progressStage}
            stages={getProgressStages(locale)}
            onBack={goBack}
            backLabel={t("back")}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={stepKey(currentStep)}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: easeLuxury }}
                >
                    {screen}
                </motion.div>
            </AnimatePresence>
        </DiagnosticShell>
    );
}

function phaseForStep(type: FlowStep["type"]): DiagnosticV7Phase {
    switch (type) {
        case "company":
            return "company";
        case "declared_ambitions":
            return "ambitions";
        case "applicable_areas":
        case "area_scan":
        case "simplification":
            return "discovery";
        case "section_priorities":
        case "choose_topics":
        case "review_possibilities":
        case "possibility_followup":
        case "tools_fit":
        case "optional_notes":
            return "priorities";
        default:
            return "company";
    }
}
