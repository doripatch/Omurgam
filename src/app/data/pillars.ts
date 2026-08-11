// Pillar (konu) sayfaları için içerik verisi.
// SEO amaçlı kapsamlı, kanıta dayalı ve bilgilendirici içerik.
// İçerikler Prof. Dr. Defne Kaya Utlu editöryel gözetiminde hazırlanmıştır;
// genel bilgilendirme amaçlıdır, tıbbi değerlendirmenin yerine geçmez.

export interface PillarSection {
  h2: string;
  body?: string[];
  list?: string[];
}
export interface PillarFAQ {
  q: string;
  a: string;
}
export interface PillarLink {
  to: string;
  label: string;
}
export interface PillarSource {
  label: string;
  url?: string;
}
export interface Pillar {
  slug: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  updated: string;
  // Opsiyonel — yalnızca GERÇEK veri varsa doldurulur (uydurma yok).
  reviewedBy?: string;        // tıbben inceleyen kişi
  reviewDate?: string;        // ISO (YYYY-MM-DD) — schema lastReviewed için
  sources?: PillarSource[];   // kaynakça
  sections: PillarSection[];
  faqs: PillarFAQ[];
  related: PillarLink[];
}

const RELATED_COMMON: PillarLink[] = [
  { to: '/mr-analiz', label: 'MR Raporu Terim Sözlüğü' },
  { to: '/videolar', label: 'Omurga Sağlığı Videoları' },
  { to: '/forum', label: 'Sizden Gelenler — Soru & Cevap' },
  { to: '/soru-sor', label: 'Uzmana Soru Sor' },
];

