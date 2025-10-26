import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, 
  Heart, 
  Building2, 
  Receipt, 
  Search, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

const API_BASE_URL = 'http://localhost:8080';
const API_KEY = 'demo-api-key-12345';

const WargaProfile = () => {
  const [nik, setNik] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [allPenduduk, setAllPenduduk] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch all penduduk for autocomplete on mount
  React.useEffect(() => {
    const fetchAllPenduduk = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/penduduk/search`,
          {
            headers: {
              'X-API-Key': API_KEY
            }
          }
        );
        if (response.data.success) {
          setAllPenduduk(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch penduduk list:', err);
      }
    };
    
    fetchAllPenduduk();
  }, []);

  // Filter search results based on input
  React.useEffect(() => {
    if (nik.length >= 2) {
      const filtered = allPenduduk.filter(p => 
        p.nik.includes(nik) || 
        p.nama.toLowerCase().includes(nik.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      setSearchResults(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [nik, allPenduduk]);

  const fetchProfile = async () => {
    if (!nik || nik.length !== 16) {
      setError('NIK harus 16 digit');
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/warga/${nik}/profil`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );
      
      setProfileData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengambil data. Pastikan API Gateway berjalan.');
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchProfile();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-lg">
              <Building2 className="h-8 w-8 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portal Warga</h1>
              <p className="text-sm text-gray-600">Sistem Informasi Pemerintah Kota Terintegrasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Cari Profil Warga</CardTitle>
            <CardDescription>
              Masukkan NIK (16 digit) untuk melihat profil lengkap warga dari semua dinas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 relative">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Cari NIK atau Nama..."
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => nik.length >= 2 && setShowSuggestions(true)}
                  className="flex-1"
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {searchResults.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setNik(item.nik);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                      >
                        <div className="font-semibold text-gray-900">{item.nama}</div>
                        <div className="text-sm text-gray-600">{item.nik}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={fetchProfile} 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Cari
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Profile Data */}
        {profileData && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Data berhasil diambil!</p>
                <p className="text-sm text-green-700">
                  Agregasi dari 4 dinas berbeda (Kependudukan, Kesehatan, PU, Pendapatan)
                </p>
              </div>
            </div>

            {/* Data Penduduk */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6" />
                  <CardTitle className="text-white">Data Kependudukan</CardTitle>
                </div>
                <CardDescription className="text-blue-100">
                  Dinas Kependudukan dan Catatan Sipil
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {profileData.data.penduduk ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">NIK</p>
                      <p className="font-semibold text-lg">{profileData.data.penduduk.nik}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                      <p className="font-semibold text-lg">{profileData.data.penduduk.nama}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(profileData.data.penduduk.tanggal_lahir)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status Perkawinan</p>
                      <Badge variant="secondary">{profileData.data.penduduk.status_perkawinan}</Badge>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Alamat</p>
                      <p className="font-medium flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1" />
                        {profileData.data.penduduk.alamat}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Data tidak tersedia</p>
                )}
              </CardContent>
            </Card>

            {/* Data Kesehatan */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6" />
                  <CardTitle className="text-white">Rekam Medis</CardTitle>
                </div>
                <CardDescription className="text-red-100">
                  Dinas Kesehatan
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {profileData.data.kesehatan && profileData.data.kesehatan.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.data.kesehatan.map((rekam, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-lg">{rekam.diagnosa}</p>
                            <p className="text-sm text-muted-foreground">{rekam.rumah_sakit}</p>
                          </div>
                          <Badge>{formatDate(rekam.tanggal_kunjungan)}</Badge>
                        </div>
                        {rekam.dokter && (
                          <p className="text-sm text-gray-600">Dokter: {rekam.dokter}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Belum ada rekam medis</p>
                )}
              </CardContent>
            </Card>

            {/* Data Infrastruktur */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  <CardTitle className="text-white">Proyek Infrastruktur</CardTitle>
                </div>
                <CardDescription className="text-green-100">
                  Dinas Pekerjaan Umum
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {profileData.data.infrastruktur && profileData.data.infrastruktur.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Total {profileData.data.infrastruktur.length} proyek ditemukan
                    </p>
                    {profileData.data.infrastruktur.slice(0, 5).map((proyek, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold">{proyek.nama_proyek}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {proyek.lokasi}
                            </p>
                          </div>
                          <Badge variant={proyek.status === 'ongoing' ? 'default' : 'secondary'}>
                            {proyek.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-sm">
                          <span className="text-muted-foreground">Anggaran:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(proyek.anggaran)}</span>
                        </div>
                      </div>
                    ))}
                    {profileData.data.infrastruktur.length > 5 && (
                      <p className="text-sm text-center text-muted-foreground">
                        +{profileData.data.infrastruktur.length - 5} proyek lainnya
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Belum ada data proyek</p>
                )}
              </CardContent>
            </Card>

            {/* Data Pajak */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Receipt className="h-6 w-6" />
                  <CardTitle className="text-white">Data Pajak</CardTitle>
                </div>
                <CardDescription className="text-amber-100">
                  Dinas Pendapatan
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {profileData.data.pajak && profileData.data.pajak.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.data.pajak.map((pajak, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">{pajak.jenis_pajak}</p>
                            <p className="text-sm text-muted-foreground">Tahun {pajak.tahun_pajak}</p>
                          </div>
                          <Badge 
                            variant={pajak.status === 'Lunas' ? 'success' : 'destructive'}
                          >
                            {pajak.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">NPWP</p>
                            <p className="text-sm font-medium">{pajak.npwp}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Wajib Pajak</p>
                            <p className="text-sm font-medium">{pajak.nama_wajib_pajak}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                          <span className="text-sm text-muted-foreground">Jumlah Terutang:</span>
                          <span className="font-bold text-xl text-amber-600">
                            {formatCurrency(pajak.jumlah_terutang)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Belum ada data pajak</p>
                )}
              </CardContent>
            </Card>

            {/* Footer Info */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8" />
                  <div>
                    <p className="font-semibold text-lg">API Aggregation Success!</p>
                    <p className="text-sm text-blue-100">
                      Data dari 4 service berbeda (PHP, Python, Go, Node.js) berhasil digabungkan dalam 1 request
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Section - shown when no data */}
        {!profileData && !loading && (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Selamat Datang di Portal Warga
                </h3>
                <p className="text-gray-600 mb-4">
                  Masukkan NIK untuk melihat profil lengkap warga dari berbagai dinas
                </p>
                <div className="grid md:grid-cols-4 gap-4 mt-8 text-left">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <User className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="font-semibold text-sm">Kependudukan</p>
                    <p className="text-xs text-gray-600">Data identitas warga</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <Heart className="h-8 w-8 text-red-600 mb-2" />
                    <p className="font-semibold text-sm">Kesehatan</p>
                    <p className="text-xs text-gray-600">Rekam medis</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Building2 className="h-8 w-8 text-green-600 mb-2" />
                    <p className="font-semibold text-sm">Pekerjaan Umum</p>
                    <p className="text-xs text-gray-600">Proyek infrastruktur</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <Receipt className="h-8 w-8 text-amber-600 mb-2" />
                    <p className="font-semibold text-sm">Pendapatan</p>
                    <p className="text-xs text-gray-600">Data pajak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Implementasi SOA dengan API Gateway/ESB
            </h3>
            <p className="text-sm text-gray-600">
              Sistem Informasi Pemerintah Kota Terintegrasi
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">👥 Kelompok 5</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Riyana Kartika Pratiwi</span>
                    <span className="text-gray-600">102022580006</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Muhammad Yoga Adi Saputra</span>
                    <span className="text-gray-600">102022580032</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Fadli Muhammad Arsyi</span>
                    <span className="text-gray-600">102022580036</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Delita Noor Iftitah</span>
                    <span className="text-gray-600">102022580045</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🎓 Informasi</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Mata Kuliah:</strong> Integrasi Aplikasi Enterprise</p>
                  <p><strong>Universitas:</strong> Telkom University</p>
                  <p><strong>Tahun:</strong> 2025</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>SOA Architecture</strong> - API Gateway aggregating 4 heterogeneous services
            </p>
            <p className="text-xs text-gray-500">
              React + Vite + Tailwind | Node.js Fastify | PHP + SQLite | Python + PostgreSQL | Go + MySQL | Node.js + MongoDB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WargaProfile;
