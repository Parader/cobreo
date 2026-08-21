import {
    DESIRE_SCORE,
    EFFORT_SCORE,
    FREQUENCY_SCORE,
    getRealityQuestion,
    optimizationAreaLabel,
    opportunityLabel,
    pickOptimizationPromptPriority,
    websiteFollowupLabel,
} from "@/content/diagnostic/v6/catalog";
import { computeCoverageUnits } from "@/lib/diagnostic/v6/sequence";
import type {
    Classification,
    DiagnosticContext,
    DiagnosticV6Result,
    GeneratedOpportunity,
    MeasurementState,
    PriorityAlignment,
    PriorityId,
    RealityAnswerValue,
    TopicId,
    TopicState,
} from "@/content/diagnostic/v6/types";

function tx(locale: string | undefined, fr: string, en: string) {
    return locale === "en" ? en : fr;
}

function asArray(value: RealityAnswerValue | undefined): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function classificationOf(questionId: string, answerId: string): Classification | undefined {
    const q = getRealityQuestion(questionId);
    const answer = q?.answers.find((a) => a.id === answerId) as
        | { classification?: Classification }
        | undefined;
    return answer?.classification;
}

function gainFromMeasurement(m?: MeasurementState): GeneratedOpportunity["potentialGain"] {
    if (!m) return "moderate";
    const score =
        (FREQUENCY_SCORE[m.frequency ?? ""] ?? 0) +
        (EFFORT_SCORE[m.effort ?? ""] ?? 0) +
        (DESIRE_SCORE[m.desire ?? ""] ?? 0);
    if (score >= 8) return "important";
    if (score >= 5) return "moderate";
    return "low";
}

function isLowValueMeasurement(m?: MeasurementState): boolean {
    if (!m) return false;
    return (
        (FREQUENCY_SCORE[m.frequency ?? ""] ?? 0) <= 1 &&
        (EFFORT_SCORE[m.effort ?? ""] ?? 0) <= 1 &&
        (DESIRE_SCORE[m.desire ?? ""] ?? 0) <= 0
    );
}

function isCredibleMeasurement(m?: MeasurementState): boolean {
    if (!m?.frequency || !m.effort || !m.desire) return true;
    if (isLowValueMeasurement(m)) return false;
    if ((DESIRE_SCORE[m.desire] ?? 0) <= 0) return false;
    return (
        ((FREQUENCY_SCORE[m.frequency] ?? 0) >= 2 && (EFFORT_SCORE[m.effort] ?? 0) >= 2) ||
        (DESIRE_SCORE[m.desire] ?? 0) >= 2
    );
}

function alignmentForTopic(
    topic: TopicId | "general",
    priorities?: PriorityId[],
): PriorityAlignment {
    const list = priorities ?? [];
    if (!list.length || list.includes("nothing_specific")) return "none";
    if (topic === "offer_testing" && list.includes("test_offer")) return "direct";
    if (
        topic === "sales_orders" &&
        (list.includes("sell_more") || list.includes("serve_clients"))
    ) {
        return "direct";
    }
    if (
        topic === "product_information" &&
        (list.includes("sell_more") ||
            list.includes("serve_clients") ||
            list.includes("test_offer"))
    ) {
        return "direct";
    }
    if (
        topic === "operational_scan" &&
        (list.includes("organize_work") ||
            list.includes("save_time") ||
            list.includes("visibility_growth"))
    ) {
        return "direct";
    }
    if (
        topic === "operational_scan" &&
        (list.includes("sell_more") || list.includes("serve_clients") || list.includes("test_offer"))
    ) {
        return "indirect";
    }
    return "none";
}

function withAlignment(
    op: Omit<GeneratedOpportunity, "priorityAlignment">,
    priorities?: PriorityId[],
): GeneratedOpportunity {
    return { ...op, priorityAlignment: alignmentForTopic(op.topic, priorities) };
}

