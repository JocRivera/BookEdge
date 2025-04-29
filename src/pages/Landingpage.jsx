import VideoSlider from "./Videoslider";
import ServicesClient from "./Services/ServicesClient";
import FiltroAlojamientos from "./Habitaciones/FiltradorAlojamiento";

function Homepage() {
  return (
    <>

    
      <VideoSlider />
      <ServicesClient/>
      <FiltroAlojamientos/>

    
    </>
  );
}

export default Homepage;
