import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { computeApplianceStatus } from "./compute";
import type { ApplianceInstanceInput, MaintenanceRuleInput, TaskEventInput } from "./types";

const NOW = new Date("2026-06-15T00:00:00Z");

function instance(overrides: Partial<ApplianceInstanceInput> = {}): ApplianceInstanceInput {
  return {
    id: "instance-1",
    applianceTypeId: "hvac",
    ageRange: "unknown",
    installDate: null,
    ...overrides,
  };
}

function recurringRule(overrides: Partial<MaintenanceRuleInput> = {}): MaintenanceRuleInput {
  return {
    id: "rule-recurring",
    applianceTypeId: "hvac",
    taskName: "Replace filter",
    description: "Replace the filter.",
    ruleType: "recurring",
    criticality: "routine",
    frequencyMonths: 3,
    minAgeRange: null,
    ...overrides,
  };
}

function lifespanRule(overrides: Partial<MaintenanceRuleInput> = {}): MaintenanceRuleInput {
  return {
    id: "rule-lifespan",
    applianceTypeId: "hvac",
    taskName: "Plan for eventual replacement",
    description: "Systems typically last 15-25 years.",
    ruleType: "lifespan",
    criticality: "routine",
    frequencyMonths: null,
    minAgeRange: "15+",
    ...overrides,
  };
}

function completedEvent(ruleId: string, eventDate: string): TaskEventInput {
  return {
    id: `event-${ruleId}-${eventDate}`,
    ruleId,
    eventType: "completed",
    eventDate,
    snoozeUntil: null,
  };
}

function dismissedEvent(ruleId: string, eventDate: string): TaskEventInput {
  return {
    id: `event-${ruleId}-${eventDate}`,
    ruleId,
    eventType: "dismissed",
    eventDate,
    snoozeUntil: null,
  };
}

function snoozedEvent(ruleId: string, eventDate: string, snoozeUntil: string): TaskEventInput {
  return { id: `event-${ruleId}-${eventDate}`, ruleId, eventType: "snoozed", eventDate, snoozeUntil };
}

