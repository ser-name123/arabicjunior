import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-7 h-screen w-full">
      <h2 className="text-indigo-700 text-6xl font-semibold text-center">
        Page Not Found
      </h2>

      <Link
        href="/"
        className="px-6 py-4 bg-indigo-700 text-white uppercase text-center flex items-center justify-center transition-all ease-in-out duration-300 hover:bg-indigo-600"
      >
        Go To Homepage
      </Link>
    </div>
  );
};

export default NotFound;
