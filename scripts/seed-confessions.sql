-- Seed confessions with realistic Turkish content
-- Categories: itiraf, ask, korku, pismanlik, umut, sir

-- İTİRAF kategorisi
INSERT INTO truths (content, category, me_too_count, hug_count, created_at) VALUES
('Isyerinde herkes beni cok basarili zannediyor ama aslinda her gun imposter sendromu yasiyorum. Bir gun yakalanacagimdan korkuyorum.', 'itiraf', 247, 189, NOW() - INTERVAL '3 days'),
('Annemle babamin evliliginin benim yuzumden bozuldugunu dusunuyorum. Kavgalari hep benimle ilgiliydi.', 'itiraf', 156, 234, NOW() - INTERVAL '5 days'),
('30 yasindayim ve hala yuzme bilmiyorum. Tatilde arkdaslarima soylemeye utaniyorum.', 'itiraf', 89, 45, NOW() - INTERVAL '2 days'),
('Universite diplomami sahte yollarla aldim. 8 yildir bu sirla yasiyorum.', 'itiraf', 67, 23, NOW() - INTERVAL '7 days'),
('En yakin arkadasimin sevgilisiyle flortlestim. Hic bir sey olmadi ama sucluluk duygusu icimi kemiriyor.', 'itiraf', 134, 67, NOW() - INTERVAL '1 day'),
('Evliyim ama esimi hic sevmedim. Aileler istedi diye evlendik.', 'itiraf', 312, 278, NOW() - INTERVAL '4 days'),
('Cocuklugumda mahalledeki kedilere kotu davranirdim. Simdi hayvan haklari savunucusuyum ama o gunleri unutamiyorum.', 'itiraf', 78, 112, NOW() - INTERVAL '6 days'),
('Issizim ama aileme her gun ise gidiyormus gibi yapiyorum. Kahvelerde oturup is basvurusu yapiyorum.', 'itiraf', 445, 567, NOW() - INTERVAL '2 days'),
('Kardesimin basarisini kiskandim ve onun onemli bir sinavda basarisiz olmasina sevindim.', 'itiraf', 123, 89, NOW() - INTERVAL '8 days'),
('Sosyal medyada mutlu gorunuyorum ama gercekte son 2 yildir depresyondayim.', 'itiraf', 567, 445, NOW() - INTERVAL '1 day'),

-- AŞK kategorisi
('5 yil birlikte oldugum kisiye hala asigim ama o mutlu bir evlilik yapti. Her gun Instagram''ini kontrol ediyorum.', 'ask', 234, 312, NOW() - INTERVAL '3 days'),
('Esimle ayni yatakta yatiyoruz ama 2 yildir birbirimize dokunmadik.', 'ask', 189, 267, NOW() - INTERVAL '5 days'),
('Patronuma asik oldum. Evli ve 2 cocugu var. Bu duyguyla bas edemiyorum.', 'ask', 156, 134, NOW() - INTERVAL '2 days'),
('Ilk askimi unutamiyorum. 15 yil oldu, evlendim, cocugum oldu ama hala onu dusunuyorum.', 'ask', 278, 234, NOW() - INTERVAL '4 days'),
('Erkek arkadasim beni aldatti ama ayrilamiyorum. Yalniz kalmaktan cok korkuyorum.', 'ask', 345, 423, NOW() - INTERVAL '1 day'),
('Gay oldugumu biliyorum ama ailem cok muhafazakar. Hayatim boyunca saklamak zorunda kalacagim.', 'ask', 456, 534, NOW() - INTERVAL '6 days'),
('Sevgilimle 7 yildir birlikteyiz ama evlilik teklif etmiyorum cunku emin degilim.', 'ask', 123, 89, NOW() - INTERVAL '3 days'),
('Eski sevgilimin dugunune gittim ve tum gece agladim. Kimse fark etmedi.', 'ask', 267, 312, NOW() - INTERVAL '7 days'),
('Karimi seviyorum ama baska birine de asik oldum. Ikisinden de vazgecemiyorum.', 'ask', 178, 145, NOW() - INTERVAL '2 days'),
('Hic sevilmedim. 35 yasindayim ve kimse bana asik olmadi.', 'ask', 389, 478, NOW() - INTERVAL '4 days'),

