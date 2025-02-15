import { useNavigate  } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import './Authnav.css';


export default function AuthNavbar() {
  const Navigate = useNavigate();
const handleclick = () => {
  Navigate('/');
}
  return (
    <nav className="auth-nav">
      <div className="auth-content">
        <h1 className="title-logo">Los Lagos</h1>
        <div className="log-aut">
          <img src={logo} alt="Logo" onClick={handleclick}/>
        </div>
      </div>
    </nav>
  );
}
