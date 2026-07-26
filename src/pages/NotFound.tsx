import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-md">
        <div className="font-sora font-black text-[120px] sm:text-[160px] leading-none gradient-text opacity-20 select-none">
          404
        </div>
        <div className="-mt-8 sm:-mt-12">
          <h1 className="font-sora font-black text-white text-3xl sm:text-4xl mb-4">Page Not Found</h1>
          <p className="text-slate-400 font-inter mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-glow px-8 py-4 rounded-full font-poppins font-semibold text-white inline-flex items-center justify-center gap-2">
              Go Home
            </Link>
            <Link to="/contact" className="btn-outline-glow px-8 py-4 rounded-full font-poppins font-medium inline-flex items-center justify-center gap-2">
              Contact Us
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            {['Services', 'Portfolio', 'Blog', 'Pricing'].map(link => (
              <Link
                key={link}
                to={`/${link.toLowerCase()}`}
                className="text-accent hover:text-white transition-colors font-inter"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
