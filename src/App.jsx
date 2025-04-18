import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importa los estilos de React Toastify

import MainLayout from "./components/layout/navbar/MainLayout";
import Homepage from "./pages/Landingpage";
import Loginform from "./components/features/componentAuth/Loginform";
import RegisterForm from "./components/features/componentAuth/register";
import RecoveryPassword from "./components/features/componentAuth/recoveryPassword";
import Emailcode from "./components/features/componentAuth/Emailcode";
import AdminLayout from "./components/layout/sidebarAdmin/adminLayout";
import TableUser from "./components/features/componentClients/tableClients";
import CreateServices from "./components/features/componentService/createServices";
import ComponentConfort from "./components/features/componentConfort/ComponentConfort";
import CreateConfig from "./components/features/componenetConfig/createConfig";
import CabinsPage from "./components/features/componentCabins/CardCabin";
import BedroomCard from "./components/features/componentBedrooms/CardBedroom";
import TableReservations from "./components/features/componentReservations/tableReservations";
import CompanionsView from "./components/features/componentCompanions/companionsView";
import TablePayments from "./components/features/componentPayments/tablePayments";
import Profile from "./components/features/componentAuth/Profile";
import { AuthProvider } from "./context/AuthContext";
import Error401 from "./components/common/401&404/401";
import Error404 from "./components/common/401&404/404";
import ProtectedRoutes from "./ProtectedRutes";
import Plan from "./components/features/componentPlans/componentPlan";
import PlanProgramed from "./components/features/componentPlans/componentPlanProgramed";
import CabinComfortsCards from "./components/features/componentAssignment/AssignAmenitiesTable "
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Homepage />} />
          </Route>
          <Route path="/login" element={<Loginform />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/recoveryPassword" element={<RecoveryPassword />} />
          <Route path="/Emailcode" element={<Emailcode />} />

          {/* Página de error 401 */}
          <Route path="/unauthorized" element={<Error401 />} />
          {/* Página de error 404 */}
          <Route path="*" element={<Error404 />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="profile" element={<Profile />} />
              <Route path="clients" element={<TableUser />} />
              <Route path="accommodations" element={<ComponentConfort />} />
              <Route path="services" element={<CreateServices />} />
              <Route path="config" element={<CreateConfig />} />
              <Route path="cabins" element={<CabinsPage />} />
              <Route path="rooms" element={<BedroomCard />} />
              <Route path="AssignAmenities" element={<CabinComfortsCards />} />

              <Route path="reservations" element={<TableReservations />} />
              <Route
                path="companions"
                element={<CompanionsView onDeleteCompanion={() => {}} />}
              />
              <Route
              path="payments"
              element={<TablePayments/>}
              ></Route>
              <Route path="plans" element={<Plan />} />
              <Route path="plansProgramed" element={<PlanProgramed />} />
            </Route>
          </Route>
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
  
}

