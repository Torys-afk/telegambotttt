# Sünger Bob Koşusu - Bikini Bottom Runner

Subway Surfers tarzı, Sünger Bob temalı 3D Android sonsuz koşu oyunu.

## Özellikler

- **3 Şeritli Koşu Mekaniği** - Sola/sağa kaydırarak şerit değiştirme
- **Zıplama & Kayma** - Yukarı kaydırarak zıplama, aşağı kaydırarak kayma
- **Engel Sistemi** - Uzun (kaçın), kısa (üzerinden atla), geniş (altından kay)
- **Para Toplama** - Yıldız paraları topla, skor kas
- **Zorluk Artışı** - Zamanla hız artar, engeller sıklaşır
- **Modern 3D Grafikler** - URP (Universal Render Pipeline) ile hazır

## Gereksinimler

- Unity Hub & Unity 2022.3 LTS (veya üzeri)
- Android Build Support modülü (Android için build almak için)

## Kurulum Adımları

### 1. Projeyi Unity'de Açma

```bash
# Bu proje klasörünü Unity Hub'da aç:
# Unity Hub → Projects → Add → Bu klasörü seç
```

### 2. Sahneyi Oluşturma

1. Unity'de projeyi açın
2. Üst menüden **Bikini Bottom Runner → Oyun Sahnesi Oluştur** seçeneğine tıklayın
3. Açılan pencerede **Sahneyi Oluştur** butonuna basın
4. Tüm oyun nesneleri otomatik oluşturulacak

### 3. 3D Modelleri Yükleme (Opsiyonel - Ama Önerilir)

Yer tutucu küp/küreler yerine gerçek Sünger Bob modelleri eklemek için:

1. **Karakter Modeli**: Sünger Bob karakter modelini (FBX/GLB) `Assets/Models/` klasörüne atın
2. **Çevre Modelleri**: Denizanası, mercan, kaya gibi engel modellerini ekleyin
3. **Malzemeler**: URP Malzemeleri oluşturun ve parlak, canlı renkler kullanın

**Önerilen Tema**:
- Zemin: Deniz tabanı (kumlu, açık kahverengi)
- Karakter: Sünger Bob (sarı kare, kahverengi pantolon)
- Engeller: Denizanaları (mor), Mercanlar (pembe/turuncu)
- Paralar: Yıldız paraları veya inci (altın sarısı)
- Güçlendirmeler: Baloncuk (mavi), Ağ (yeşil)

### 4. Android Build Alma

```
File → Build Settings → Android → Switch Platform
Player Settings → Other Settings → Minimum API Level: 26
File → Build (APK oluştur)
```

Bluestacks gibi emülatörlerde çalıştırmak için APK'yı emülatöre sürükleyip bırakın.

## Oyun Mekaniği

| Hareket | Kontrol |
|---------|---------|
| Şerit Değiştirme | Sola/Sağa Kaydırma |
| Zıplama | Yukarı Kaydırma |
| Kayma | Aşağı Kaydırma |

**Editor'de Test**: Mouse ile tıklayıp sürükleyerek kaydırma yapabilirsiniz.

## Proje Yapısı

```
Assets/
├── Scripts/
│   ├── Core/          # GameManager, ScoreManager, UIManager
│   ├── Player/        # PlayerController, SwipeInput, PlayerAnimations
│   ├── Environment/   # LaneSystem, GroundTile, TileSpawner
│   ├── Obstacles/     # ObstacleSpawner, Obstacle
│   ├── Collectibles/  # CoinSpawner, Coin
│   ├── Camera/        # CameraFollow
│   └── Editor/        # GameSetupEditor (otomatik sahne kurulumu)
├── Materials/
├── Prefabs/
├── Scenes/
└── Resources/
```

## Özel Teşekkür

- **Subway Surfers** (oyun mekaniği ilhamı)
- **SpongeBob SquarePants** (tema ilhamı)
- **Unity Technologies** (Unity oyun motoru)
