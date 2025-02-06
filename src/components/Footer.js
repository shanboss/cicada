import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-6 bg-gray-900 text-white text-center">
      <p className="text-gray-400">
        © 2025 Cicada Music Society | All Rights Reserved
      </p>
      <div className="mt-4 flex justify-center space-x-4">
        <a href="#" className="hover:text-blue-500">
          Instagram
        </a>
        <a href="#" className="hover:text-blue-500">
          Twitter
        </a>
        <a href="#" className="hover:text-blue-500">
          Facebook
        </a>
        <Link href="/admin" className="hover:text-blue-500">
          Admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
