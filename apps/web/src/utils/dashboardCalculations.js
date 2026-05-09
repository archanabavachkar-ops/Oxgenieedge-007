export function calculateRevenue(deals) {
  return deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
}

export function calculateConversionRate(totalCount, convertedCount) {
  if (!totalCount || totalCount === 0) return 0;
  return (convertedCount / totalCount) * 100;
}

export function calculateTrendPercentage(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

export function getDateRange(period) {
  const now = new Date();
  let start = new Date();
  let end = new Date();
  let prevStart = new Date();
  let prevEnd = new Date();

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    prevStart.setDate(start.getDate() - 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(end.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
  } else if (period === 'week') {
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    prevStart.setDate(start.getDate() - 7);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd = new Date(start.getTime() - 1);
  } else if (period === 'month') {
    start.setMonth(now.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    prevStart.setMonth(start.getMonth() - 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd = new Date(start.getTime() - 1);
  }

  const formatPBDate = (d) => d.toISOString().replace('T', ' ');

  return {
    start: formatPBDate(start),
    end: formatPBDate(end),
    prevStart: formatPBDate(prevStart),
    prevEnd: formatPBDate(prevEnd)
  };
}

export function calculateFunnelDropoff(currentStageCount, previousStageCount) {
  if (!previousStageCount || previousStageCount === 0) return 0;
  return ((previousStageCount - currentStageCount) / previousStageCount) * 100;
}

export function identifyLeaks(funnelStages, escalations) {
  const leaks = [];
  
  for (let i = 1; i < funnelStages.length; i++) {
    const dropoff = calculateFunnelDropoff(funnelStages[i].count, funnelStages[i-1].count);
    if (dropoff > 50) {
      leaks.push({
        id: `leak-dropoff-${i}`,
        severity: dropoff > 70 ? 'high' : 'medium',
        title: `High Drop-off: ${funnelStages[i-1].name} to ${funnelStages[i].name}`,
        description: `${dropoff.toFixed(1)}% of users are dropping off at this stage.`,
        metric: dropoff
      });
    }
  }

  const highSeverityEscalations = escalations.filter(e => e.severity && e.severity > 3);
  if (highSeverityEscalations.length > 5) {
    leaks.push({
      id: `leak-escalation`,
      severity: 'high',
      title: `Elevated Escalation Volume`,
      description: `${highSeverityEscalations.length} high-severity escalations flagged in this period.`,
      metric: highSeverityEscalations.length
    });
  }

  return leaks;
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}