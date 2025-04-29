import VideoSlider from "./Videoslider";
import ServicesClient from "./Services/ServicesClient";
import FiltroAlojamientos from "./Habitaciones/FiltradorAlojamiento";

function Homepage() {
  return (
    <>
      <VideoSlider />
      <div id="services">
        <ServicesClient/>
      </div>
      <div id="habitaciones">
        <FiltroAlojamientos/>
      </div>
    </>
  );
}

export default Homepage;