function pushOptimizationOpportunity(
    opportunities: GeneratedOpportunity[],
    input: {
        topic: TopicId;
        opportunityId: string;
        answers: Record<string, RealityAnswerValue>;
        priorities?: PriorityId[];
        locale?: string;
        noticedHealthyFr: string;
        noticedHealthyEn: string;
    },
) {
    const probe = asArray(input.answers.optimization_probe)[0];
    if (probe !== "yes" && probe !== "maybe") return;

    const areas = asArray(input.answers.optimization_areas).filter(
        (id) => id && id !== "nothing_particular",
    );
    const promptPriority = pickOptimizationPromptPriority(input.priorities);
    const areaLabels = areas
        .map((id) => (promptPriority ? optimizationAreaLabel(id, promptPriority) : id))
        .filter(Boolean);

    if (areas.length === 0) {
        opportunities.push(
            withAlignment(
                {
                    id: input.opportunityId,
                    type: "exploration",
                    topic: input.topic,
                    whatWeNoticed: [tx(input.locale, input.noticedHealthyFr, input.noticedHealthyEn)],
                    why: tx(
                        input.locale,
                        probe === "yes"
                            ? "Vous aimeriez optimiser cette partie, même si elle fonctionne déjà. Une discussion permettrait de préciser où le gain serait le plus utile."
                            : "Un intérêt à optimiser apparaît, mais les éléments restent insuffisants pour une recommandation plus nette.",
                        probe === "yes"
                            ? "You’d like to optimize this area even though it already works. A conversation would help clarify where the gain would be most useful."
                            : "There is interest in optimizing, but there isn’t enough yet for a clearer recommendation.",
                    ),
                    potentialGain: "low",
                },
                input.priorities,
            ),
        );
        return;
    }

    opportunities.push(
        withAlignment(
            {
                id: input.opportunityId,
                type: "optimization",
                topic: input.topic,
                whatWeNoticed: [
                    tx(input.locale, input.noticedHealthyFr, input.noticedHealthyEn),
                    tx(
                        input.locale,
                        `Même si ça fonctionne, vous verriez un intérêt à optimiser : ${areaLabels.join(", ")}.`,
                        `Even though it works, you’d see value in optimizing: ${areaLabels.join(", ")}.`,
                    ),
                ],
                why: tx(
                    input.locale,
                    "Ce n’est pas un problème à corriger, mais une piste d’optimisation crédible à partir de ce qui fonctionne déjà.",
                    "This isn’t a problem to fix, but a credible optimization path from what already works.",
                ),
                potentialGain: "moderate",
            },
            input.priorities,
        ),
    );
}

/** Lightweight estimate used to gate operational scan */
export function estimateCredibleCount(topicStates: Partial<Record<TopicId, TopicState>>): number {
    let n = 0;
    const offerFit = asArray(topicStates.offer_testing?.answers.testing_trace_fit)[0];
    if (offerFit === "sometimes_hard" || offerFit === "hard" || offerFit === "partly") n += 1;

    const salesNear = asArray(topicStates.sales_orders?.answers.sales_near_term_need)[0];
    if (salesNear === "yes") n += 1;

    const info = topicStates.product_information?.answers;
    const infoFit = asArray(info?.product_information_fit)[0];
    const infoNear = asArray(info?.product_information_near_term_need)[0];
    if (infoFit === "not_really" || infoFit === "no") n += 1;
    if (infoNear === "yes") n += 1;

    return n;
}