-- KORKU kategorisi
('Gece karanlikta yalniz kalamiyorum. 28 yasindayim ve hala isik acik uyuyorum.', 'korku', 234, 123, NOW() - INTERVAL '3 days'),
('Olumden degil, olmeden once herkese yuk olmaktan korkuyorum.', 'korku', 456, 345, NOW() - INTERVAL '2 days'),
('Anne babamin olecegi gunu dusununce panik atak geciriyorum.', 'korku', 345, 423, NOW() - INTERVAL '5 days'),
('Asansorlere binemiyorum. 15 kati merdivenlerden cikmak zorunda kaliyorum.', 'korku', 167, 89, NOW() - INTERVAL '4 days'),
('Basarisiz olacagimdan o kadar korkuyorum ki hic bir seye baslayamiyorum.', 'korku', 389, 267, NOW() - INTERVAL '1 day'),
('Herkesin beni gizlice yargiladigindan eminim. Paranoyak olabilir miyim?', 'korku', 234, 189, NOW() - INTERVAL '6 days'),
('Cocuk sahibi olmaktan korkuyorum. Ya kotu bir anne olursam?', 'korku', 289, 234, NOW() - INTERVAL '3 days'),
('Ucaga binmekten o kadar korkuyorum ki 10 yildir tatile gidemedim.', 'korku', 178, 134, NOW() - INTERVAL '7 days'),
('Telefon calmasi beni korkutuyor. Mesaj bile atarim, aramam.', 'korku', 312, 156, NOW() - INTERVAL '2 days'),
('Yalniz yaslanmaktan korkuyorum. Kimsenin olmadigi bir yaslilik...', 'korku', 423, 389, NOW() - INTERVAL '4 days'),

-- PİŞMANLIK kategorisi
('Dedemin son gunlerinde yaninda olamadim. Is yogunlugu diye gidemedim. Hic affetmeyecegim kendimi.', 'pismanlik', 345, 456, NOW() - INTERVAL '5 days'),
('Universite secerken ailemin dedigi bolumu sectim. Hayallerimden vazgectim ve hala pismanim.', 'pismanlik', 267, 234, NOW() - INTERVAL '3 days'),
('Eski sevgilime cok kotu davrandim. Simdi ne kadar iyi biri oldugunu anliyorum ama cok gec.', 'pismanlik', 234, 312, NOW() - INTERVAL '2 days'),
('Cocukken kardesime zorbalik yaptim. Simdi o cocuk psikolog tedavisi goruyor.', 'pismanlik', 156, 234, NOW() - INTERVAL '6 days'),
('Arkadasimi zor gununke yalniz biraktim. Sonra kendine zarar verdi. Affedilmeyecek bir sey yaptim.', 'pismanlik', 312, 423, NOW() - INTERVAL '4 days'),
('Annemle son kavgamizda cok kotu seyler soyledim. 1 hafta sonra vefat etti.', 'pismanlik', 478, 567, NOW() - INTERVAL '7 days'),
('Kariyer icin asikimi biraktim. 10 yil oldu, hala mutlu olamadim.', 'pismanlik', 234, 189, NOW() - INTERVAL '1 day'),
('Babamin bana uzattigi eli cevirdim. Simdi hasta ve ben yaninda degilim.', 'pismanlik', 289, 345, NOW() - INTERVAL '3 days'),
('Lisede arkadasimi dedikodu yaparak disladik. Su an ne kadar kotu hissettigimi anlatamam.', 'pismanlik', 178, 223, NOW() - INTERVAL '5 days'),
('Sahte bahaneyle isten cikarildim ama gercek sebep benim hatamdi. Itiraf etmedim.', 'pismanlik', 145, 112, NOW() - INTERVAL '2 days'),

