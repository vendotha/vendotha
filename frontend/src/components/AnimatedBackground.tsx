const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="orb-1 absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[100px]"
        style={{
          background: "radial-gradient(circle, hsla(211, 100%, 70%, 0.4), transparent 70%)",
          top: "10%",
          left: "20%",
        }}
      />
      <div
        className="orb-2 absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[100px]"
        style={{
          background: "radial-gradient(circle, hsla(260, 80%, 75%, 0.35), transparent 70%)",
          top: "40%",
          right: "15%",
        }}
      />
      <div
        className="orb-3 absolute w-[450px] h-[450px] rounded-full opacity-25 blur-[100px]"
        style={{
          background: "radial-gradient(circle, hsla(170, 70%, 65%, 0.3), transparent 70%)",
          bottom: "20%",
          left: "40%",
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
