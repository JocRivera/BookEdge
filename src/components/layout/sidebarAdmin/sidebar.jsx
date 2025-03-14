import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoBedSharp } from "react-icons/io5";
import { MdDashboard, MdBedroomParent, MdCabin, MdPeople } from "react-icons/md";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import logoDev from "../../../assets/LogoAzul.png";
import './sidebar.css';
import { FaServicestack } from "react-icons/fa";
import { SettingsIcon } from "lucide-react";

export default function Sidebar() {
  const [openSubmenuId, setOpenSubmenuId] = useState(null);

  const menuItems = [
    {
      id: 1,
      name: <MdDashboard size={20} />,
      text: "Dashboard",
      link: "/admin/dashboard",
    },
    {
      id: 2,
      name: <MdPeople size={20} />,
      text: "Clientes",
      link: "/admin/clients",
    },
    {
      id: 3,
      name: <MdBedroomParent size={20} />,
      text: "Habitaciones",
      submenu: [
        {
          id: 61,
          name: <MdCabin size={20} />,
          text: "Cabañas",
          link: "/admin/cabins",
        },
        {
          id: 62,
          name: <IoBedSharp size={20} />,
          text: "Habitaciones",
          link: "/admin/rooms",
        },
      ],
    },
    {
      id: 4,
      name: <MdCabin size={20} />,
      text: "Comodidades",
      link: "/admin/accommodations",
    },
    {
      id: 5,
      name: <FaServicestack size={20} />,
      text: "Servicios",
      link: "/admin/services",
    },
    {
      id: 6,
      name: <SettingsIcon size={20} />,
      text: "configuracion",
      link: "/admin/config ",
    }
  ];

  const toggleSubmenu = (id) => {
    setOpenSubmenuId(openSubmenuId === id ? null : id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoDev} alt="" />
        <h2 className="sidebar-title">BookEdge</h2>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.id} className="sidebar-item">
            {item.submenu ? (
              <div
                className="sidebar-link"
                onClick={() => toggleSubmenu(item.id)}
              >
                {item.name}
                <span>{item.text}</span>
                <span className="arrow">
                  {openSubmenuId === item.id ?
                    <IoMdArrowDropupCircle size={20} /> :
                    <IoMdArrowDropdownCircle size={20} />
                  }
                </span>
              </div>
            ) : (
              <Link to={item.link} className="sidebar-link">
                {item.name}
                <span>{item.text}</span>
              </Link>
            )}
            {item.submenu && openSubmenuId === item.id && (
              <ul className="sidebar-submenu show">
                {item.submenu.map((subItem) => (
                  <li key={subItem.id}>
                    <Link to={subItem.link}>
                      {subItem.name}
                      <span>{subItem.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}