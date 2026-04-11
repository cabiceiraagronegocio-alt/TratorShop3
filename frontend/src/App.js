import { useEffect, useState, useCallback, createContext, useContext, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { 
  Search, Menu, X, MapPin, Phone, ChevronRight, Star, Eye, Clock, 
  Plus, LogOut, User, Settings, Tractor, Wrench, Cog, Loader2,
  ChevronLeft, MessageCircle, Share2, Heart, Filter, Grid, List,
  Upload, Image as ImageIcon, Trash2, Edit, Camera, Shield, Lock, Mail,
  Store, Users, Building2, Package, Check, Instagram, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SEOHead, getListingSEO, getSearchSEO } from "@/components/SEOHead";

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Cache bust: v2 - force new URL
// Use localhost:8001 for local development, otherwise use env variable
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_URL = isLocalhost ? 'http://localhost:8001' : (process.env.REACT_APP_BACKEND_URL || window.location.origin);
const API = `${BACKEND_URL}/api`;

// Admin Auth Context
const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAdminAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/auth/me`, { withCredentials: true });
      setAdmin(response.data);
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const adminLogin = async (email, password) => {
    const response = await axios.post(
      `${API}/admin/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setAdmin(response.data);
    return response.data;
  };

  const adminLogout = async () => {
    try {
      await axios.post(`${API}/admin/auth/logout`, {}, { withCredentials: true });
      setAdmin(null);
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, adminLogin, adminLogout, checkAdminAuth, setAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// MS Cities coordinates for map
const MS_CITY_COORDS = {
  "Campo Grande": [-20.4697, -54.6201],
  "Dourados": [-22.2231, -54.8118],
  "Três Lagoas": [-20.7849, -51.7013],
  "Corumbá": [-19.0087, -57.6517],
  "Ponta Porã": [-22.5357, -55.7256],
  "Naviraí": [-23.0651, -54.1996],
  "Nova Andradina": [-22.2328, -53.3434],
  "Aquidauana": [-20.4666, -55.7869],
  "Sidrolândia": [-20.9308, -54.9610],
  "Paranaíba": [-19.6744, -51.1909],
  "Maracaju": [-21.6108, -55.1678],
  "Coxim": [-18.5066, -54.7600],
  "Amambai": [-23.1048, -55.2256],
  "Rio Brilhante": [-21.8014, -54.5461],
  "Cassilândia": [-19.1127, -51.7349],
  "Chapadão do Sul": [-18.7881, -52.6265],
  "Costa Rica": [-18.5425, -53.1281],
  "São Gabriel do Oeste": [-19.3919, -54.5508],
  "Jardim": [-21.4799, -56.1380],
  "Bonito": [-21.1267, -56.4836]
};

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      toast.success("Você saiu da sua conta");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Callback Component
const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = hash.split('session_id=')[1]?.split('&')[0];
      
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );
        setUser(response.data);
        toast.success(`Bem-vindo, ${response.data.name}!`);
        
        // Redirect admin to admin panel
        if (response.data.is_admin) {
          navigate('/admin', { replace: true, state: { user: response.data } });
        } else {
          navigate('/dashboard', { replace: true, state: { user: response.data } });
        }
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Erro ao fazer login");
        navigate('/');
      }
    };

    processAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#1A4D2E] mx-auto mb-4" />
        <p className="text-slate-600">Autenticando...</p>
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  const { user, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            {/* Logo responsiva - usa imagem */}
            <img 
              src="/logo-light.png" 
              alt="TratorShop" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/buscar?category=tratores" className="text-slate-600 hover:text-[#1A4D2E] transition-colors" data-testid="nav-tractors">
              Tratores
            </Link>
            <Link to="/buscar?category=implementos" className="text-slate-600 hover:text-[#1A4D2E] transition-colors" data-testid="nav-implements">
              Implementos
            </Link>
            <Link to="/buscar?category=colheitadeiras" className="text-slate-600 hover:text-[#1A4D2E] transition-colors" data-testid="nav-harvesters">
              Colheitadeiras
            </Link>
            <Link to="/buscar?category=pecas" className="text-slate-600 hover:text-[#1A4D2E] transition-colors" data-testid="nav-parts">
              Peças
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate(user ? '/anunciar' : '/login')}
              className="bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E] font-bold hidden sm:flex"
              data-testid="cta-advertise"
            >
              <Plus className="w-4 h-4 mr-2" />
              Anunciar
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="user-menu-trigger">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.picture ? (user.picture.startsWith('http') ? user.picture : `${API}/files/${user.picture}`) : null} alt={user.name} />
                      <AvatarFallback className="bg-[#1A4D2E] text-white">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    {user.role === 'dealer' && (
                      <Badge className="mt-1 bg-[#F9C02D] text-[#1A4D2E] text-xs">
                        <Store className="w-3 h-3 mr-1" />
                        Dealer
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Meus Anúncios
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/perfil/editar')} data-testid="menu-edit-profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </DropdownMenuItem>
                  {user.role === 'dealer' && user.dealer_profile?.store_slug && (
                    <DropdownMenuItem onClick={() => navigate(`/loja/${user.dealer_profile.store_slug}`)} data-testid="menu-my-store">
                      <Store className="w-4 h-4 mr-2" />
                      Minha Loja
                    </DropdownMenuItem>
                  )}
                  {user.is_admin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="menu-admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Painel Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => navigate('/login')} className="border-[#1A4D2E] text-[#1A4D2E]" data-testid="login-button">
                Entrar
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 mobile-menu-enter">
            <nav className="flex flex-col gap-2">
              <Link to="/buscar?category=tratores" className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Tratores
              </Link>
              <Link to="/buscar?category=implementos" className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Implementos
              </Link>
              <Link to="/buscar?category=colheitadeiras" className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Colheitadeiras
              </Link>
              <Link to="/buscar?category=pecas" className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Peças
              </Link>
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-2">
                <Button 
                  onClick={() => { navigate(user ? '/anunciar' : '/login'); setMobileMenuOpen(false); }}
                  className="w-full bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E] font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Anunciar Máquina
                </Button>
                {!user && (
                  <Button 
                    variant="outline"
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="w-full border-[#1A4D2E] text-[#1A4D2E]"
                    data-testid="mobile-login-button"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Entrar / Cadastrar
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-[#1A4D2E] text-white py-12">
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {/* Logo para dark mode (fundo verde) */}
            <img 
              src="/logo-dark.png" 
              alt="TratorShop" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="text-white/70 text-sm">
            O maior marketplace de máquinas agrícolas do Mato Grosso do Sul.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Categorias</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li><Link to="/buscar?category=tratores" className="hover:text-white">Tratores</Link></li>
            <li><Link to="/buscar?category=implementos" className="hover:text-white">Implementos</Link></li>
            <li><Link to="/buscar?category=colheitadeiras" className="hover:text-white">Colheitadeiras</Link></li>
            <li><Link to="/buscar?category=pecas" className="hover:text-white">Peças</Link></li>
            <li><Link to="/lojas" className="hover:text-white">Lojas Oficiais</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Cidades</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li><Link to="/buscar?city=Campo Grande" className="hover:text-white">Campo Grande</Link></li>
            <li><Link to="/buscar?city=Dourados" className="hover:text-white">Dourados</Link></li>
            <li><Link to="/buscar?city=Três Lagoas" className="hover:text-white">Três Lagoas</Link></li>
            <li><Link to="/buscar?city=Corumbá" className="hover:text-white">Corumbá</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Contato</h4>
          <p className="text-white/70 text-sm">
            Dúvidas ou sugestões?<br />
            contato@tratorshop.com.br
          </p>
          
          {/* Redes Sociais */}
          <div className="mt-4 flex items-center gap-3">
            <a 
              href="https://www.instagram.com/tratorshop?igsh=MXNzcjQ3cnFlaGdnaQ==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              data-testid="footer-instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link to="/admin-login" className="text-white/50 hover:text-white text-xs flex items-center gap-1" data-testid="footer-admin-link">
              <Shield className="w-3 h-3" />
              Área Administrativa
            </Link>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} TratorShop. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

// Listing Card Component
const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const imageUrl = listing.images?.[0] 
    ? `${API}/files/${listing.images[0]}`
    : 'https://images.unsplash.com/photo-1758533696874-587c4e62940c?w=400&h=300&fit=crop';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer card-hover transition-card group border-slate-200"
      onClick={() => navigate(`/anuncio/${listing.listing_id}`)}
      data-testid={`listing-card-${listing.listing_id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1758533696874-587c4e62940c?w=400&h=300&fit=crop';
          }}
        />
        {listing.is_featured && (
          <Badge className="absolute top-3 left-3 bg-[#F9C02D] text-[#1A4D2E] font-semibold">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Destaque
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <p className="price-tag mb-2">{formatPrice(listing.price)}</p>
        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-[#1A4D2E] transition-colors">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 text-slate-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{listing.city}, {listing.state}</span>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{listing.views || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(listing.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Category Card Component
const CategoryCard = ({ category, image, count }) => {
  const navigate = useNavigate();
  const icons = {
    tratores: Tractor,
    implementos: Wrench,
    colheitadeiras: Tractor,
    pecas: Cog
  };
  const Icon = icons[category.id] || Tractor;

  return (
    <div 
      className="relative overflow-hidden rounded-xl aspect-[4/3] group cursor-pointer"
      onClick={() => navigate(`/buscar?category=${category.id}`)}
      data-testid={`category-card-${category.id}`}
    >
      <img 
        src={image} 
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 category-overlay" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold text-lg" style={{ fontFamily: 'Outfit' }}>{category.name}</h3>
        </div>
        <p className="text-white/70 text-sm">{count} anúncios</p>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar = ({ onSearch, initialQuery = '', initialCity = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    axios.get(`${API}/cities`).then(res => setCities(res.data)).catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, city });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" data-testid="search-form">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar máquinas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-full border-slate-200 focus:border-[#1A4D2E] focus:ring-[#1A4D2E]/20 shadow-sm"
            data-testid="search-input"
          />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-12 w-full sm:w-48 rounded-full border-slate-200" data-testid="city-select">
            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cities.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          type="submit" 
          className="h-12 px-8 bg-[#1A4D2E] hover:bg-[#143d24] rounded-full"
          data-testid="search-button"
        >
          Buscar
        </Button>
      </div>
    </form>
  );
};

// Image Upload Component
const ImageUploader = ({ images, onImagesChange, listingId, maxImages = 10 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef(null);

  // Compress image using canvas
  const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if needed
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg'
              }));
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Convert HEIC to JPEG
  const convertHeicToJpeg = async (file) => {
    try {
      // Dynamic import for heic2any library
      const heic2any = (await import('heic2any')).default;
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });
      return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg'
      });
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      // Fallback: try to read as-is (some browsers support HEIC)
      return file;
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitido`);
      return;
    }

    setUploading(true);
    setUploadingCount(files.length);
    setUploadProgress(0);
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const fileName = (file.name || 'image.jpg').toLowerCase();
      
      // Check for HEIC format - also check for empty type (common on iOS)
      const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif') || 
                     file.type === 'image/heic' || file.type === 'image/heif' ||
                     (file.type === '' && (fileName.endsWith('.heic') || fileName.endsWith('.heif')));
      
      // Validate file type (including HEIC) - be more lenient for mobile
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', ''];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      // If type is empty but it's an image from camera, treat as valid
      const isLikelyImage = file.type.startsWith('image/') || file.type === '' || hasValidExtension;
      
      if (!isLikelyImage && !hasValidExtension && !isHeic) {
        toast.error(`${file.name}: Formato não suportado. Use JPG, PNG, WEBP ou HEIC`);
        continue;
      }

      try {
        // Convert HEIC to JPEG if needed
        if (isHeic) {
          toast.info(`Convertendo ${file.name}...`);
          file = await convertHeicToJpeg(file);
        }
        
        // Always compress images for mobile - reduces upload time
        // Compress all images larger than 500KB or if they don't have proper dimensions
        if (file.size > 500 * 1024) {
          try {
            file = await compressImage(file);
          } catch (compressErr) {
            console.warn("Compression failed, using original:", compressErr);
            // Continue with original file if compression fails
          }
        }

        const formData = new FormData();
        formData.append('file', file, file.name || 'image.jpg');
        
        const res = await axios.post(
          `${API}/listings/${listingId}/images`,
          formData,
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000, // 60 second timeout for mobile
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(Math.round(((i + percentCompleted / 100) / files.length) * 100));
              }
            }
          }
        );
        newImages.push(res.data.path);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMsg = error.response?.data?.detail || error.message || 'Erro desconhecido';
        toast.error(`Erro ao enviar ${file.name}: ${errorMsg}`);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
      toast.success(`${newImages.length} imagem(ns) enviada(s)`);
    } else if (files.length > 0) {
      toast.error("Nenhuma imagem foi enviada. Verifique sua conexão.");
    }
    setUploading(false);
    setUploadProgress(0);
    setUploadingCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Progress */}
      {uploading && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">
              Enviando {uploadingCount} imagem(ns)... {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
            <img 
              src={`${API}/files/${img}`} 
              alt={`Imagem ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-manipulation"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#1A4D2E] text-white text-xs rounded">
                Principal
              </span>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <label
            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-[#1A4D2E] active:border-[#1A4D2E] flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#1A4D2E] transition-colors cursor-pointer touch-manipulation"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8" />
                <span className="text-xs text-center px-2">Adicionar Foto</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center">
        Formatos aceitos: JPG, PNG, WEBP, HEIC • Máximo {maxImages} fotos • Imagens são comprimidas automaticamente
      </p>
    </div>
  );
};

// Location Map Component
const LocationMap = ({ city, className = "" }) => {
  const coords = MS_CITY_COORDS[city] || MS_CITY_COORDS["Campo Grande"];
  
  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height: '300px' }}>
      <MapContainer 
        center={coords} 
        zoom={12} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>{city}, MS</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

// Home Page
const HomePage = () => {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_listings: 0, total_users: 0 });

  const categoryImages = {
    tratores: 'https://images.unsplash.com/photo-1758533696874-587c4e62940c?w=600&h=400&fit=crop',
    implementos: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=600&h=400&fit=crop',
    colheitadeiras: 'https://images.pexels.com/photos/6680160/pexels-photo-6680160.jpeg?auto=compress&w=600&h=400&fit=crop',
    pecas: 'https://images.pexels.com/photos/7568421/pexels-photo-7568421.jpeg?auto=compress&w=600&h=400&fit=crop'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, recentRes, statsRes] = await Promise.all([
          axios.get(`${API}/listings/featured?limit=4`),
          axios.get(`${API}/listings?limit=8`),
          axios.get(`${API}/stats`)
        ]);
        setFeaturedListings(featuredRes.data);
        setRecentListings(recentRes.data.listings || []);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = ({ query, city }) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (city && city !== 'all') params.set('city', city);
    navigate(`/buscar?${params.toString()}`);
  };

  const categories = [
    { id: 'tratores', name: 'Tratores' },
    { id: 'implementos', name: 'Implementos' },
    { id: 'colheitadeiras', name: 'Colheitadeiras' },
    { id: 'pecas', name: 'Peças' }
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="home-page">
      <SEOHead />
      
      {/* Hero Section */}
      <section className="relative bg-[#1A4D2E] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1762291398819-335cdb4b14f1?w=1920&h=800&fit=crop"
            alt="Agricultural field"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: 'Outfit' }}
            >
              Compre e venda máquinas agrícolas no MS
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              O maior marketplace de tratores, colheitadeiras e implementos do Mato Grosso do Sul
            </p>
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>
              Categorias
            </h2>
            <Link to="/buscar" className="text-[#1A4D2E] font-medium flex items-center gap-1 hover:underline">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map(category => (
              <CategoryCard 
                key={category.id}
                category={category}
                image={categoryImages[category.id]}
                count={stats.total_listings || 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-[#F9C02D] fill-current" />
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>
                  Destaques
                </h2>
              </div>
              <Link to="/buscar?featured=true" className="text-[#1A4D2E] font-medium flex items-center gap-1 hover:underline">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3]" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                featuredListings.map(listing => (
                  <ListingCard key={listing.listing_id} listing={listing} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>
              Anúncios Recentes
            </h2>
            <Link to="/buscar" className="text-[#1A4D2E] font-medium flex items-center gap-1 hover:underline">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3]" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : recentListings.length > 0 ? (
              recentListings.map(listing => (
                <ListingCard key={listing.listing_id} listing={listing} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Tractor className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum anúncio disponível ainda</p>
                <Button 
                  onClick={() => navigate('/anunciar')}
                  className="mt-4 bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E] font-bold"
                >
                  Seja o primeiro a anunciar!
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#1A4D2E]">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>
            Tem uma máquina para vender?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Anuncie gratuitamente e alcance milhares de compradores em todo o Mato Grosso do Sul
          </p>
          <Button 
            onClick={() => navigate('/anunciar')}
            className="bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E] font-bold text-lg px-8 py-6"
            data-testid="cta-advertise-footer"
          >
            <Plus className="w-5 h-5 mr-2" />
            Anunciar Máquina
          </Button>
        </div>
      </section>
    </div>
  );
};

// Search Page
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const search = searchParams.get('search') || '';
  const condition = searchParams.get('condition') || '';
  const featured = searchParams.get('featured') === 'true';

  const seo = getSearchSEO(category, city, search);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (city) params.set('city', city);
        if (search) params.set('search', search);
        if (condition) params.set('condition', condition);
        if (featured) params.set('featured', 'true');
        params.set('page', page.toString());
        params.set('limit', '20');

        const res = await axios.get(`${API}/listings?${params.toString()}`);
        setListings(res.data.listings || []);
        setTotal(res.data.total || 0);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Erro ao buscar anúncios");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [category, city, search, condition, featured, page]);

  const handleSearch = ({ query, city: newCity }) => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('search', query);
    else params.delete('search');
    if (newCity && newCity !== 'all') params.set('city', newCity);
    else params.delete('city');
    setSearchParams(params);
    setPage(1);
  };

  const categoryNames = {
    tratores: 'Tratores',
    implementos: 'Implementos',
    colheitadeiras: 'Colheitadeiras',
    pecas: 'Peças'
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="search-page">
      <SEOHead 
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />
      
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SearchBar onSearch={handleSearch} initialQuery={search} initialCity={city} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Filters & Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>
              {category ? categoryNames[category] : 'Todos os anúncios'}
              {city && ` em ${city}`}
            </h1>
            <p className="text-slate-500">{total} anúncios encontrados</p>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['tratores', 'implementos', 'colheitadeiras', 'pecas'].map(cat => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  if (category === cat) params.delete('category');
                  else params.set('category', cat);
                  setSearchParams(params);
                }}
                className={category === cat ? "bg-[#1A4D2E]" : ""}
                data-testid={`filter-${cat}`}
              >
                {categoryNames[cat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-sm text-slate-600 flex items-center mr-2">Estado:</span>
          {[
            { value: '', label: 'Todos' },
            { value: 'novo', label: 'Novo' },
            { value: 'semi-novo', label: 'Semi-novo' },
            { value: 'usado', label: 'Usado' }
          ].map(cond => (
            <Button
              key={cond.value}
              variant={condition === cond.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (cond.value) params.set('condition', cond.value);
                else params.delete('condition');
                setSearchParams(params);
                setPage(1);
              }}
              className={condition === cond.value ? "bg-[#F9C02D] text-[#1A4D2E] hover:bg-[#e5ad28]" : ""}
              data-testid={`filter-condition-${cond.value || 'all'}`}
            >
              {cond.label}
            </Button>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.listing_id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Tractor className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Nenhum anúncio encontrado</p>
            <Button onClick={() => setSearchParams({})} variant="outline">
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-4 text-slate-600">
              Página {page} de {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Listing Detail Page  
const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${API}/listings/${id}`);
        setListing(res.data);
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Anúncio não encontrado");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handleWhatsAppClick = async () => {
    if (!listing) return;
    
    try {
      await axios.post(`${API}/listings/${listing.listing_id}/whatsapp-click`);
    } catch (error) {
      console.error("Error tracking click:", error);
    }

    const message = encodeURIComponent(`Olá! Vi seu anúncio "${listing.title}" no TratorShop e tenho interesse.`);
    const phone = listing.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const seo = getListingSEO(listing);
  const images = listing.images?.length > 0 
    ? listing.images.map(img => `${API}/files/${img}`)
    : ['https://images.unsplash.com/photo-1758533696874-587c4e62940c?w=800&h=600&fit=crop'];

  const conditionLabels = {
    novo: 'Novo',
    seminovo: 'Seminovo',
    usado: 'Usado'
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="listing-detail-page">
      <SEOHead 
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        type="product"
        image={images[0]}
      />
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-[#1A4D2E]">Início</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/buscar?category=${listing.category}`} className="hover:text-[#1A4D2E] capitalize">
            {listing.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 truncate">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-[16/10] relative bg-slate-100">
                <img 
                  src={images[selectedImage]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1758533696874-587c4e62940c?w=800&h=600&fit=crop';
                  }}
                />
                {listing.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-[#F9C02D] text-[#1A4D2E] font-semibold">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Destaque
                  </Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === idx ? 'border-[#1A4D2E]' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <Card>
              <CardHeader>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Outfit' }}>
                  {listing.title}
                </h1>
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {listing.city}, {listing.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views} visualizações
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.brand && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Marca</p>
                      <p className="font-semibold">{listing.brand}</p>
                    </div>
                  )}
                  {listing.model && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Modelo</p>
                      <p className="font-semibold">{listing.model}</p>
                    </div>
                  )}
                  {listing.year && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Ano</p>
                      <p className="font-semibold">{listing.year}</p>
                    </div>
                  )}
                  {listing.hours_used && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Horas</p>
                      <p className="font-semibold mono">{listing.hours_used.toLocaleString('pt-BR')}h</p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Condição</p>
                    <p className="font-semibold">{conditionLabels[listing.condition] || listing.condition}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'Outfit' }}>Descrição</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{listing.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg" style={{ fontFamily: 'Outfit' }}>Localização</h3>
              </CardHeader>
              <CardContent>
                <LocationMap city={listing.city} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <p className="text-4xl font-bold text-[#1A4D2E] mb-6" style={{ fontFamily: 'Outfit' }}>
                  {formatPrice(listing.price)}
                </p>
                
                <Button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold py-6 text-lg whatsapp-pulse"
                  data-testid="whatsapp-button"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chamar no WhatsApp
                </Button>

                {/* Seller Info */}
                {listing.seller && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <Link 
                      to={`/vendedor/${listing.seller.user_id || listing.user_id}`}
                      className="flex items-center gap-3 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={listing.seller.picture?.startsWith('http') ? listing.seller.picture : listing.seller.picture ? `${API}/files/${listing.seller.picture}` : null} />
                        <AvatarFallback className="bg-[#1A4D2E] text-white">
                          {listing.seller.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{listing.seller.name}</p>
                        <p className="text-sm text-slate-500">Ver perfil do vendedor →</p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Published Date */}
                <div className="mt-4 text-sm text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Publicado em {new Date(listing.created_at).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Listing Page
const ListingFormPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editId } = useParams();
  const isEditing = !!editId;
  
  const [loading, setLoading] = useState(false);
  const [fetchingListing, setFetchingListing] = useState(isEditing);
  const [cities, setCities] = useState([]);
  const [images, setImages] = useState([]);
  const [listingId, setListingId] = useState(editId || null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    brand: '',
    model: '',
    year: '',
    hours_used: '',
    condition: '',
    city: '',
    whatsapp: ''
  });

  const currentUser = user || location.state?.user;

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Check if onboarding is complete before allowing to create listing
    const checkOnboarding = async () => {
      try {
        const res = await axios.get(`${API}/user/profile`, { withCredentials: true });
        if (!res.data.onboarding_complete) {
          navigate('/onboarding');
          return;
        }
        setCheckingOnboarding(false);
      } catch (error) {
        navigate('/login');
      }
    };
    
    checkOnboarding();
    axios.get(`${API}/cities`).then(res => setCities(res.data)).catch(() => {});
    
    // Fetch existing listing for editing
    if (isEditing) {
      axios.get(`${API}/listings/${editId}`, { withCredentials: true })
        .then(res => {
          const listing = res.data;
          setFormData({
            title: listing.title || '',
            description: listing.description || '',
            category: listing.category || '',
            price: listing.price?.toString() || '',
            brand: listing.brand || '',
            model: listing.model || '',
            year: listing.year?.toString() || '',
            hours_used: listing.hours_used?.toString() || '',
            condition: listing.condition || '',
            city: listing.city || '',
            whatsapp: listing.whatsapp || ''
          });
          setImages(listing.images || []);
          setListingId(listing.listing_id);
        })
        .catch(err => {
          toast.error("Erro ao carregar anúncio");
          navigate('/dashboard');
        })
        .finally(() => setFetchingListing(false));
    }
  }, [currentUser, authLoading, navigate, isEditing, editId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submit
    if (loading) return;
    
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.city || !formData.whatsapp || !formData.condition) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        year: formData.year ? parseInt(formData.year) : null,
        hours_used: formData.hours_used ? parseInt(formData.hours_used) : null
      };

      if (isEditing) {
        await axios.put(`${API}/listings/${editId}`, payload, { withCredentials: true });
        toast.success("Anúncio atualizado! Aguardando re-aprovação.");
        navigate('/dashboard');
      } else {
        const res = await axios.post(`${API}/listings`, payload, { withCredentials: true });
        // Check if it was a duplicate (backend returns duplicate: true)
        if (res.data.duplicate) {
          toast.warning("Este anúncio já foi criado. Redirecionando...");
          setListingId(res.data.listing_id);
        } else {
          setListingId(res.data.listing_id);
          toast.success("Anúncio criado! Agora adicione fotos.");
        }
      }
    } catch (error) {
      console.error("Error saving listing:", error);
      toast.error(error.response?.data?.detail || "Erro ao salvar anúncio");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser && !authLoading) return null;
  
  if (fetchingListing || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A4D2E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="listing-form-page">
      <SEOHead title={isEditing ? "Editar Anúncio" : "Anunciar Máquina"} />
      
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'Outfit' }}>
          {isEditing ? "Editar Anúncio" : "Anunciar Máquina"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Images Section - Show if listing exists */}
          {listingId && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>Fotos</h2>
                <p className="text-sm text-slate-500">Adicione fotos para atrair mais compradores</p>
              </CardHeader>
              <CardContent>
                <ImageUploader 
                  images={images}
                  onImagesChange={setImages}
                  listingId={listingId}
                />
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>Informações Básicas</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título do anúncio *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ex: Trator John Deere 5085E 2020"
                  className="mt-1"
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descreva sua máquina em detalhes..."
                  rows={4}
                  className="mt-1"
                  data-testid="input-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger className="mt-1" data-testid="select-category">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tratores">Tratores</SelectItem>
                      <SelectItem value="implementos">Implementos</SelectItem>
                      <SelectItem value="colheitadeiras">Colheitadeiras</SelectItem>
                      <SelectItem value="pecas">Peças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="150000"
                    className="mt-1"
                    data-testid="input-price"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>Especificações</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="John Deere"
                    className="mt-1"
                    data-testid="input-brand"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="5085E"
                    className="mt-1"
                    data-testid="input-model"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder="2020"
                    className="mt-1"
                    data-testid="input-year"
                  />
                </div>
                <div>
                  <Label htmlFor="hours">Horas de uso</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={formData.hours_used}
                    onChange={(e) => handleChange('hours_used', e.target.value)}
                    placeholder="2500"
                    className="mt-1"
                    data-testid="input-hours"
                  />
                </div>
              </div>

              <div>
                <Label>Condição *</Label>
                <Select value={formData.condition} onValueChange={(v) => handleChange('condition', v)}>
                  <SelectTrigger className="mt-1" data-testid="select-condition">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="seminovo">Seminovo</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit' }}>Localização e Contato</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cidade *</Label>
                <Select value={formData.city} onValueChange={(v) => handleChange('city', v)}>
                  <SelectTrigger className="mt-1" data-testid="select-city">
                    <SelectValue placeholder="Selecione sua cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="(67) 99999-9999"
                  className="mt-1"
                  data-testid="input-whatsapp"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Compradores entrarão em contato diretamente pelo WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
              disabled={loading}
              data-testid="submit-listing"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEditing ? "Salvar Alterações" : (listingId ? "Atualizar e Finalizar" : "Criar Anúncio")}
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            {isEditing ? "Alterações serão analisadas antes de serem publicadas" : "Seu anúncio será analisado antes de ser publicado"}
          </p>
        </form>
      </div>
    </div>
  );
};

