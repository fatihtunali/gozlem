import type { PromptCategory } from '../../types/index.js';
import type { PromptTemplate } from './types.js';
import { TIME_PROMPTS } from './time.js';
import { CURIOSITY_PROMPTS } from './curiosity.js';
import { CONTROL_PROMPTS } from './control.js';
import { RISK_PROMPTS } from './risk.js';
import { SACRIFICE_PROMPTS } from './sacrifice.js';
import { PATTERN_PROMPTS } from './pattern.js';
import { MEMORY_PROMPTS } from './memory.js';

export type { PromptTemplate } from './types.js';

// Combined prompt bank: 1015 prompts total (145 per category)
export const PROMPT_BANK: Record<PromptCategory, PromptTemplate[]> = {
  time: TIME_PROMPTS,
  curiosity: CURIOSITY_PROMPTS,
  control: CONTROL_PROMPTS,
  risk: RISK_PROMPTS,
  sacrifice: SACRIFICE_PROMPTS,
  pattern: PATTERN_PROMPTS,
  memory: MEMORY_PROMPTS,
};

// Category order for step-based selection
export const CATEGORY_ORDER: PromptCategory[] = [
  'time',
  'curiosity',
  'control',
  'risk',
  'sacrifice',
  'pattern',
  'memory',
];

// Feedback templates based on category and common choice patterns
export const FEEDBACK_TEMPLATES: Record<PromptCategory, Record<string, string>> = {
  time: {
    now: 'Acele edenler bazen daha çok bekler.',
    later: 'Erteleme bir strateji olabilir.',
    none: 'Seçmemek de bir seçim.',
    agree: 'Sabır bir erdem.',
    disagree: 'Hız bazen kazandırır.',
    unsure: 'Belirsizlik rahatsız eder.',
    rush: 'Hız her zaman çözüm değil.',
    wait: 'Beklemek de bir eylem.',
    today: 'Bugün başlamak cesaret.',
    tomorrow: 'Yarın belirsizdir.',
    panic: 'Panik nadiren yardımcı olur.',
    calm: 'Sakinlik güç verir.',
    hurry: 'Acele işe şeytan karışır.',
    default: 'Zaman akıyor.',
  },
  curiosity: {
    know: 'Bilgi güç verir, ama ağırlık da.',
    comfort: 'Bazen bilmemek huzurdur.',
    yes: 'Merak kapıları açar.',
    no: 'Bazı kapılar kapalı kalmalı.',
    maybe: 'Tereddüt de bir cevap.',
    open: 'Cesaret gösterdin.',
    closed: 'Sınırlarını biliyorsun.',
    peek: 'Temkinli bir yaklaşım.',
    ask: 'Soru sormak güçtür.',
    silent: 'Sessizlik de bir cevap.',
    explore: 'Keşif cesarettir.',
    safe: 'Güvenlik değerlidir.',
    research: 'Bilgi arayışı soylu.',
    default: 'Merak insanı insan yapar.',
  },
  control: {
    keep: 'Kontrol güven verir.',
    release: 'Bırakmak da güçtür.',
    share: 'Paylaşmak çoğaltır.',
    agree: 'Kabul ettin.',
    disagree: 'Direnç gösterdin.',
    yes: 'Liderlik içgüdüsü.',
    no: 'Takip etmek de bir seçim.',
    none: 'Özgür ruh.',
    manage: 'Yönetmek sorumluluk.',
    managed: 'Güven gösterdin.',
    chaos: 'Kaos da bir düzen.',
    order: 'Düzen huzur verir.',
    default: 'Kontrol bir illüzyon olabilir.',
  },
  risk: {
    take: 'Cesaret ödüllendirilir... bazen.',
    avoid: 'Dikkatli olmak akıllıca.',
    wait: 'Sabır stratejik olabilir.',
    agree: 'Riski anlıyorsun.',
    disagree: 'Güvenlik öncelik.',
    depends: 'Durumsal düşünüyorsun.',
    step: 'Bilinmeyene yürüdün.',
    stay: 'Bilinen tercih edildi.',
    fear: 'Korku da bir pusula.',
    courage: 'Cesaret gösterdin.',
    calculate: 'Hesaplı hareket.',
    jump: 'Atlayış cesaret ister.',
    default: 'Risk ve ödül dengesi.',
  },
  sacrifice: {
    accept: 'Bedel ödemeye hazırsın.',
    refuse: 'Sınırların var.',
    negotiate: 'Pazarlıkçı bir yaklaşım.',
    time: 'Zamanı harcamaya değer buldun.',
    comfort: 'Konfordan vazgeçebiliyorsun.',
    nothing: 'Hiçbir şey vermek istemiyorsun.',
    agree: 'Bırakmanın gücünü biliyorsun.',
    disagree: 'Tutunmak istiyorsun.',
    can: 'Fedakarlık yapabilirsin.',
    cant: 'Sınırların var.',
    would: 'Verebilirsin.',
    wouldnt: 'Kendin için tutuyorsun.',
    default: 'Her kazanımın bir bedeli var.',
  },
  pattern: {
    same: 'Tutarlılık mı, tekrar mı?',
    different: 'Değişim cesarettir.',
    random: 'Öngörülemezlik bir strateji.',
    continue: 'Kararlısın.',
    break: 'Kalıbı kırdın.',
    ignore: 'Umursamazlık da bir cevap.',
    intentional: 'Bilinçli hareket ediyorsun.',
    accidental: 'Tesadüfler ilginç.',
    unclear: 'Kendini sorgulamak güzel.',
    repeat: 'Tekrar bir tercih.',
    change: 'Değişim cesaret.',
    notice: 'Farkındalık güç.',
    default: 'Desenler ortaya çıkıyor.',
  },
  memory: {
    remember: 'Hafızan güçlü.',
    forgot: 'Unutmak doğal.',
    unsure: 'Belirsizlik rahatsız eder.',
    confident: 'Başlangıçta emindim.',
    hesitant: 'Tereddüt normaldir.',
    random: 'Rastgelelik bazen özgürlüktür.',
    yes: 'Geçmişle yüzleşmek istiyorsun.',
    no: 'İleriye bakmayı tercih ediyorsun.',
    afraid: 'Korku da bir pusula.',
    strong: 'Güçlü bir hafıza.',
    weak: 'Hafıza seçicidir.',
    selective: 'Akıllı bir hafıza.',
    default: 'Hafıza seçicidir.',
  },
};

