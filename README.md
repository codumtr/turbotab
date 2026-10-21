<div align="center">

# ⚡ TurboTab

### Ultra Hızlı Tarayıcı & Sekme Hızlandırıcı
**0ms Prerender Motoru • Akıllı RAM Temizleyici • Donanım Hızlandırma**

Geliştirici ve Destek: **[codum.tr](https://codum.tr)**

<br/>

[![Geliştirici: codum.tr](https://img.shields.io/badge/Geli%C5%9Ftirici-codum.tr-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://codum.tr)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge)](#)
[![Chromium](https://img.shields.io/badge/Chromium-Chrome%20%7C%20Brave%20%7C%20Edge%20%7C%20Opera-informational?style=for-the-badge)](#)
[![Version](https://img.shields.io/badge/S%C3%BCr%C3%BCm-2.0.0-orange?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/Lisans-MIT-green?style=for-the-badge)](#)

<p align="center">
  <a href="#-kurulum-ve-tarayıcıya-ekleme-adım-adım">📥 Kurulum Rehberi</a> •
  <a href="#-temel-özellikler">⚡ Özellikler</a> •
  <a href="#-codumtr-hakkında">🌐 codum.tr</a> •
  <a href="#-sorun-giderme-faq">🛠️ SSS</a> •
  <a href="#-english-quick-start">🌍 English</a>
</p>

---

</div>

## 📖 TurboTab Nedir?

**TurboTab**, Chromium tabanlı web tarayıcılarında sayfa açılış gecikmelerini sıfıra indirmek, gereksiz bellek (RAM) tüketimini önlemek ve internet deneyiminizi hızlandırmak için **[codum.tr](https://codum.tr)** tarafından geliştirilmiş yeni nesil bir tarayıcı uzantısıdır.

Geleneksel uzantıların aksine, Chromium motorunun en gelişmiş yerel API'lerini (`Speculation Rules API`, `chrome.privacy`, `content-visibility`, `declarativeNetRequest`, `tabs.discard`) doğrudan kullanarak:
* Siz linke fareyi götürdüğünüz veya tıkladığınız ilk milisaniyede hedef sayfayı arka planda gizlice belleğe render eder.
* Linke bastığınız anda sayfa bekleme yapmadan **0 milisaniyede (anında)** ekrana gelir.
* Kullanılmayan arka plan sekmelerini uyutarak bilgisayarınızın RAM ve CPU gücünü aktif sekmeye odaklar.

---

## 📥 Kurulum ve Tarayıcıya Ekleme (Adım Adım)

TurboTab'ı tarayıcınıza yüklemek yalnızca **1 dakikanızı** alır. Kurulum için aşağıdaki adımları takip edin:

### 1. Adım: Dosyaları İndirin

* **Kolay Yöntem (ZIP):**
  1. Bu GitHub sayfasında sağ üstteki yeşil **`<> Code`** butonuna tıklayın.
  2. Açılan menüden **`Download ZIP`** seçeneğini seçin.
  3. İndirilen ZIP dosyasını klasöre çıkartın (*Sağ tık -> Tümünü Ayıkla*).

* **Geliştirici Yöntemi (Git Clone):**
  ```bash
  git clone https://github.com/codumtr/turbotab.git
  ```

---

### 2. Adım: Tarayıcınızın Uzantılar Sayfasına Gidin

Kullandığınız tarayıcının adres satırına uygun adresi yazıp **Enter**'a basın:

| Tarayıcı | Adres Satırına Yazılacak Bağlantı |
| :--- | :--- |
| **Google Chrome** | `chrome://extensions` |
| **Brave Browser** | `brave://extensions` |
| **Microsoft Edge** | `edge://extensions` |
| **Opera / Opera GX** | `opera://extensions` |
| **Vivaldi** | `vivaldi://extensions` |

---

### 3. Adım: Geliştirici Modunu Açın

* Açılan sayfanın sağ üst köşesinde bulunan **"Geliştirici modu" (Developer mode)** anahtarını açık konuma getirin.

---

### 4. Adım: TurboTab Klasörünü Seçin

1. Sol üst köşede görünen **"Paketlenmemiş öğe yükle"** *(Load unpacked)* butonuna tıklayın.
2. Açılan dosya seçim penceresinde, ZIP'ten çıkarttığınız klasörü (içerisinde `manifest.json` dosyasının bulunduğu ana dizini) seçin.
3. **"Klasör Seç"** butonuna basın.

🎉 **Tebrikler!** TurboTab başarıyla tarayıcınıza kuruldu ve anında hızlandırmaya başladı.

---

### 5. Adım: Araç Çubuğuna Sabitleyin

1. Tarayıcının sağ üstündeki **Uzantılar (Yapboz parçası 🧩)** simgesine tıklayın.
2. **TurboTab**'ın yanındaki **Raptiye (Pin 📌)** simgesine basarak simgeyi araç çubuğunuza sabitleyin.
3. Simgeye tıklayarak canlı performans verilerinizi görebilir, tek tıkla **Turbo Boost (RAM Temizliği)** yapabilir ve ayarlarınızı kişiselleştirebilirsiniz.

---

## ⚡ Temel Özellikler

### 1. 🚀 0ms Speculative Prerender Engine
Linklerin üzerine fareyle gelindiğinde veya dokunulduğu anda (`pointerdown` & `touchstart`) Chromium motoru hedef sayfayı görünmez bir arka plan belleğinde tam olarak render eder (DOM ağacı, CSS hesaplaması ve JavaScript motoru çalıştırılır). Tıkladığınızda sayfa yüklenmeyi beklemez, ekrana anında yansır.

### 2. 🧹 Tek Tıkla Turbo Boost & Akıllı RAM Uyutucu
Arka planda açık kalan ve kullanılmayan sekmeler belleğinizi tüketir. TurboTab, boştaki sekmeleri güvenli bir şekilde dondurur ve gigabaytlarca RAM'i serbest bırakır. Dondurulan sekmeye tıkladığınızda kaldığı yerden anında devam eder.

### 3. 🖼️ DOM Layout Virtualization & Lazy Loading
Ağır web sitelerinde sayfanın en altında kalan yorumlar, yan sütunlar ve onlarca görsel ilk açılışta gereksiz yere hesaplanmaz (`content-visibility: auto`). Yalnızca ekranda görünen alanlar önceliklendirilir; sayfa 3-4 kat daha hızlı ekrana düşer.

### 4. 🛡️ 20+ Ağır İzleyici ve Telemetri Kalkanı
Google Analytics, Yandex Metrika, Hotjar, TikTok Pixel, Facebook Pixel gibi tarayıcınızı yavaşlatan ve işlemciyi meşgul eden telemetri kodları Chromium ağ katmanında (`declarativeNetRequest`) kesilir.

### 5. 🌐 Donanım Seviyesi Ağ & DNS Hızlandırma
Chromium'un yerleşik ağ tahmin mekanizması en agresif moda getirilir. Ekranda görünen harici sunucularla DNS ve TCP bağlantıları önceden kurulur.

---

## 🌐 codum.tr Hakkında

**[codum.tr](https://codum.tr)**, modern web teknolojileri, yüksek performanslı yazılım mimarileri ve açık kaynak topluluk projeleri üreten teknoloji odaklı bir geliştirici platformudur.

* 🌍 **Web Sitemiz:** [https://codum.tr](https://codum.tr)
* 💡 **Hizmetlerimiz:** Web Geliştirme, API Tasarımı, Tarayıcı Uzantıları, Performans Optimizasyonu ve Özel Yazılım Çözümleri
* 📬 **İletişim & İş Birliği:** [codum.tr](https://codum.tr) üzerinden bizimle dilediğiniz zaman iletişime geçebilirsiniz.

---

## 🛠️ Sorun Giderme (FAQ)

<details>
<summary><b>❓ "Manifest dosyası eksik veya bozuk" hatası alıyorum</b></summary>
<br>
Klasör seçerken ZIP'ten çıkarttığınız klasörün en dışını değil, doğrudan <code>manifest.json</code>, <code>background.js</code> ve <code>content.js</code> dosyalarının yer aldığı klasörü seçtiğinizden emin olun.
</details>

<details>
<summary><b>❓ Belirli bir sitenin (örn. WhatsApp Web, YouTube) asla uyutulmasını istemiyorum</b></summary>
<br>
O sitedeyken TurboTab uzantı simgesine tıklayın ve <b>"Bu Siteyi Korumaya Al"</b> butonuna basın. Site koruma listesine eklenir ve arka planda kalsa dahi asla dondurulmaz.
</details>

<details>
<summary><b>❓ Güncellemeleri nasıl alırım?</b></summary>
<br>
Yeni bir sürüm indirdiğinizde veya kodları güncellediğinizde <code>chrome://extensions</code> sayfasına gidip TurboTab kartındaki <b>Yenile (Dönen ok 🔄)</b> butonuna basmanız yeterlidir.
</details>

---

## 🌍 English Quick Start

**TurboTab** is a modern Chromium browser extension designed by **[codum.tr](https://codum.tr)** to eliminate tab opening delays and reduce memory footprint using the latest Speculation Rules API and Chromium internals.

1. **Download:** Click on `Code -> Download ZIP` and extract it to a folder.
2. **Open Extensions:** Navigate to `chrome://extensions` in your browser.
3. **Enable Developer Mode:** Toggle **Developer mode** in the top-right corner.
4. **Load Unpacked:** Click **Load unpacked** and select the folder containing `manifest.json`.
5. **Visit codum.tr:** Check out [https://codum.tr](https://codum.tr) for more cutting-edge tools and software solutions!

---

## 📄 Lisans

Bu proje [MIT](LICENSE) lisansı altında korunmaktadır. Ticari ve kişisel projelerinizde özgürce kullanabilir, çatallayabilir ve katkıda bulunabilirsiniz.

<div align="center">
  <sub>❤️ <b><a href="https://codum.tr">codum.tr</a></b> ekibi tarafından geliştirilmiştir.</sub>
</div>
