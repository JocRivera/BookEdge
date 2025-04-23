// Homepage.js - Versión optimizada
import Videoslider from "./Videoslider";
import CabinsClient from "./Cabins/CabinsClient";
import BedroomsClient from "./Rooms/BedroomClient"

function Homepage() {
  return (
    <>
      <Videoslider />
      <CabinsClient />
      <BedroomsClient/>
    </>
  );
}

export default Homepage;
