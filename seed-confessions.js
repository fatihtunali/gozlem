const confessions = [
  // İtiraf kategorisi
  { content: "Bazen herkes uyuduktan sonra buzdolabını açıp karanlıkta yemek yiyorum. Kimse bilmiyor.", category: "itiraf" },
  { content: "İşyerinde tuvalete gidiyorum diye çıkıp 15 dakika telefonuma bakıyorum her gün.", category: "itiraf" },
  { content: "Annemin yemeklerini beğenmiyorum ama her seferinde çok güzel olmuş diyorum.", category: "itiraf" },
  { content: "Üniversite diplomamı duvara asmadım çünkü utanıyorum. Hiç bir işe yaramadı.", category: "itiraf" },
  { content: "Sosyal medyada mutlu görünüyorum ama aslında çok yalnızım.", category: "itiraf" },
  { content: "Arabada tek başımayken şarkılara bağıra bağıra eşlik ediyorum.", category: "itiraf" },
  { content: "Bazen hasta numarası yapıp işten kaçıyorum sadece evde oturmak için.", category: "itiraf" },
  { content: "30 yaşındayım ve hala karanlıktan korkuyorum. Gece lambası olmadan uyuyamıyorum.", category: "itiraf" },
  { content: "Kedimle konuşuyorum ve o beni herkesten daha iyi anlıyor.", category: "itiraf" },
  { content: "Toplum içinde gülümserken içimde ağlamak istiyorum çoğu zaman.", category: "itiraf" },
  { content: "Hiçbir hobim yok ve bu beni çok üzüyor. Sadece var olmaya çalışıyorum.", category: "itiraf" },

  // Aşk kategorisi
  { content: "5 yıldır aynı kişiye aşığım ama hiç söylemedim. Artık evli ve çocuğu var.", category: "ask" },
  { content: "Eski sevgilimi hala sosyal medyadan takip ediyorum sahte hesapla.", category: "ask" },
  { content: "Hiç kimseyi sevmedim aslında. Sadece yalnız kalmamak için ilişkiye girdim.", category: "ask" },
  { content: "En yakın arkadaşımın sevgilisine aşığım. Kendimden nefret ediyorum.", category: "ask" },
  { content: "Birinden hoşlandığımda tamamen aptal gibi davranıyorum. Kontrol edemiyorum.", category: "ask" },
  { content: "Evliliğim mutlu değil ama çocuklarım için devam ediyorum.", category: "ask" },
  { content: "İlk aşkımı unutamıyorum. 10 yıl geçti hala rüyalarıma giriyor.", category: "ask" },
  { content: "Sevilmeyi hak etmediğimi düşünüyorum. Biri beni sevince uzaklaşıyorum.", category: "ask" },
  { content: "Eski mesajları tekrar tekrar okuyorum. Bitirmiş olduğum ilişkilerin.", category: "ask" },

  // Korku kategorisi
  { content: "Anne babamın yaşlanıyor olması beni çok korkutuyor. Bu düşünceyle uyuyamıyorum bazen.", category: "korku" },
  { content: "Sıradan bir hayat yaşayıp hiçbir iz bırakmadan öleceğimden korkuyorum.", category: "korku" },
  { content: "İnsanların beni aslında sevmediğini, sadece rol yaptıklarını düşünüyorum.", category: "korku" },
  { content: "Başarılı olamayacağımdan o kadar korkuyorum ki başlayamıyorum bile.", category: "korku" },
  { content: "Telefon çalarsa kötü haber gelecek diye her seferinde kalbim çok hızlı atıyor.", category: "korku" },
  { content: "Yalnız kalacağımdan korkuyorum. Kimsenin beni gerçekten anlamadığından.", category: "korku" },
  { content: "Hastalık hastalığı var bende. Her ağrım kanser mi diye düşünüyorum.", category: "korku" },
  { content: "Asansörlere binemiyorum. Merdivenlerden çıksam bile kimseye söylemiyorum.", category: "korku" },
  { content: "Kalabalık ortamlarda panik atak geçiriyorum ama kimse farketmiyor.", category: "korku" },

  // Pişmanlık kategorisi
  { content: "Dedemin son günlerinde yanında olmadım. Hala kendimi affetmedim.", category: "pismanlik" },
  { content: "En iyi arkadaşıma yıl önce çok kötü davrandım. Özür dileyemedim hala.", category: "pismanlik" },
  { content: "Üniversiteyi bıraktığım için çok pişmanım. Ailem hala bilmiyor.", category: "pismanlik" },
  { content: "Beni seven insanı başka biri için bıraktım. O başka biri de beni bıraktı.", category: "pismanlik" },
  { content: "Hayallerimin peşinden gitmedim. Güvenli yolu seçtim. Şimdi her gün düşünüyorum.", category: "pismanlik" },
  { content: "Anneme son kez seni seviyorum demedim. Çok ani gitti.", category: "pismanlik" },
  { content: "20 yıllık dostluğumu bir yanlış anlama yüzünden bitirdim. Hala aramadım.", category: "pismanlik" },
  { content: "Gençliğimde çok kibirliydim. Şimdi o dönemde uzaklaştırdığım insanları arıyorum.", category: "pismanlik" },
  { content: "Çocukluğumda yaptığım hataları hala rüyamda görüyorum.", category: "pismanlik" },

  // Umut kategorisi
  { content: "Her şey çok zor ama bir gün her şeyin düzeleceğine inanıyorum. İnanmak zorundayım.", category: "umut" },
  { content: "Depresyondan çıktım. 3 yıl sürmesine rağmen çıkabildim. Siz de çıkabilirsiniz.", category: "umut" },
  { content: "40 yaşında yeni bir dil öğrenmeye başladım. Yaşı geçti diye bir şey yok.", category: "umut" },
  { content: "İflas ettikten 2 yıl sonra kendi işimi kurdum. Bazen kaybetmek lazım.", category: "umut" },
  { content: "En karanlık anlarımda bile içimde küçük bir ışık hep yandı. O ışık beni kurtardı.", category: "umut" },
  { content: "Ömür boyu yalnız kalacağımı düşünüyordum. Bu yıl evleniyorum.", category: "umut" },
  { content: "Hayatımda ilk defa kendimi sevmeye başladım. 35 yıl sürdü ama oldu.", category: "umut" },
  { content: "Bir yıl önce sokaklardaydım. Şimdi küçük de olsa bir evim var. Her şey değişebilir.", category: "umut" },
  { content: "Bu sene ilk defa spor yapmaya başladım ve hayatım değişti.", category: "umut" },

  // Sır kategorisi
  { content: "Ailem zengin sanıyorlar ama çok borcum var. Görüntü için yaşıyorum.", category: "sir" },
  { content: "İş toplantılarına katılıyormuş gibi yapıp kahvede oturuyorum bazen.", category: "sir" },
  { content: "Herkesin hayran olduğu kariyerimden nefret ediyorum. İstifa etmek istiyorum.", category: "sir" },
  { content: "Mutlu evliliği oynuyoruz ama ayrı odalarda uyuyoruz 3 yıldır.", category: "sir" },
  { content: "Doktor olduğum halde alternatif tıbba inanıyorum. Meslektaşlarım duysa linç ederler.", category: "sir" },
  { content: "Her hafta psikoloğa gidiyorum. Ailem tatile gittiğimi sanıyor.", category: "sir" },
  { content: "Yaşadığım şehirden nefret ediyorum ama gidecek cesaretim yok.", category: "sir" },
  { content: "En yakın arkadaşımın sırlarını günlüğüme yazıyorum. Kimse bilmiyor.", category: "sir" },
  { content: "Kimse bilmiyor ama şiir yazıyorum. Bir gün kitap çıkarmak istiyorum.", category: "sir" },

  // Ek itiraflar - karışık
  { content: "Aslında hiç kahve sevmiyorum ama herkes içtiği için içiyorum.", category: "itiraf" },
  { content: "Toplantılarda not alıyormuş gibi yapıp karalama yapıyorum.", category: "itiraf" },
  { content: "İlk buluşmada hep aynı gömleği giyiyorum. Şanslı gömleğim.", category: "sir" },
  { content: "Hafta sonları hiç kimseyle konuşmadan geçirebiliyorum. Ve özlemiyorum.", category: "itiraf" },
  { content: "Başkalarının mutsuzluğunu duyunca kendi hayatımın iyi olduğunu hissediyorum.", category: "itiraf" },
  { content: "Tanımadığım insanların hikayelerini sosyal medyada okuyup ağlıyorum.", category: "itiraf" },
  { content: "35 yaşındayım ve hala ne yapmak istediğimi bilmiyorum.", category: "korku" },
  { content: "Terapiye başladım ve hayatımın en iyi kararıydı. Herkes denemeli.", category: "umut" },
];

async function seedConfessions() {
  const API = 'http://localhost:4002/api/truths';
  let successCount = 0;
  let failCount = 0;

  for (const confession of confessions) {
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confession)
      });

      if (response.ok) {
        successCount++;
        console.log(`✓ Added: ${confession.content.substring(0, 40)}...`);
      } else {
        failCount++;
        const error = await response.text();
        console.log(`✗ Failed: ${confession.content.substring(0, 40)}... - ${error}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      failCount++;
      console.log(`✗ Error: ${confession.content.substring(0, 40)}... - ${error.message}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${confessions.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

seedConfessions();
