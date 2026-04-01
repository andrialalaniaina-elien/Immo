import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./style/Layout.css";

function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
