"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { submitDiagnostic } from "@/app/actions/forms";

const TOTAL = 5;

export function DiagnosticWizard() {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const [step, setStep] = useState(0);
    const [pending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
    const [values, setValues] = useState({
        company: "",
        companySize: "11-50",
        challenge: "",
        tools: "",
        email: "",
    });

    function next() {
        setStep((s) => Math.min(TOTAL - 1, s + 1));
    }

    function back() {
        setStep((s) => Math.max(0, s - 1));
    }

    function onSubmit() {
        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => formData.set(k, v));
        formData.set("locale", locale);
        formData.set("website", "");
        startTransition(async () => {
            const result = await submitDiagnostic(formData);
            setStatus(result.ok ? "ok" : "error");
        });
    }

    if (status === "ok") {
        return <p className="rounded-xl bg-success-primary p-6 text-md text-primary">{t("success")}</p>;
    }

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <p className="text-sm font-semibold text-brand-700">{t("step", { current: step + 1, total: TOTAL })}</p>

            {step === 0 && (
                <Input
                    isRequired
                    label={t("q1")}
                    value={values.company}
                    onChange={(v) => setValues((s) => ({ ...s, company: v }))}
                />
            )}
            {step === 1 && (
                <RadioGroup
                    aria-label={t("q2")}
                    value={values.companySize}
                    onChange={(v) => setValues((s) => ({ ...s, companySize: v }))}
                >
                    <RadioButton value="1-10" label={t("size1")} />
                    <RadioButton value="11-50" label={t("size2")} />
                    <RadioButton value="51-200" label={t("size3")} />
                    <RadioButton value="200+" label={t("size4")} />
                </RadioGroup>
            )}
            {step === 2 && (
                <TextArea
                    isRequired
                    label={t("q3")}
                    value={values.challenge}
                    onChange={(v) => setValues((s) => ({ ...s, challenge: v }))}
                    rows={4}
                />
            )}
            {step === 3 && (
                <TextArea
                    isRequired
                    label={t("q4")}
                    value={values.tools}
                    onChange={(v) => setValues((s) => ({ ...s, tools: v }))}
                    rows={3}
                />
            )}
            {step === 4 && (
                <Input
                    isRequired
                    type="email"
                    label={t("q5")}
                    value={values.email}
                    onChange={(v) => setValues((s) => ({ ...s, email: v }))}
                />
            )}

            {status === "error" ? <p className="text-sm text-error-primary">Error</p> : null}

            <div className="flex gap-3">
                {step > 0 ? (
                    <Button color="secondary" size="lg" onClick={back}>
                        {t("back")}
                    </Button>
                ) : null}
                {step < TOTAL - 1 ? (
                    <Button color="primary" size="lg" onClick={next}>
                        {t("next")}
                    </Button>
                ) : (
                    <Button color="primary" size="lg" isDisabled={pending} isLoading={pending} onClick={onSubmit}>
                        {t("submit")}
                    </Button>
                )}
            </div>
        </div>
    );
}