describe("computeApplianceStatus", () => {
  test("recurring rule with no task_events is unscheduled", () => {
    const rule = recurringRule();
    const result = computeApplianceStatus(instance(), [], [rule], { now: NOW });

    assert.equal(result.hasContent, true);
    assert.deepEqual(result.rules, [
      { rule, status: "unscheduled", dueDate: null, criticality: "routine" },
    ]);
  });

  test("a dismissed event (the most recent) overrides an otherwise-unscheduled rule", () => {
    // Phase 2b: dismiss is task-scoped and can apply before a task is ever
    // completed (e.g. "doesn't apply to my water heater").
    const rule = recurringRule();
    const events: TaskEventInput[] = [
      snoozedEvent(rule.id, "2026-05-01T00:00:00Z", "2026-05-15"),
      dismissedEvent(rule.id, "2026-05-02T00:00:00Z"),
    ];
    const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

    assert.equal(result.rules[0].status, "dismissed");
  });

  test("recurring rule due within the urgency window is due_soon", () => {
    const rule = recurringRule({ frequencyMonths: 3 });
    const events = [completedEvent(rule.id, "2026-03-20T00:00:00Z")]; // due 2026-06-20
    const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

    assert.equal(result.rules[0].status, "due_soon");
    assert.equal(result.rules[0].dueDate, "2026-06-20");
  });

  test("recurring rule past its due date is overdue", () => {
    const rule = recurringRule({ frequencyMonths: 3 });
    const events = [completedEvent(rule.id, "2026-01-01T00:00:00Z")]; // due 2026-04-01
    const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

    assert.equal(result.rules[0].status, "overdue");
    assert.equal(result.rules[0].dueDate, "2026-04-01");
  });

  test("recurring rule with a due date well outside the window is on_track", () => {
    // Not one of the doc's three named states, but a necessary fourth
    // bucket: "due_soon" and "overdue" don't cover a task that was just
    // completed with months of runway left. Flagged for review.
    const rule = recurringRule({ frequencyMonths: 3 });
    const events = [completedEvent(rule.id, "2026-06-10T00:00:00Z")]; // due 2026-09-10
    const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

    assert.equal(result.rules[0].status, "on_track");
  });

  test("uses the most recent completed event, not the first", () => {
    const rule = recurringRule({ frequencyMonths: 3 });
    const events = [
      completedEvent(rule.id, "2025-01-01T00:00:00Z"), // would be very overdue
      completedEvent(rule.id, "2026-06-10T00:00:00Z"), // due 2026-09-10, on_track
    ];
    const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

    assert.equal(result.rules[0].status, "on_track");
    assert.equal(result.rules[0].dueDate, "2026-09-10");
  });

  test("ignores completed events belonging to a different rule", () => {
    const rule = recurringRule({ id: "rule-a", frequencyMonths: 3 });
    const events = [completedEvent("rule-b", "2026-06-10T00:00:00Z")];
    const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

    assert.equal(result.rules[0].status, "unscheduled");
  });

  test("lifespan rule fires when age_range meets the threshold", () => {
    const rule = lifespanRule({ minAgeRange: "15+" });
    const result = computeApplianceStatus(instance({ ageRange: "15+" }), [], [rule], {
      now: NOW,
    });

    assert.deepEqual(result.rules, [
      { rule, status: "lifespan_notice", dueDate: null, criticality: "routine" },
    ]);
  });

  test("lifespan rule is skipped (not errored, not guessed) when age_range is unknown", () => {
    const rule = lifespanRule({ minAgeRange: "15+" });
    const result = computeApplianceStatus(instance({ ageRange: "unknown" }), [], [rule], {
      now: NOW,
    });

    assert.equal(result.hasContent, true);
    assert.deepEqual(result.rules, []);
  });

  test("lifespan rule is skipped when age_range is known but below the threshold", () => {
    const rule = lifespanRule({ minAgeRange: "15+" });
    const result = computeApplianceStatus(instance({ ageRange: "3-7" }), [], [rule], {
      now: NOW,
    });

    assert.deepEqual(result.rules, []);
  });

  test("a ranged threshold (e.g. water heater's '8-15, 15+') fires at or above the minimum", () => {
    const rule = lifespanRule({ minAgeRange: "8-15" });

    const atThreshold = computeApplianceStatus(instance({ ageRange: "8-15" }), [], [rule], {
      now: NOW,
    });
    const aboveThreshold = computeApplianceStatus(instance({ ageRange: "15+" }), [], [rule], {
      now: NOW,
    });
    const belowThreshold = computeApplianceStatus(instance({ ageRange: "3-7" }), [], [rule], {
      now: NOW,
    });

    assert.equal(atThreshold.rules[0].status, "lifespan_notice");
    assert.equal(aboveThreshold.rules[0].status, "lifespan_notice");
    assert.deepEqual(belowThreshold.rules, []);
  });

  test("appliance type with zero maintenance_rules returns the explicit no-content signal", () => {
    const result = computeApplianceStatus(instance(), [], [], { now: NOW });

    assert.deepEqual(result, { hasContent: false, rules: [] });
  });

  test("hasContent stays true even when per-instance filtering empties the rules array", () => {
    // The type DOES have content (a lifespan rule exists) — it's just not
    // applicable to this instance's unknown age. That must stay
    // distinguishable from the appliance type having no content at all.
    const rule = lifespanRule({ minAgeRange: "15+" });
    const result = computeApplianceStatus(instance({ ageRange: "unknown" }), [], [rule], {
      now: NOW,
    });

    assert.equal(result.hasContent, true);
    assert.deepEqual(result.rules, []);
  });

  test("mixed recurring and lifespan rules produce one entry per applicable rule", () => {
    const recurring = recurringRule({ id: "rule-recurring" });
    const lifespan = lifespanRule({ id: "rule-lifespan", minAgeRange: "15+" });
    const result = computeApplianceStatus(
      instance({ ageRange: "15+" }),
      [],
      [recurring, lifespan],
      { now: NOW }
    );

    assert.equal(result.rules.length, 2);
    assert.equal(
      result.rules.find((r) => r.rule.id === "rule-recurring")?.status,
      "unscheduled"
    );
    assert.equal(
      result.rules.find((r) => r.rule.id === "rule-lifespan")?.status,
      "lifespan_notice"
    );
  });

  describe("snooze/dismiss precedence (Phase 2b)", () => {
    test("a dismissed event hides the rule regardless of what its status would otherwise be", () => {
      const rule = recurringRule({ frequencyMonths: 3 });
      const events = [
        completedEvent(rule.id, "2026-01-01T00:00:00Z"), // would be overdue on its own
        dismissedEvent(rule.id, "2026-06-01T00:00:00Z"),
      ];
      const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

      assert.equal(result.rules[0].status, "dismissed");
      assert.equal(result.rules[0].dueDate, null);
    });

    test("an active snooze (snooze_until today or later) suppresses the rule's own status", () => {
      const rule = recurringRule({ frequencyMonths: 3 });
      const events = [
        completedEvent(rule.id, "2026-01-01T00:00:00Z"), // would be overdue on its own
        snoozedEvent(rule.id, "2026-06-05T00:00:00Z", "2026-06-15"), // snooze_until == today
      ];
      const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

      assert.equal(result.rules[0].status, "snoozed");
      assert.equal(result.rules[0].dueDate, null);
    });

    test("an expired snooze (snooze_until has passed) falls back to normal completion-based status", () => {
      const rule = recurringRule({ frequencyMonths: 3 });
      const events = [
        completedEvent(rule.id, "2026-01-01T00:00:00Z"), // due 2026-04-01 -> overdue
        snoozedEvent(rule.id, "2026-02-01T00:00:00Z", "2026-05-01"), // expired before NOW
      ];
      const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

      assert.equal(result.rules[0].status, "overdue");
      assert.equal(result.rules[0].dueDate, "2026-04-01");
    });

    test("a completed event after a dismissal supersedes it", () => {
      // "Most recent event of any type" — a later completion is real
      // history and takes precedence over an earlier dismiss.
      const rule = recurringRule({ frequencyMonths: 3 });
      const events = [
        dismissedEvent(rule.id, "2026-01-01T00:00:00Z"),
        completedEvent(rule.id, "2026-06-10T00:00:00Z"), // due 2026-09-10, on_track
      ];
      const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

      assert.equal(result.rules[0].status, "on_track");
    });

    test("dismiss/snooze events for a different rule don't affect this one", () => {
      const rule = recurringRule({ id: "rule-a", frequencyMonths: 3 });
      const events = [dismissedEvent("rule-b", "2026-06-01T00:00:00Z")];
      const result = computeApplianceStatus(instance(), events, [rule], { now: NOW });

      assert.equal(result.rules[0].status, "unscheduled");
    });

    test("a dismissed lifespan rule that would otherwise fire is hidden", () => {
      const rule = lifespanRule({ minAgeRange: "15+" });
      const events = [dismissedEvent(rule.id, "2026-01-01T00:00:00Z")];
      const result = computeApplianceStatus(instance({ ageRange: "15+" }), events, [rule], {
        now: NOW,
      });

      assert.equal(result.rules[0].status, "dismissed");
    });

    test("an active snooze on a lifespan rule that would otherwise fire suppresses it", () => {
      const rule = lifespanRule({ minAgeRange: "15+" });
      const events = [snoozedEvent(rule.id, "2026-06-01T00:00:00Z", "2026-12-01")];
      const result = computeApplianceStatus(instance({ ageRange: "15+" }), events, [rule], {
        now: NOW,
      });

      assert.equal(result.rules[0].status, "snoozed");
    });

    test("a dismiss event does not resurrect a lifespan rule that isn't applicable yet", () => {
      // Dismiss/snooze override a rule's status — they don't make an
      // inapplicable rule (age below threshold) applicable.
      const rule = lifespanRule({ minAgeRange: "15+" });
      const events = [dismissedEvent(rule.id, "2026-01-01T00:00:00Z")];
      const result = computeApplianceStatus(instance({ ageRange: "3-7" }), events, [rule], {
        now: NOW,
      });

      assert.deepEqual(result.rules, []);
    });
  });
});
