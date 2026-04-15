function Layout({ children }) {
  return (
    <div style={container}>
      
      {/* 🔝 HEADER GLOBAL */}
      <div style={header}>
        <div>
          <h1 style={{ margin: 0 }}>Gerenciamento de Louvor</h1>
          <p style={{ margin: 0, color: "#bbb" }}>
            Planejamento de escala e disponibilidade
          </p>
        </div>

        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXcOxGXurUS7CcWlAXzTjA27H_8wrSULY-Mw&s"
          alt="Igreja"
          style={headerImg}
        />
      </div>

      {/* 📦 CONTEÚDO DAS PÁGINAS */}
      <div>{children}</div>
    </div>
  );
}
const container = {
  background: "#f1f5f9",
  minHeight: "100vh",
  padding: 20
};

const header = {
  background: "linear-gradient(135deg, #000000, #000000)",
  color: "#fff",
  padding: "25px 30px",
  borderRadius: 12,
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const headerImg = {
  width: 80,
  height: 80,
  objectFit: "cover",
  borderRadius: 10,
  opacity: 0.9
};

export default Layout;