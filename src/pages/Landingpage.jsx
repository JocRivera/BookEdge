import VideoSlider from "./Videoslider";
import ServicesClient from "./Services/ServicesClient";
import FiltroAlojamientos from "./Habitaciones/FiltradorAlojamiento";
import EnhancedPlanClient from "./Plans/PlanClient.jsx";

function Homepage() {
  return (
    <>
      <VideoSlider />
      <div id="services">
        <ServicesClient/>
      </div>
      <div id="plans">
        <EnhancedPlanClient/>
      </div>
      <div id="habitaciones">
        <FiltroAlojamientos/>
      </div>
    </>
  );
}

export default Homepage;