export function generateDiagnosticResult(input: {
    context: DiagnosticContext;
    currentPriority?: PriorityId[];
    topicStates: Partial<Record<TopicId, TopicState>>;
    scanAnswers?: Record<string, RealityAnswerValue>;
    measurements?: Partial<Record<string, MeasurementState>>;
    locale?: string;
}): DiagnosticV6Result {
    const locale = input.locale ?? "fr";
    const scanAnswers = input.scanAnswers ?? {};
    const measurements = input.measurements ?? {};
    const priorities = input.currentPriority;
    const opportunities: GeneratedOpportunity[] = [];
    const noticed: string[] = [];

    const offer = input.topicStates.offer_testing;
    if (offer) {
        const fit = asArray(offer.answers.testing_trace_fit)[0];
        const method = asArray(offer.answers.testing_trace_method)[0];
        const reality = asArray(offer.answers.reality_offer_testing);
        const measure = measurements.offer_testing ?? offer.measurement;

        if (method === "several_places" || method === "notes" || method === "memory") {
            noticed.push(
                tx(
                    locale,
                    "Vous gardez une trace de vos essais, parfois de façon dispersée.",
                    "You keep a record of your trials, sometimes in a scattered way.",
                ),
            );
        }
        if (reality.includes("collect_reactions") || reality.includes("change_from_learning")) {
            noticed.push(
                tx(
                    locale,
                    "Vous recueillez déjà des réactions et ajustez votre offre.",
                    "You already gather reactions and adjust your offer.",
                ),
            );
        }

        const fitClass = fit ? classificationOf("testing_trace_fit", fit) : undefined;
        const friction =
            fitClass === "friction_candidate" || fit === "partly" || fit === "no";

        if (fitClass === "healthy_close" || fitClass === "likely_healthy" || fit === "yes") {
            pushOptimizationOpportunity(opportunities, {
                topic: "offer_testing",
                opportunityId: "optimize_offer_testing",
                answers: offer.answers,
                priorities,
                locale,
                noticedHealthyFr: "Le suivi de vos essais fonctionne déjà de façon satisfaisante.",
                noticedHealthyEn: "How you track your trials already works satisfactorily.",
            });
        } else if (friction && !isLowValueMeasurement(measure)) {
            opportunities.push(
                withAlignment(
                    {
                        id: "structure_testing_feedback",
                        type: "improvement",
                        topic: "offer_testing",
                        whatWeNoticed: [
                            tx(
                                locale,
                                "Comparer les essais et retrouver les commentaires n’est pas toujours simple.",
                                "Comparing trials and finding feedback isn’t always straightforward.",
                            ),
                        ],
                        why: tx(
                            locale,
                            "Mieux organiser le suivi des essais faciliterait les apprentissages.",
                            "Organizing how you track trials would make learning easier.",
                        ),
                        potentialGain: gainFromMeasurement(measure),
                    },
                    priorities,
                ),
            );
        } else if (fitClass === "exploration_candidate") {
            opportunities.push(
                withAlignment(
                    {
                        id: "structure_testing_feedback",
                        type: "exploration",
                        topic: "offer_testing",
                        whatWeNoticed: [
                            tx(
                                locale,
                                "La façon de suivre vos essais reste à clarifier.",
                                "How you track your trials still needs clarifying.",
                            ),
                        ],
                        why: tx(
                            locale,
                            "Il y a un signal utile, mais pas encore assez d’éléments pour une conclusion plus nette.",
                            "There’s a useful signal, but not enough yet for a clearer conclusion.",
                        ),
                        potentialGain: "low",
                    },
                    priorities,
                ),
            );
        }
    }

    const sales = input.topicStates.sales_orders;
    if (sales) {
        const path = asArray(sales.answers.reality_sales_path);
        const near = asArray(sales.answers.sales_near_term_need)[0];

        if (path.includes("not_relevant")) {
            // closed
        } else if (path.includes("not_taking_orders") || path.includes("not_decided")) {
            const nearClass = near ? classificationOf("sales_near_term_need", near) : undefined;
            if (nearClass === "emerging_capability_candidate") {
                noticed.push(
                    tx(
                        locale,
                        "Vous ne prenez pas encore de commandes, mais vous y pensez prochainement.",
                        "You’re not taking orders yet, but you’re thinking about it soon.",
                    ),
                );
                opportunities.push(
                    withAlignment(
                        {
                            id: "prepare_order_intake",
                            type: "emerging",
                            topic: "sales_orders",
                            whatWeNoticed: [
                                tx(
                                    locale,
                                    "Une façon de prendre des commandes n’est pas encore définie.",
                                    "A way to take orders hasn’t been defined yet.",
                                ),
                            ],
                            why: tx(
                                locale,
                                "Comme c’est quelque chose dont vous pensez avoir besoin bientôt, préparer un parcours simple de commande devient pertinent.",
                                "Since you expect to need this soon, preparing a simple order path becomes relevant.",
                            ),
                            potentialGain: "moderate",
                        },
                        priorities,
                    ),
                );
            } else if (
                nearClass === "exploration_candidate" ||
                nearClass === "low_confidence_exploration"
            ) {
                opportunities.push(
                    withAlignment(
                        {
                            id: "prepare_order_intake",
                            type: "exploration",
                            topic: "sales_orders",
                            whatWeNoticed: [
                                tx(
                                    locale,
                                    "La prise de commandes n’est pas encore définie.",
                                    "Order-taking isn’t defined yet.",
                                ),
                            ],
                            why: tx(
                                locale,
                                "Le besoin n’est pas encore affirmé clairement; à surveiller plutôt qu’à bâtir tout de suite.",
                                "The need isn’t clear yet; something to watch rather than build right away.",
                            ),
                            potentialGain: "low",
                        },
                        priorities,
                    ),
                );
            }
        } else {
            // Existing sales path that already works — optimization without inventing friction
            pushOptimizationOpportunity(opportunities, {
                topic: "sales_orders",
                opportunityId: "optimize_operations",
                answers: sales.answers,
                priorities,
                locale,
                noticedHealthyFr: "Vous avez déjà une façon de prendre des demandes ou des commandes.",
                noticedHealthyEn: "You already have a way to take requests or orders.",
            });
        }
    }

    const info = input.topicStates.product_information;
    if (info) {
        const channels = asArray(info.answers.reality_product_information);
        const fit = asArray(info.answers.product_information_fit)[0];
        const near = asArray(info.answers.product_information_near_term_need)[0];
        const measure = measurements.product_information ?? info.measurement;
        const existingChannels = [
            "direct_explanation",
            "send_info",
            "page_profile",
            "website",
            "other",
        ];
        const hasChannel = channels.some((id) => existingChannels.includes(id));

        if (channels.includes("not_relevant")) {
            // closed
        } else if (hasChannel) {
            if (channels.includes("website") || channels.includes("page_profile")) {
                noticed.push(
                    tx(
                        locale,
                        "Vous présentez déjà votre offre en ligne ou via une page.",
                        "You already present your offer online or through a page.",
                    ),
                );
            }
            const fitClass = fit ? classificationOf("product_information_fit", fit) : undefined;
            if (fitClass === "healthy_close" || fitClass === "likely_healthy") {
                pushOptimizationOpportunity(opportunities, {
                    topic: "product_information",
                    opportunityId: "optimize_product_information",
                    answers: info.answers,
                    priorities,
                    locale,
                    noticedHealthyFr:
                        "Les façons actuelles de présenter votre offre répondent déjà bien au besoin.",
                    noticedHealthyEn:
                        "Current ways of presenting your offer already meet the need well.",
                });
            } else if (fitClass === "fit_gap_candidate" && !isLowValueMeasurement(measure)) {
                const followup = asArray(info.answers.website_fit_followup);
                const followupLabels = followup
                    .map((id) => websiteFollowupLabel(id, locale))
                    .filter(Boolean);
                const why =
                    channels.includes("website") && followupLabels.length
                        ? tx(
                              locale,
                              `Votre site actuel ne répond pas pleinement au besoin. Vous aimeriez surtout qu’il aide à : ${followupLabels.join(", ")}. On explore comment l’améliorer à partir de ce qui existe déjà.`,
                              `Your current site doesn’t fully meet the need. You’d especially like it to help with: ${followupLabels.join(", ")}. We’ll explore how to improve it from what’s already there.`,
                          )
                        : tx(
                              locale,
                              "L’existence d’un site, d’une page ou d’un envoi d’info ne suffit pas: l’écart de pertinence pour trouver des clients ou faire comprendre l’offre reste ouvert.",
                              "Having a site, a page, or a way to send info isn’t enough: the gap in helping people find you or understand the offer remains open.",
                          );
                opportunities.push(
                    withAlignment(
                        {
                            id: "improve_customer_experience",
                            type: "improvement",
                            topic: "product_information",
                            whatWeNoticed: [
                                channels.includes("website")
                                    ? tx(
                                          locale,
                                          "Votre site existe, mais il ne répond pas pleinement à ce dont vous avez besoin.",
                                          "Your site exists, but it doesn’t fully meet what you need.",
                                      )
                                    : tx(
                                          locale,
                                          "Les façons actuelles de présenter l’offre ne répondent pas pleinement au besoin.",
                                          "Current ways of presenting the offer don’t fully meet the need.",
                                      ),
                            ],
                            why,
                            potentialGain: gainFromMeasurement(measure),
                        },
                        priorities,
                    ),
                );
            } else if (fitClass === "exploration_candidate") {
                opportunities.push(
                    withAlignment(
                        {
                            id: "improve_customer_experience",
                            type: "exploration",
                            topic: "product_information",
                            whatWeNoticed: [
                                tx(
                                    locale,
                                    "Il est encore difficile de dire si la présentation de l’offre répond bien au besoin.",
                                    "It’s still hard to say whether how the offer is presented meets the need.",
                                ),
                            ],
                            why: tx(
                                locale,
                                "Un signal utile existe, mais pas assez d’éléments pour une conclusion plus nette.",
                                "There’s a useful signal, but not enough yet for a clearer conclusion.",
                            ),
                            potentialGain: "low",
                        },
                        priorities,
                    ),
                );
            }
        } else if (channels.includes("not_planned")) {
            const nearClass = near
                ? classificationOf("product_information_near_term_need", near)
                : undefined;
            if (nearClass === "emerging_capability_candidate") {
                noticed.push(
                    tx(
                        locale,
                        "L’information sur l’offre n’est pas encore prévue de façon autonome.",
                        "Offer information isn’t set up to stand on its own yet.",
                    ),
                );
                opportunities.push(
                    withAlignment(
                        {
                            id: "make_offer_information_accessible",
                            type: "emerging",
                            topic: "product_information",
                            whatWeNoticed: [
                                tx(
                                    locale,
                                    "Les nouvelles personnes doivent souvent vous parler pour comprendre l’offre.",
                                    "New people often need to talk to you to understand the offer.",
                                ),
                            ],
                            why: tx(
                                locale,
                                "Puisque c’est important pour vous que l’offre soit compréhensible sans vous parler directement, rendre cette information accessible devient une piste utile.",
                                "Since it matters that people can understand the offer without talking to you directly, making that information accessible becomes a useful path.",
                            ),
                            potentialGain: "moderate",
                        },
                        priorities,
                    ),
                );
            } else if (
                nearClass === "exploration_candidate" ||
                nearClass === "low_confidence_exploration"
            ) {
                opportunities.push(
                    withAlignment(
                        {
                            id: "make_offer_information_accessible",
                            type: "exploration",
                            topic: "product_information",
                            whatWeNoticed: [
                                tx(
                                    locale,
                                    "L’accès à l’information sur l’offre n’est pas encore structuré.",
                                    "Access to offer information isn’t structured yet.",
                                ),
                            ],
                            why: tx(
                                locale,
                                "Le besoin n’est pas encore assez clair pour une recommandation plus nette.",
                                "The need isn’t clear enough yet for a firmer recommendation.",
                            ),
                            potentialGain: "low",
                        },
                        priorities,
                    ),
                );
            }
        }
    }

    const manual = asArray(scanAnswers.scan_manual_repetitive)[0];
    const manualTypes = asArray(scanAnswers.scan_manual_types);
    const manualMeasure = measurements.scan_manual;
    if (
        manual &&
        ["several", "one_two", "maybe"].includes(manual) &&
        manualTypes.length &&
        isCredibleMeasurement(manualMeasure)
    ) {
        noticed.push(
            tx(
                locale,
                "Certaines tâches manuelles reviennent dans votre quotidien.",
                "Some manual tasks keep coming up in your day-to-day.",
            ),
        );
        opportunities.push(
            withAlignment(
                {
                    id: "simplify_process",
                    type: "improvement",
                    topic: "operational_scan",
                    whatWeNoticed: [
                        tx(
                            locale,
                            "Des tâches répétitives pourraient être simplifiées.",
                            "Some repetitive tasks could be simplified.",
                        ),
                    ],
                    why: tx(
                        locale,
                        "La fréquence et l’effort associés à ces tâches justifient d’explorer une simplification, sans partir d’une hypothèse d’automatisation.",
                        "How often these tasks come up and how much effort they take justify exploring a simpler way—without assuming automation.",
                    ),
                    potentialGain: gainFromMeasurement(manualMeasure),
                },
                priorities,
            ),
        );
    }

    const handoffs = asArray(scanAnswers.scan_tool_handoffs);
    const handoffMeasure = measurements.scan_handoffs;
    if (handoffs.length && !handoffs.includes("none") && isCredibleMeasurement(handoffMeasure)) {
        noticed.push(
            tx(
                locale,
                "Des allers-retours entre outils ou saisies répétées apparaissent dans votre façon de travailler.",
                "Moving between tools or re-entering the same information shows up in how you work.",
            ),
        );
        const oppId = handoffs.includes("duplicate_entry")
            ? "reduce_duplicate_entry"
            : "clarify_process";
        opportunities.push(
            withAlignment(
                {
                    id: oppId,
                    type: "improvement",
                    topic: "operational_scan",
                    whatWeNoticed: [
                        tx(
                            locale,
                            "Des étapes manuelles entre outils ou des doubles saisies ont été mentionnées.",
                            "Manual steps between tools or double entry were mentioned.",
                        ),
                    ],
                    why: tx(
                        locale,
                        "Ces situations observables, combinées à la fréquence et à l’envie d’améliorer, forment une piste concrète.",
                        "These observable situations, combined with how often they happen and the wish to improve, form a concrete path.",
                    ),
                    potentialGain: gainFromMeasurement(handoffMeasure),
                },
                priorities,
            ),
        );
    }

    const followup = asArray(scanAnswers.scan_followup_memory)[0];
    const followupMeasure = measurements.scan_followup;
    if (
        (followup === "often" || followup === "very_often") &&
        isCredibleMeasurement(followupMeasure)
    ) {
        opportunities.push(
            withAlignment(
                {
                    id: "improve_followup",
                    type: "improvement",
                    topic: "operational_scan",
                    whatWeNoticed: [
                        tx(
                            locale,
                            "Les suivis importants reposent souvent sur la mémoire.",
                            "Important follow-ups often rely on memory.",
                        ),
                    ],
                    why: tx(
                        locale,
                        "Réduire la charge de mémorisation des prochaines étapes pourrait fiabiliser les suivis.",
                        "Easing the need to remember next steps could make follow-ups more reliable.",
                    ),
                    potentialGain: gainFromMeasurement(followupMeasure),
                },
                priorities,
            ),
        );
    }

    const visibility = asArray(scanAnswers.scan_visibility)[0];
    const visibilityMeasure = measurements.scan_visibility;
    if (
        (visibility === "sometimes_hard" || visibility === "hard") &&
        isCredibleMeasurement(visibilityMeasure)
    ) {
        opportunities.push(
            withAlignment(
                {
                    id: "improve_visibility",
                    type: "improvement",
                    topic: "operational_scan",
                    whatWeNoticed: [
                        tx(
                            locale,
                            "Il n’est pas toujours facile de voir où en sont les travaux en cours.",
                            "It isn’t always easy to see where work in progress stands.",
                        ),
                    ],
                    why: tx(
                        locale,
                        "Améliorer la visibilité sur l’état du travail pourrait réduire les recherches et les oublis.",
                        "Better visibility into work status could reduce searching and forgotten items.",
                    ),
                    potentialGain: gainFromMeasurement(visibilityMeasure),
                },
                priorities,
            ),
        );
    }

    const coverageUnits = computeCoverageUnits({
        topicStates: input.topicStates,
        scanAnswers,
    });
    const coverageSufficient = coverageUnits.length >= 4;

    const credible = opportunities.filter(
        (o) => o.type === "improvement" || o.type === "emerging" || o.type === "optimization",
    );
    const hasCredibleOpportunity = credible.length > 0;

    if (!opportunities.length) {
        const message = coverageSufficient
            ? tx(
                  locale,
                  "Dans les aspects explorés, rien n’indique une piste prioritaire à traiter tout de suite. Certaines façons de faire simples fonctionnent très bien lorsqu’elles demandent peu d’effort.",
                  "In the areas explored, nothing points to a priority path to address right away. Some simple ways of working work well when they take little effort.",
              )
            : tx(
                  locale,
                  "Dans les aspects que vous avez explorés jusqu’ici, rien n’indique une piste prioritaire. D’autres parties de votre activité n’ont pas encore été regardées.",
                  "In the areas you’ve explored so far, nothing points to a priority path. Other parts of your activity haven’t been looked at yet.",
              );

        return {
            opportunities: [],
            whatWeNoticed: noticed.length
                ? noticed
                : [
                      tx(
                          locale,
                          "Les aspects explorés semblent fonctionner sans friction prioritaire.",
                          "The areas explored seem to work without a priority friction.",
                      ),
                  ],
            hasCredibleOpportunity: false,
            coverageUnits,
            coverageSufficient,
            message,
        };
    }

    const gainRank = { important: 3, moderate: 2, low: 1 };
    const alignRank = { direct: 3, indirect: 2, none: 1 };
    const ranked = [...opportunities]
        .filter((o) => o.type !== "healthy")
        .sort((a, b) => {
            const typeRank = (t: GeneratedOpportunity["type"]) =>
                t === "improvement" || t === "emerging" || t === "optimization" ? 1 : 0;
            const byType = typeRank(b.type) - typeRank(a.type);
            if (byType) return byType;
            const byGain = gainRank[b.potentialGain] - gainRank[a.potentialGain];
            if (byGain) return byGain;
            return (
                alignRank[b.priorityAlignment ?? "none"] -
                alignRank[a.priorityAlignment ?? "none"]
            );
        })
        .slice(0, 3);

    for (const op of ranked) {
        for (const line of op.whatWeNoticed) {
            if (!noticed.includes(line)) noticed.push(line);
        }
    }

    return {
        opportunities: ranked,
        whatWeNoticed: noticed.slice(0, 5),
        hasCredibleOpportunity,
        coverageUnits,
        coverageSufficient,
    };
}

export function summarizeResult(result: DiagnosticV6Result, locale?: string): string {
    if (!result.opportunities.length) {
        return (
            result.message ??
            tx(
                locale,
                "Aucune piste prioritaire repérée dans les aspects explorés.",
                "No priority path spotted in the areas explored.",
            )
        );
    }
    return result.opportunities
        .map((o) => `${opportunityLabel(o.id, locale)} (${o.type})`)
        .join(" · ");
}
