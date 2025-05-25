import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"; // Importa Outlet
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/navbar/MainLayout";
import AdminLayout from "./components/layout/sidebarAdmin/adminLayout";
import ProtectedRoute from "./ProtectedRutes";
import { MODULES, PRIVILEGES } from "./constants/permissions";
import Homepage from "./pages/Landingpage";
import Loginform from "./components/features/componentAuth/Loginform";
import RegisterForm from "./components/features/componentAuth/register";
import RecoveryPassword from "./components/features/componentAuth/recoveryPassword";
import Emailcode from "./components/features/componentAuth/Emailcode";
import DashboardManagement from "./components/features/componentDashboard/main";
import TableUser from "./components/features/componentClients/tableClients";
import Customer from "./components/features/componentCustomer/customer";
import ComponentConfort from "./components/features/componentConfort/ComponentConfort";
import CreateServices from "./components/features/componentService/createServices";
import CreateConfig from "./components/features/componenetConfig/createConfig";
import CabinsPage from "./components/features/componentCabins/CardCabin";
import BedroomCard from "./components/features/componentBedrooms/CardBedroom";
import TableReservations from "./components/features/componentReservations/tableReservations";
import CompanionsView from "./components/features/componentCompanions/companionsView";
import ViewPayments from "./components/features/componentPayments/viewPayments";
import Plan from "./components/features/componentPlans/componentPlan";
import PlanProgramed from "./components/features/componentPlans/componentPlanProgramed";
import Error401 from "./components/common/401&404/401";
import Error404 from "./components/common/401&404/404";
import "../src/components/features/componentPlans/componentPlan.css";
import { AlertProvider } from "./context/AlertContext";
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <Routes>
            {/* --- RUTAS PÚBLICAS --- */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Homepage />} />
            </Route>
            <Route path="/login" element={<Loginform />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/recoveryPassword" element={<RecoveryPassword />} />
            <Route path="/Emailcode" element={<Emailcode />} />
            <Route path="/unauthorized" element={<Error401 />} />

            {/* --- RUTAS PROTEGIDAS DEL PANEL DE ADMINISTRADOR --- */}
            <Route
              element={
                // Esta instancia de ProtectedRoute verifica Auth general y que NO sea cliente
                <ProtectedRoute>
                  <AdminLayout />{" "}
                </ProtectedRoute>
              }
            >
              <Route
                path="/admin" // Dashboard
                element={
                  // El Dashboard puede no necesitar un permiso específico,
                  // o uno general como MODULES.DASHBOARD, PRIVILEGES.READ
                  // Si no se especifica, solo se valida Auth y rol Staff
                  <ProtectedRoute>
                    <DashboardManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.USUARIOS}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <TableUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customer"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.CLIENTES}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <Customer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/accommodations" // Comodidades
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.COMODIDADES}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <ComponentConfort />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.SERVICIOS}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <CreateServices />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/config" element={<CreateConfig />} />
              <Route
                path="/admin/cabins"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.ALOJAMIENTOS}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <CabinsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rooms"
                element={
                  <ProtectedRoute
                    requiredModule={
                      MODULES.ALOJAMIENTOS /*O MODULO.HABITACIONES*/
                    }
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <BedroomCard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reservations"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.RESERVAS}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <TableReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companions"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.RESERVAS}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <CompanionsView onDeleteCompanion={() => {}} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.PAGOS}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <ViewPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/plans"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.PLANES /*O PLANES*/}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <Plan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/plansProgramed"
                element={
                  <ProtectedRoute
                    requiredModule={MODULES.PLANES /*O PLANES*/}
                    requiredPrivilege={PRIVILEGES.READ}
                  >
                    <PlanProgramed />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Error404 />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
