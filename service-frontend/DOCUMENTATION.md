# 🎨 Service Frontend - Documentation

## 📋 Overview

Service frontend adalah aplikasi web berbasis React yang menampilkan hasil agregasi data dari API Gateway. Frontend ini menggunakan teknologi modern dengan UI yang menarik dan responsif.

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18 | UI Library |
| **Vite** | 7.1 | Build tool & dev server (fast!) |
| **TypeScript** | Latest | Type safety |
| **Tailwind CSS** | 4.0 | Utility-first CSS framework |
| **Axios** | Latest | HTTP client untuk API calls |
| **Lucide React** | Latest | Beautiful icon set |
| **Nginx** | Alpine | Production web server |

## 🎨 Design System

Frontend menggunakan custom implementation dari shadcn/ui components:
- **Card Components** - Container untuk data sections
- **Badge** - Status indicators (Lunas/Belum Lunas)
- **Button** - Interactive elements
- **Input** - Form controls

### Color Palette

```css
Primary: #3B82F6 (Blue)
Secondary: #EFF6FF (Light Blue)
Success: #10B981 (Green)
Destructive: #EF4444 (Red)
Muted: #6B7280 (Gray)
```

## 📁 Project Structure

```
service-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── card.jsx          # Card components
│   │   │   ├── badge.jsx         # Badge component
│   │   │   ├── button.jsx        # Button component
│   │   │   └── input.jsx         # Input component
│   │   └── WargaProfile.jsx      # Main application component
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind
├── public/                        # Static assets
├── Dockerfile                     # Multi-stage Docker build
├── nginx.conf                     # Nginx configuration
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

## 🚀 Development

### Prerequisites
- Node.js 20+
- npm

### Install Dependencies
```bash
cd service-frontend
npm install
```

### Run Development Server
```bash
npm run dev
```
Access at: **http://localhost:5173**

### Build for Production
```bash
npm run build
```
Output directory: `dist/`

### Preview Production Build
```bash
npm run preview
```

## 🐳 Docker

### Build Image
```bash
docker build -t service-frontend .
```

### Run Container
```bash
docker run -p 8005:80 service-frontend
```

### Multi-stage Build Benefits
1. **Stage 1 (Builder)**: Build React app with Node.js
2. **Stage 2 (Production)**: Serve static files with Nginx
3. **Result**: Small image size (~50MB vs ~1GB)

## 📡 API Integration

### Configuration
```javascript
const API_BASE_URL = 'http://localhost:8080';
const API_KEY = 'demo-api-key-12345';
```

### Main API Call
```javascript
const response = await axios.get(
  `${API_BASE_URL}/api/warga/${nik}/profil`,
  {
    headers: {
      'X-API-Key': API_KEY
    }
  }
);
```

### Response Structure
```json
{
  "success": true,
  "nik": "3201012345678901",
  "timestamp": "2024-10-26T10:30:00.000Z",
  "data": {
    "penduduk": { /* Data Kependudukan */ },
    "kesehatan": [ /* Array Rekam Medis */ ],
    "infrastruktur": [ /* Array Proyek */ ],
    "pajak": [ /* Array Data Pajak */ ]
  }
}
```

## 🎯 Features

### 1. Search Functionality
- Input NIK (16 digit)
- Real-time validation
- Sample NIK suggestions
- Enter key support

### 2. Data Display

#### Data Kependudukan (Blue Theme)
- NIK
- Nama Lengkap
- Tanggal Lahir
- Status Perkawinan
- Alamat

#### Data Kesehatan (Red/Pink Theme)
- Tanggal Kunjungan
- Diagnosa
- Rumah Sakit/Faskes
- Nama Dokter

#### Data Infrastruktur (Green Theme)
- Nama Proyek
- Lokasi
- Status (ongoing/completed)
- Anggaran
- Pagination (show 5, +N more)

#### Data Pajak (Amber/Orange Theme)
- Jenis Pajak
- Tahun Pajak
- NPWP
- Nama Wajib Pajak
- Jumlah Terutang
- Status (Lunas/Belum Lunas)

### 3. UI/UX Features
- ✅ Responsive design (mobile-friendly)
- ✅ Loading states with spinner
- ✅ Error handling with user-friendly messages
- ✅ Success indicators
- ✅ Color-coded service sections
- ✅ Currency formatting (IDR)
- ✅ Date formatting (Indonesian locale)
- ✅ Gradient backgrounds
- ✅ Card-based layout
- ✅ Smooth animations

### 4. Info Section
Displayed when no data loaded:
- Welcome message
- Service overview (4 dinas)
- Visual icons for each service

## 🎨 Component Breakdown

### WargaProfile Component

**State Management:**
```javascript
const [nik, setNik] = useState('3201012345678901');
const [profileData, setProfileData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**Key Functions:**
- `fetchProfile()` - Fetch data from API Gateway
- `formatCurrency(amount)` - Format to IDR
- `formatDate(dateString)` - Format to Indonesian locale
- `handleKeyPress(e)` - Handle Enter key

## 📊 Data Flow

```
User Input (NIK)
    ↓
WargaProfile Component
    ↓
axios.get() with API Key
    ↓
API Gateway (localhost:8080)
    ↓
Parallel calls to 4 services
    ↓
Aggregated Response
    ↓
React State Update
    ↓
UI Re-render with Data
```

## 🌐 Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d service-frontend
```

Access at: **http://localhost:8005**

### Standalone Docker
```bash
docker build -t service-frontend .
docker run -p 8005:80 service-frontend
```

### Production Considerations
1. **Nginx Configuration**: Already optimized with gzip, caching, security headers
2. **Environment Variables**: Update API_BASE_URL for production
3. **CORS**: API Gateway must allow frontend origin
4. **HTTPS**: Use reverse proxy (e.g., Nginx, Traefik) for SSL

## 🧪 Testing

### Sample NIKs for Testing
```
3201012345678901 - Budi Santoso (complete data) ⭐
3201012345678902 - Siti Aminah
3201012345678903 - Ahmad Wijaya
3201012345678904 - Dewi Lestari
3201012345678905 - Rudi Hartono
```

### Manual Testing Checklist
- [ ] Search with valid NIK
- [ ] Search with invalid NIK (error handling)
- [ ] All data sections displayed correctly
- [ ] Currency formatting correct
- [ ] Date formatting correct
- [ ] Status badges display correctly
- [ ] Loading state shows spinner
- [ ] Responsive on mobile
- [ ] Sample NIK buttons work

## 🔧 Configuration Files

### tailwind.config.js
- Custom color variables
- Border radius utilities
- Dark mode support

### postcss.config.js
```javascript
{
  '@tailwindcss/postcss': {},  // Tailwind v4
  autoprefixer: {}             // Browser compatibility
}
```

### nginx.conf
- SPA routing support (try_files)
- Gzip compression
- Static asset caching
- Security headers

### Dockerfile
- Multi-stage build
- Node 20 Alpine (builder)
- Nginx Alpine (production)
- Optimized layer caching

## 📈 Performance

### Bundle Size
- JavaScript: ~252 KB (gzipped: ~80 KB)
- CSS: ~22 KB (gzipped: ~4.8 KB)
- Total: **~274 KB** (optimized!)

### Optimization Techniques
1. Code splitting (Vite automatic)
2. Tree shaking
3. Minification
4. Gzip compression
5. Static asset caching (1 year)
6. Image optimization (if added)

## 🐛 Common Issues & Solutions

### Issue: API Gateway not responding
**Solution:** Ensure API Gateway is running on port 8080
```bash
docker-compose ps
curl http://localhost:8080/health
```

### Issue: CORS error
**Solution:** API Gateway CORS is configured, but check browser console
```javascript
// api-gateway/index.js should have:
fastify.register(require('@fastify/cors'), { origin: '*' });
```

### Issue: Data not displaying (NaN)
**Solution:** Check field names match API response
- Use `tahun_pajak` not `tahun`
- Use `jumlah_terutang` not `jumlah`

### Issue: Build fails
**Solution:** Clear node_modules and rebuild
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Environment Variables

### Development
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_API_KEY=demo-api-key-12345
```

### Production
```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_KEY=your-production-key
```

**Usage in code:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

## 🎓 Learning Resources

### Technologies Used
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [Lucide Icons](https://lucide.dev)

### Related Docs
- [API Gateway Documentation](../api-gateway/README.md)
- [API Endpoints](../docs/API-ENDPOINTS.md)
- [Main README](../README.md)

## 📊 System Integration

Frontend adalah bagian dari sistem SOA:

```
┌─────────────────────────────────┐
│      USER BROWSER (Port 8005)   │
│      React + Tailwind UI        │
└────────────┬────────────────────┘
             │ HTTP Request
             ↓
┌─────────────────────────────────┐
│   API GATEWAY/ESB (Port 8080)   │
│   Node.js + Fastify             │
│   + API Key Authentication      │
└────────────┬────────────────────┘
             │ Parallel Calls
     ┌───────┼───────┬────────┐
     ↓       ↓       ↓        ↓
  Kepen-  Penda-   PU    Kese-
  dudukan patan         hatan
   (PHP)  (Python)  (Go) (Node.js)
```

## 🎉 Features Showcase

### ✨ Modern UI
- Beautiful gradient backgrounds
- Smooth transitions
- Professional color scheme
- Consistent spacing & typography

### 🚀 Performance
- Fast build with Vite
- Small bundle size
- Optimized images
- Lazy loading ready

### 📱 Responsive
- Mobile-first design
- Tablet optimized
- Desktop enhanced
- Grid layout adaptation

### ♿ Accessibility
- Semantic HTML
- ARIA labels (can be improved)
- Keyboard navigation
- High contrast colors

## 🔮 Future Enhancements

### Potential Features
- [ ] User authentication & login
- [ ] Data export (PDF/Excel)
- [ ] Print-friendly view
- [ ] Dark mode toggle
- [ ] Multiple language support (i18n)
- [ ] Real-time updates (WebSocket)
- [ ] Advanced search & filters
- [ ] Data visualization (charts)
- [ ] Offline mode (PWA)
- [ ] Accessibility improvements (WCAG)

### Technical Improvements
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Environment variable management
- [ ] Error boundary components
- [ ] Analytics integration
- [ ] Performance monitoring
- [ ] SEO optimization
- [ ] CDN integration

## 📞 Support

### Development Team
- Frontend: React + Vite + Tailwind
- Backend: API Gateway (Node.js)
- Integration: 4 heterogeneous services

### Documentation
- Main: [README.md](../README.md)
- API: [API-ENDPOINTS.md](../docs/API-ENDPOINTS.md)
- Architecture: [ARSITEKTUR.md](../docs/ARSITEKTUR.md)

---

**✅ Service Frontend - Ready for Production!**

Built with ❤️ using React, Vite, and Tailwind CSS

*Last Updated: October 26, 2025*
