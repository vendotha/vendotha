import { Link } from "react-router-dom";
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-center px-6">
    <div>
      <div className="text-8xl font-display font-bold gradient-text mb-4">404</div>
      <p className="text-muted-foreground font-sans mb-8">Page not found.</p>
      <Link to="/" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium font-sans hover:-translate-y-0.5 transition-all inline-block">Go home</Link>
    </div>
  </div>
);
export default NotFound;
