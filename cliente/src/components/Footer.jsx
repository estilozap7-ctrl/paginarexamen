export default function Footer() {
  return (
    <footer className="bg-black/40 border-t border-white/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-white/30 text-sm">
          © {new Date().getFullYear()} Universidad de Córdoba · NIT 891080031-3 ·
          Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
