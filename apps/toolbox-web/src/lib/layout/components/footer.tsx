export const Footer = () => {
  return (
    <footer className="mb-4 border-t px-4 py-4 text-center text-muted-foreground text-xs md:text-left lg:px-6">
      &copy; {new Date().getFullYear()}{' '}
      <a
        className="hover:underline"
        href="https://agustinusnathaniel.com"
        rel="noopener noreferrer"
        target="_blank"
      >
        agustinusnathaniel.com
      </a>
    </footer>
  );
};
