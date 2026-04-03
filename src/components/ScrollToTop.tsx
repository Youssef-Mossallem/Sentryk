import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // بيخلي الصفحة تطلع فوق خالص أول ما المسار (اللينك) يتغير
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}