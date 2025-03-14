import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/navbar/MainLayout";
import Homepage from "./pages/Landingpage";
import Loginform from "./components/features/componentAuth/Loginform";
import RegisterForm from "./components/features/componentAuth/register";
import RecoveryPassword from "./components/features/componentAuth/recoveryPassword";
import Emailcode from "./components/features/componentAuth/Emailcode";
import AdminLayout from "./components/layout/sidebarAdmin/adminLayout";
import CreateClientes from "./components/features/componentClients/createClientes";
import CreateServices from "./components/features/componentService/createServices";
import ComponentConfort from "./components/features/componentConfort/componentConfort";
import CreateConfig from "./components/features/componenetConfig/createConfig";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Homepage />} />
        </Route>
        <Route path="/login" element={<Loginform />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/recoveryPassword" element={<RecoveryPassword />} />
        <Route path="/Emailcode" element={<Emailcode />} />

        {/* Rutas administrativas */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="clients" element={<CreateClientes />} />
          <Route path="accommodations" element={<ComponentConfort />} />
          <Route path="services" element={<CreateServices />} />
          <Route path="config" element={<CreateConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}