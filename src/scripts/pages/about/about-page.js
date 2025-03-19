export default class AboutPage {
  async render() {
    return `
      <section class="about-page container">
        <h1 class="about-title">About StoryApp</h1>
        
        <div class="about-content">
          <div class="app-description">
            <h2>Selamat Datang di StoryApp</h2>
            <p>StoryApp adalah platform berbagi cerita dan pengalaman untuk komunitas Dicoding. Aplikasi ini dibuat sebagai submission untuk kelas Dicoding "Menjadi Front-End Web Developer Expert".</p>
            
            <p>Dengan StoryApp, Anda dapat:</p>
            <ul>
              <li>Berbagi cerita dan pengalaman Anda dengan foto</li>
              <li>Menambahkan lokasi pada cerita Anda</li>
              <li>Melihat cerita dari pengguna lain</li>
              <li>Melihat lokasi cerita pada peta</li>
            </ul>
          </div>
          
          <div class="tech-stack">
            <h2>Teknologi yang Digunakan</h2>
            <ul>
              <li>HTML, CSS, dan JavaScript</li>
              <li>Single Page Application dengan teknik hash routing</li>
              <li>Model-View-Presenter (MVP) pattern</li>
              <li>Leaflet.js untuk integrasi peta</li>
              <li>Web Camera API untuk pengambilan gambar</li>
              <li>View Transition API untuk transisi halaman yang halus</li>
              <li>Service Worker dan Workbox untuk offline experience</li>
            </ul>
          </div>
          
         
    `;
  }

  async afterRender() {
    // Add any interactivity or additional functionality here if needed
    document.title = 'About StoryApp';
  }
}