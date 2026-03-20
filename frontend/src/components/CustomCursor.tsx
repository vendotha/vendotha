import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useSpring(0, { stiffness: 300, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 300, damping: 28 });

  useEffect(() => {
    // Add class to body so CSS hides the default cursor on this page only
    document.body.classList.add("custom-cursor");
    return () => document.body.classList.remove("custom-cursor");
  }, []);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button, [role='button'], input, textarea, select"))
        setIsHovering(true);
    };
    const out = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button, [role='button'], input, textarea, select"))
        setIsHovering(false);
    };
    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, [cursorX, cursorY, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-foreground"
        style={{
          x: cursorX, y: cursorY,
          width: isHovering ? 40 : 10,
          height: isHovering ? 40 : 10,
          translateX: "-50%", translateY: "-50%",
          opacity: isHovering ? 0.15 : 0.8,
          transition: "width 0.2s, height 0.2s, opacity 0.2s",
        }}
      />
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-foreground/30"
        style={{
          x: cursorX, y: cursorY,
          width: isHovering ? 50 : 32,
          height: isHovering ? 50 : 32,
          translateX: "-50%", translateY: "-50%",
          transition: "width 0.3s, height 0.3s",
        }}
      />
    </>
  );
};

export default CustomCursor;
