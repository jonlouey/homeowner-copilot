export type RuleHeadlinePhrases = {
  overdue: string;
  dueSoon: string;
  unscheduled: string;
};

// Hand-written per recurring rule, same contractor voice as the Summary
// paragraphs in summary-content.ts. Keyed by (appliance_type_id,
// task_name) rather than maintenance_rules.id, since the id isn't a
// stable authoring key across reseeds.
export const RULE_HEADLINES: Record<string, Record<string, RuleHeadlinePhrases>> = {
  hvac: {
    "Replace filter": {
      overdue: "Right now, your filter's overdue for a change.",
      dueSoon: "Right now, your filter change is coming up soon.",
      unscheduled: "We don't have a record of your filter being changed yet.",
    },
    "Professional tune-up": {
      overdue: "Right now, you're overdue for your annual tune-up.",
      dueSoon: "Right now, your annual tune-up is coming up soon.",
      unscheduled: "We don't have a record of a tune-up for your HVAC system yet.",
    },
  },
  roof: {
    "Professional inspection": {
      overdue: "Right now, your roof's overdue for its annual inspection.",
      dueSoon: "Right now, your roof's annual inspection is coming up soon.",
      unscheduled: "We don't have a record of your roof being inspected yet.",
    },
    "Clean gutters & check for debris": {
      overdue: "Right now, your gutters are overdue for a cleaning.",
      dueSoon: "Right now, your gutters are due for a cleaning soon.",
      unscheduled: "We don't have a record of your gutters being cleaned yet.",
    },
  },
  water_heater: {
    "Test T&P relief valve": {
      overdue:
        "Right now, your pressure relief valve test is overdue — this one's worth doing right away.",
      dueSoon: "Right now, your pressure relief valve test is coming up.",
      unscheduled:
        "We don't have a record of your pressure relief valve being tested — worth checking soon.",
    },
    "Flush tank (sediment)": {
      overdue: "Right now, your tank's overdue for a flush.",
      dueSoon: "Right now, your tank flush is coming up soon.",
      unscheduled: "We don't have a record of your tank being flushed yet.",
    },
    "Inspect/replace anode rod": {
      overdue: "Right now, you're overdue to check the anode rod.",
      dueSoon: "Right now, it's almost time to check the anode rod.",
      unscheduled: "We don't have a record of your anode rod being checked yet.",
    },
  },
  electrical_panel: {
    "Professional inspection": {
      overdue: "Right now, your panel's overdue for its inspection — worth getting to soon.",
      dueSoon: "Right now, your panel's inspection is coming up soon.",
      unscheduled:
        "We don't have a record of your panel being inspected — worth getting to soon.",
    },
  },
  sump_pump: {
    "Test pump (pour water, confirm activation)": {
      overdue:
        "Right now, your pump's overdue for a test — worth doing sooner rather than later.",
      dueSoon: "Right now, your pump test is coming up soon.",
      unscheduled: "We don't have a record of your pump being tested — worth checking soon.",
    },
    "Professional inspection (pit, check valve, backup power, alarm)": {
      overdue: "Right now, your pump's overdue for its full inspection.",
      dueSoon: "Right now, your pump's full inspection is coming up soon.",
      unscheduled:
        "We don't have a record of your pump's full inspection — worth getting to soon.",
    },
  },
};
