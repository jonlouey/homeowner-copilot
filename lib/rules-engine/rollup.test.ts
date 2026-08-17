import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  computeApplianceRollup,
  computeCategoryRollup,
  isAttentionWorthy,
  type ApplianceRollup,
} from "./rollup";
import type {
  ComputeApplianceStatusResult,
  MaintenanceRuleInput,
  RuleComputation,
  RuleStatus,
} from "./types";

let ruleCounter = 0;

function rule(overrides: Partial<MaintenanceRuleInput> = {}): MaintenanceRuleInput {
  ruleCounter += 1;
  return {
    id: `rule-${ruleCounter}`,
    applianceTypeId: "hvac",
    taskName: `Task ${ruleCounter}`,
    description: "...",
    ruleType: "recurring",
    criticality: "routine",
    frequencyMonths: 3,
    minAgeRange: null,
    ...overrides,
  };
}

function computation(status: RuleStatus, overrides: Partial<RuleComputation> = {}): RuleComputation {
  return {
    rule: rule(),
    status,
    dueDate: null,
    criticality: "routine",
    ...overrides,
  };
}

function withContent(rules: RuleComputation[]): ComputeApplianceStatusResult {
  return { hasContent: true, rules };
}

const NO_CONTENT: ComputeApplianceStatusResult = { hasContent: false, rules: [] };

describe("computeApplianceRollup", () => {
  test("no maintenance_rules content -> gray, regardless of anything else", () => {
    const rollup = computeApplianceRollup(NO_CONTENT);
    assert.deepEqual(rollup, { color: "gray", hasRing: false, cardCopy: "No guidance yet" });
  });

  test("any overdue rule -> red", () => {
    const result = withContent([
      computation("on_track"),
      computation("overdue"),
      computation("unscheduled"),
    ]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "red");
    assert.equal(rollup.hasRing, false);
    assert.equal(rollup.cardCopy, "Needs attention");
  });

  test("amber ring never appears on red, even if a due_soon rule also exists", () => {
    const result = withContent([computation("overdue"), computation("due_soon")]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "red");
    assert.equal(rollup.hasRing, false);
  });

  test("no overdue, any unscheduled -> yellow", () => {
    const result = withContent([computation("on_track"), computation("unscheduled")]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "yellow");
    assert.equal(rollup.hasRing, false);
    assert.equal(rollup.cardCopy, "Needs info");
  });

  test("no overdue, no unscheduled, any due_soon -> green with a ring", () => {
    const result = withContent([computation("on_track"), computation("due_soon")]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "green");
    assert.equal(rollup.hasRing, true);
    assert.equal(rollup.cardCopy, "Action needed soon");
  });

  test("unscheduled + due_soon together -> yellow with a ring", () => {
    const result = withContent([computation("unscheduled"), computation("due_soon")]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "yellow");
    assert.equal(rollup.hasRing, true);
    assert.equal(rollup.cardCopy, "Action needed soon");
  });

  test("only on_track rules -> green, no ring", () => {
    const result = withContent([computation("on_track"), computation("on_track")]);
    const rollup = computeApplianceRollup(result);
    assert.deepEqual(rollup, { color: "green", hasRing: false, cardCopy: "All good" });
  });

  test("an appliance with only a dismissed overdue action shows green, not red", () => {
    // Explicit acceptance criterion from the Phase 2c doc.
    const result = withContent([computation("dismissed")]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "green");
  });

  test("an actively snoozed action doesn't drag the rollup down", () => {
    const result = withContent([computation("snoozed")]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "green");
    assert.equal(rollup.hasRing, false);
  });

  test("dismissed/snoozed rules are ignored even alongside real overdue/unscheduled rules", () => {
    const result = withContent([
      computation("dismissed"),
      computation("snoozed"),
      computation("unscheduled"),
    ]);
    const rollup = computeApplianceRollup(result);
    // Yellow from the real unscheduled rule — not elevated by the noise,
    // but not hidden by it either.
    assert.equal(rollup.color, "yellow");
  });

  test("lifespan_notice alone doesn't elevate the rollup out of green", () => {
    const result = withContent([computation("lifespan_notice")]);
    const rollup = computeApplianceRollup(result);
    assert.deepEqual(rollup, { color: "green", hasRing: false, cardCopy: "All good" });
  });

  test("lifespan_notice alongside real rules doesn't affect their outcome", () => {
    const result = withContent([computation("lifespan_notice"), computation("due_soon")]);
    const rollup = computeApplianceRollup(result);
    assert.equal(rollup.color, "green");
    assert.equal(rollup.hasRing, true);
  });

  test("hasContent true with an empty rules array -> green, no ring", () => {
    const result = withContent([]);
    const rollup = computeApplianceRollup(result);
    assert.deepEqual(rollup, { color: "green", hasRing: false, cardCopy: "All good" });
  });
});

