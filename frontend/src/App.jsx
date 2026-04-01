import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import PrivateRouteAdmin from "./components/PrivateRouteAdmin";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyList from "./pages/PropertyList";
import AddProperty from "./pages/AddProperty";
import MesAnnonces from "./pages/MesAnnonces";
import ModifierAnnonce from "./pages/ModifierAnnonce";
import ImageViewer from "./pages/ImageViewer";
import ProfilUtilisateur from "./pages/ProfilUtilisateur";
import ModifierProfil from "./pages/ModifierProfil";
import MesFavoris from "./pages/MesFavoris";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilUtilisateurAdmin from "./pages/ProfilUtilisateurAdmin";
import MotDePasseOublie from "./pages/MotDePasseOublie";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="annonces" element={<PropertyList />} />
          <Route path="annonce/:id" element={<PropertyDetail />} />
          <Route path="annonce/ajouter" element={<AddProperty />} />
          <Route path="annonce/mes-annonces" element={<MesAnnonces />} />
          <Route path="annonce/modifier/:id" element={<ModifierAnnonce />} />
          <Route path="/favoris" element={<MesFavoris />} />
          <Route path="/image-viewer" element={<ImageViewer />} />
          <Route path="/profil" element={<ProfilUtilisateur />} />
          <Route path="/profil/modifier" element={<ModifierProfil />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route
            path="/admin"
            element={
              <PrivateRouteAdmin>
                <AdminDashboard />
              </PrivateRouteAdmin>
            }
          />
          <Route
            path="/profil/:id"
            element={
              <PrivateRouteAdmin>
                <ProfilUtilisateurAdmin />
              </PrivateRouteAdmin>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