-- UMUT kategorisi
('Kanser tedavisi gordukten sonra hayatin degerini anladim. Her gun mucize gibi.', 'umut', 567, 634, NOW() - INTERVAL '3 days'),
('5 yil depresyondan sonra ilk kez gunesin dogusunu izlerken agladim. Iyilesiyorum.', 'umut', 445, 512, NOW() - INTERVAL '2 days'),
('40 yasinda universitye basladim. Hayaller icin gec degilmis.', 'umut', 389, 423, NOW() - INTERVAL '4 days'),
('Intihari dusunuyordum. Simdi evliyim ve bebegim yolda. Hayat degisebiliyor.', 'umut', 678, 734, NOW() - INTERVAL '1 day'),
('10 yil sonra ablamla baristik. Tek bir mesaj her seyi degistirdi.', 'umut', 312, 356, NOW() - INTERVAL '5 days'),
('Issizlikten sonra kendi isimi kurdum. Simdi 5 kisi calistiriyorum.', 'umut', 423, 389, NOW() - INTERVAL '6 days'),
('Alkol bagimliligini 3 yil once yendim. Her gun kendimle gurur duyuyorum.', 'umut', 534, 478, NOW() - INTERVAL '3 days'),
('Engelli cocugum var ve o bana hayatin anlamini ogretti.', 'umut', 456, 523, NOW() - INTERVAL '7 days'),
('50 yasinda ilk kitabimi yayinladim. Hic vazgecmeyin.', 'umut', 345, 312, NOW() - INTERVAL '2 days'),
('Yillar sonra babamla ilk kez sarilarak agladik. Her sey duzeldi.', 'umut', 489, 534, NOW() - INTERVAL '4 days'),

-- SIR kategorisi
('Ailem zengin saniliyor ama aslinda iflas ettik. Goruntuyu korumaya calisiyoruz.', 'sir', 234, 178, NOW() - INTERVAL '3 days'),
('Esimin eski sevgilisiyle yazistigini biliyorum. Sesimi cikarmiyorum.', 'sir', 312, 234, NOW() - INTERVAL '5 days'),
('Babamin baska bir ailesi oldugunu ogrendim. Anneme soylemedim.', 'sir', 389, 312, NOW() - INTERVAL '2 days'),
('Evlat edindildim ama ailem bana hic soylemedi. DNA testinden ogrendim.', 'sir', 456, 389, NOW() - INTERVAL '4 days'),
('Is yerinde kasa acigi var ve kim yaptigini biliyorum. Sustum.', 'sir', 156, 123, NOW() - INTERVAL '6 days'),
('Kuzenimle yasak bir iliski yasadik. Kimse bilmiyor.', 'sir', 178, 134, NOW() - INTERVAL '7 days'),
('Annemin recetesiz ilac bagimliligini sakliyorum.', 'sir', 234, 267, NOW() - INTERVAL '1 day'),
('Servetimi piyangodan kazandim ama herkese is kurdum dedim.', 'sir', 289, 145, NOW() - INTERVAL '3 days'),
('Cocuklarim benden degil. Esim bilmiyor, babam biliyor.', 'sir', 423, 345, NOW() - INTERVAL '5 days'),
('Komsuumuzun is yerini soyan benim. 15 yil oldu, hic yakalanmadim.', 'sir', 145, 89, NOW() - INTERVAL '8 days'),

-- Ekstra popüler itiraflar
('Bazen her seyi birakip kaybolmak istiyorum. Yeni bir hayat, yeni bir kimlik...', 'itiraf', 678, 534, NOW() - INTERVAL '1 day'),
('Herkesin mutlu gorunduhu bu dunyada ben neden hep disarida hissediyorum?', 'itiraf', 534, 623, NOW() - INTERVAL '2 days'),
('Kimse gercek beni tanimiyor. Herkesin tanidigi kisi bir maske.', 'itiraf', 445, 389, NOW() - INTERVAL '3 days'),
('Bir gun her sey yoluna girecek diye umut ediyorum ama ne zaman?', 'umut', 512, 456, NOW() - INTERVAL '1 day'),
('Yalnizlik beni oldurmuyor, yalnizmis gibi hissetmek olduruyor.', 'itiraf', 623, 567, NOW() - INTERVAL '4 days'),
('Insanlarin beni terk etmesinden o kadar korkuyorum ki hep ben terk ediyorum.', 'korku', 389, 345, NOW() - INTERVAL '2 days'),
('Gecmisi degistiremezsin ama gelecegi yazabilirsin. Buna inaniyorum.', 'umut', 456, 512, NOW() - INTERVAL '5 days'),
('Her gun ayni isi yapiyorum ve hayatin elimden kayip gittigini hissediyorum.', 'itiraf', 567, 489, NOW() - INTERVAL '3 days'),
('Birini gercekten sevmek bu kadar zor olmamali. Neden hep acitiyoruz?', 'ask', 423, 478, NOW() - INTERVAL '1 day'),
('Kendi degerimi baskalarinin bakislarinda ariyorum ve bu beni tukettiriyor.', 'itiraf', 489, 534, NOW() - INTERVAL '2 days');