function applianceRollup(
  color: ApplianceRollup["color"],
  hasRing = false
): ApplianceRollup {
  return { color, hasRing, cardCopy: "" };
}

describe("computeCategoryRollup", () => {
  test("empty category -> gray, 0 of 0", () => {
    const rollup = computeCategoryRollup([]);
    assert.deepEqual(rollup, { color: "gray", count: 0, total: 0, metaText: "No appliances yet" });
  });

  test("all green -> green, count equals total, 'All good'", () => {
    const rollup = computeCategoryRollup([applianceRollup("green"), applianceRollup("green")]);
    assert.deepEqual(rollup, { color: "green", count: 2, total: 2, metaText: "All good" });
  });

  test("all gray -> gray, 'No guidance yet'", () => {
    const rollup = computeCategoryRollup([applianceRollup("gray"), applianceRollup("gray")]);
    assert.deepEqual(rollup, {
      color: "gray",
      count: 2,
      total: 2,
      metaText: "No guidance yet",
    });
  });

  test("any red wins over yellow/green/gray, counting only the red ones", () => {
    const rollup = computeCategoryRollup([
      applianceRollup("green"),
      applianceRollup("yellow"),
      applianceRollup("red"),
      applianceRollup("red"),
      applianceRollup("gray"),
    ]);
    assert.deepEqual(rollup, {
      color: "red",
      count: 2,
      total: 5,
      metaText: "2 of 5 need attention",
    });
  });

  test("yellow wins over green/gray when there's no red", () => {
    const rollup = computeCategoryRollup([
      applianceRollup("green"),
      applianceRollup("yellow"),
      applianceRollup("gray"),
    ]);
    assert.deepEqual(rollup, {
      color: "yellow",
      count: 1,
      total: 3,
      metaText: "1 of 3 need info",
    });
  });

  test("a single red appliance", () => {
    const rollup = computeCategoryRollup([applianceRollup("red")]);
    assert.deepEqual(rollup, { color: "red", count: 1, total: 1, metaText: "1 of 1 need attention" });
  });

  test("the amber ring on an individual rollup doesn't affect category color", () => {
    const rollup = computeCategoryRollup([
      applianceRollup("green", true),
      applianceRollup("green", false),
    ]);
    assert.equal(rollup.color, "green");
    assert.equal(rollup.metaText, "All good");
  });
});

describe("isAttentionWorthy", () => {
  test("red qualifies", () => {
    assert.equal(isAttentionWorthy(applianceRollup("red")), true);
  });

  test("yellow qualifies", () => {
    assert.equal(isAttentionWorthy(applianceRollup("yellow")), true);
  });

  test("green does not qualify", () => {
    assert.equal(isAttentionWorthy(applianceRollup("green")), false);
  });

  test("green with an active due-soon ring still does not qualify", () => {
    // The bug this guards against: a green card carrying a ring (the
    // Roof "Action needed soon" case) was previously showing up in
    // "Needs your attention" even though there's nothing to act on —
    // the ring is a visual modifier wherever the card renders, not an
    // attention-list qualifier.
    assert.equal(isAttentionWorthy(applianceRollup("green", true)), false);
  });

  test("gray does not qualify", () => {
    assert.equal(isAttentionWorthy(applianceRollup("gray")), false);
  });
});
