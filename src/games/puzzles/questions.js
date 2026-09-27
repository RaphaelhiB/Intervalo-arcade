export function buildQuestions(seed, count = 10) {
  let value = seed >>> 0;
  const random = () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
  return Array.from({ length: count }, (_, index) => {
    const a = 3 + Math.floor(random() * 18);
    const b = 2 + Math.floor(random() * 10);
    let prompt, answer, category;
    if (index % 3 === 0) {
      prompt = `Quanto é ${a} + ${b}?`; answer = a + b; category = 'CÁLCULO';
    } else if (index % 3 === 1) {
      prompt = `Complete: ${a}, ${a + b}, ${a + b * 2}, ?`; answer = a + b * 3; category = 'PADRÃO';
    } else {
      prompt = `Quanto é ${a} × ${b}?`; answer = a * b; category = 'LÓGICA';
    }
    const options = [answer, answer + 1, answer - 1, answer + b];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { prompt, options, correct: options.indexOf(answer), category };
  });
}