// Onboarding Page Component (Full Page - Required for new users)
const OnboardingPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [step, setStep] = useState(1); // 1: type selection, 2: plan selection, 3: confirmation

  useEffect(() => {
    // Check if user needs onboarding
    const checkOnboarding = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const res = await axios.get(`${API}/user/profile`, { withCredentials: true });
        // If onboarding already complete, redirect to dashboard
        if (res.data.onboarding_complete) {
          navigate('/dashboard');
          return;
        }
        // Pre-fill phone if available
        if (res.data.phone) setPhone(res.data.phone);
      } catch (error) {
        console.error("Error checking profile:", error);
        navigate('/login');
      } finally {
        setCheckingProfile(false);
      }
    };
    
    checkOnboarding();
  }, [user, navigate]);

  const handleSelectPlan = async (planType) => {
    setLoading(true);
    try {
      // First save phone if provided
      if (phone) {
        await axios.put(`${API}/user/profile`, { phone }, { withCredentials: true });
      }

      // Select the plan
      await axios.post(`${API}/user/select-plan`, { plan_type: planType }, { withCredentials: true });
      
      // Complete onboarding
      const res = await axios.post(
        `${API}/user/onboarding`,
        { 
          account_type: planType === 'lojista' ? 'dealer' : 'individual',
          store_name: planType === 'lojista' ? storeName : null
        },
        { withCredentials: true }
      );
      setUser(res.data);
      
      // Go to confirmation step
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao configurar plano");
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#1A4D2E]" />
      </div>
    );
  }

  // Step 3: Confirmation (Pending Approval)
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A4D2E] to-[#0d2617] flex items-center justify-center py-12 px-4">
        <SEOHead title="Cadastro Realizado" />
        
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit' }}>
              Aguardando Validação
            </h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Seu cadastro foi realizado com sucesso!
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 font-medium">
                Nossa equipe entrará em contato via WhatsApp para finalizar seu cadastro.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Enquanto isso, você pode explorar o site e completar seu perfil.
            </p>
            <div className="pt-4 space-y-3">
              <Button
                onClick={() => navigate('/perfil/editar')}
                className="w-full bg-[#1A4D2E] hover:bg-[#143d24]"
              >
                Completar Perfil
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Plan Selection
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A4D2E] to-[#0d2617] flex items-center justify-center py-12 px-4">
        <SEOHead title="Escolha seu Plano" />
        
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <h1 className="text-2xl font-bold text-[#1A4D2E]" style={{ fontFamily: 'Outfit' }}>
              Escolha seu Plano
            </h1>
            <p className="text-slate-500">
              Selecione o plano ideal para você
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Phone Input */}
            <div className="mb-6">
              <Label className="text-base font-medium">Seu WhatsApp (para contato)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(67) 99999-9999"
                className="mt-2 py-5 text-lg"
              />
            </div>

            {/* Store Name for Lojista */}
            {accountType === 'dealer' && (
              <div className="mb-6">
                <Label className="text-base font-medium">Nome da sua Loja</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Tratores do Sul"
                  className="mt-2 py-5 text-lg"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Plano Anúncio Único */}
              <button
                onClick={() => handleSelectPlan('anuncio_unico')}
                disabled={loading}
                className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Anúncio Único</h3>
                    <p className="text-sm text-slate-500">Para vendas pontuais</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-green-500" />
                    1 anúncio ativo
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-green-500" />
                    Validade: 3 meses (trimestral)
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-3xl font-bold text-blue-600">R$ 49</p>
                  <p className="text-sm text-slate-500">pagamento trimestral</p>
                </div>
              </button>

              {/* Plano Lojista */}
              <button
                onClick={() => {
                  if (accountType !== 'dealer' || !storeName.trim()) {
                    toast.error("Preencha o nome da loja primeiro");
                    return;
                  }
                  handleSelectPlan('lojista');
                }}
                disabled={loading || (accountType === 'dealer' && !storeName.trim())}
                className="p-6 rounded-xl border-2 border-[#F9C02D] bg-[#F9C02D]/10 hover:shadow-lg transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#F9C02D] text-[#1A4D2E] px-3 py-1 text-xs font-bold rounded-bl-lg">
                  POPULAR
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#F9C02D] rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-[#1A4D2E]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Lojista</h3>
                    <p className="text-sm text-slate-500">Para revendedores</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-green-500" />
                    Até 20 anúncios ativos
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-green-500" />
                    Página exclusiva da loja
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-green-500" />
                    Validade: 3 meses (trimestral)
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-3xl font-bold text-[#1A4D2E]">R$ 149</p>
                  <p className="text-sm text-slate-500">trimestral</p>
                </div>
              </button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="w-full mt-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: Account Type Selection
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A4D2E] to-[#0d2617] flex items-center justify-center py-12 px-4" data-testid="onboarding-page">
      <SEOHead title="Complete seu Cadastro" />
      
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-[#1A4D2E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Tractor className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A4D2E]" style={{ fontFamily: 'Outfit' }}>
            Bem-vindo, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-lg text-slate-500 mt-2">
            Como deseja anunciar?
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Individual Option */}
          <button
            type="button"
            onClick={() => setAccountType('individual')}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
              accountType === 'individual' 
                ? 'border-[#1A4D2E] bg-[#1A4D2E]/5 shadow-md' 
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
            data-testid="onboarding-individual"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                accountType === 'individual' ? 'bg-[#1A4D2E] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">Anúncio Único</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ideal para quem quer vender algumas máquinas.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    1 anúncio
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    R$ 49,00
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Válido por 3 meses
                  </Badge>
                </div>
              </div>
            </div>
          </button>

          {/* Dealer Option */}
          <button
            type="button"
            onClick={() => setAccountType('dealer')}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
              accountType === 'dealer' 
                ? 'border-[#F9C02D] bg-[#F9C02D]/10 shadow-md' 
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
            data-testid="onboarding-dealer"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                accountType === 'dealer' ? 'bg-[#F9C02D] text-[#1A4D2E]' : 'bg-slate-100 text-slate-500'
              }`}>
                <Store className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">Lojista / Revendedor</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Para lojas e empresas que vendem regularmente.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className="bg-[#F9C02D]/20 text-[#1A4D2E]">
                    Até 20 anúncios
                  </Badge>
                  <Badge className="bg-[#1A4D2E]/10 text-[#1A4D2E]">
                    R$ 149,00
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    Válido por 3 meses
                  </Badge>
                </div>
              </div>
            </div>
          </button>

          {/* Store Name Input (for dealers) */}
          {accountType === 'dealer' && (
            <div className="pt-2 animate-in slide-in-from-top-2">
              <Label htmlFor="store-name" className="text-base font-medium">Nome da sua Loja</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Tratores do Sul"
                className="mt-2 py-6 text-lg"
                data-testid="onboarding-store-name"
              />
              <p className="text-xs text-slate-400 mt-1">
                Sua loja ficará em: tratorshop.com/loja/{storeName ? storeName.toLowerCase().replace(/\s+/g, '-') : 'sua-loja'}
              </p>
            </div>
          )}

          <Button
            onClick={() => setStep(2)}
            disabled={!accountType || (accountType === 'dealer' && !storeName.trim())}
            className="w-full bg-[#1A4D2E] hover:bg-[#143d24] py-7 text-lg font-bold mt-6"
            data-testid="onboarding-submit"
          >
            <ChevronRight className="w-5 h-5 mr-2" />
            Escolher Plano
          </Button>
          
          <p className="text-center text-xs text-slate-400 pt-2">
            Você pode alterar isso depois nas configurações
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard Page

const DashboardPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealerInfo, setDealerInfo] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const currentUser = user || location.state?.user;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    fetchListings();
  }, [currentUser, navigate]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API}/user/profile`, { withCredentials: true });
      setUserProfile(res.data);
      
      // Redirect to onboarding if not complete
      if (!res.data.onboarding_complete) {
        navigate('/onboarding');
        return;
      }
      
      // Fetch dealer info if dealer
      if (res.data.role === 'dealer') {
        fetchDealerInfo();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API}/my-listings`, { withCredentials: true });
      setListings(res.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDealerInfo = async () => {
    try {
      const res = await axios.get(`${API}/dealer/profile`, { withCredentials: true });
      setDealerInfo(res.data);
    } catch (error) {
      console.error("Error fetching dealer info:", error);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio?')) return;
    
    try {
      await axios.delete(`${API}/listings/${listingId}`, { withCredentials: true });
      toast.success("Anúncio excluído");
      fetchListings();
      fetchUserProfile();
      if (userProfile?.role === 'dealer') fetchDealerInfo();
    } catch (error) {
      toast.error("Erro ao excluir anúncio");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  const statusBadges = {
    pending: { label: 'Aguardando', className: 'bg-amber-100 text-amber-800' },
    approved: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' },
    expired: { label: 'Expirado', className: 'bg-slate-100 text-slate-600' }
  };

  const activeListings = listings.filter(l => l.status === 'approved' || l.status === 'pending').length;
  const maxListings = userProfile?.max_listings || 3;

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="dashboard-page">
      <SEOHead title="Meus Anúncios" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Pending Approval Warning */}
        {userProfile?.status === 'pending_approval' && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">Cadastro em Análise</h3>
                  <p className="text-amber-700 mt-1">
                    Seu cadastro está em análise. Entraremos em contato via WhatsApp para finalizar sua liberação.
                  </p>
                  <p className="text-amber-600 text-sm mt-2">
                    Enquanto isso, você pode completar seu perfil e explorar o site.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dealer Info Card */}
        {userProfile?.role === 'dealer' && dealerInfo && (
          <Card className="mb-6 bg-gradient-to-r from-[#1A4D2E] to-[#2d6e45] text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                    {dealerInfo.dealer_profile?.store_logo ? (
                      <img 
                        src={`${API}/files/${dealerInfo.dealer_profile.store_logo}`}
                        alt="Logo"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Store className="w-8 h-8 text-white/70" />
                    )}
                  </div>
                  <div>
                    <Badge className="bg-[#F9C02D] text-[#1A4D2E] text-xs mb-1">
                      <Store className="w-3 h-3 mr-1" />
                      Dealer
                    </Badge>
                    <h2 className="text-xl font-bold">{dealerInfo.dealer_profile?.store_name}</h2>
                    <p className="text-white/70 text-sm">
                      /loja/{dealerInfo.dealer_profile?.store_slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dealerInfo.active_listings}</p>
                    <p className="text-white/70 text-sm">Ativos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dealerInfo.pending_listings}</p>
                    <p className="text-white/70 text-sm">Pendentes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dealerInfo.max_listings}</p>
                    <p className="text-white/70 text-sm">Limite</p>
                  </div>
                </div>
              </div>
              {dealerInfo.active_listings + dealerInfo.pending_listings >= dealerInfo.max_listings && (
                <div className="mt-4 p-3 bg-red-500/20 rounded-lg text-sm">
                  Você atingiu o limite de anúncios. Entre em contato com o administrador para aumentar seu limite.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Outfit' }}>
              Meus Anúncios
            </h1>
            <p className="text-slate-500">
              {userProfile?.role !== 'dealer' && (
                <span>Limite: {activeListings}/{maxListings} anúncios</span>
              )}
              {!userProfile?.role && "Gerencie suas máquinas anunciadas"}
            </p>
          </div>
          <Button 
            onClick={() => {
              if (userProfile?.status === 'pending_approval') {
                toast.error("Seu cadastro está em análise. Aguarde a aprovação para criar anúncios.");
                return;
              }
              navigate('/anunciar');
            }}
            className="bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E] font-bold"
            data-testid="new-listing-button"
            disabled={activeListings >= maxListings || userProfile?.status === 'pending_approval'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Anúncio
          </Button>
        </div>

        {/* Individual User Limit Warning */}
        {userProfile?.role !== 'dealer' && activeListings >= maxListings && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">Limite de anúncios atingido</p>
                <p className="text-sm text-amber-600">
                  Você atingiu o limite de {maxListings} anúncios. Entre em contato com o administrador ou torne-se um Dealer para mais anúncios.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map(listing => (
              <Card key={listing.listing_id} className="overflow-hidden" data-testid={`my-listing-${listing.listing_id}`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-32 bg-slate-100 relative">
                    {listing.images?.[0] ? (
                      <img 
                        src={`${API}/files/${listing.images[0]}`}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={statusBadges[listing.status]?.className}>
                            {statusBadges[listing.status]?.label}
                          </Badge>
                          {listing.is_featured && (
                            <Badge className="bg-[#F9C02D] text-[#1A4D2E]">
                              <Star className="w-3 h-3 mr-1" />
                              Destaque
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <p className="text-[#1A4D2E] font-bold">{formatPrice(listing.price)}</p>
                        <p className="text-sm text-slate-500">{listing.city} • {listing.views} views • {listing.whatsapp_clicks} cliques WhatsApp</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/editar/${listing.listing_id}`)}
                          data-testid={`edit-${listing.listing_id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(listing.listing_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Tractor className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Você ainda não tem anúncios</p>
            <Button 
              onClick={() => navigate('/anunciar')}
              className="bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E] font-bold"
            >
              Criar primeiro anúncio
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

// Edit Profile Page
const EditProfilePage = () => {
  const { user, setUser, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    bio: '',
    address: '',
    website: '',
    store_name: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/user/profile`, { withCredentials: true });
      setProfile({
        name: res.data.name || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        address: res.data.address || '',
        website: res.data.website || '',
        store_name: res.data.store_name || ''
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`${API}/user/profile`, profile, { withCredentials: true });
      setUser(prev => ({ ...prev, ...res.data }));
      toast.success("Perfil atualizado!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(`${API}/user/profile-picture`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update user in context with new picture
      setUser(prev => ({ ...prev, picture: res.data.path }));
      toast.success("Foto atualizada!");
      // Reload auth to update everywhere
      await checkAuth();
      // Reload profile
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="edit-profile-page">
      <SEOHead title="Editar Perfil" />
      
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit' }}>
              Editar Perfil
            </h1>
          </CardHeader>
          <CardContent>
            {/* Profile Photo */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.picture ? (user.picture.startsWith('http') ? user.picture : `${API}/files/${user.picture}`) : null} />
                  <AvatarFallback className="bg-[#1A4D2E] text-white text-2xl">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Seu nome"
                  className="mt-1"
                />
              </div>

              {user?.role === 'dealer' && (
                <div>
                  <Label>Nome da Loja</Label>
                  <Input
                    value={profile.store_name}
                    onChange={(e) => setProfile({...profile, store_name: e.target.value})}
                    placeholder="Nome da sua loja"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label>WhatsApp</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="(67) 99999-9999"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Biografia</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Conte um pouco sobre você ou sua empresa..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Endereço Completo</Label>
                <Textarea
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  placeholder="Rua, número, bairro, cidade - UF"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Website / Redes Sociais</Label>
                <Input
                  value={profile.website}
                  onChange={(e) => setProfile({...profile, website: e.target.value})}
                  placeholder="https://www.seusite.com.br"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin Login Page
const AdminLoginPage = () => {
  const { admin, adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (admin) {
      navigate('/admin');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const adminData = await adminLogin(email, password);
      toast.success(`Bem-vindo, ${adminData.name}!`);
      
      if (adminData.must_change_password) {
        navigate('/admin/change-password');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error(error.response?.data?.detail || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4" data-testid="admin-login-page">
      <SEOHead title="Admin Login" />
      
      <Card className="w-full max-w-md border-slate-700 bg-slate-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {/* Logo para fundo escuro */}
            <img 
              src="/logo-dark.png" 
              alt="TratorShop" 
              className="h-12 w-auto object-contain mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>
            Área Administrativa
          </h1>
          <p className="text-slate-400">
            Acesso restrito para administradores
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="text-slate-300">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tratorshop.com"
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  data-testid="admin-email-input"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="admin-password" className="text-slate-300">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  data-testid="admin-password-input"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A4D2E] hover:bg-[#143d24] text-white py-6"
              data-testid="admin-login-button"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
              Entrar como Admin
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <Link to="/" className="text-slate-400 hover:text-white text-sm">
              Voltar para o site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Change Password Page
const AdminChangePasswordPage = () => {
  const { admin, adminLogout, checkAdminAuth } = useAdminAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/admin/auth/change-password`,
        { current_password: currentPassword, new_password: newPassword },
        { withCredentials: true }
      );
      toast.success("Senha alterada com sucesso!");
      // Update admin state to reflect password change
      await checkAdminAuth();
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4">
      <SEOHead title="Alterar Senha" />
      
      <Card className="w-full max-w-md border-slate-700 bg-slate-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>
            Alterar Senha
          </h1>
          <p className="text-slate-400">
            Você precisa alterar sua senha temporária
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Senha Atual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Nova Senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A4D2E] hover:bg-[#143d24] text-white py-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Alterar Senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Page
const AdminPage = () => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [leadFilter, setLeadFilter] = useState('aguardando');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Promote to Dealer Modal
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteStoreName, setPromoteStoreName] = useState('');
  const [promoteMaxListings, setPromoteMaxListings] = useState('20');
  const [promotingUser, setPromotingUser] = useState(false);
  
  // Edit Dealer Limit Modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [newLimit, setNewLimit] = useState('');

  // Edit User Full Modal (Admin)
  const [showEditUserFullModal, setShowEditUserFullModal] = useState(false);
  const [editingUserFull, setEditingUserFull] = useState(null);
  const [editUserFullData, setEditUserFullData] = useState({
    name: '', email: '', password: '', phone: '', role: '', 
    max_listings: '', status: '', bio: '', address: '', 
    website: '', instagram: '', facebook: ''
  });

  // Edit User Modal
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserLimit, setEditUserLimit] = useState('');

  // Edit Listing Modal
  const [showEditListingModal, setShowEditListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [editListingData, setEditListingData] = useState({});

  // User Listings Modal
  const [showUserListingsModal, setShowUserListingsModal] = useState(false);
  const [userListings, setUserListings] = useState({ user: null, listings: [], total: 0 });
  const [loadingUserListings, setLoadingUserListings] = useState(false);

  // Create User Modal
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    name: '',
    email: '',
    phone: '',
    account_type: 'anuncio_unico',
    password: ''
  });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    if (admin.must_change_password) {
      navigate('/admin/change-password');
      return;
    }
    fetchStats();
  }, [admin, navigate]);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    }
  }, [filter, activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, { withCredentials: true });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/listings?status=${filter}`, { withCredentials: true });
      setListings(res.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      if (error.response?.status === 401) {
        navigate('/admin-login');
      }
      toast.error("Erro ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    }
  };

  const fetchDealers = async () => {
    try {
      const res = await axios.get(`${API}/admin/dealers`, { withCredentials: true });
      setDealers(res.data);
    } catch (error) {
      toast.error("Erro ao carregar dealers");
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API}/admin/leads?status=${leadFilter}`, { withCredentials: true });
      setLeads(res.data);
    } catch (error) {
      toast.error("Erro ao carregar leads");
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users/pending`, { withCredentials: true });
      setPendingUsers(res.data);
    } catch (error) {
      toast.error("Erro ao carregar usuários pendentes");
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
      fetchPendingUsers();
    } else if (activeTab === 'dealers') {
      fetchDealers();
    } else if (activeTab === 'leads') {
      fetchLeads();
    }
  }, [activeTab, leadFilter]);

  const handleApprove = async (listingId) => {
    try {
      await axios.post(`${API}/admin/listings/${listingId}/approve`, {}, { withCredentials: true });
      toast.success("Anúncio aprovado!");
      fetchListings();
      fetchStats();
    } catch (error) {
      toast.error("Erro ao aprovar");
    }
  };

  // Abrir modal de edição completa de usuário
  const handleOpenEditUserFull = (user) => {
    setEditingUserFull(user);
    setEditUserFullData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Não preenchemos a senha atual
      phone: user.phone || '',
      role: user.role || 'user',
      max_listings: user.role === 'dealer' 
        ? (user.dealer_profile?.max_listings || 20).toString()
        : (user.max_listings || 3).toString(),
      status: user.status || 'pending_approval',
      bio: user.bio || '',
      address: user.address || '',
      website: user.website || '',
      instagram: user.instagram || '',
      facebook: user.facebook || ''
    });
    setShowEditUserFullModal(true);
  };

  // Salvar edição completa de usuário
  const handleSaveUserFull = async (e) => {
    e.preventDefault();
    if (!editingUserFull) return;
    
    try {
      const updateData = {};
      if (editUserFullData.name) updateData.name = editUserFullData.name;
      if (editUserFullData.email) updateData.email = editUserFullData.email;
      if (editUserFullData.password) updateData.password = editUserFullData.password;
      if (editUserFullData.phone) updateData.phone = editUserFullData.phone;
      if (editUserFullData.role) updateData.role = editUserFullData.role;
      if (editUserFullData.max_listings) updateData.max_listings = parseInt(editUserFullData.max_listings);
      if (editUserFullData.status) updateData.status = editUserFullData.status;
      updateData.bio = editUserFullData.bio;
      updateData.address = editUserFullData.address;
      updateData.website = editUserFullData.website;
      updateData.instagram = editUserFullData.instagram;
      updateData.facebook = editUserFullData.facebook;
      
      await axios.put(`${API}/admin/users/${editingUserFull.user_id}`, updateData, { withCredentials: true });
      toast.success("Usuário atualizado!");
      setShowEditUserFullModal(false);
      setEditingUserFull(null);
      fetchUsers();
      fetchPendingUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao atualizar usuário");
    }
  };

  const handleReject = async (listingId) => {
    try {
      await axios.post(`${API}/admin/listings/${listingId}/reject`, {}, { withCredentials: true });
      toast.success("Anúncio rejeitado");
      fetchListings();
      fetchStats();
    } catch (error) {
      toast.error("Erro ao rejeitar");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio permanentemente?')) return;
    try {
      await axios.delete(`${API}/admin/listings/${listingId}`, { withCredentials: true });
      toast.success("Anúncio excluído!");
      fetchListings();
      fetchStats();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const handleFeature = async (listingId, featured) => {
    try {
      await axios.post(`${API}/admin/listings/${listingId}/feature?featured=${featured}`, {}, { withCredentials: true });
      toast.success(featured ? "Anúncio destacado!" : "Destaque removido");
      fetchListings();
    } catch (error) {
      toast.error("Erro ao alterar destaque");
    }
  };

  const handleUpdateUserLimit = async (e) => {
    e.preventDefault();
    if (!editingUser || !editUserLimit) return;
    
    try {
      await axios.put(`${API}/admin/users/${editingUser.user_id}/limit`, {
        max_listings: parseInt(editUserLimit)
      }, { withCredentials: true });
      
      toast.success("Limite atualizado!");
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao atualizar limite");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Excluir usuário ${user.name}? Todos os anúncios serão removidos.`)) return;
    
    try {
      await axios.delete(`${API}/admin/users/${user.user_id}`, { withCredentials: true });
      toast.success("Usuário excluído!");
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    }
  };

  // Aprovar usuário pendente
  const handleApproveUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/approve`, {}, { withCredentials: true });
      toast.success("Usuário aprovado!");
      fetchPendingUsers();
      fetchUsers();
      fetchStats();
      fetchLeads();
    } catch (error) {
      toast.error("Erro ao aprovar usuário");
    }
  };

  // Rejeitar usuário pendente
  const handleRejectUser = async (userId) => {
    if (!window.confirm("Tem certeza que deseja rejeitar este usuário?")) return;
    try {
      await axios.post(`${API}/admin/users/${userId}/reject`, {}, { withCredentials: true });
      toast.success("Usuário rejeitado");
      fetchPendingUsers();
      fetchUsers();
      fetchStats();
      fetchLeads();
    } catch (error) {
      toast.error("Erro ao rejeitar usuário");
    }
  };

  // Marcar lead como contatado
  const handleMarkLeadContacted = async (userId, contacted) => {
    try {
      await axios.put(`${API}/admin/leads/${userId}/contacted`, { contacted }, { withCredentials: true });
      toast.success(contacted ? "Lead marcado como contatado" : "Lead marcado como aguardando");
      fetchLeads();
      fetchStats();
    } catch (error) {
      toast.error("Erro ao atualizar status do lead");
    }
  };

  // Criar usuário manualmente
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createUserData.name || !createUserData.email || !createUserData.phone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await axios.post(`${API}/admin/users/create`, createUserData, { withCredentials: true });
      toast.success(`Usuário criado! Senha: ${res.data.password}`);
      setShowCreateUserModal(false);
      setCreateUserData({
        name: '',
        email: '',
        phone: '',
        account_type: 'anuncio_unico',
        password: ''
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao criar usuário");
    } finally {
      setCreatingUser(false);
    }
  };

  const handlePromoteToDealer = async (e) => {
    e.preventDefault();
    if (!promoteEmail || !promoteStoreName) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    setPromotingUser(true);
    try {
      await axios.post(`${API}/admin/dealers/promote`, {
        user_email: promoteEmail,
        store_name: promoteStoreName,
        max_listings: parseInt(promoteMaxListings) || 20
      }, { withCredentials: true });
      
      toast.success("Usuário promovido a dealer!");
      setShowPromoteModal(false);
      setPromoteEmail('');
      setPromoteStoreName('');
      setPromoteMaxListings('20');
      fetchDealers();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao promover usuário");
    } finally {
      setPromotingUser(false);
    }
  };

  const handleSetDealerLimit = async (e) => {
    e.preventDefault();
    if (!editingDealer || !newLimit) return;
    
    try {
      await axios.put(`${API}/admin/dealers/${editingDealer.user_id}/limit`, {
        max_listings: parseInt(newLimit)
      }, { withCredentials: true });
      
      toast.success("Limite atualizado!");
      setShowLimitModal(false);
      setEditingDealer(null);
      setNewLimit('');
      fetchDealers();
    } catch (error) {
      toast.error("Erro ao atualizar limite");
    }
  };

  const handleToggleDealerActive = async (dealer) => {
    try {
      await axios.post(`${API}/admin/dealers/${dealer.user_id}/toggle-active`, {}, { withCredentials: true });
      toast.success(dealer.dealer_profile?.is_active ? "Dealer desativado" : "Dealer ativado");
      fetchDealers();
    } catch (error) {
      toast.error("Erro ao alterar status");
    }
  };

  const handleDemoteDealer = async (dealer) => {
    if (!window.confirm(`Remover status de dealer de ${dealer.name}? Os anúncios serão mantidos.`)) return;
    
    try {
      await axios.delete(`${API}/admin/dealers/${dealer.user_id}`, { withCredentials: true });
      toast.success("Status de dealer removido");
      fetchDealers();
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao remover dealer");
    }
  };

  // Expire listing manually
  const handleExpireListing = async (listingId) => {
    if (!window.confirm('Tem certeza que deseja expirar este anúncio?')) return;
    try {
      await axios.post(`${API}/admin/listings/${listingId}/expire`, {}, { withCredentials: true });
      toast.success("Anúncio expirado!");
      fetchListings();
      fetchStats();
    } catch (error) {
      toast.error("Erro ao expirar anúncio");
    }
  };

  // Edit listing
  const handleOpenEditListing = (listing) => {
    setEditingListing(listing);
    setEditListingData({
      title: listing.title || '',
      description: listing.description || '',
      category: listing.category || '',
      price: listing.price || '',
      brand: listing.brand || '',
      model: listing.model || '',
      year: listing.year || '',
      hours_used: listing.hours_used || '',
      condition: listing.condition || '',
      city: listing.city || '',
      whatsapp: listing.whatsapp || '',
      status: listing.status || 'pending',
      is_featured: listing.is_featured || false
    });
    setShowEditListingModal(true);
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    if (!editingListing) return;
    
    try {
      const updateData = { ...editListingData };
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.year) updateData.year = parseInt(updateData.year);
      if (updateData.hours_used) updateData.hours_used = parseInt(updateData.hours_used);
      
      await axios.put(`${API}/admin/listings/${editingListing.listing_id}`, updateData, { withCredentials: true });
      toast.success("Anúncio atualizado!");
      setShowEditListingModal(false);
      setEditingListing(null);
      fetchListings();
      fetchStats();
    } catch (error) {
      toast.error("Erro ao atualizar anúncio");
    }
  };

  // Promote/Remove admin
  const handleToggleAdmin = async (user) => {
    const action = user.is_admin ? 'remover admin de' : 'promover a admin';
    if (!window.confirm(`Tem certeza que deseja ${action} ${user.name}?`)) return;
    
    try {
      if (user.is_admin) {
        await axios.post(`${API}/admin/remove-admin/${user.user_id}`, {}, { withCredentials: true });
        toast.success("Admin removido!");
      } else {
        await axios.post(`${API}/admin/make-admin/${user.user_id}`, {}, { withCredentials: true });
        toast.success("Usuário promovido a admin!");
      }
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao alterar status de admin");
    }
  };

  // View user listings
  const handleViewUserListings = async (user) => {
    setLoadingUserListings(true);
    setShowUserListingsModal(true);
    try {
      const res = await axios.get(`${API}/admin/users/${user.user_id}/listings`, { withCredentials: true });
      setUserListings(res.data);
    } catch (error) {
      toast.error("Erro ao carregar anúncios do usuário");
      setShowUserListingsModal(false);
    } finally {
      setLoadingUserListings(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    toast.success("Logout realizado");
    navigate('/admin-login');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-900" data-testid="admin-page">
      <SEOHead title="Painel Admin" />
      
      {/* Admin Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-dark.png" 
                alt="TratorShop" 
                className="h-8 w-auto object-contain"
              />
              <div>
                <span className="font-bold text-white" style={{ fontFamily: 'Outfit' }}>
                  Admin
                </span>
                <p className="text-xs text-slate-400">{admin.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Pending Users Badge */}
              {stats?.users?.pending_approval > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('users')}
                    className="text-amber-400 hover:text-amber-300 hover:bg-slate-700 relative"
                  >
                    <User className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {stats.users.pending_approval}
                    </span>
                  </Button>
                </div>
              )}
              <Link to="/" className="text-slate-400 hover:text-white text-sm">
                Ver Site
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
                data-testid="admin-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Outfit' }}>
          Painel Administrativo
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#1A4D2E]" data-testid="tab-dashboard">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-[#1A4D2E]">
              Anúncios
            </TabsTrigger>
            <TabsTrigger value="dealers" className="data-[state=active]:bg-[#1A4D2E]" data-testid="tab-dealers">
              Dealers
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#1A4D2E]">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-[#1A4D2E]" data-testid="tab-leads">
              Leads
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stats?.users?.total || 0}</p>
                        <p className="text-sm text-slate-400">Usuários</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stats?.listings?.approved || 0}</p>
                        <p className="text-sm text-slate-400">Ativos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stats?.listings?.pending || 0}</p>
                        <p className="text-sm text-slate-400">Pendentes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Store className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stats?.users?.dealers || 0}</p>
                        <p className="text-sm text-slate-400">Dealers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories Breakdown */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white">Anúncios por Categoria</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { key: 'tratores', label: 'Tratores', icon: Tractor },
                        { key: 'implementos', label: 'Implementos', icon: Wrench },
                        { key: 'colheitadeiras', label: 'Colheitadeiras', icon: Cog },
                        { key: 'pecas', label: 'Peças', icon: Settings }
                      ].map(cat => (
                        <div key={cat.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-300">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                          <span className="text-white font-medium">
                            {stats?.categories?.[cat.key] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Activity */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white">Atividade Semanal</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-slate-300">Novos usuários</span>
                        <Badge className="bg-blue-500">{stats?.users?.new_this_week || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-slate-300">Novos anúncios</span>
                        <Badge className="bg-green-500">{stats?.listings?.new_this_week || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-slate-300">Destaques ativos</span>
                        <Badge className="bg-[#F9C02D] text-[#1A4D2E]">{stats?.listings?.featured || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white">Ações Rápidas</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => { setActiveTab('listings'); setFilter('pending'); }}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Ver Pendentes ({stats?.listings?.pending || 0})
                    </Button>
                    <Button 
                      onClick={() => setShowPromoteModal(true)}
                      className="bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E]"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Novo Dealer
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('users')}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Gerenciar Usuários
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="mb-6 bg-slate-800 flex-wrap">
                <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600" data-testid="tab-pending">
                  Pendentes
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-green-600" data-testid="tab-approved">
                  Aprovados
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600" data-testid="tab-rejected">
                  Rejeitados
                </TabsTrigger>
                <TabsTrigger value="expired" className="data-[state=active]:bg-slate-600" data-testid="tab-expired">
                  Expirados
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter}>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 rounded-xl bg-slate-800" />
                    ))}
                  </div>
                ) : listings.length > 0 ? (
                  <div className="space-y-4">
                    {listings.map(listing => (
                      <Card key={listing.listing_id} className="overflow-hidden bg-slate-800 border-slate-700">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-48 h-32 bg-slate-700">
                            {listing.images?.[0] ? (
                              <img 
                                src={`${API}/files/${listing.images[0]}`}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Tractor className="w-12 h-12 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg text-white">{listing.title}</h3>
                                  {listing.is_featured && (
                                    <Badge className="bg-[#F9C02D] text-[#1A4D2E]">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      Destaque
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[#F9C02D] font-bold">{formatPrice(listing.price)}</p>
                                <p className="text-sm text-slate-400">
                                  {listing.city} • Por: {listing.seller?.name || 'N/A'} ({listing.seller?.email})
                                </p>
                                <p className="text-sm text-slate-500">
                                  Criado: {new Date(listing.created_at).toLocaleDateString('pt-BR')}
                                  {listing.expires_at && ` • Expira: ${new Date(listing.expires_at).toLocaleDateString('pt-BR')}`}
                                </p>
                                {/* Show all images for pending listings */}
                                {listing.images?.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-sm text-slate-400 mb-2">Fotos ({listing.images.length}):</p>
                                    <div className="flex flex-wrap gap-2">
                                      {listing.images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                          <img 
                                            src={`${API}/files/${img}`}
                                            alt={`Foto ${idx + 1}`}
                                            className="w-16 h-16 object-cover rounded border border-slate-600"
                                          />
                                          <button
                                            onClick={async () => {
                                              if (!window.confirm(`Excluir esta foto?`)) return;
                                              try {
                                                await axios.delete(`${API}/listings/${listing.listing_id}/images/${idx}`, { withCredentials: true });
                                                toast.success("Foto excluída");
                                                fetchListings();
                                              } catch (error) {
                                                toast.error("Erro ao excluir foto");
                                              }
                                            }}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 justify-end">
                                {/* Edit button - always visible */}
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEditListing(listing)}
                                  className="text-blue-400 border-blue-700 hover:bg-blue-900/50"
                                  data-testid={`edit-${listing.listing_id}`}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Editar
                                </Button>

                                {listing.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleApprove(listing.listing_id)}
                                      className="bg-green-600 hover:bg-green-700"
                                      data-testid={`approve-${listing.listing_id}`}
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReject(listing.listing_id)}
                                      className="text-red-400 border-red-700 hover:bg-red-900/50"
                                      data-testid={`reject-${listing.listing_id}`}
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Rejeitar
                                    </Button>
                                  </>
                                )}
                                {listing.status === 'approved' && (
                                  <>
                                    <Button 
                                      size="sm"
                                      variant={listing.is_featured ? "outline" : "default"}
                                      onClick={() => handleFeature(listing.listing_id, !listing.is_featured)}
                                      className={listing.is_featured ? "border-[#F9C02D] text-[#F9C02D]" : "bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E]"}
                                      data-testid={`feature-${listing.listing_id}`}
                                    >
                                      <Star className={`w-4 h-4 mr-1 ${listing.is_featured ? 'fill-current' : ''}`} />
                                      {listing.is_featured ? 'Remover' : 'Destacar'}
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleExpireListing(listing.listing_id)}
                                      className="text-amber-400 border-amber-700 hover:bg-amber-900/50"
                                      data-testid={`expire-${listing.listing_id}`}
                                    >
                                      <Clock className="w-4 h-4 mr-1" />
                                      Expirar
                                    </Button>
                                  </>
                                )}
                                {listing.status === 'rejected' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleApprove(listing.listing_id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Reaprovar
                                  </Button>
                                )}
                                {listing.status === 'expired' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleApprove(listing.listing_id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Reativar
                                  </Button>
                                )}
                                {/* Delete button */}
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteListing(listing.listing_id)}
                                  className="text-red-400 border-red-700 hover:bg-red-900/50"
                                  data-testid={`delete-${listing.listing_id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-slate-800 border-slate-700">
                    <p className="text-slate-400">Nenhum anúncio {filter === 'pending' ? 'pendente' : filter === 'approved' ? 'aprovado' : filter === 'rejected' ? 'rejeitado' : 'expirado'}</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Dealers Tab */}
          <TabsContent value="dealers">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Gerenciar Dealers (Lojas)</h2>
              <Button 
                onClick={() => setShowPromoteModal(true)}
                className="bg-[#F9C02D] hover:bg-[#f5b00b] text-[#1A4D2E]"
                data-testid="promote-dealer-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Dealer
              </Button>
            </div>

            {dealers.length > 0 ? (
              <div className="space-y-4">
                {dealers.map(dealer => (
                  <Card key={dealer.user_id} className="overflow-hidden bg-slate-800 border-slate-700">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-32 h-32 bg-slate-700 flex items-center justify-center">
                        {dealer.dealer_profile?.store_logo ? (
                          <img 
                            src={`${API}/files/${dealer.dealer_profile.store_logo}`}
                            alt={dealer.dealer_profile.store_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-12 h-12 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-white">
                                {dealer.dealer_profile?.store_name || 'Sem nome'}
                              </h3>
                              {!dealer.dealer_profile?.is_active && (
                                <Badge variant="outline" className="text-red-400 border-red-600">Inativo</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">
                              {dealer.name} • {dealer.email}
                            </p>
                            <p className="text-sm text-slate-500">
                              {dealer.dealer_profile?.city && `${dealer.dealer_profile.city}, MS • `}
                              Slug: /loja/{dealer.dealer_profile?.store_slug}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-green-400">
                                <strong>{dealer.active_listings}</strong> ativos
                              </span>
                              <span className="text-amber-400">
                                <strong>{dealer.pending_listings}</strong> pendentes
                              </span>
                              <span className="text-slate-400">
                                Limite: <strong>{dealer.dealer_profile?.max_listings || 20}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingDealer(dealer);
                                setNewLimit(dealer.dealer_profile?.max_listings?.toString() || '20');
                                setShowLimitModal(true);
                              }}
                              className="text-slate-300 border-slate-600 hover:bg-slate-700"
                              data-testid={`edit-limit-${dealer.user_id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Limite
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleDealerActive(dealer)}
                              className={dealer.dealer_profile?.is_active 
                                ? "text-red-400 border-red-700 hover:bg-red-900/50" 
                                : "text-green-400 border-green-700 hover:bg-green-900/50"
                              }
                            >
                              {dealer.dealer_profile?.is_active ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleDemoteDealer(dealer)}
                              className="text-red-400 border-red-700 hover:bg-red-900/50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-slate-800 border-slate-700">
                <Store className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum dealer cadastrado</p>
                <p className="text-sm text-slate-500 mt-2">
                  Clique em "Novo Dealer" para promover um usuário
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users">
            {/* Pending Users Section */}
            {pendingUsers.length > 0 && (
              <Card className="bg-amber-900/30 border-amber-700 mb-6">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-amber-400">
                    ⏳ Aguardando Aprovação ({pendingUsers.length})
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingUsers.map(user => (
                      <div key={user.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700 rounded-lg gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.picture ? (user.picture.startsWith('http') ? user.picture : `${API}/files/${user.picture}`) : null} />
                            <AvatarFallback className="bg-amber-600 text-white">
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {user.phone && (
                                <span className="text-xs text-green-400">📱 {user.phone}</span>
                              )}
                              {user.plan_type && (
                                <Badge className={user.plan_type === 'lojista' ? 'bg-[#F9C02D] text-[#1A4D2E]' : 'bg-blue-600'}>
                                  {user.plan_type === 'lojista' ? 'Lojista' : 'Anúncio Único'}
                                </Badge>
                              )}
                              <span className="text-xs text-slate-500">
                                {new Date(user.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-12 sm:ml-0">
                          <Button 
                            size="sm"
                            onClick={() => handleApproveUser(user.user_id)}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`approve-user-${user.user_id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectUser(user.user_id)}
                            className="text-red-400 border-red-700 hover:bg-red-900/50"
                            data-testid={`reject-user-${user.user_id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Usuários Ativos ({users.filter(u => u.status === 'active' || !u.status).length})</h2>
                <Button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-[#1A4D2E] hover:bg-[#143d24]"
                  data-testid="create-user-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Usuário
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.filter(u => u.status === 'active' || !u.status).map(user => (
                    <div key={user.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700 rounded-lg gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.picture ? (user.picture.startsWith('http') ? user.picture : `${API}/files/${user.picture}`) : null} />
                          <AvatarFallback className="bg-[#1A4D2E] text-white">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {user.role === 'dealer' ? (
                              <Badge className="bg-[#F9C02D] text-[#1A4D2E]">
                                <Store className="w-3 h-3 mr-1" />
                                Dealer ({user.dealer_profile?.max_listings || 20})
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-400 border-slate-600">
                                <User className="w-3 h-3 mr-1" />
                                Individual ({user.max_listings || 3})
                              </Badge>
                            )}
                            {user.is_admin && (
                              <Badge className="bg-red-600">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 sm:ml-0 flex-wrap">
                        <span className="text-xs text-slate-500 hidden sm:block">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {/* View User Listings */}
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUserListings(user)}
                          className="text-slate-300 border-slate-600 hover:bg-slate-600"
                          data-testid={`view-listings-${user.user_id}`}
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Anúncios
                        </Button>
                        {/* Edit User Full */}
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditUserFull(user)}
                          className="text-blue-400 border-blue-700 hover:bg-blue-900/50"
                          data-testid={`edit-user-full-${user.user_id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {/* Edit Limit */}
                        {user.role !== 'dealer' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user);
                              setEditUserLimit(user.max_listings?.toString() || '3');
                              setShowEditUserModal(true);
                            }}
                            className="text-slate-300 border-slate-600 hover:bg-slate-600"
                            data-testid={`edit-limit-${user.user_id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Limite
                          </Button>
                        )}
                        {/* Promote to Dealer */}
                        {user.role !== 'dealer' && !user.is_admin && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPromoteEmail(user.email);
                              setShowPromoteModal(true);
                            }}
                            className="text-[#F9C02D] border-[#F9C02D] hover:bg-[#F9C02D]/20"
                            data-testid={`promote-dealer-${user.user_id}`}
                          >
                            <Store className="w-4 h-4 mr-1" />
                            Dealer
                          </Button>
                        )}
                        {/* Toggle Admin Status */}
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleAdmin(user)}
                          className={user.is_admin 
                            ? "text-amber-400 border-amber-700 hover:bg-amber-900/50" 
                            : "text-purple-400 border-purple-700 hover:bg-purple-900/50"
                          }
                          data-testid={`toggle-admin-${user.user_id}`}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          {user.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                        </Button>
                        {/* Delete User */}
                        {!user.is_admin && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-400 border-red-700 hover:bg-red-900/50"
                            data-testid={`delete-user-${user.user_id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  📞 Leads / Cadastros Pendentes ({leads.length})
                </h2>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant={leadFilter === 'aguardando' ? 'default' : 'outline'}
                    onClick={() => setLeadFilter('aguardando')}
                    className={leadFilter === 'aguardando' 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                  >
                    Aguardando
                  </Button>
                  <Button 
                    size="sm"
                    variant={leadFilter === 'contatado' ? 'default' : 'outline'}
                    onClick={() => setLeadFilter('contatado')}
                    className={leadFilter === 'contatado' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                  >
                    Contatados
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    Nenhum lead {leadFilter === 'aguardando' ? 'aguardando contato' : 'contatado'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {leads.map(lead => (
                      <div key={lead.lead_id || lead.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700 rounded-lg gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{lead.name}</p>
                            {lead.plan_type && (
                              <Badge className={lead.plan_type === 'lojista' ? 'bg-[#F9C02D] text-[#1A4D2E]' : 'bg-blue-600'}>
                                {lead.plan_type === 'lojista' ? 'Lojista - R$149' : 'Anúncio Único - R$49'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{lead.email}</p>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            {lead.phone && (
                              <a 
                                href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 flex items-center gap-1"
                              >
                                <Phone className="w-4 h-4" />
                                {lead.phone}
                              </a>
                            )}
                            <span className="text-xs text-slate-500">
                              Cadastro: {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            {lead.contacted_at && (
                              <span className="text-xs text-green-500">
                                Contatado: {new Date(lead.contacted_at).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-0 sm:ml-4">
                          {lead.status === 'aguardando' ? (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleMarkLeadContacted(lead.user_id, true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Marcar Contatado
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleApproveUser(lead.user_id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Aprovar Usuário
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkLeadContacted(lead.user_id, false)}
                              className="text-amber-400 border-amber-700 hover:bg-amber-900/50"
                            >
                              Voltar p/ Aguardando
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Limit Modal */}
        <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Alterar Limite de Anúncios</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingUser?.name} ({editingUser?.email})
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUserLimit} className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">Novo Limite</Label>
                <Input
                  type="number"
                  value={editUserLimit}
                  onChange={(e) => setEditUserLimit(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="100"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Padrão para usuários individuais: 3 anúncios
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Promote to Dealer Modal */}
        <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Promover a Dealer</DialogTitle>
              <DialogDescription className="text-slate-400">
                Transforme um usuário em uma loja (dealer) do marketplace
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePromoteToDealer} className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">Email do Usuário</Label>
                <Input
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  data-testid="promote-email-input"
                />
              </div>
              <div>
                <Label className="text-slate-300">Nome da Loja</Label>
                <Input
                  value={promoteStoreName}
                  onChange={(e) => setPromoteStoreName(e.target.value)}
                  placeholder="Ex: Tratores do Sul"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  data-testid="promote-store-name-input"
                />
              </div>
              <div>
                <Label className="text-slate-300">Limite de Anúncios</Label>
                <Input
                  type="number"
                  value={promoteMaxListings}
                  onChange={(e) => setPromoteMaxListings(e.target.value)}
                  placeholder="20"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  data-testid="promote-limit-input"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Quantidade máxima de anúncios ativos permitidos
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPromoteModal(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={promotingUser}
                  className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
                  data-testid="promote-submit-btn"
                >
                  {promotingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Store className="w-4 h-4 mr-2" />}
                  Promover
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Full Modal (Admin) */}
        <Dialog open={showEditUserFullModal} onOpenChange={setShowEditUserFullModal}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Usuário Completo</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingUserFull?.email}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveUserFull} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Nome</Label>
                  <Input
                    value={editUserFullData.name}
                    onChange={(e) => setEditUserFullData({...editUserFullData, name: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={editUserFullData.email}
                    onChange={(e) => setEditUserFullData({...editUserFullData, email: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Nova Senha (deixe vazio para manter)</Label>
                  <Input
                    type="password"
                    value={editUserFullData.password}
                    onChange={(e) => setEditUserFullData({...editUserFullData, password: e.target.value})}
                    placeholder="••••••••"
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">WhatsApp</Label>
                  <Input
                    value={editUserFullData.phone}
                    onChange={(e) => setEditUserFullData({...editUserFullData, phone: e.target.value})}
                    placeholder="(67) 99999-9999"
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Tipo de Conta</Label>
                  <select
                    value={editUserFullData.role}
                    onChange={(e) => setEditUserFullData({...editUserFullData, role: e.target.value})}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                  >
                    <option value="user">Individual</option>
                    <option value="dealer">Lojista (Dealer)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-slate-300">Limite de Anúncios</Label>
                  <Input
                    type="number"
                    value={editUserFullData.max_listings}
                    onChange={(e) => setEditUserFullData({...editUserFullData, max_listings: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Status</Label>
                  <select
                    value={editUserFullData.status}
                    onChange={(e) => setEditUserFullData({...editUserFullData, status: e.target.value})}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                  >
                    <option value="pending_approval">Pendente</option>
                    <option value="active">Ativo</option>
                    <option value="rejected">Rejeitado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-slate-300">Biografia</Label>
                  <textarea
                    value={editUserFullData.bio}
                    onChange={(e) => setEditUserFullData({...editUserFullData, bio: e.target.value})}
                    rows={2}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-slate-300">Endereço Completo</Label>
                  <Input
                    value={editUserFullData.address}
                    onChange={(e) => setEditUserFullData({...editUserFullData, address: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Website</Label>
                  <Input
                    value={editUserFullData.website}
                    onChange={(e) => setEditUserFullData({...editUserFullData, website: e.target.value})}
                    placeholder="https://..."
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Instagram</Label>
                  <Input
                    value={editUserFullData.instagram}
                    onChange={(e) => setEditUserFullData({...editUserFullData, instagram: e.target.value})}
                    placeholder="@usuario ou URL"
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Facebook</Label>
                  <Input
                    value={editUserFullData.facebook}
                    onChange={(e) => setEditUserFullData({...editUserFullData, facebook: e.target.value})}
                    placeholder="@pagina ou URL"
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditUserFullModal(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dealer Limit Modal */}
        <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Alterar Limite de Anúncios</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingDealer?.dealer_profile?.store_name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSetDealerLimit} className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">Novo Limite</Label>
                <Input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="20"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Atualmente: {editingDealer?.active_listings || 0} anúncios ativos
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Listing Modal */}
        <Dialog open={showEditListingModal} onOpenChange={setShowEditListingModal}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Anúncio</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingListing?.listing_id}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateListing} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-300">Título</Label>
                  <Input
                    value={editListingData.title || ''}
                    onChange={(e) => setEditListingData({...editListingData, title: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-slate-300">Descrição</Label>
                  <textarea
                    value={editListingData.description || ''}
                    onChange={(e) => setEditListingData({...editListingData, description: e.target.value})}
                    rows={3}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Categoria</Label>
                  <select
                    value={editListingData.category || ''}
                    onChange={(e) => setEditListingData({...editListingData, category: e.target.value})}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                  >
                    <option value="tratores">Tratores</option>
                    <option value="implementos">Implementos</option>
                    <option value="colheitadeiras">Colheitadeiras</option>
                    <option value="pecas">Peças</option>
                  </select>
                </div>
                <div>
                  <Label className="text-slate-300">Preço (R$)</Label>
                  <Input
                    type="number"
                    value={editListingData.price || ''}
                    onChange={(e) => setEditListingData({...editListingData, price: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Marca</Label>
                  <Input
                    value={editListingData.brand || ''}
                    onChange={(e) => setEditListingData({...editListingData, brand: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Modelo</Label>
                  <Input
                    value={editListingData.model || ''}
                    onChange={(e) => setEditListingData({...editListingData, model: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Ano</Label>
                  <Input
                    type="number"
                    value={editListingData.year || ''}
                    onChange={(e) => setEditListingData({...editListingData, year: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Horas de Uso</Label>
                  <Input
                    type="number"
                    value={editListingData.hours_used || ''}
                    onChange={(e) => setEditListingData({...editListingData, hours_used: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Condição</Label>
                  <select
                    value={editListingData.condition || ''}
                    onChange={(e) => setEditListingData({...editListingData, condition: e.target.value})}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                  >
                    <option value="novo">Novo</option>
                    <option value="usado">Usado</option>
                    <option value="seminovo">Seminovo</option>
                  </select>
                </div>
                <div>
                  <Label className="text-slate-300">Cidade</Label>
                  <Input
                    value={editListingData.city || ''}
                    onChange={(e) => setEditListingData({...editListingData, city: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">WhatsApp</Label>
                  <Input
                    value={editListingData.whatsapp || ''}
                    onChange={(e) => setEditListingData({...editListingData, whatsapp: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Status</Label>
                  <select
                    value={editListingData.status || ''}
                    onChange={(e) => setEditListingData({...editListingData, status: e.target.value})}
                    className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                  >
                    <option value="pending">Pendente</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                    <option value="expired">Expirado</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={editListingData.is_featured || false}
                    onChange={(e) => setEditListingData({...editListingData, is_featured: e.target.checked})}
                    className="w-5 h-5 bg-slate-700 border-slate-600 rounded"
                  />
                  <Label htmlFor="is_featured" className="text-slate-300 cursor-pointer">
                    Anúncio em Destaque
                  </Label>
                </div>

                {/* Images Section */}
                {editingListing?.images?.length > 0 && (
                  <div className="md:col-span-2 mt-4">
                    <Label className="text-slate-300 mb-2 block">Imagens do Anúncio</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {editingListing.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={`${API}/files/${img}`}
                            alt={`Imagem ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm('Excluir esta imagem?')) return;
                              try {
                                await axios.delete(`${API}/admin/listings/${editingListing.listing_id}/images/${idx}`, { withCredentials: true });
                                toast.success("Imagem excluída!");
                                // Update the local state
                                const newImages = [...editingListing.images];
                                newImages.splice(idx, 1);
                                setEditingListing({...editingListing, images: newImages});
                              } catch (error) {
                                toast.error("Erro ao excluir imagem");
                              }
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditListingModal(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* User Listings Modal */}
        <Dialog open={showUserListingsModal} onOpenChange={setShowUserListingsModal}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                Anúncios de {userListings.user?.name || '...'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {userListings.user?.email} • Total: {userListings.total} anúncios
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              {loadingUserListings ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg bg-slate-700" />
                  ))}
                </div>
              ) : userListings.listings.length > 0 ? (
                userListings.listings.map(listing => (
                  <div key={listing.listing_id} className="flex items-center gap-4 p-3 bg-slate-700 rounded-lg">
                    <div className="w-16 h-16 bg-slate-600 rounded flex-shrink-0 overflow-hidden">
                      {listing.images?.[0] ? (
                        <img 
                          src={`${API}/files/${listing.images[0]}`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tractor className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{listing.title}</h4>
                      <p className="text-sm text-[#F9C02D]">{formatPrice(listing.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={
                            listing.status === 'approved' ? 'bg-green-600' :
                            listing.status === 'pending' ? 'bg-amber-600' :
                            listing.status === 'rejected' ? 'bg-red-600' :
                            'bg-slate-600'
                          }
                        >
                          {listing.status === 'approved' ? 'Aprovado' :
                           listing.status === 'pending' ? 'Pendente' :
                           listing.status === 'rejected' ? 'Rejeitado' : 'Expirado'}
                        </Badge>
                        {listing.is_featured && (
                          <Badge className="bg-[#F9C02D] text-[#1A4D2E]">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Destaque
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowUserListingsModal(false);
                          handleOpenEditListing(listing);
                        }}
                        className="text-blue-400 border-blue-700 hover:bg-blue-900/50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteListing(listing.listing_id)}
                        className="text-red-400 border-red-700 hover:bg-red-900/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">Nenhum anúncio encontrado</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create User Modal */}
        <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Novo Usuário</DialogTitle>
              <DialogDescription className="text-slate-400">
                O usuário será criado já aprovado e ativo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div>
                <Label className="text-slate-300">Nome *</Label>
                <Input
                  value={createUserData.name}
                  onChange={(e) => setCreateUserData({...createUserData, name: e.target.value})}
                  placeholder="Nome completo ou nome da loja"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Email *</Label>
                <Input
                  type="email"
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">WhatsApp *</Label>
                <Input
                  value={createUserData.phone}
                  onChange={(e) => setCreateUserData({...createUserData, phone: e.target.value})}
                  placeholder="(67) 99999-9999"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Tipo de Conta *</Label>
                <select
                  value={createUserData.account_type}
                  onChange={(e) => setCreateUserData({...createUserData, account_type: e.target.value})}
                  className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md p-2"
                >
                  <option value="anuncio_unico">Anúncio Único - R$49 (1 anúncio / 3 meses)</option>
                  <option value="lojista">Lojista - R$149 (20 anúncios / 3 meses)</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-300">Senha (opcional)</Label>
                <Input
                  type="text"
                  value={createUserData.password}
                  onChange={(e) => setCreateUserData({...createUserData, password: e.target.value})}
                  placeholder="Deixe vazio para gerar automaticamente"
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  A senha será exibida após criar o usuário
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 bg-[#1A4D2E] hover:bg-[#143d24]"
                >
                  {creatingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Criar Usuário
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Login Page
const LoginPage = () => {
  const { user, login, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Redirect admin to admin panel
      if (user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data);
      toast.success(`Bem-vindo, ${response.data.name}!`);
      
      // Redirect based on role
      if (response.data.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Erro ao fazer login';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    // Validar WhatsApp
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      setError('Informe um WhatsApp válido para continuar');
      return;
    }
    
    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, { email, password, name, phone });
      toast.success('Cadastro realizado! Fazendo login...');
      
      // Auto login after register
      const response = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.detail || 'Erro ao cadastrar';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4" data-testid="login-page">
      <SEOHead title={isLogin ? "Entrar" : "Cadastrar"} />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#1A4D2E] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Tractor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>
            {isLogin ? 'Entre no TratorShop' : 'Crie sua conta'}
          </h1>
          <p className="text-slate-500">
            {isLogin ? 'Faça login para anunciar suas máquinas' : 'Cadastre-se para começar a anunciar'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email/Password Form */}
          <form onSubmit={isLogin ? handleEmailLogin : handleEmailRegister} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-1"
                  data-testid="register-name-input"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <Label htmlFor="phone">WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(67) 99999-9999"
                  className="mt-1"
                  data-testid="register-phone-input"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Obrigatório para contato</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="seu@email.com"
                className="mt-1"
                data-testid="login-email-input"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                className="mt-1"
                data-testid="login-password-input"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" data-testid="login-error">
                {error}
              </div>
            )}
            
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A4D2E] hover:bg-[#143d24] py-6"
              data-testid="login-submit-button"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Mail className="w-5 h-5 mr-2" />
              )}
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">ou</span>
            </div>
          </div>

          {/* Google Login */}
          <Button 
            type="button"
            onClick={login}
            className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 py-6"
            data-testid="google-login-button"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </Button>

          {/* Toggle Login/Register */}
          <div className="text-center text-sm">
            <span className="text-slate-500">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </span>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-1 text-[#1A4D2E] font-medium hover:underline"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// All Stores Page
const StoresListPage = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await axios.get(`${API}/dealers`);
        setDealers(res.data);
      } catch (error) {
        console.error("Error fetching dealers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDealers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="stores-list-page">
      <SEOHead 
        title="Lojas | TratorShop"
        description="Confira todas as lojas de máquinas agrícolas no TratorShop. Encontre dealers de tratores, implementos e colheitadeiras em Mato Grosso do Sul."
      />
      
      {/* Header */}
      <div className="bg-[#1A4D2E] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <Store className="w-12 h-12 mx-auto mb-4 text-[#F9C02D]" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>
            Lojas Oficiais
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Encontre dealers de máquinas agrícolas em todo o Mato Grosso do Sul
          </p>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-6">
                  <Skeleton className="w-20 h-20 rounded-xl mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : dealers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealers.map(dealer => (
              <Card 
                key={dealer.user_id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/loja/${dealer.store_slug}`)}
                data-testid={`store-card-${dealer.store_slug}`}
              >
                <CardContent className="p-6 text-center">
                  {/* Store Logo */}
                  <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {dealer.store_logo ? (
                      <img 
                        src={`${API}/files/${dealer.store_logo}`}
                        alt={dealer.store_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  
                  {/* Store Info */}
                  <Badge className="bg-[#F9C02D] text-[#1A4D2E] text-xs mb-2">
                    Loja Oficial
                  </Badge>
                  <h3 className="font-semibold text-lg text-slate-900 mb-1" style={{ fontFamily: 'Outfit' }}>
                    {dealer.store_name || 'Sem nome'}
                  </h3>
                  {dealer.city && (
                    <p className="text-slate-500 text-sm flex items-center justify-center gap-1 mb-3">
                      <MapPin className="w-4 h-4" />
                      {dealer.city}, MS
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-4">
                    <Package className="w-4 h-4" />
                    <span><strong>{dealer.active_listings}</strong> anúncios ativos</span>
                  </div>
                  
                  {/* CTA Button */}
                  <Button 
                    className="w-full bg-[#1A4D2E] hover:bg-[#143d24] group-hover:bg-[#143d24]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/loja/${dealer.store_slug}`);
                    }}
                  >
                    Ver Loja
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">Nenhuma loja cadastrada ainda</p>
            <p className="text-sm text-slate-400">Em breve teremos dealers parceiros!</p>
          </div>
        )}
      </div>
    </div>
  );
};


// Public Store Page (Dealer)
const StorePage = () => {
  const { slug } = useParams();
  const [dealer, setDealer] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        const res = await axios.get(`${API}/dealers/${slug}`);
        setDealer(res.data);
      } catch (error) {
        console.error("Error fetching dealer:", error);
        setDealer(null);
        setLoading(false);
      }
    };
    fetchDealer();
  }, [slug]);

  useEffect(() => {
    const fetchListings = async () => {
      if (!dealer) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        params.set('page', page.toString());
        params.set('limit', '12');
        
        const res = await axios.get(`${API}/dealers/${slug}/listings?${params.toString()}`);
        setListings(res.data.listings || []);
        setTotal(res.data.total || 0);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [dealer, slug, category, page]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsAppClick = () => {
    if (!dealer?.dealer_profile?.whatsapp) return;
    const phone = dealer.dealer_profile.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Vi sua loja "${dealer.dealer_profile.store_name}" no TratorShop.`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  const categoryNames = {
    tratores: 'Tratores',
    implementos: 'Implementos',
    colheitadeiras: 'Colheitadeiras',
    pecas: 'Peças'
  };

  if (loading && !dealer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A4D2E]" />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Loja não encontrada</h1>
          <p className="text-slate-500 mb-4">A loja que você procura não existe ou foi desativada.</p>
          <Link to="/">
            <Button className="bg-[#1A4D2E] hover:bg-[#143d24]">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const logoUrl = dealer?.dealer_profile?.store_logo 
    ? `${API}/files/${dealer.dealer_profile.store_logo}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="store-page">
      <SEOHead 
        title={dealer?.dealer_profile?.store_name ? `${dealer.dealer_profile.store_name} | TratorShop` : 'Loja'}
        description={dealer?.dealer_profile?.description || `Confira os anúncios da loja ${dealer?.dealer_profile?.store_name} no TratorShop`}
      />
      
      {/* Store Header */}
      <div className="bg-[#1A4D2E] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Store Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={dealer?.dealer_profile?.store_name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-12 h-12 md:w-16 md:h-16 text-white/50" />
              )}
            </div>
            
            {/* Store Info */}
            <div className="flex-1 text-center md:text-left">
              <Badge className="bg-[#F9C02D] text-[#1A4D2E] mb-2">
                <Store className="w-3 h-3 mr-1" />
                Loja Oficial
              </Badge>
              <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>
                {dealer?.dealer_profile?.store_name || 'Carregando...'}
              </h1>
              {dealer?.dealer_profile?.city && (
                <p className="text-white/80 flex items-center justify-center md:justify-start gap-1 mb-3">
                  <MapPin className="w-4 h-4" />
                  {dealer.dealer_profile.city}, MS
                </p>
              )}
              {dealer?.dealer_profile?.description && (
                <p className="text-white/70 max-w-2xl mb-4">
                  {dealer.dealer_profile.description}
                </p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="text-white/80">
                  <strong className="text-white">{dealer?.active_listings || 0}</strong> anúncios ativos
                </span>
                {dealer?.dealer_profile?.whatsapp && (
                  <Button 
                    onClick={handleWhatsAppClick}
                    className="bg-[#25D366] hover:bg-[#1ebd59] text-white"
                    data-testid="store-whatsapp"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp da Loja
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>
            Anúncios da Loja
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={!category ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory('')}
              className={!category ? "bg-[#1A4D2E]" : ""}
            >
              Todos
            </Button>
            {['tratores', 'implementos', 'colheitadeiras', 'pecas'].map(cat => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className={category === cat ? "bg-[#1A4D2E]" : ""}
              >
                {categoryNames[cat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.listing_id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum anúncio disponível nesta categoria</p>
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-4 text-slate-600">
              Página {page} de {Math.ceil(total / 12)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Seller Public Profile Page (SEO-friendly)
const SellerProfilePage = () => {
  const { userId } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/vendedor/${userId}`);
        setSeller(res.data);
      } catch (error) {
        console.error("Error fetching seller:", error);
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [userId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppClick = () => {
    if (!seller?.phone) return;
    const phone = seller.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Vi seu perfil no TratorShop.`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#1A4D2E]" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Vendedor não encontrado</h1>
          <p className="text-slate-500 mb-6">Este perfil não existe ou não está disponível.</p>
          <Link to="/">
            <Button className="bg-[#1A4D2E] hover:bg-[#143d24]">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="seller-profile-page">
      <SEOHead 
        title={`${seller.name} - Vendedor | TratorShop`}
        description={seller.bio || `Veja os anúncios de ${seller.name} no TratorShop`}
      />
      
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-[#1A4D2E] to-[#143d24] py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              {seller.picture ? (
                <AvatarImage src={seller.picture.startsWith('http') ? seller.picture : `${API}/files/${seller.picture}`} />
              ) : null}
              <AvatarFallback className="bg-[#F9C02D] text-[#1A4D2E] text-3xl">
                {seller.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>
                {seller.name}
              </h1>
              {seller.role === 'dealer' && (
                <Badge className="bg-[#F9C02D] text-[#1A4D2E] mb-3">
                  <Store className="w-3 h-3 mr-1" />
                  Lojista
                </Badge>
              )}
              {seller.bio && (
                <p className="text-white/80 mb-4">{seller.bio}</p>
              )}
              {seller.address && (
                <p className="text-white/60 text-sm flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-4 h-4" />
                  {seller.address}
                </p>
              )}
              {seller.website && (
                <a 
                  href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F9C02D] text-sm flex items-center justify-center md:justify-start gap-1 hover:underline mt-1"
                >
                  <Globe className="w-4 h-4" />
                  {seller.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className="flex gap-3">
              {seller.phone && (
                <Button 
                  onClick={handleWhatsAppClick}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={handleShareProfile}
                className="border-white text-white hover:bg-white/10"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                {copied ? 'Copiado!' : 'Compartilhar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6" style={{ fontFamily: 'Outfit' }}>
          Anúncios ({seller.total_listings})
        </h2>
        
        {seller.listings?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seller.listings.map(listing => (
              <ListingCard key={listing.listing_id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Este vendedor ainda não tem anúncios ativos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// App Router
const AppRouter = () => {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  // Onboarding route without header/footer (full page experience)
  if (location.pathname === '/onboarding') {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    );
  }

  // Admin routes without header/footer
  if (location.pathname === '/admin-login' || location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin/change-password" element={<AdminChangePasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/anuncio/:id" element={<ListingDetailPage />} />
          <Route path="/anunciar" element={<ListingFormPage />} />
          <Route path="/editar/:id" element={<ListingFormPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perfil/editar" element={<EditProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lojas" element={<StoresListPage />} />
          <Route path="/loja/:slug" element={<StorePage />} />
          <Route path="/vendedor/:userId" element={<SellerProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster position="top-center" richColors />
          <AppRouter />
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
