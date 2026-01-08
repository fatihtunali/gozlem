import type { PromptCategory, ChoiceOption } from '../types/index.js';

export interface PromptTemplate {
  id: string;
  category: PromptCategory;
  text: string;
  choices: ChoiceOption[];
}

// Prompt bank: 18 prompts, 3 per category
export const PROMPT_BANK: Record<PromptCategory, PromptTemplate[]> = {
  time: [
    {
      id: 'prm_time_001',
      category: 'time',
      text: 'Şu anda ilerlemek için bir şey seçmelisin.',
      choices: [
        { id: 'now', label: 'Şimdi' },
        { id: 'later', label: 'Biraz Sonra' },
        { id: 'none', label: 'Hiçbiri' },
      ],
    },
    {
      id: 'prm_time_002',
      category: 'time',
      text: 'Bir şeyi ertelemek bazen ilerletir.',
      choices: [
        { id: 'agree', label: 'Katılıyorum' },
        { id: 'disagree', label: 'Katılmıyorum' },
        { id: 'unsure', label: 'Emin Değilim' },
      ],
    },
    {
      id: 'prm_time_003',
      category: 'time',
      text: 'Şimdi mi, sonra mı?',
      choices: [
        { id: 'now', label: 'Şimdi' },
        { id: 'later', label: 'Sonra' },
      ],
    },
  ],
  curiosity: [
    {
      id: 'prm_curiosity_001',
      category: 'curiosity',
      text: 'Bilmek mi, rahat kalmak mı?',
      choices: [
        { id: 'know', label: 'Bilmek' },
        { id: 'comfort', label: 'Rahat Kalmak' },
      ],
    },
    {
      id: 'prm_curiosity_002',
      category: 'curiosity',
      text: 'Bir ipucu ister misin?',
      choices: [
        { id: 'yes', label: 'Evet' },
        { id: 'no', label: 'Hayır' },
        { id: 'maybe', label: 'Belki Sonra' },
      ],
    },
    {
      id: 'prm_curiosity_003',
      category: 'curiosity',
      text: 'Kapıyı aralamak ister misin?',
      choices: [
        { id: 'open', label: 'Aç' },
        { id: 'closed', label: 'Kapalı Kalsın' },
        { id: 'peek', label: 'Sadece Bak' },
      ],
    },
  ],
  control: [
    {
      id: 'prm_control_001',
      category: 'control',
      text: 'Kontrol sende mi kalsın?',
      choices: [
        { id: 'keep', label: 'Evet, Bende' },
        { id: 'release', label: 'Bırakabilirim' },
        { id: 'share', label: 'Paylaşabilirim' },
      ],
    },
    {
      id: 'prm_control_002',
      category: 'control',
      text: 'Bir şeyi bırakmak ilerletir.',
      choices: [
        { id: 'agree', label: 'Katılıyorum' },
        { id: 'disagree', label: 'Katılmıyorum' },
      ],
    },
    {
      id: 'prm_control_003',
      category: 'control',
      text: 'Kuralı sen mi koyarsın?',
      choices: [
        { id: 'yes', label: 'Ben Koyarım' },
        { id: 'no', label: 'Başkası Koysun' },
        { id: 'none', label: 'Kural İstemem' },
      ],
    },
  ],
  risk: [
    {
      id: 'prm_risk_001',
      category: 'risk',
      text: 'Küçük bir risk al.',
      choices: [
        { id: 'take', label: 'Alırım' },
        { id: 'avoid', label: 'Almam' },
        { id: 'wait', label: 'Beklerim' },
      ],
    },
    {
      id: 'prm_risk_002',
      category: 'risk',
      text: 'Güvenli olanı seçmek her zaman güvenli değildir.',
      choices: [
        { id: 'agree', label: 'Doğru' },
        { id: 'disagree', label: 'Yanlış' },
        { id: 'depends', label: 'Duruma Göre' },
      ],
    },
    {
      id: 'prm_risk_003',
      category: 'risk',
      text: 'Bilinmeyene bir adım.',
      choices: [
        { id: 'step', label: 'Adım At' },
        { id: 'stay', label: 'Yerinde Kal' },
      ],
    },
  ],
  sacrifice: [
    {
      id: 'prm_sacrifice_001',
      category: 'sacrifice',
      text: 'Bir şeyden vazgeçmek gerekiyor.',
      choices: [
        { id: 'accept', label: 'Kabul' },
        { id: 'refuse', label: 'Ret' },
        { id: 'negotiate', label: 'Pazarlık' },
      ],
    },
    {
      id: 'prm_sacrifice_002',
      category: 'sacrifice',
      text: 'Kazanmak için ne verirsin?',
      choices: [
        { id: 'time', label: 'Zaman' },
        { id: 'comfort', label: 'Konfor' },
        { id: 'nothing', label: 'Hiçbir Şey' },
      ],
    },
    {
      id: 'prm_sacrifice_003',
      category: 'sacrifice',
      text: 'Bırakmak bazen kazanmaktır.',
      choices: [
        { id: 'agree', label: 'Evet' },
        { id: 'disagree', label: 'Hayır' },
      ],
    },
  ],
  pattern: [
    {
      id: 'prm_pattern_001',
      category: 'pattern',
      text: 'Aynı şeyi tekrar seçmek zorunda değilsin.',
      choices: [
        { id: 'same', label: 'Yine Aynısı' },
        { id: 'different', label: 'Farklı Bir Şey' },
        { id: 'random', label: 'Rastgele' },
      ],
    },
    {
      id: 'prm_pattern_002',
      category: 'pattern',
      text: 'Bugün tutarlısın.',
      choices: [
        { id: 'continue', label: 'Devam Et' },
        { id: 'break', label: 'Kır' },
        { id: 'ignore', label: 'Önemseme' },
      ],
    },
    {
      id: 'prm_pattern_003',
      category: 'pattern',
      text: 'Rastgele gibi görünmüyor.',
      choices: [
        { id: 'intentional', label: 'Kasıtlı' },
        { id: 'accidental', label: 'Tesadüf' },
        { id: 'unclear', label: 'Bilmiyorum' },
      ],
    },
  ],
  memory: [
    {
      id: 'prm_memory_001',
      category: 'memory',
      text: 'Bir önceki seçiminde ne seçmiştin?',
      choices: [
        { id: 'remember', label: 'Hatırlıyorum' },
        { id: 'forgot', label: 'Unuttum' },
        { id: 'unsure', label: 'Emin Değilim' },
      ],
    },
    {
      id: 'prm_memory_002',
      category: 'memory',
      text: 'İlk seçiminde nasıldın?',
      choices: [
        { id: 'confident', label: 'Emindim' },
        { id: 'hesitant', label: 'Tereddütlüydüm' },
        { id: 'random', label: 'Rastgele Seçtim' },
      ],
    },
    {
      id: 'prm_memory_003',
      category: 'memory',
      text: 'Hatırlamak ister misin?',
      choices: [
        { id: 'yes', label: 'Evet' },
        { id: 'no', label: 'Hayır' },
        { id: 'afraid', label: 'Korkuyorum' },
      ],
    },
  ],
};

// Category order for step-based selection
export const CATEGORY_ORDER: PromptCategory[] = [
  'time',
  'curiosity',
  'control',
  'risk',
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
    default: 'Hafıza seçicidir.',
  },
};

// Social hints pool
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
];