export const PILLARS: Record<string, Pillar> = {
  'bel-fitigi': {
    slug: 'bel-fitigi',
    keyword: 'bel fıtığı',
    metaTitle: 'Bel Fıtığı Nedir? Belirtileri, Nedenleri ve Tedavisi',
    metaDescription:
      'Bel fıtığı (lomber disk hernisi) nedir, belirtileri nelerdir, MR raporunda ne anlama gelir ve nasıl tedavi edilir? Prof. Dr. Defne Kaya Utlu editörlüğünde, bilimsel kaynaklara dayalı sade bir rehber.',
    h1: 'Bel Fıtığı (Lomber Disk Hernisi): Belirtiler, Nedenler ve Tedavi',
    lead:
      'Bel fıtığı, omurlar arasındaki diskin dış halkasının zayıflayıp iç kısmının taşması ve çoğu zaman bir sinir köküne baskı yapmasıyla ortaya çıkar. Toplumda çok yaygındır, ancak MR’da fıtık görülmesi tek başına ameliyat gerektiği anlamına gelmez. Aşağıda belirtileri, nedenleri, tanı sürecini ve güncel tedavi yaklaşımlarını sade bir dille bulacaksınız.',
    updated: '11 Temmuz 2026',
    sections: [
      {
        h2: 'Bel fıtığı nedir?',
        body: [
          'Omurga, üst üste dizili omurlar ve bunların arasında yastık görevi gören disklerden oluşur. Her diskin içinde jölemsi bir çekirdek (nucleus pulposus), bunu saran dış halka ise anulus fibrosus adını alır. Yaşlanma, tekrarlayan yüklenme veya ani zorlanmalarla dış halka zayıflar; çekirdeğin bir kısmı bu zayıf noktadan dışarı taşar. Bu taşmaya bel fıtığı ya da tıbbi adıyla lomber disk hernisi denir.',
          'Fıtık en sık, belin en çok yük taşıyan alt seviyeleri olan L4–L5 ve L5–S1 disklerinde görülür. Taşan disk materyali komşu sinir köküne baskı yaptığında, o sinirin uzandığı bacak boyunca ağrı, uyuşma veya güçsüzlük ortaya çıkabilir.',
        ],
      },
      {
        h2: 'Bel fıtığı belirtileri nelerdir?',
        body: [
          'Belirtiler fıtığın yerine, boyutuna ve sinir köküne baskı olup olmadığına göre değişir. En tipik tablo, belden başlayıp kalçaya ve bacağa yayılan ağrıdır (siyatik). Bazı kişilerde yalnızca bel ağrısı olurken, bazılarında baskın şikâyet bacak ağrısıdır.',
        ],
        list: [
          'Bele, kalçaya veya bacağa yayılan ağrı (çoğunlukla tek taraflı)',
          'Bacakta, ayakta ya da parmaklarda uyuşma ve karıncalanma',
          'Ayak veya bacak kaslarında güçsüzlük',
          'Öksürme, hapşırma ya da ıkınma ile artan ağrı',
          'Uzun oturma veya öne eğilme ile artabilen şikâyetler',
        ],
      },
      {
        h2: 'Acil değerlendirme gerektiren durumlar (kırmızı bayraklar)',
        body: [
          'Nadir de olsa bazı belirtiler acil değerlendirme gerektirir. Aşağıdaki bulgulardan biri varsa vakit kaybetmeden bir sağlık kuruluşuna başvurulmalıdır:',
        ],
        list: [
          'İdrar veya büyük abdest kontrolünde kayıp',
          'Makat ve iç bacak bölgesinde (eyer bölgesi) uyuşma',
          'Her iki bacakta hızla ilerleyen güçsüzlük',
          'Ateşle birlikte olan şiddetli bel ağrısı veya açıklanamayan kilo kaybı',
        ],
      },
      {
        h2: 'Bel fıtığının nedenleri ve risk faktörleri',
        body: [
          'Bel fıtığı çoğu zaman tek bir olaya değil, zamanla biriken yüklenmelere bağlıdır. Diskler yaşla birlikte su içeriğini kaybeder ve esnekliği azalır; bu durum fıtıklaşmaya zemin hazırlar.',
        ],
        list: [
          'Yaşa bağlı disk dejenerasyonu (en sık zemin)',
          'Ağır kaldırırken aynı anda gövdeyi döndürmek',
          'Uzun süre hareketsiz ve hatalı postürle oturmak',
          'Sedanter yaşam ve zayıf gövde (kor) kasları',
          'Fazla kilo, sigara kullanımı ve genetik yatkınlık',
        ],
      },
      {
        h2: 'Tanı: Muayene ve MR’ın rolü',
        body: [
          'Tanı öncelikle öykü ve fizik muayene ile konur. Düz bacak kaldırma testi gibi manevralar sinir kökü tahrişini gösterebilir. MR (manyetik rezonans) görüntüleme, fıtığın yerini ve sinir yapılarına ilişkisini gösteren en ayrıntılı yöntemdir.',
          'Önemli bir nokta: MR’da fıtık görülmesi tek başına tedavi kararı vermez. Hiçbir şikâyeti olmayan kişilerde de MR’da disk taşması saptanabilir. Bu nedenle görüntüleme bulguları her zaman kişinin şikâyetleri ve muayenesi ile birlikte yorumlanır. MR raporunuzda geçen protrüzyon, ekstrüzyon, bulging gibi terimlerin ne anlama geldiğini MR Raporu Terim Sözlüğü’nden öğrenebilirsiniz.',
        ],
      },
      {
        h2: 'Bel fıtığı tedavisi',
        body: [
          'Bel fıtıklarının büyük çoğunluğu ameliyatsız (konservatif) yöntemlerle iyileşir. Amaç ağrıyı yönetmek, işlevi geri kazandırmak ve tekrarı önlemektir.',
        ],
        list: [
          'Aktif kalmak: Uzun yatak istirahati önerilmez; tolere edilen hareket iyileşmeyi destekler.',
          'Fizyoterapi ve egzersiz: Kişiye özel yüklenme ve güçlendirme programları.',
          'Ağrı yönetimi: Hekim önerisiyle ilaç ve gerektiğinde seçili vakalarda enjeksiyon.',
          'Yaşam düzenlemeleri: Kaldırma tekniği, oturma düzeni ve aktivite planlaması.',
          'Cerrahi: Kırmızı bayrak bulgularında ya da uygun konservatif tedaviye rağmen sürüp giden ciddi sinir baskısında düşünülür.',
        ],
      },
      {
        h2: 'Egzersiz ve iyileşme süreci',
        body: [
          'Egzersiz bel fıtığı yönetiminin temelidir, ancak “herkese uyan tek program” yoktur. Bazı kişiler belirli hareket yönlerinde rahatlarken (yön tercihi), aynı hareket bir başkasında şikâyeti artırabilir. Bu nedenle programın bir uzman tarafından kişiye göre belirlenmesi önemlidir.',
          'İyi haber şu ki, fıtıkların önemli bir kısmı zamanla kendiliğinden küçülebilir (spontan regresyon). Çoğu kişide şikâyetler haftalar içinde belirgin şekilde azalır. Sabırlı, düzenli ve doğru yüklenmeye dayalı bir süreç, hem iyileşmeyi hızlandırır hem de tekrar riskini azaltır.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Bel fıtığı ameliyatsız geçer mi?',
        a: 'Evet, bel fıtıklarının büyük çoğunluğu ameliyatsız yöntemlerle (egzersiz, fizyoterapi, ağrı yönetimi ve aktif kalma) belirgin şekilde iyileşir. Cerrahi, yalnızca kırmızı bayrak bulgularında veya uygun konservatif tedaviye yanıt vermeyen ciddi sinir baskısında gündeme gelir.',
      },
      {
        q: 'MR’da bel fıtığı çıktı, ameliyat olmam gerekir mi?',
        a: 'Hayır, MR’da fıtık görülmesi tek başına ameliyat gerektiğini göstermez. Şikâyeti olmayan kişilerde de MR’da disk taşması bulunabilir. Tedavi kararı, görüntüleme değil, kişinin şikâyetleri ve muayenesi ile birlikte verilir.',
      },
      {
        q: 'Bel fıtığında hangi hareketlerden kaçınmalıyım?',
        a: 'Genel olarak ağır yükü gövdeyi döndürerek kaldırmaktan ve uzun süre hatalı postürle sabit kalmaktan kaçınmak yararlıdır. Ancak nelerin sizi rahatlatıp nelerin şikâyetinizi artırdığı kişiye göre değişir; bu yüzden egzersiz ve aktivite planının bir uzmanla belirlenmesi önerilir.',
      },
      {
        q: 'Bel fıtığı ağrısı ne kadar sürede geçer?',
        a: 'Çoğu kişide belirtiler birkaç hafta içinde belirgin şekilde azalır. Fıtıkların bir kısmı zamanla kendiliğinden küçülebilir. Süreç kişiden kişiye değişir; düzenli egzersiz ve doğru yüklenme iyileşmeyi destekler.',
      },
      {
        q: 'Bel fıtığı ile bel kayması aynı şey mi?',
        a: 'Hayır. Bel fıtığı diskin taşmasıyken, bel kayması (spondilolistezis) bir omurun alttaki omura göre öne kaymasıdır. Belirtileri benzeşebilir ama farklı durumlardır ve değerlendirmeleri farklıdır.',
      },
    ],
    related: [
      { to: '/boyun-fitigi', label: 'Boyun Fıtığı' },
      { to: '/skolyoz', label: 'Skolyoz' },
      ...RELATED_COMMON,
    ],
  },

  'boyun-fitigi': {
    slug: 'boyun-fitigi',
    keyword: 'boyun fıtığı',
    metaTitle: 'Boyun Fıtığı Nedir? Belirtileri, Nedenleri ve Tedavisi',
    metaDescription:
      'Boyun fıtığı (servikal disk hernisi) nedir, belirtileri nelerdir, kola yayılan ağrının nedeni nedir ve nasıl tedavi edilir? Prof. Dr. Defne Kaya Utlu editörlüğünde bilimsel kaynaklara dayalı sade bir rehber.',
    h1: 'Boyun Fıtığı (Servikal Disk Hernisi): Belirtiler, Nedenler ve Tedavi',
    lead:
      'Boyun fıtığı, boyun bölgesindeki (servikal) omurlar arasında yer alan diskin taşması ve sıklıkla bir sinir köküne baskı yapmasıyla oluşur. Boyun ağrısının yanı sıra omuza, kola ve parmaklara yayılan şikâyetlere yol açabilir. Aşağıda belirtilerini, nedenlerini ve güncel tedavi yaklaşımlarını sade bir dille açıklıyoruz.',
    updated: '11 Temmuz 2026',
    sections: [
      {
        h2: 'Boyun fıtığı nedir?',
        body: [
          'Boyun bölgesinde yedi omur ve bunların arasında yastıklama görevi gören diskler bulunur. Bir diskin dış halkası zayıfladığında iç çekirdeği dışarı taşabilir ve komşu sinir köküne ya da nadiren omuriliğe baskı yapabilir. Bu duruma boyun fıtığı ya da tıbbi adıyla servikal disk hernisi denir.',
          'Boyun fıtığı en sık, boynun hareketli alt seviyeleri olan C5–C6 ve C6–C7 disklerinde görülür. Baskı yapan seviyeye göre kolun farklı bölgelerinde şikâyet ortaya çıkar.',
        ],
      },
      {
        h2: 'Boyun fıtığı belirtileri nelerdir?',
        body: [
          'Belirtiler yalnızca boyunla sınırlı kalmayabilir; sinir kökü tahrişi olduğunda şikâyetler kol boyunca aşağı yayılır.',
        ],
        list: [
          'Boyun ağrısı ve boyunda hareket kısıtlılığı',
          'Omuza, kola, ön kola veya parmaklara yayılan ağrı',
          'Kolda veya elde uyuşma ve karıncalanma',
          'Kol veya el kaslarında güçsüzlük, kavrama zorluğu',
          'Baş ve boyun hareketleriyle değişebilen şikâyetler',
        ],
      },
      {
        h2: 'Acil değerlendirme gerektiren durumlar',
        body: [
          'Bazı belirtiler omuriliğin de etkilendiğine (miyelopati) işaret edebilir ve öncelikli değerlendirme gerektirir:',
        ],
        list: [
          'El becerilerinde belirgin kayıp (düğme ilikleme, yazı yazma güçlüğü)',
          'Yürüme ve dengede bozulma',
          'Kol ve bacakları birlikte etkileyen güçsüzlük',
          'İdrar veya bağırsak kontrolünde değişiklik',
        ],
      },
      {
        h2: 'Boyun fıtığının nedenleri ve risk faktörleri',
        body: [
          'Boyun fıtığı çoğu zaman yıllar içinde biriken yüklenmelerin sonucudur; bazen ani bir zorlanma tetikleyici olur.',
        ],
        list: [
          'Yaşa bağlı disk dejenerasyonu',
          'Uzun süre öne eğik baş postürü (ekran ve telefon kullanımı)',
          'Tekrarlayan zorlanmalar ve ani boyun hareketleri',
          'Travma (örneğin ani fren/çarpma sonrası boyun zorlanması)',
          'Sigara kullanımı ve genetik yatkınlık',
        ],
      },
      {
        h2: 'Tanı: Muayene ve görüntüleme',
        body: [
          'Tanı, öykü ve fizik muayene ile başlar. Kol refleksleri, kas gücü ve duyu değerlendirilir; bazı boyun manevraları sinir kökü tahrişini ortaya çıkarabilir. MR, disk taşmasını ve sinir yapılarına ilişkisini gösteren en ayrıntılı yöntemdir.',
          'Tıpkı bel fıtığında olduğu gibi, boyun MR’ında görülen her disk değişikliği şikâyet oluşturmaz. Bulgular her zaman kişinin muayenesiyle birlikte yorumlanır. MR raporunuzdaki terimleri MR Raporu Terim Sözlüğü’nden inceleyebilirsiniz.',
        ],
      },
      {
        h2: 'Boyun fıtığı tedavisi',
        body: [
          'Boyun fıtıklarının büyük bölümü ameliyatsız yöntemlerle iyileşir. Tedavinin amacı ağrıyı azaltmak, boyun ve kol işlevini korumak ve tekrarı önlemektir.',
        ],
        list: [
          'Postür düzenlemeleri ve ekran/telefon kullanım alışkanlıklarının gözden geçirilmesi',
          'Kişiye özel fizyoterapi ve boyun–omuz kuşağı egzersizleri',
          'Hekim önerisiyle ağrı yönetimi ve gerektiğinde seçili enjeksiyonlar',
          'Cerrahi: ilerleyici sinir/omurilik baskısında ya da dirençli, ciddi vakalarda değerlendirilir',
        ],
      },
    ],
    faqs: [
      {
        q: 'Boyun fıtığı neden kola ağrı yapar?',
        a: 'Taşan disk, o bölgeden çıkan sinir köküne baskı yaptığında, bu sinirin uzandığı omuz, kol ve parmaklar boyunca ağrı, uyuşma veya güçsüzlük hissedilir. Bu nedenle şikâyet çoğu zaman boyunla sınırlı kalmaz.',
      },
      {
        q: 'Boyun fıtığı ameliyatsız iyileşir mi?',
        a: 'Evet, çoğu boyun fıtığı postür düzenlemeleri, egzersiz ve fizyoterapi gibi ameliyatsız yöntemlerle belirgin şekilde iyileşir. Cerrahi, ilerleyici sinir ya da omurilik baskısında ve dirençli vakalarda düşünülür.',
      },
      {
        q: 'Telefon ve bilgisayar kullanımı boyun fıtığı yapar mı?',
        a: 'Uzun süre öne eğik baş postürü boyun yapılarında yüklenmeyi artırır ve şikâyetleri tetikleyebilir. Tek başına doğrudan “fıtık yapar” demek doğru olmaz, ancak ekran alışkanlıklarını düzenlemek ve ara vermek koruyucudur.',
      },
      {
        q: 'Boyun fıtığında hangi yastık kullanılmalı?',
        a: 'Amaç, uyurken boynun omurga ile aynı hizada, nötr pozisyonda kalmasıdır. Çok yüksek veya çok düz yastıklar boynu zorlayabilir. En uygun yükseklik kişinin omuz genişliği ve uyku pozisyonuna göre değişir.',
      },
    ],
    related: [
      { to: '/bel-fitigi', label: 'Bel Fıtığı' },
      { to: '/skolyoz', label: 'Skolyoz' },
      ...RELATED_COMMON,
    ],
  },

  skolyoz: {
    slug: 'skolyoz',
    keyword: 'skolyoz',
    metaTitle: 'Skolyoz Nedir? Belirtileri, Türleri ve Tedavisi',
    metaDescription:
      'Skolyoz nedir, belirtileri nelerdir, nasıl teşhis edilir ve tedavi seçenekleri nelerdir? Cobb açısı, korse ve egzersiz dâhil, Prof. Dr. Defne Kaya Utlu editörlüğünde bilimsel kaynaklara dayalı sade bir rehber.',
    h1: 'Skolyoz: Belirtiler, Türleri, Tanı ve Tedavi',
    lead:
      'Skolyoz, omurganın yana doğru eğrilip aynı zamanda hafifçe döndüğü, üç boyutlu bir omurga şekil bozukluğudur. Eğrilik derecesi röntgende ölçülen Cobb açısı ile belirlenir ve 10 dereceden büyük eğrilikler skolyoz olarak kabul edilir. Aşağıda türlerini, belirtilerini, tanı yöntemlerini ve tedavi seçeneklerini sade bir dille açıklıyoruz.',
    updated: '11 Temmuz 2026',
    sections: [
      {
        h2: 'Skolyoz nedir?',
        body: [
          'Sağlıklı bir omurga önden bakıldığında düz görünür. Skolyozda ise omurga yana doğru “C” veya “S” biçiminde eğrilir ve gövde hafifçe döner. Bu üç boyutlu değişiklik nedeniyle omuzlarda, kürek kemiklerinde veya belde asimetri fark edilebilir.',
          'Eğriliğin ciddiyeti, röntgen üzerinde Cobb açısı ölçülerek sınıflandırılır. Tedavi kararı büyük ölçüde bu açıya, kişinin yaşına ve kemik büyümesinin tamamlanıp tamamlanmadığına göre verilir.',
        ],
      },
      {
        h2: 'Skolyoz türleri',
        body: ['Skolyoz nedenine göre farklı gruplara ayrılır:'],
        list: [
          'İdiyopatik skolyoz: En sık görülen türdür; nedeni tam bilinmez ve çoğunlukla ergenlik döneminde ortaya çıkar.',
          'Konjenital skolyoz: Omurların doğuştan gelişim farklılığına bağlıdır.',
          'Nöromusküler skolyoz: Kas ve sinir sistemini etkileyen durumlara eşlik eder.',
          'Dejeneratif (erişkin) skolyoz: Yaşa bağlı disk ve eklem değişiklikleriyle ileri yaşta gelişir.',
        ],
      },
      {
        h2: 'Skolyoz belirtileri nelerdir?',
        body: [
          'Özellikle ergenlerde skolyoz çoğu zaman ağrısızdır ve ilk fark edilen şey duruştaki asimetridir. Bu nedenle erken dönemde gözden kaçabilir.',
        ],
        list: [
          'Omuzların farklı yükseklikte olması',
          'Bir kürek kemiğinin daha belirgin çıkması',
          'Bel çukurlarının veya kalça hizasının asimetrik görünmesi',
          'Öne eğilince sırtın bir tarafının daha yüksek (kaburga çıkıntısı) görünmesi',
          'Erişkinlerde eğriliğe eşlik edebilen bel ağrısı ve yorgunluk',
        ],
      },
      {
        h2: 'Tanı: Adams testi, skolyometre ve röntgen',
        body: [
          'Tarama amaçlı en bilinen yöntem Adams öne eğilme testidir: Kişi öne eğildiğinde sırtın bir tarafındaki kabarıklık gözlemlenir. Skolyometre ile gövde dönüşünün derecesi ölçülebilir.',
          'Kesin tanı ve eğriliğin ciddiyeti, ayakta çekilen tüm omurga röntgeni üzerinde Cobb açısının ölçülmesiyle konur. Gerektiğinde altta yatan nedeni araştırmak için ek görüntülemeler istenebilir.',
        ],
      },
      {
        h2: 'Skolyoz tedavisi',
        body: [
          'Tedavi tek tip değildir; eğriliğin derecesine, kişinin yaşına ve büyümenin devam edip etmediğine göre planlanır. Genel yaklaşım şöyle özetlenebilir:',
        ],
        list: [
          'Gözlem: Hafif eğriliklerde, özellikle büyüme sürüyorsa, düzenli aralıklarla takip edilir.',
          'Skolyoza özgü egzersizler (örn. Schroth yaklaşımı): Duruş farkındalığı ve gövde dengesi için kullanılır.',
          'Korse: Büyümesi süren ve orta dereceli eğriliği olan gençlerde, eğriliğin ilerlemesini yavaşlatmak amacıyla değerlendirilir.',
          'Cerrahi: İleri derecede ve ilerleyen eğriliklerde gündeme gelebilir.',
        ],
      },
      {
        h2: 'Erken tanının önemi',
        body: [
          'Skolyozda erken tanı, özellikle büyüme çağındaki çocuklarda tedavi seçeneklerini genişletir. Büyüme döneminde yakalanan eğriliklerde, ilerlemeyi yavaşlatmaya yönelik yaklaşımlar daha etkili olabilir. Bu nedenle çocuklarda ve ergenlerde duruş asimetrisi fark edildiğinde bir uzmana başvurmak önemlidir.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Skolyoz egzersizle düzelir mi?',
        a: 'Skolyoza özgü egzersizler duruş farkındalığını, gövde dengesini ve kas kontrolünü destekler; büyüme çağında ve uygun vakalarda tedavi planının parçasıdır. Ancak egzersizin katkısı eğriliğin derecesine ve kişinin durumuna göre değişir ve bir uzman tarafından planlanmalıdır.',
      },
      {
        q: 'Kaç derece skolyoz ciddidir?',
        a: 'Eğrilik Cobb açısı ile ölçülür. 10 dereceden büyük eğrilikler skolyoz kabul edilir; genel olarak açı arttıkça ve büyüme sürüyorsa yakın takip ve tedavi gereksinimi artar. Kesin değerlendirme kişinin yaşı ve büyüme durumu ile birlikte yapılır.',
      },
      {
        q: 'Skolyoz kalıtsal mıdır?',
        a: 'En sık görülen idiyopatik skolyozda ailesel yatkınlık rol oynayabilir, ancak tek bir kesin neden yoktur. Ailesinde skolyoz olan çocuklarda duruşun takip edilmesi yararlıdır.',
      },
      {
        q: 'Skolyoz ağrı yapar mı?',
        a: 'Ergenlerde skolyoz çoğu zaman ağrısızdır ve önce duruş asimetrisiyle fark edilir. Erişkinlerde, özellikle dejeneratif skolyozda ise bel ağrısı ve yorgunluk eşlik edebilir.',
      },
    ],
    related: [
      { to: '/bel-fitigi', label: 'Bel Fıtığı' },
      { to: '/boyun-fitigi', label: 'Boyun Fıtığı' },
      ...RELATED_COMMON,
    ],
  },
};

export const PILLAR_SLUGS = Object.keys(PILLARS);
