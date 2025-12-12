import { expect, test } from '@playwright/test';

test('الأنيميشن السينمائي: تحقق رقمي من الثبات (≤ 0.5px)', async ({ page }) => {
  await page.goto('/');

  // انتظر اكتمال تهيئة ScrollTrigger/GSAP
  await page.waitForTimeout(1500);

  // مرّر إلى “قرب النهاية” داخل نطاق الـPin (حتى لا يحدث Unpin فيغيّر الإحداثيات).
  await page.evaluate(() => {
    const trigger = document.querySelector<HTMLElement>('[data-cinematic-trigger=\"true\"]');
    if (!trigger) throw new Error('missing cinematic trigger');
    const top = trigger.getBoundingClientRect().top + window.scrollY;
    // end: +=5000 => نبقى داخل النطاق بإنقاص هامش بسيط.
    window.scrollTo(0, top + 4990);
  });

  // scrub=2.5 يحتاج وقتًا ليصل لنهاية التايملاين
  await page.waitForTimeout(3500);

  const audit = await page.evaluate(() => {
    const w = window as unknown as {
      __THECOPY_AUDIT__?: { snapshots: any[] };
    };
    return w.__THECOPY_AUDIT__ ?? null;
  });

  expect(audit).toBeTruthy();
  expect(Array.isArray(audit!.snapshots)).toBeTruthy();

  const labels = audit!.snapshots.map((s) => s.label);
  expect(labels).toContain('frame0_initial');
  expect(labels).toContain('phase1_end_t3');
  expect(labels).toContain('phase4_end_t3_5');
  expect(labels).toContain('hold_near_end_t5_9');

  const end = audit!.snapshots.find((s) => s.label === 'hold_near_end_t5_9');
  expect(end).toBeTruthy();

  // الدليل الرقمي: لا قفزات بين فريم نهاية التشكيل وفريم النهاية.
  expect(end.stabilityCheck).toBeTruthy();
  // اطبع “دليل البراءة” في سجل الاختبار (صالح للنسخ/اللصق).
  // eslint-disable-next-line no-console
  console.log('[AUDIT_PROOF]', JSON.stringify(end.stabilityCheck, null, 2));
  expect(end.stabilityCheck.tolerancePx).toBe(0.5);
  expect(end.stabilityCheck.failures).toEqual([]);
  expect(end.stabilityCheck.maxAbsDelta.dx).toBeLessThanOrEqual(0.5);
  expect(end.stabilityCheck.maxAbsDelta.dy).toBeLessThanOrEqual(0.5);
});
