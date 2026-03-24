// Seed data for Omurgam platform

import { usersStorage, videosStorage, blogStorage, questionsStorage, termsStorage, setInitialized, isInitialized } from './storage';

export const seedData = () => {
  // Check if already initialized
  if (isInitialized()) {
    console.log('✅ Data already seeded');
    return;
  }

  console.log('🌱 Seeding initial data...');

  // 1. Create admin users
  const adminUsers = [
    {
      id: 'admin-defne',
      email: 'defne.kayautlu@omurgam.com',
      password: 'defne123', // In real app, this would be hashed
      name: 'Prof. Dr. Defne Kaya Utlu',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'admin-dorukhan',
      email: 'dorukhan.sayim@omurgam.com',
      password: 'dorukhan123',
      name: 'Dorukhan Sayım',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  adminUsers.forEach(user => usersStorage.add(user));
  console.log('✅ Admin users created:', adminUsers.length);

  // 2. Create sample videos
  const sampleVideos = [
    {
      id: 'video-1',
      title: 'Boyun Egzersizleri - Temel Seviye',
      description: 'Boyun ağrılarını önlemek için günlük yapabileceğiniz basit egzersizler',
      category: 'Boyun',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
      duration: '12:34',
      views: 1245,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'video-2',
      title: 'Bel Sağlığı İçin 5 Altın Kural',
      description: 'Bel fıtığından korunmak için mutlaka bilmeniz gerekenler',
      category: 'Bel',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
      duration: '15:20',
      views: 2103,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'video-3',
      title: 'Skolyoz Egzersizleri',
      description: 'Skolyoz hastalarına özel omurga sağlığı egzersizleri',
      category: 'Skolyoz',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
      duration: '18:45',
      views: 987,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  sampleVideos.forEach(video => videosStorage.add(video));
  console.log('✅ Sample videos created:', sampleVideos.length);

  // 3. Create sample blog posts
  const samplePosts = [
    {
      id: 'blog-1',
      title: 'Doğru Oturuş Pozisyonu Nasıl Olmalı?',
      excerpt: 'Günümüzde masa başında geçirdiğimiz uzun saatler, omurga sağlığımızı olumsuz etkiliyor...',
      content: '<p>Günümüzde masa başında geçirdiğimiz uzun saatler, omurga sağlığımızı olumsuz etkiliyor. Doğru oturuş pozisyonu için dikkat edilmesi gerekenler:</p><ul><li>Ayaklarınız yere tam basmalı</li><li>Sırtınız sandalyeye yaslanmalı</li><li>Ekran göz hizasında olmalı</li></ul>',
      category: 'Egzersiz',
      imageUrl: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800',
      published: true,
      views: 3421,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'blog-2',
      title: 'Bel Fıtığı Belirtileri Nelerdir?',
      excerpt: 'Bel fıtığı, omurga sağlığını etkileyen en yaygın sorunlardan biridir...',
      content: '<p>Bel fıtığı belirtileri şunlardır:</p><ul><li>Bel ve bacakta ağrı</li><li>Uyuşma ve karıncalanma</li><li>Hareket kısıtlılığı</li></ul><p>Bu belirtileri fark ettiğinizde mutlaka bir uzmana danışmalısınız.</p>',
      category: 'Sağlık',
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      published: true,
      views: 2891,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  samplePosts.forEach(post => blogStorage.add(post));
  console.log('✅ Sample blog posts created:', samplePosts.length);

  // 4. Create sample questions
  const sampleQuestions = [
    {
      id: 'question-1',
      userId: 'user-1',
      user: 'Ayşe Yılmaz',
      avatar: 'https://ui-avatars.com/api/?name=Ayse+Yilmaz',
      question: 'Bel fıtığı ameliyatı sonrası ne kadar sürede normale dönebilirim?',
      excerpt: 'Ameliyat oldum, normal hayata dönüş süreci hakkında bilgi almak istiyorum...',
      category: 'Bel',
      answers: 3,
      likes: 12,
      isAnswered: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timeAgo: '2 gün önce',
    },
    {
      id: 'question-2',
      userId: 'user-2',
      user: 'Mehmet Kaya',
      avatar: 'https://ui-avatars.com/api/?name=Mehmet+Kaya',
      question: 'Boyun düzleşmesi için hangi egzersizleri yapmalıyım?',
      excerpt: 'MR raporumda boyun düzleşmesi tespit edildi, öneriler almak istiyorum...',
      category: 'Boyun',
      answers: 5,
      likes: 8,
      isAnswered: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      timeAgo: '5 gün önce',
    },
    {
      id: 'question-3',
      userId: 'user-3',
      user: 'Zeynep Demir',
      avatar: 'https://ui-avatars.com/api/?name=Zeynep+Demir',
      question: 'Skolyoz tedavisi için fizyoterapi yeterli mi?',
      excerpt: '17 derece skolyozum var, hangi tedavi yöntemini önerirsiniz?',
      category: 'Skolyoz',
      answers: 2,
      likes: 15,
      isAnswered: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      timeAgo: '1 gün önce',
    },
  ];

  sampleQuestions.forEach(question => questionsStorage.add(question));
  console.log('✅ Sample questions created:', sampleQuestions.length);

  // 5. Create MR terms dictionary
  const mrTerms = [
    {
      id: 'term-1',
      term: 'Herniye Disk',
      category: 'Genel',
      definition: 'Omurlar arasındaki yumuşak diskin dışarıya doğru çıkması durumudur. Genellikle bel veya boyun bölgesinde görülür.',
      relatedTerms: ['Disk Protrüzyonu', 'Bel Fıtığı', 'Sinir Basısı'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'term-2',
      term: 'Disk Protrüzyonu',
      category: 'Genel',
      definition: 'Diskin dış tabakasının zayıflaması ve içteki jelatinsi yapının dışa doğru baskı yapması durumudur. Herniye olmamış ancak şişkinlik gösteren disk durumudur.',
      relatedTerms: ['Herniye Disk', 'Disk Dejenerasyonu'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'term-3',
      term: 'Spinal Stenoz',
      category: 'Genel',
      definition: 'Omuriliğin geçtiği kanal içinde daralmalar olması durumudur. Yaşlanmayla birlikte kemik ve bağ dokusunun kalınlaşması sonucu oluşur.',
      relatedTerms: ['Sinir Basısı', 'Foraminal Stenoz'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'term-4',
      term: 'Lordoz',
      category: 'Bel',
      definition: 'Omurganın öne doğru normal eğriliğidir. Boyun ve bel bölgelerinde görülür. Aşırı lordoz veya lordoz kaybı problemlere yol açabilir.',
      relatedTerms: ['Kifoz', 'Skolyoz'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'term-5',
      term: 'Kifoz',
      category: 'Sırt',
      definition: 'Omurganın arkaya doğru eğriliğidir. Göğüs bölgesinde normaldir, ancak aşırı kifoz (kamburlaşma) sorun oluşturabilir.',
      relatedTerms: ['Lordoz', 'Postür Bozukluğu'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'term-6',
      term: 'Skolyoz',
      category: 'Skolyoz',
      definition: 'Omurganın yan tarafa eğriliğidir. S veya C şeklinde eğrilik gösterebilir. Genellikle çocukluk ve ergenlik döneminde ortaya çıkar.',
      relatedTerms: ['Kifoz', 'Lordoz', 'Postür Bozukluğu'],
      createdAt: new Date().toISOString(),
    },
  ];

  mrTerms.forEach(term => termsStorage.add(term));
  console.log('✅ MR terms created:', mrTerms.length);

  // Mark as initialized
  setInitialized();
  console.log('🎉 Seed data completed!');
};

// Reset function for development
export const resetData = () => {
  localStorage.clear();
  console.log('🔥 All data cleared!');
};
