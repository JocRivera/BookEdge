  import "./Landingpage.css";
  import Videoslider from "./Videoslider";
  import CabinsClient from "./Cabins/CabinsClient";


  function Homepage() {
    return (
      <>
      <div className="container-homepage">
      <Videoslider />
      <CabinsClient/>
    </div>
      </>
    
    );
  }
  
  export default Homepage;