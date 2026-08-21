"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { DiagnosticQuestion, DiagnosticResponses, StoredAnswer } from "@/content/diagnostic/types";
import { QuestionCard } from "@/components/cobreo/diagnostic/question-screen";
import { easeLuxury } from "@/components/cobreo/motion";

export function QuestionStack({
    sequence,
    index,
    highWater,
    responses,
    onAnswer,
    onNext,
    onSkip,
    onFocusQuestion,
}: {
    sequence: DiagnosticQuestion[];
    index: number;
    /** Furthest question reached — keeps later answers visible when reviewing */
    highWater: number;
    responses: DiagnosticResponses;
    onAnswer: (questionId: string, value: StoredAnswer) => void;
    onNext: () => void;
    onSkip: () => void;
    onFocusQuestion: (i: number) => void;
}) {
    const t = useTranslations("diagnostic");
    const reduce = useReducedMotion();
    const activeRef = useRef<HTMLDivElement | null>(null);
    const end = Math.min(Math.max(index, highWater), Math.max(sequence.length - 1, 0));
    const visible = sequence.slice(0, end + 1);

    useEffect(() => {
        const node = activeRef.current;
        if (!node) return;
        const id = window.setTimeout(() => {
            node.scrollIntoView({
                behavior: reduce ? "auto" : "smooth",
                block: "center",
            });
        }, reduce ? 0 : 80);
        return () => window.clearTimeout(id);
    }, [index, reduce]);

    const sectionStarts = visible.map((q, i) => i === 0 || q.stage !== visible[i - 1]?.stage);

    return (
        <div className="flex flex-col gap-6 pb-[35vh]">
            <AnimatePresence initial={false}>
                {visible.map((q, i) => {
                    const isActive = i === index;
                    const isLast = i === sequence.length - 1;

                    return (
                        <motion.div
                            key={q.id}
                            initial={reduce ? false : { opacity: 0, y: 28 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.4, ease: easeLuxury },
                            }}
                            className="flex flex-col gap-3"
                            style={{ transformOrigin: "top center" }}
                        >
                            {sectionStarts[i] ? (
                                <div className={i === 0 ? "pt-1" : "mt-4 border-t border-[#171717]/10 pt-8"}>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4d6b97]">
                                        {t(`stages.${q.stage}`)}
                                    </p>
                                </div>
                            ) : null}

                            <div ref={isActive ? activeRef : undefined} data-question-index={i}>
                                <QuestionCard
                                    questionId={q.id}
                                    answerType={q.answerType}
                                    progressLabel={t("progress", {
                                        current: i + 1,
                                        total: Math.max(sequence.length, 1),
                                    })}
                                    value={responses[q.id]}
                                    onChange={(v) => onAnswer(q.id, v)}
                                    onNext={onNext}
                                    onSkip={onSkip}
                                    onFocus={() => onFocusQuestion(i)}
                                    mode={isActive ? "active" : "past"}
                                    isLast={isLast && isActive}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