// Social hints pool - expanded
export const SOCIAL_HINTS = [
  'Bugün senin gibi düşünen {count} kişi vardı.',
  'Bu seçimi yapanların çoğu sonra farklı düşündü.',
  'İlginç bir tercih. Az rastlanıyor.',
  'Çoğunluk farklı seçti.',
  'Beklenmedik değildi.',
  'Sistem seni tanımaya başlıyor.',
  'Bu seçim bir şey söylüyor.',
  'Tutarlılık oranın yükseliyor.',
  'Değişkenlik gösteriyorsun.',
  'Benzer profiller farklı seçti.',
  'Bu tercih kalıbına uyuyor.',
  'Önceki seçimlerinle tutarlı.',
  'Farklı bir yön seçtin.',
  'Beklentileri aştın.',
  'Tipik bir tercih.',
  'Sıra dışı bir tercih.',
  'Çoğu insan tereddüt etti burada.',
  'Hızlı karar verdin.',
  'Düşünerek seçtin.',
  'İçgüdüsel bir tercih.',
  'Analitik bir yaklaşım.',
  'Duygusal bir tercih.',
  'Rasyonel bir karar.',
  'Kalıbını kırdın.',
  'Kalıbını sürdürdün.',
  'Sistem öğreniyor.',
  'Desenin belirginleşiyor.',
  'Öngörülemez kaldın.',
  'Tutarlısın.',
  'Değişkensin.',
];

// Get total prompt count
export function getTotalPromptCount(): number {
  return Object.values(PROMPT_BANK).reduce((total, prompts) => total + prompts.length, 0);
}

// Get prompts by category
export function getPromptsByCategory(category: PromptCategory): PromptTemplate[] {
  return PROMPT_BANK[category] || [];
}

// Get random prompt from category
export function getRandomPromptFromCategory(category: PromptCategory): PromptTemplate {
  const prompts = PROMPT_BANK[category];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}
